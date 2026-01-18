// supabase/functions/score-assessment/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { computeProfile } from "../_shared/personality-core/logic.ts"
import questionsData from "./questions.json" assert { type: "json" }

const SCORING_VERSION = "v1";

interface ScoringRequest {
    user_id: string;
    responses: Record<string, number>;
    quiz_type: string;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { user_id, responses, quiz_type } = (await req.json()) as ScoringRequest;

        if (!user_id || !responses) {
            return new Response(JSON.stringify({ error: "Missing user_id or responses" }), {
                status: 400,
                headers: { ...corsHeaders, 'Content-Type': 'application/json' }
            });
        }

        // 1. Scoring Execution (Pure Core)
        const qs = (questionsData as any).questions;
        const result = computeProfile(responses, qs, quiz_type, SCORING_VERSION);

        // 2. Database Write (STRICT SCHEMA ALIGNMENT)
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const { data: assessment, error: assessmentError } = await supabase
            .from('personality_assessments')
            .insert({
                user_id,
                quiz_type,
                scoring_version: SCORING_VERSION,
                raw_scores: result.raw_scores,
                trait_scores: result.trait_scores,
                facet_scores: result.facet_scores,
                mbti_code: result.mbti_code,
                persona_id: result.persona_id,
                confidence: result.confidence,
                metadata: result.metadata
            })
            .select('id')
            .single();

        if (assessmentError) {
            console.error("Database Write Error:", assessmentError);
            throw new Error("Failed to persist assessment result to database.");
        }

        // 3. Construct Canonical Response
        const response = {
            assessment_id: assessment.id,
            ocean: {
                O: result.trait_scores.O / 100,
                C: result.trait_scores.C / 100,
                E: result.trait_scores.E / 100,
                A: result.trait_scores.A / 100,
                N: result.trait_scores.N / 100,
            },
            persona_id: result.persona_id,
            mbti_proxy: result.mbti_code,
            confidence: result.confidence,
            metadata: {
                ...result.metadata,
                timestamp: Math.floor(Date.now() / 1000),
                is_edge: true
            }
        };

        return new Response(JSON.stringify(response), {
            status: 200,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (err: any) {
        console.error("Edge Function Error:", err);
        return new Response(JSON.stringify({
            error: err.message,
            fallback_suggested: false // Authoritative spec: "No fallback endpoints"
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
})

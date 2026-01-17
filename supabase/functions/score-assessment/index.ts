// supabase/functions/score-assessment/index.ts

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import questionsData from "./questions.json" assert { type: "json" }

const SCORING_VERSION = "v1";

interface Question {
    id: string;
    trait: "O" | "C" | "E" | "A" | "N";
    weight: number;
    reverse: boolean;
    facet: string;
}

interface ScoringRequest {
    user_id: string;
    responses: Record<string, number>;
    quiz_type: string;
}

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// --- Deterministic Hashing ---

async function computeHash(data: any): Promise<string> {
    const msgUint8 = new TextEncoder().encode(JSON.stringify(data, Object.keys(data).sort()));
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// --- Scoring Logic (Ported from @lifesync/personality-engine) ---

function applyReverseScoring(answers: Record<string, number>, questions: Question[]) {
    const reversed: Record<string, number> = {};
    for (const [qid, score] of Object.entries(answers)) {
        const q = questions.find(item => item.id === qid);
        if (q?.reverse) {
            reversed[qid] = 6 - score;
        } else {
            reversed[qid] = score;
        }
    }
    return reversed;
}

function aggregateTraits(answers: Record<string, number>, questions: Question[]) {
    const traitSums = { O: 0, C: 0, E: 0, A: 0, N: 0 };
    const traitCounts = { O: 0, C: 0, E: 0, A: 0, N: 0 };

    for (const [qid, score] of Object.entries(answers)) {
        const q = questions.find(item => item.id === qid);
        if (!q) continue;

        const weightedScore = score * q.weight;
        traitSums[q.trait] += weightedScore;
        traitCounts[q.trait] += q.weight;
    }

    return {
        ocean: {
            O: traitCounts.O > 0 ? traitSums.O / traitCounts.O : 0,
            C: traitCounts.C > 0 ? traitSums.C / traitCounts.C : 0,
            E: traitCounts.E > 0 ? traitSums.E / traitCounts.E : 0,
            A: traitCounts.A > 0 ? traitSums.A / traitCounts.A : 0,
            N: traitCounts.N > 0 ? traitSums.N / traitCounts.N : 0,
        },
        traitCounts
    };
}

function normalizeScores(scores: Record<string, number>) {
    const normalize = (val: number) => ((val - 1) / 4) * 100;
    return {
        O: normalize(scores.O),
        C: normalize(scores.C),
        E: normalize(scores.E),
        A: normalize(scores.A),
        N: normalize(scores.N)
    };
}

function determineMBTI(ocean: Record<string, number>) {
    // Deterministic tie-break: >= 50 is High
    const IE = ocean.E >= 50 ? 'E' : 'I';
    const SN = ocean.O >= 50 ? 'N' : 'S';
    const TF = ocean.A >= 50 ? 'F' : 'T';
    const JP = ocean.C >= 50 ? 'J' : 'P';
    return `${IE}${SN}${TF}${JP}`;
}

// --- Main Handler ---

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

        // 1. Deterministic Input Hash
        const input_hash = await computeHash(responses);

        // 2. Scoring Execution
        // Note: questionsData is cast as Question[]
        const qs = (questionsData as any).questions as Question[];
        const reversed = applyReverseScoring(responses, qs);
        const { ocean: rawOcean } = aggregateTraits(reversed, qs);
        const ocean = normalizeScores(rawOcean);
        const mbti = determineMBTI(ocean);

        // 3. Output Preparation & Hash
        const output_data = {
            O: ocean.O,
            C: ocean.C,
            E: ocean.E,
            A: ocean.A,
            N: ocean.N,
            mbti,
            version: SCORING_VERSION
        };
        const output_hash = await computeHash(output_data);

        // 4. Database Write (WHOLE-OR-NOTHING CONTRACT)
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        // Save assessment result
        const { data: assessment, error: assessmentError } = await supabase
            .from('personality_assessments')
            .insert({
                user_id,
                quiz_type,
                scoring_version: SCORING_VERSION,
                // Match the expected schema for results
                // Assuming results is a JSONB column or similar
                // Adjust column names if they differ in your real schema
                results: {
                    ocean,
                    mbti,
                    confidence: 1.0, // Full confidence for direct deterministic scoring
                    metadata: {
                        quiz_type,
                        scoring_version: SCORING_VERSION,
                        execution_path: 'edge',
                        input_hash,
                        output_hash
                    }
                }
            })
            .select('id')
            .single();

        if (assessmentError) {
            console.error("Database Write Error:", assessmentError);
            throw new Error("Failed to persist assessment result to database.");
        }

        // 5. Telemetry Write
        const { error: telemetryError } = await supabase
            .from('parity_telemetry')
            .schema('internal')
            .insert({
                assessment_id: assessment.id,
                input_hash,
                output_hash,
                scoring_version: SCORING_VERSION,
                execution_path: 'edge'
            });

        if (telemetryError) {
            console.warn("Telemetry Write Error (Non-Blocking for client):", telemetryError);
            // We don't throw here if the measurement itself failed but scoring was saved
        }

        // 6. Return Canonical Response
        const response: any = {
            assessment_id: assessment.id,
            ocean: {
                O: ocean.O / 100,
                C: ocean.C / 100,
                E: ocean.E / 100,
                A: ocean.A / 100,
                N: ocean.N / 100,
            },
            persona_id: mbti.toLowerCase(),
            mbti_proxy: mbti,
            confidence: 1.0,
            metadata: {
                quiz_type,
                engine_version: "edge-v1",
                scoring_version: SCORING_VERSION,
                timestamp: Math.floor(Date.now() / 1000),
                is_edge: true,
                input_hash,
                output_hash
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
            fallback_suggested: true
        }), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
})

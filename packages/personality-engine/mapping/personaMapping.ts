// packages/personality-engine/mapping/personaMapping.ts
export type OCEAN = {
    openness: number; // 0-100
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
};

export type Persona = {
    id: string;
    title: string;
    mbti?: string;
    tagline?: string;
    ranges: {
        openness: [number, number];
        conscientiousness: [number, number];
        extraversion: [number, number];
        agreeableness: [number, number];
        neuroticism: [number, number];
    };
    strengths: string[];
    growth: string[];
    description: string;
    llm_template?: string; // short template for LLM to expand
    tags?: string[];
    example_note?: string;
};

export const PERSONAS: Persona[] = [
    // 1
    {
        id: "p_detached_observer",
        title: "The Detached Observer",
        mbti: "INTP-ish",
        tagline: "Quiet, reserved, and highly reflective.",
        ranges: {
            openness: [0, 20],
            conscientiousness: [0, 40],
            extraversion: [0, 30],
            agreeableness: [0, 30],
            neuroticism: [0, 40],
        },
        strengths: [
            "Calm under pressure",
            "Objective reasoning",
            "Independent problem-solving"
        ],
        growth: [
            "Emotional expressiveness",
            "Social initiative",
            "Long-term planning"
        ],
        description:
            "A reserved thinker who prefers observation and analysis over social stimulation. Practical, internally driven, and often self-sufficient.",
        llm_template:
            "Summarize persona: factual, concise (3-4 short paragraphs). Focus on behavioral cues and actionable growth suggestions."
    },

    // 2
    {
        id: "p_reserved_strategist",
        title: "The Reserved Strategist",
        mbti: "ISTJ-ish",
        tagline: "Careful, dependable, quietly effective.",
        ranges: {
            openness: [0, 20],
            conscientiousness: [60, 100],
            extraversion: [0, 30],
            agreeableness: [40, 60],
            neuroticism: [0, 40],
        },
        strengths: [
            "Reliable execution",
            "Attention to detail",
            "Disciplined work ethic"
        ],
        growth: [
            "Flexibility",
            "Expressing warmth",
            "Big-picture thinking"
        ],
        description:
            "Structured and practical. Prioritizes efficiency and order — excels with predictable systems and clear responsibilities.",
        llm_template:
            "Create a pragmatic, trust-building narrative. Include 3 action tips for improving flexibility and interpersonal warmth."
    },

    // 3
    {
        id: "p_creative_dynamo",
        title: "The Creative Dynamo",
        mbti: "ENFP-ish",
        tagline: "Ideas first, structure later.",
        ranges: {
            openness: [80, 100],
            conscientiousness: [80, 100],
            extraversion: [70, 100],
            agreeableness: [60, 100],
            neuroticism: [20, 60],
        },
        strengths: [
            "Highly creative",
            "Energetic collaboration",
            "Ambitious and driven"
        ],
        growth: [
            "Manage overwhelm",
            "Sustain focus",
            "Emotional regulation"
        ],
        description:
            "A powerhouse of ideas and energy. Brings enthusiasm and breadth of vision but may struggle with consistency and stress.",
        llm_template:
            "Write a vivid, motivational persona summary emphasizing channeling creative energy into sustainable routines. Include two small habit suggestions."
    },

    // 4
    {
        id: "p_analytical_explorer",
        title: "The Analytical Explorer",
        mbti: "ISTP",
        tagline: "You fix what's broken; you build what's needed.",
        ranges: {
            openness: [60, 80],
            conscientiousness: [40, 60],
            extraversion: [20, 40],
            agreeableness: [40, 80],
            neuroticism: [40, 60],
        },
        strengths: [
            "Practical problem-solving",
            "Adaptable",
            "Composed under pressure"
        ],
        growth: [
            "Sharing feelings",
            "Long-term vision"
        ],
        description:
            "Hands-on, resourceful, and pragmatic. Prefers direct action and practical solutions; comfortable experimenting in real conditions.",
        llm_template:
            "Offer experimental learning steps and 3 real-world projects or routines to apply skills."
    },

    // 5
    {
        id: "p_caring_connector",
        title: "The Caring Connector",
        mbti: "ESFJ-ish",
        tagline: "People-first, relationship-centered.",
        ranges: {
            openness: [40, 70],
            conscientiousness: [50, 80],
            extraversion: [60, 90],
            agreeableness: [70, 100],
            neuroticism: [10, 50],
        },
        strengths: [
            "Empathy",
            "Community-building",
            "Reliable support"
        ],
        growth: [
            "Boundaries",
            "Self-prioritization"
        ],
        description:
            "Warm, responsive, and attuned to social dynamics. Focuses on keeping people connected and supported.",
        llm_template:
            "Give interpersonal scripts for boundary-setting and proactive self-care practices in friendly tone."
    },

    // 6
    {
        id: "p_structured_planner",
        title: "The Structured Planner",
        mbti: "ESTJ-ish",
        tagline: "Organized, decisive, and action-oriented.",
        ranges: {
            openness: [30, 60],
            conscientiousness: [80, 100],
            extraversion: [50, 80],
            agreeableness: [30, 60],
            neuroticism: [10, 40],
        },
        strengths: [
            "Reliable delivery",
            "Clear priorities",
            "Leadership presence"
        ],
        growth: [
            "Emotional nuance",
            "Tolerance for ambiguity"
        ],
        description:
            "Values order and predictable performance; excels at translating plans into results.",
        llm_template:
            "Provide a crisp 3-point action plan for delegating, prioritizing, and delegating softer communication."
    },

    // 7
    {
        id: "p_introspective_scholar",
        title: "The Introspective Scholar",
        mbti: "INFJ-ish",
        tagline: "Quiet depth, principled thinking.",
        ranges: {
            openness: [70, 100],
            conscientiousness: [50, 80],
            extraversion: [0, 40],
            agreeableness: [50, 80],
            neuroticism: [20, 60],
        },
        strengths: [
            "Deep insight",
            "Ethical consistency",
            "Long-term thinking"
        ],
        growth: [
            "Practical follow-through",
            "Social outreach"
        ],
        description:
            "Reflective and values-driven. Prefers meaningful work and considered judgment over quick wins.",
        llm_template:
            "Create a grounded, empathetic narrative focusing on meaningful next steps and guardrails against burnout."
    },

    // 8
    {
        id: "p_social_innovator",
        title: "The Social Innovator",
        mbti: "ENFJ-ish",
        tagline: "Big-picture connector and motivator.",
        ranges: {
            openness: [60, 90],
            conscientiousness: [50, 80],
            extraversion: [70, 100],
            agreeableness: [60, 90],
            neuroticism: [10, 50],
        },
        strengths: [
            "Vision communication",
            "People mobilization",
            "Charisma"
        ],
        growth: [
            "Pacing",
            "Micro-detail"
        ],
        description:
            "Leads by inspiration and human understanding. Great at aligning people around a mission.",
        llm_template:
            "Write a motivational piece that translates big vision into 3 tactical actions and invites accountability."
    },

    // 9
    {
        id: "p_calm_custodian",
        title: "The Calm Custodian",
        mbti: "ISFJ-ish",
        tagline: "Steady, protective, quietly dependable.",
        ranges: {
            openness: [20, 50],
            conscientiousness: [60, 90],
            extraversion: [10, 40],
            agreeableness: [60, 90],
            neuroticism: [0, 40],
        },
        strengths: [
            "Reliability",
            "Care for systems",
            "Consistency"
        ],
        growth: [
            "Adaptability",
            "Delegation"
        ],
        description:
            "Prefers stable roles and is driven by responsibility to others. Effective in maintenance and support roles.",
        llm_template:
            "Offer gentle encouragement and concrete delegation experiments to free bandwidth."
    },

    // 10
    {
        id: "p_inventive_loner",
        title: "The Inventive Loner",
        mbti: "INTJ-ish",
        tagline: "Strategic, private, relentlessly curious.",
        ranges: {
            openness: [70, 100],
            conscientiousness: [60, 90],
            extraversion: [0, 40],
            agreeableness: [20, 50],
            neuroticism: [10, 50],
        },
        strengths: [
            "Strategic foresight",
            "Independent research",
            "High competence"
        ],
        growth: [
            "Relational warmth",
            "Team alignment"
        ],
        description:
            "Prefers autonomy and long-range planning. Strong at systems thinking and high-complexity problems.",
        llm_template:
            "Explain pragmatic steps to prototype strategy and soft-skill practice for team alignment."
    },

    // 11
    {
        id: "p_optimistic_driver",
        title: "The Optimistic Driver",
        mbti: "ENTP-ish",
        tagline: "Fast thinker, witty, and opportunistic.",
        ranges: {
            openness: [70, 100],
            conscientiousness: [30, 70],
            extraversion: [60, 95],
            agreeableness: [30, 70],
            neuroticism: [10, 50],
        },
        strengths: [
            "Rapid idea generation",
            "Adaptability",
            "Risk tolerance"
        ],
        growth: [
            "Follow-through",
            "Sensitivity in persuasion"
        ],
        description:
            "Excels in rapid prototyping and ideation. Needs structure to realize ideas repeatedly.",
        llm_template:
            "Provide experiment-style suggestions and a 2-week follow-through plan."
    },

    // 12
    {
        id: "p_grounded_reliability",
        title: "The Grounded Reliability",
        mbti: "ESTP-ish",
        tagline: "Action-first, results-focused.",
        ranges: {
            openness: [40, 70],
            conscientiousness: [50, 80],
            extraversion: [60, 95],
            agreeableness: [30, 70],
            neuroticism: [10, 50],
        },
        strengths: [
            "Effective improvisation",
            "Action orientation",
            "Calm under pressure"
        ],
        growth: [
            "Planning horizon",
            "Emotional reflection"
        ],
        description:
            "Thrives in dynamic environments. Tactical and immediate — loves hands-on challenges.",
        llm_template:
            "Recommend immediate projects and micro-retrospectives for learning from action."
    },

    // 13
    {
        id: "p_compassionate_mentor",
        title: "The Compassionate Mentor",
        mbti: "INFJ/ENFJ hybrid",
        tagline: "Deeply nurturing, guided by values.",
        ranges: {
            openness: [50, 80],
            conscientiousness: [50, 80],
            extraversion: [30, 70],
            agreeableness: [70, 100],
            neuroticism: [10, 50],
        },
        strengths: [
            "Mentoring",
            "Perspective-taking",
            "Long-term care"
        ],
        growth: [
            "Self-care",
            "Boundary clarity"
        ],
        description:
            "Natural at long-term support and growth work. Values meaningful connection and development.",
        llm_template:
            "Give coaching scripts and daily micro-practices to preserve energy while supporting others."
    },

    // 14
    {
        id: "p_steady_resolver",
        title: "The Steady Resolver",
        mbti: "ISFP-ish",
        tagline: "Practical kindness with quiet strength.",
        ranges: {
            openness: [40, 70],
            conscientiousness: [40, 70],
            extraversion: [20, 60],
            agreeableness: [50, 90],
            neuroticism: [10, 50],
        },
        strengths: [
            "Practical empathy",
            "Conflict de-escalation",
            "Reliable action"
        ],
        growth: [
            "Big-picture focus",
            "Self-advocacy"
        ],
        description:
            "Balances action with care; stabilizes teams and relationships with steady presence.",
        llm_template:
            "Offer 3 conflict-resolution steps and assertiveness micro-practices."
    },

    // 15
    {
        id: "p_adaptable_explorer",
        title: "The Adaptable Explorer",
        mbti: "ENFP/ENTP mix",
        tagline: "Flexible, curious, socially energetic.",
        ranges: {
            openness: [60, 95],
            conscientiousness: [30, 60],
            extraversion: [60, 100],
            agreeableness: [40, 80],
            neuroticism: [10, 50],
        },
        strengths: [
            "Curiosity",
            "Network building",
            "Creative problem solving"
        ],
        growth: [
            "Focus",
            "Follow-through"
        ],
        description:
            "Energetic curiosity and social agility. Thrives in exploratory contexts and rapid iteration.",
        llm_template:
            "Give a 30-day curiosity challenge and accountability checkpoints."
    },

    // 16
    {
        id: "p_balanced_generalist",
        title: "The Balanced Generalist",
        mbti: "ISxP/INxP balanced",
        tagline: "Even-keeled and dependable.",
        ranges: {
            openness: [40, 70],
            conscientiousness: [40, 70],
            extraversion: [40, 70],
            agreeableness: [40, 70],
            neuroticism: [20, 50],
        },
        strengths: [
            "Reliability",
            "Versatility",
            "Moderation"
        ],
        growth: [
            "Distinct differentiation",
            "Core vision"
        ],
        description:
            "A steady profile without extreme poles. Great at bridging gaps and providing consistent contribution.",
        llm_template:
            "Provide a gentle growth plan focusing on specialization and a single 90-day project."
    },

    // Special / Extreme cases
    {
        id: "p_extreme_low",
        title: "Extreme Low Profile",
        tagline: "Markedly underactive or withdrawn across measures.",
        ranges: {
            openness: [0, 10],
            conscientiousness: [0, 10],
            extraversion: [0, 10],
            agreeableness: [0, 10],
            neuroticism: [0, 10]
        },
        strengths: [],
        growth: [
            "Activation",
            "Social engagement",
            "Affect monitoring"
        ],
        description:
            "Uniformly low scores across traits. This may reflect extreme disengagement, low arousal, or context-specific suppression. Treat interpretations cautiously; consider follow-up screening.",
        llm_template:
            "Flag carefully: ask follow-up questions about fatigue, context, and motivation. Suggest gentle activation steps and recommend retest in varied context."
    },
    {
        id: "p_extreme_high",
        title: "Extreme High Profile",
        tagline: "Markedly intense across measures.",
        ranges: {
            openness: [90, 100],
            conscientiousness: [90, 100],
            extraversion: [90, 100],
            agreeableness: [90, 100],
            neuroticism: [80, 100]
        },
        strengths: [
            "High energy",
            "Drive",
            "Broad engagement"
        ],
        growth: [
            "Stress regulation",
            "Selective focus"
        ],
        description:
            "Extremely high trait scores across the board. May indicate intense reactivity or hyperengaged style. Interpret with context and recommend pacing strategies.",
        llm_template:
            "Provide targeted stress management and prioritization techniques; ask follow-ups about sleep and workload."
    },
    {
        id: "p_uniform_response",
        title: "Uniform Response Pattern (Diagnostic)",
        tagline: "Highly uniform answers detected.",
        ranges: {
            openness: [0, 100],
            conscientiousness: [0, 100],
            extraversion: [0, 100],
            agreeableness: [0, 100],
            neuroticism: [0, 100]
        },
        strengths: [],
        growth: ["Validity concerns"],
        description:
            "Answers show minimal variance. This can indicate straight-lining, inattention, trolling, or misunderstanding. Recommend retake with instructions, or run full 180-question follow-up.",
        llm_template:
            "Ask the user clarifying follow-ups about attention, environment, and ask to retake. Provide a one-sentence explanation why results are not diagnostic."
    }
];

/**
 * Get persona by ID or MBTI code
 */
export function getPersona(idOrMbti: string): Persona | null {
    return PERSONAS.find(p => p.id === idOrMbti || p.mbti?.startsWith(idOrMbti)) || null;
}

// --- Matching algorithm utilities ---

function inRange(val: number, [min, max]: [number, number]) {
    return val >= min && val <= max;
}

// distance to center of a range (0..50)
function distanceFromRangeCenter(val: number, [min, max]: [number, number]) {
    const center = (min + max) / 2;
    return Math.abs(val - center);
}

/**
 * Maps an OCEAN profile to a persona.
 * Returns: { persona, confidence, matches, tie }
 */
export function mapProfileToPersona(profile: OCEAN) {
    // score each persona by trait hits and proximity
    // Exclude p_uniform_response from standard mapping (it's diagnostic only)
    const candidates = PERSONAS.filter(p => p.id !== 'p_uniform_response');

    const scored = candidates.map((p) => {
        let hits = 0;
        let proximity = 0; // lower is better
        const traits: Array<keyof OCEAN> = ["openness", "conscientiousness", "extraversion", "agreeableness", "neuroticism"];
        for (const t of traits) {
            const val = profile[t];
            const range = p.ranges[t];
            if (inRange(val, range)) {
                hits += 1;
                proximity += distanceFromRangeCenter(val, range);
            } else {
                // small partial credit if close (within 10 points)
                const [min, max] = range;
                const delta = Math.max(min - val, val - max, 0);
                if (delta <= 10) {
                    proximity += delta; // still added as penalty
                } else {
                    proximity += 30; // large penalty
                }
            }
        }
        // compute a composite score: primary = hits (0..5), secondary = negative proximity
        return {
            persona: p,
            hits,
            proximity
        };
    });

    // pick highest hits; break ties with lower proximity (closer to centers)
    scored.sort((a, b) => {
        if (b.hits !== a.hits) return b.hits - a.hits;
        return a.proximity - b.proximity;
    });

    const top = scored[0];
    const second = scored[1];

    // confidence: fraction of matched traits (hits/5) adjusted by proximity
    const baseConfidence = top.hits / 5;
    // normalize proximity roughly: lower proximity -> higher boost
    const proximityBoost = Math.max(0, 1 - (top.proximity / (5 * 50))); // prox max ~250
    const confidence = Math.min(1, baseConfidence * 0.75 + proximityBoost * 0.25);

    // tie detection
    const tie = top.hits === second.hits && Math.abs(top.proximity - second.proximity) < 20;

    return {
        persona: top.persona,
        confidence: Math.round(confidence * 100),
        hits: top.hits,
        proximity: Math.round(top.proximity),
        tie
    };
}

/**
 * Heuristic to detect uniform answers (straight-lining).
 * Pass raw answers array or object values.
 */
export function detectUniformResponses(answers: number[] | Record<string, number>) {
    const values = Array.isArray(answers) ? answers : Object.values(answers);
    if (values.length === 0) return false;
    const uniq = new Set(values);
    if (uniq.size === 1) return true;
    // low variance
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / values.length;
    const std = Math.sqrt(variance);
    if (std < 0.5) return true; // extremely low variance on 1-5 scale
    return false;
}

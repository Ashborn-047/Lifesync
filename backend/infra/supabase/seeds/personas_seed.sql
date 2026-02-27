-- backend/infra/supabase/seeds/personas_seed.sql
-- Clear existing personas (optional, use with caution in prod)
-- TRUNCATE internal.personas;
INSERT INTO internal.personas (
        id,
        title,
        mbti,
        tagline,
        ranges,
        strengths,
        growth,
        description,
        llm_template
    )
VALUES (
        'p_detached_observer',
        'The Detached Observer',
        'INTP-ish',
        'Quiet, reserved, and highly reflective.',
        '{"openness": [0, 20], "conscientiousness": [0, 40], "extraversion": [0, 30], "agreeableness": [0, 30], "neuroticism": [0, 40]}',
        ARRAY ['Calm under pressure', 'Objective reasoning', 'Independent problem-solving'],
        ARRAY ['Emotional expressiveness', 'Social initiative', 'Long-term planning'],
        'A reserved thinker who prefers observation and analysis over social stimulation. Practical, internally driven, and often self-sufficient.',
        'Summarize persona: factual, concise (3-4 short paragraphs). Focus on behavioral cues and actionable growth suggestions.'
    ),
    (
        'p_reserved_strategist',
        'The Reserved Strategist',
        'ISTJ-ish',
        'Careful, dependable, quietly effective.',
        '{"openness": [0, 20], "conscientiousness": [60, 100], "extraversion": [0, 30], "agreeableness": [40, 60], "neuroticism": [0, 40]}',
        ARRAY ['Reliable execution', 'Attention to detail', 'Disciplined work ethic'],
        ARRAY ['Flexibility', 'Expressing warmth', 'Big-picture thinking'],
        'Structured and practical. Prioritizes efficiency and order — excels with predictable systems and clear responsibilities.',
        'Create a pragmatic, trust-building narrative. Include 3 action tips for improving flexibility and interpersonal warmth.'
    ),
    (
        'p_creative_dynamo',
        'The Creative Dynamo',
        'ENFP-ish',
        'Ideas first, structure later.',
        '{"openness": [80, 100], "conscientiousness": [80, 100], "extraversion": [70, 100], "agreeableness": [60, 100], "neuroticism": [20, 60]}',
        ARRAY ['Highly creative', 'Energetic collaboration', 'Ambitious and driven'],
        ARRAY ['Manage overwhelm', 'Sustain focus', 'Emotional regulation'],
        'A powerhouse of ideas and energy. Brings enthusiasm and breadth of vision but may struggle with consistency and stress.',
        'Write a vivid, motivational persona summary emphasizing channeling creative energy into sustainable routines. Include two small habit suggestions.'
    ),
    (
        'p_analytical_explorer',
        'The Analytical Explorer',
        'ISTP',
        'You fix what''s broken; you build what''s needed.',
        '{"openness": [60, 80], "conscientiousness": [40, 60], "extraversion": [20, 40], "agreeableness": [40, 80], "neuroticism": [40, 60]}',
        ARRAY ['Practical problem-solving', 'Adaptable', 'Composed under pressure'],
        ARRAY ['Sharing feelings', 'Long-term vision'],
        'Hands-on, resourceful, and pragmatic. Prefers direct action and practical solutions; comfortable experimenting in real conditions.',
        'Offer experimental learning steps and 3 real-world projects or routines to apply skills.'
    ),
    (
        'p_caring_connector',
        'The Caring Connector',
        'ESFJ-ish',
        'People-first, relationship-centered.',
        '{"openness": [40, 70], "conscientiousness": [50, 80], "extraversion": [60, 90], "agreeableness": [70, 100], "neuroticism": [10, 50]}',
        ARRAY ['Empathy', 'Community-building', 'Reliable support'],
        ARRAY ['Boundaries', 'Self-prioritization'],
        'Warm, responsive, and attuned to social dynamics. Focuses on keeping people connected and supported.',
        'Give interpersonal scripts for boundary-setting and proactive self-care practices in friendly tone.'
    ),
    (
        'p_structured_planner',
        'The Structured Planner',
        'ESTJ-ish',
        'Organized, decisive, and action-oriented.',
        '{"openness": [30, 60], "conscientiousness": [80, 100], "extraversion": [50, 80], "agreeableness": [30, 60], "neuroticism": [10, 40]}',
        ARRAY ['Reliable delivery', 'Clear priorities', 'Leadership presence'],
        ARRAY ['Emotional nuance', 'Tolerance for ambiguity'],
        'Values order and predictable performance; excels at translating plans into results.',
        'Provide a crisp 3-point action plan for delegating, prioritizing, and delegating softer communication.'
    ),
    (
        'p_introspective_scholar',
        'The Introspective Scholar',
        'INFJ-ish',
        'Quiet depth, principled thinking.',
        '{"openness": [70, 100], "conscientiousness": [50, 80], "extraversion": [0, 40], "agreeableness": [50, 80], "neuroticism": [20, 60]}',
        ARRAY ['Deep insight', 'Ethical consistency', 'Long-term thinking'],
        ARRAY ['Practical follow-through', 'Social outreach'],
        'Reflective and values-driven. Prefers meaningful work and considered judgment over quick wins.',
        'Create a grounded, empathetic narrative focusing on meaningful next steps and guardrails against burnout.'
    ),
    (
        'p_social_innovator',
        'The Social Innovator',
        'ENFJ-ish',
        'Big-picture connector and motivator.',
        '{"openness": [60, 90], "conscientiousness": [50, 80], "extraversion": [70, 100], "agreeableness": [60, 90], "neuroticism": [10, 50]}',
        ARRAY ['Vision communication', 'People mobilization', 'Charisma'],
        ARRAY ['Pacing', 'Micro-detail'],
        'Leads by inspiration and human understanding. Great at aligning people around a mission.',
        'Write a motivational piece that translates big vision into 3 tactical actions and invites accountability.'
    ),
    (
        'p_calm_custodian',
        'The Calm Custodian',
        'ISFJ-ish',
        'Steady, protective, quietly dependable.',
        '{"openness": [20, 50], "conscientiousness": [60, 90], "extraversion": [10, 40], "agreeableness": [60, 90], "neuroticism": [0, 40]}',
        ARRAY ['Reliability', 'Care for systems', 'Consistency'],
        ARRAY ['Adaptability', 'Delegation'],
        'Prefers stable roles and is driven by responsibility to others. Effective in maintenance and support roles.',
        'Offer gentle encouragement and concrete delegation experiments to free bandwidth.'
    ),
    (
        'p_inventive_loner',
        'The Inventive Loner',
        'INTJ-ish',
        'Strategic, private, relentlessly curious.',
        '{"openness": [70, 100], "conscientiousness": [60, 90], "extraversion": [0, 40], "agreeableness": [20, 50], "neuroticism": [10, 50]}',
        ARRAY ['Strategic foresight', 'Independent research', 'High competence'],
        ARRAY ['Relational warmth', 'Team alignment'],
        'Prefers autonomy and long-range planning. Strong at systems thinking and high-complexity problems.',
        'Explain pragmatic steps to prototype strategy and soft-skill practice for team alignment.'
    ),
    (
        'p_optimistic_driver',
        'The Optimistic Driver',
        'ENTP-ish',
        'Fast thinker, witty, and opportunistic.',
        '{"openness": [70, 100], "conscientiousness": [30, 70], "extraversion": [60, 95], "agreeableness": [30, 70], "neuroticism": [10, 50]}',
        ARRAY ['Rapid idea generation', 'Adaptability', 'Risk tolerance'],
        ARRAY ['Follow-through', 'Sensitivity in persuasion'],
        'Excels in rapid prototyping and ideation. Needs structure to realize ideas repeatedly.',
        'Provide experiment-style suggestions and a 2-week follow-through plan.'
    ),
    (
        'p_grounded_reliability',
        'The Grounded Reliability',
        'ESTP-ish',
        'Action-first, results-focused.',
        '{"openness": [40, 70], "conscientiousness": [50, 80], "extraversion": [60, 95], "agreeableness": [30, 70], "neuroticism": [10, 50]}',
        ARRAY ['Effective improvisation', 'Action orientation', 'Calm under pressure'],
        ARRAY ['Planning horizon', 'Emotional reflection'],
        'Thrives in dynamic environments. Tactical and immediate — loves hands-on challenges.',
        'Recommend immediate projects and micro-retrospectives for learning from action.'
    ),
    (
        'p_compassionate_mentor',
        'The Compassionate Mentor',
        'INFJ/ENFJ hybrid',
        'Deeply nurturing, guided by values.',
        '{"openness": [50, 80], "conscientiousness": [50, 80], "extraversion": [30, 70], "agreeableness": [70, 100], "neuroticism": [10, 50]}',
        ARRAY ['Mentoring', 'Perspective-taking', 'Long-term care'],
        ARRAY ['Self-care', 'Boundary clarity'],
        'Natural at long-term support and growth work. Values meaningful connection and development.',
        'Give coaching scripts and daily micro-practices to preserve energy while supporting others.'
    ),
    (
        'p_steady_resolver',
        'The Steady Resolver',
        'ISFP-ish',
        'Practical kindness with quiet strength.',
        '{"openness": [40, 70], "conscientiousness": [40, 70], "extraversion": [20, 60], "agreeableness": [50, 90], "neuroticism": [10, 50]}',
        ARRAY ['Practical empathy', 'Conflict de-escalation', 'Reliable action'],
        ARRAY ['Big-picture focus', 'Self-advocacy'],
        'Balances action with care; stabilizes teams and relationships with steady presence.',
        'Offer 3 conflict-resolution steps and assertiveness micro-practices.'
    ),
    (
        'p_adaptable_explorer',
        'The Adaptable Explorer',
        'ENFP/ENTP mix',
        'Flexible, curious, socially energetic.',
        '{"openness": [60, 95], "conscientiousness": [30, 60], "extraversion": [60, 100], "agreeableness": [40, 80], "neuroticism": [10, 50]}',
        ARRAY ['Curiosity', 'Network building', 'Creative problem solving'],
        ARRAY ['Focus', 'Follow-through'],
        'Energetic curiosity and social agility. Thrives in exploratory contexts and rapid iteration.',
        'Give a 30-day curiosity challenge and accountability checkpoints.'
    ),
    (
        'p_balanced_generalist',
        'The Balanced Generalist',
        'ISxP/INxP balanced',
        'Even-keeled and dependable.',
        '{"openness": [40, 70], "conscientiousness": [40, 70], "extraversion": [40, 70], "agreeableness": [40, 70], "neuroticism": [20, 50]}',
        ARRAY ['Reliability', 'Versatility', 'Moderation'],
        ARRAY ['Distinct differentiation', 'Core vision'],
        'A steady profile without extreme poles. Great at bridging gaps and providing consistent contribution.',
        'Provide a gentle growth plan focusing on specialization and a single 90-day project.'
    ),
    (
        'p_extreme_low',
        'Extreme Low Profile',
        NULL,
        'Markedly underactive or withdrawn across measures.',
        '{"openness": [0, 10], "conscientiousness": [0, 10], "extraversion": [0, 10], "agreeableness": [0, 10], "neuroticism": [0, 10]}',
        ARRAY []::TEXT [],
        ARRAY ['Activation', 'Social engagement', 'Affect monitoring'],
        'Uniformly low scores across traits. This may reflect extreme disengagement, low arousal, or context-specific suppression. Treat interpretations cautiously; consider follow-up screening.',
        'Flag carefully: ask follow-up questions about fatigue, context, and motivation. Suggest gentle activation steps and recommend retest in varied context.'
    ),
    (
        'p_extreme_high',
        'Extreme High Profile',
        NULL,
        'Markedly intense across measures.',
        '{"openness": [90, 100], "conscientiousness": [90, 100], "extraversion": [90, 100], "agreeableness": [90, 100], "neuroticism": [80, 100]}',
        ARRAY ['High energy', 'Drive', 'Broad engagement'],
        ARRAY ['Stress regulation', 'Selective focus'],
        'Extremely high trait scores across the board. May indicate intense reactivity or hyperengaged style. Interpret with context and recommend pacing strategies.',
        'Provide targeted stress management and prioritization techniques; ask follow-ups about sleep and workload.'
    ),
    (
        'p_uniform_response',
        'Uniform Response Pattern (Diagnostic)',
        NULL,
        'Highly uniform answers detected.',
        '{"openness": [0, 100], "conscientiousness": [0, 100], "extraversion": [0, 100], "agreeableness": [0, 100], "neuroticism": [0, 100]}',
        ARRAY []::TEXT [],
        ARRAY ['Validity concerns'],
        'Answers show minimal variance. This can indicate straight-lining, inattention, trolling, or misunderstanding. Recommend retake with instructions, or run full 180-question follow-up.',
        'Ask the user clarifying follow-ups about attention, environment, and ask to retake. Provide a one-sentence explanation why results are not diagnostic.'
    ) ON CONFLICT (id) DO
UPDATE
SET title = EXCLUDED.title,
    mbti = EXCLUDED.mbti,
    tagline = EXCLUDED.tagline,
    ranges = EXCLUDED.ranges,
    strengths = EXCLUDED.strengths,
    growth = EXCLUDED.growth,
    description = EXCLUDED.description,
    llm_template = EXCLUDED.llm_template,
    updated_at = now();
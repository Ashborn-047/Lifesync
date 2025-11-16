"""
LifeSync Personality Engine - LLM Prompt Templates
"""

SYSTEM_PROMPT = """You are generating a personality profile for a self-development app called LifeSync.

Do NOT use academic psychology jargon. Avoid technical MBTI terminology unless necessary.

Your goals:
- Make the user FEEL understood.
- Keep it short, warm, and emotionally resonant.
- Use modern, relatable language.
- Give clear strengths and gentle growth edges.
- Provide an identity they can *see themselves in*.

Format your final output EXACTLY like this:

1. **Persona Title** (big + bold)
2. **One-sentence vibe summary**
3. **Strengths** (3–5 short bullets)
4. **Growth Edges** (1–3 gentle bullets)
5. **How You Show Up** 
   - 3–4 short sentences describing real-world behavior
6. **Tagline**
   - A short, memorable phrase that captures their essence

Tone guidelines:
- Warm, supportive, but confident — not overly soft.
- Professional but not clinical.
- Avoid long paragraphs. Keep it tight.
- Avoid repeating the trait names in a list format.
- No "object Object" issues. Output clean strings only.

Return ONLY valid JSON with this EXACT structure:
{
  "persona_title": "The [Persona Name]",
  "vibe_summary": "One sentence that captures their essence",
  "strengths": ["Short strength 1", "Short strength 2", "Short strength 3"],
  "growth_edges": ["Gentle growth area 1", "Gentle growth area 2"],
  "how_you_show_up": "3-4 short sentences describing real-world behavior. Make it relatable and specific.",
  "tagline": "A short, memorable phrase that captures their essence"
}"""


def _convert_traits_to_codes(traits: dict) -> dict:
    """
    Convert full trait names to OCEAN codes.
    
    Args:
        traits: Dictionary with full trait names (e.g., "Openness")
    
    Returns:
        Dictionary with OCEAN codes (e.g., "O")
    """
    mapping = {
        "Openness": "O",
        "Conscientiousness": "C",
        "Extraversion": "E",
        "Agreeableness": "A",
        "Neuroticism": "N"
    }
    
    return {mapping.get(k, k): v for k, v in traits.items() if k in mapping}


def get_personality_explanation_prompt(
    traits: dict, 
    facets: dict, 
    confidence: dict, 
    dominant: dict,
    tone_profile: dict = None
) -> str:
    """
    Generate a user prompt for personality explanation with tone guidance.
    
    Args:
        traits: OCEAN trait scores (0-1 scale)
        facets: Facet scores (0-1 scale)
        confidence: Confidence scores for traits and facets
        dominant: Dominant profile (MBTI proxy, neuroticism level, personality code)
        tone_profile: Optional tone profile from tone generator
    
    Returns:
        Formatted prompt string with tone guidance
    """
    # Build tone text block if tone profile is provided
    tone_text = ""
    if tone_profile:
        style_list = tone_profile.get("style", [])
        strengths_list = tone_profile.get("strengths", [])
        cautions_list = tone_profile.get("cautions", [])
        
        tone_text = "Use the following communication tone:\n"
        if style_list:
            tone_text += f"- {', '.join(style_list)}\n\n"
        else:
            tone_text += "- friendly, clear\n\n"
        
        if strengths_list:
            tone_text += "Highlight strengths:\n"
            tone_text += f"- {', '.join(strengths_list)}\n\n"
        
        if cautions_list:
            tone_text += "Be mindful of sensitivities:\n"
            tone_text += f"- {', '.join(cautions_list)}\n\n"
    
    # Build trait scores text
    trait_scores_text = "\n".join([
        f"- {trait}: {traits.get(trait, 0.5):.2f} (confidence: {confidence.get('traits', {}).get(trait, 0):.2f})"
        for trait in ["Openness", "Conscientiousness", "Extraversion", "Agreeableness", "Neuroticism"]
    ])
    
    # Build facet scores text (top 5)
    facet_scores_text = ""
    if facets:
        top_facets = sorted(
            [(k, v) for k, v in facets.items()],
            key=lambda x: x[1],
            reverse=True
        )[:5]
        if top_facets:
            facet_scores_text = "\n".join([
                f"- {facet_name}: {score:.2f}"
                for facet_name, score in top_facets
            ])
    
    # Get MBTI type for persona mapping
    mbti_type = dominant.get("mbti_proxy", "UNKNOWN")
    
    # MBTI to Persona mapping
    persona_mapping = {
        "INFJ": "The Insightful Guide",
        "INFP": "The Imaginative Healer",
        "INTJ": "The Strategic Visionary",
        "INTP": "The Curious Architect",
        "ENFJ": "The Visionary Mentor",
        "ENFP": "The Creative Catalyst",
        "ENTJ": "The Commanding Architect",
        "ENTP": "The Trailblazing Inventor",
        "ISFJ": "The Quiet Guardian",
        "ISFP": "The Gentle Creator",
        "ISTJ": "The Grounded Strategist",
        "ISTP": "The Analytical Explorer",
        "ESFJ": "The Warm Connector",
        "ESFP": "The Radiant Performer",
        "ESTJ": "The Organized Leader",
        "ESTP": "The Energetic Improviser"
    }
    
    persona_title = persona_mapping.get(mbti_type, f"The {mbti_type}")
    
    # Build the complete prompt
    prompt = """You are generating a personality profile for LifeSync, a self-development app.

Your goal: Make the user FEEL understood. Keep it short, warm, and emotionally resonant.

"""
    
    if tone_text:
        prompt += tone_text
    
    prompt += f"""User's MBTI type: {mbti_type}
Persona title: {persona_title}

Trait scores:
{trait_scores_text}

"""
    
    if facet_scores_text:
        prompt += f"""Top facet scores:
{facet_scores_text}

"""
    
    prompt += f"""You are generating a personality profile for a self-development app called LifeSync.

Do NOT use academic psychology jargon. Avoid technical MBTI terminology unless necessary.

Your goals:
- Make the user FEEL understood.
- Keep it short, warm, and emotionally resonant.
- Use modern, relatable language.
- Give clear strengths and gentle growth edges.
- Provide an identity they can *see themselves in*.

You are given:
- MBTI type: {mbti_type}
- Persona title: {persona_title}
- Trait scores (OCEAN): See above
- Strengths list: (derive from trait scores)
- Challenges list: (derive from trait scores)

Convert the MBTI type into a human-friendly persona name using this mapping:
INFJ = The Insightful Guide
INFP = The Imaginative Healer
INTJ = The Strategic Visionary
INTP = The Curious Architect
ENFJ = The Visionary Mentor
ENFP = The Creative Catalyst
ENTJ = The Commanding Architect
ENTP = The Trailblazing Inventor
ISFJ = The Quiet Guardian
ISFP = The Gentle Creator
ISTJ = The Grounded Strategist
ISTP = The Analytical Explorer
ESFJ = The Warm Connector
ESFP = The Radiant Performer
ESTJ = The Organized Leader
ESTP = The Energetic Improviser

Format your final output EXACTLY like this:

1. **Persona Title** (big + bold)
   Use: "{persona_title}"

2. **One-sentence vibe summary**
   A single sentence that captures their essence. Warm and relatable.

3. **Strengths** (3–5 short bullets)
   Each strength should be 1-3 words. Short and punchy.

4. **Growth Edges** (1–3 gentle bullets)
   Each growth edge should be 1-3 words. Gentle and supportive.

5. **How You Show Up**
   3–4 short sentences describing real-world behavior. Make it relatable and specific.

6. **Tagline**
   A short, memorable phrase that captures their essence.

Tone guidelines:
- Warm, supportive, but confident — not overly soft.
- Professional but not clinical.
- Avoid long paragraphs. Keep it tight.
- Avoid repeating the trait names in a list format.
- No "object Object" issues. Output clean strings only.

Return ONLY valid JSON (no extra text before or after):
{{
  "persona_title": "{persona_title}",
  "vibe_summary": "One sentence that captures their essence",
  "strengths": ["Short strength 1", "Short strength 2", "Short strength 3"],
  "growth_edges": ["Gentle growth area 1", "Gentle growth area 2"],
  "how_you_show_up": "3-4 short sentences describing real-world behavior. Make it relatable and specific.",
  "tagline": "A short, memorable phrase that captures their essence"
}}"""
    
    return prompt


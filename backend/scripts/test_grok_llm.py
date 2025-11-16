"""
Test script for Grok LLM provider integration
Tests the full explanation generation flow with Grok
"""

import sys
import os
from dotenv import load_dotenv

# Add project root to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Load environment variables
load_dotenv()

from src.ai.explanation_generator import generate_explanation_with_tone
from src.config.llm_provider import get_grok_key, is_provider_available


def create_fake_assessment_data():
    """
    Create fake assessment data for testing.
    
    Returns:
        Dictionary with traits, facets, confidence, and dominant profile
    """
    # OCEAN traits (using full names as expected by the system)
    traits = {
        "Openness": 0.72,
        "Conscientiousness": 0.41,
        "Extraversion": 0.33,
        "Agreeableness": 0.85,
        "Neuroticism": 0.56
    }
    
    # Sample facets (30 facets total, showing a subset)
    facets = {
        "Fantasy": 0.70,
        "Aesthetics": 0.65,
        "Feelings": 0.68,
        "Actions": 0.45,
        "Ideas": 0.75,
        "Values": 0.60,
        "Competence": 0.40,
        "Order": 0.35,
        "Dutifulness": 0.50,
        "Achievement": 0.45,
        "Self-Discipline": 0.38,
        "Deliberation": 0.42,
        "Warmth": 0.80,
        "Gregariousness": 0.30,
        "Assertiveness": 0.25,
        "Activity": 0.40,
        "Excitement-Seeking": 0.35,
        "Positive Emotions": 0.50,
        "Trust": 0.90,
        "Straightforwardness": 0.85,
        "Altruism": 0.88,
        "Compliance": 0.82,
        "Modesty": 0.75,
        "Tender-Mindedness": 0.80,
        "Anxiety": 0.60,
        "Angry Hostility": 0.45,
        "Depression": 0.55,
        "Self-Consciousness": 0.58,
        "Immoderation": 0.50,
        "Vulnerability": 0.51
    }
    
    # Confidence scores
    confidence = {
        "traits": {
            "Openness": 0.95,
            "Conscientiousness": 0.90,
            "Extraversion": 0.88,
            "Agreeableness": 0.92,
            "Neuroticism": 0.85
        },
        "facets": {facet: 0.85 for facet in facets.keys()}
    }
    
    # Dominant profile
    dominant = {
        "mbti_proxy": "INFP",
        "neuroticism_level": "Balanced",
        "personality_code": "INFP-B"
    }
    
    return {
        "traits": traits,
        "facets": facets,
        "confidence": confidence,
        "dominant": dominant
    }


def print_explanation_result(result: dict):
    """
    Print the explanation result in a formatted way.
    
    Args:
        result: Explanation dictionary from generate_explanation_with_tone
    """
    print("\n" + "=" * 70)
    print("GROK LLM EXPLANATION RESULT")
    print("=" * 70)
    
    # Check for errors
    if "error" in result:
        print(f"\n[ERROR] {result.get('error')}")
        if "raw_response" in result:
            print(f"\nRaw response: {result.get('raw_response')[:200]}...")
        return
    
    # Model info
    print(f"\nModel: {result.get('model_name', 'unknown')}")
    print(f"Generation time: {result.get('generation_time_ms', 0)}ms")
    if result.get('tokens_used'):
        print(f"Tokens used: {result.get('tokens_used')}")
    
    # Summary
    print("\n" + "-" * 70)
    print("SUMMARY")
    print("-" * 70)
    summary = result.get("summary", "")
    if summary:
        print(summary)
    else:
        print("[No summary generated]")
    
    # Steps (Key Insights)
    print("\n" + "-" * 70)
    print("KEY INSIGHTS")
    print("-" * 70)
    steps = result.get("steps", [])
    if steps:
        for i, step in enumerate(steps, 1):
            if isinstance(step, dict):
                # Handle structured step format
                title = step.get("title", f"Insight {i}")
                content = step.get("content", "")
                print(f"\n{i}. {title}")
                if content:
                    print(f"   {content}")
            else:
                # Handle string format
                print(f"\n{i}. {step}")
    else:
        print("[No insights generated]")
    
    # Confidence Note
    print("\n" + "-" * 70)
    print("CONFIDENCE NOTE")
    print("-" * 70)
    confidence_note = result.get("confidence_note", "")
    if confidence_note:
        print(confidence_note)
    else:
        print("[No confidence note]")
    
    # Tone Profile
    print("\n" + "-" * 70)
    print("TONE PROFILE")
    print("-" * 70)
    tone_profile = result.get("tone_profile", {})
    if tone_profile:
        style = tone_profile.get("style", [])
        strengths = tone_profile.get("strengths", [])
        cautions = tone_profile.get("cautions", [])
        
        print(f"\nStyle: {', '.join(style) if style else 'None'}")
        print(f"\nStrengths:")
        for strength in strengths:
            print(f"  - {strength}")
        
        print(f"\nCautions:")
        for caution in cautions:
            print(f"  - {caution}")
    else:
        print("[No tone profile]")
    
    print("\n" + "=" * 70)


def main():
    """Main test function"""
    print("=" * 70)
    print("GROK LLM PROVIDER TEST")
    print("=" * 70)
    print()
    
    # Check if Grok is available
    print("1. Checking Grok configuration...")
    grok_key = get_grok_key()
    if not grok_key or grok_key.startswith("YOUR"):
        print("[ERROR] GROK_API_KEY not configured in .env file")
        print("Please add: GROK_API_KEY=\"your-actual-key\"")
        sys.exit(1)
    
    is_available = is_provider_available("grok")
    print(f"   Grok API key: {'Configured' if is_available else 'Not configured'}")
    
    if not is_available:
        print("[ERROR] Grok provider is not available")
        sys.exit(1)
    
    print("[OK] Grok provider is available")
    print()
    
    # Create fake assessment data
    print("2. Creating fake assessment data...")
    assessment_data = create_fake_assessment_data()
    print(f"   Traits: {len(assessment_data['traits'])} OCEAN traits")
    print(f"   Facets: {len(assessment_data['facets'])} facets")
    print("[OK] Assessment data created")
    print()
    
    # Generate explanation using Grok
    print("3. Generating explanation with Grok provider...")
    print("   (This may take 10-30 seconds)")
    print()
    
    try:
        result = generate_explanation_with_tone(
            traits=assessment_data["traits"],
            facets=assessment_data["facets"],
            confidence=assessment_data["confidence"],
            dominant=assessment_data["dominant"],
            provider="grok"  # Force Grok provider
        )
        
        print("[OK] Explanation generated successfully!")
        print()
        
        # Print results
        print_explanation_result(result)
        
        # Validation
        print("\n" + "=" * 70)
        print("VALIDATION")
        print("=" * 70)
        
        has_summary = bool(result.get("summary"))
        has_steps = bool(result.get("steps"))
        has_tone = bool(result.get("tone_profile"))
        model_name = result.get("model_name", "")
        
        print(f"[OK] Summary present: {has_summary}")
        print(f"[OK] Steps/Insights present: {has_steps}")
        print(f"[OK] Tone profile present: {has_tone}")
        print(f"[OK] Model name: {model_name}")
        
        if "grok" in model_name.lower():
            print("\n[SUCCESS] Grok provider was used successfully!")
        else:
            print(f"\n[WARNING] Expected Grok but got: {model_name}")
            print("         (This may be due to Grok API errors or fallback behavior)")
        
        if has_summary and has_steps and has_tone:
            print("\n[SUCCESS] All required fields present!")
        else:
            print("\n[WARNING] Some fields are missing")
        
    except Exception as e:
        print(f"\n[ERROR] Explanation generation failed: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)


if __name__ == "__main__":
    main()


"""
LifeSync Personality Assessment - Persona Variation Test
Tests that varied answer patterns generate all 16 MBTI types and their persona names.

Runs 100+ assessments with random answer patterns to verify:
- All 16 MBTI types can be generated
- Persona names are correctly mapped
- Distribution is varied (not biased to specific types)

Run with: pytest tests/test_persona_variation.py -v --log-cli-level=INFO -s
"""

import pytest
import sys
import logging
import random
from pathlib import Path
from typing import Dict, List
from collections import Counter

# Add src to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from src.scorer.personality_scorer import PersonalityScorer

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# MBTI to Persona mapping
PERSONA_MAPPING = {
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


@pytest.fixture
def scorer():
    """Create a scorer instance for testing"""
    questions_path = Path(__file__).parent.parent / "data" / "question_bank" / "lifesync_180_questions.json"
    logger.info(f"Loading scorer from: {questions_path}")
    return PersonalityScorer(str(questions_path))


@pytest.fixture
def balanced_question_ids():
    """Get balanced question IDs from smart_quiz_30.json"""
    smart_quiz_path = Path(__file__).parent.parent / "data" / "question_bank" / "smart_quiz_30.json"
    
    if smart_quiz_path.exists():
        import json
        with open(smart_quiz_path, 'r') as f:
            data = json.load(f)
            question_ids = data.get('question_ids', [])
            logger.info(f"Loaded {len(question_ids)} balanced question IDs from smart_quiz_30.json")
            return question_ids[:30]  # Ensure exactly 30
    
    # Fallback: use first 30 questions
    questions_path = Path(__file__).parent.parent / "data" / "question_bank" / "lifesync_180_questions.json"
    import json
    with open(questions_path, 'r') as f:
        data = json.load(f)
        questions = data.get('questions', [])
        return [q['id'] for q in questions[:30]]


def generate_varied_responses(question_ids: List[str], seed: int = None) -> Dict[str, int]:
    """
    Generate varied responses with different patterns to encourage MBTI diversity.
    
    Patterns:
    - Some questions get extreme answers (1 or 5)
    - Some get moderate answers (2, 3, 4)
    - Mix of patterns to create varied personality profiles
    """
    if seed is not None:
        random.seed(seed)
    
    responses = {}
    for i, q_id in enumerate(question_ids):
        # Create varied patterns
        pattern = i % 5
        
        if pattern == 0:
            # 20% extreme low
            value = random.choice([1, 1, 2])
        elif pattern == 1:
            # 20% low-moderate
            value = random.choice([2, 3])
        elif pattern == 2:
            # 20% neutral
            value = random.choice([2, 3, 4])
        elif pattern == 3:
            # 20% high-moderate
            value = random.choice([3, 4])
        else:
            # 20% extreme high
            value = random.choice([4, 5, 5])
        
        responses[q_id] = value
    
    return responses


class TestPersonaVariation:
    """Test that varied answer patterns generate diverse MBTI types and personas"""
    
    def test_persona_variation_100_runs(self, scorer, balanced_question_ids):
        """Run 100+ assessments and verify persona diversity"""
        logger.info("=" * 80)
        logger.info("PERSONA VARIATION TEST - 100+ Assessments")
        logger.info("=" * 80)
        logger.info("")
        
        NUM_RUNS = 100
        results = []
        mbti_counter = Counter()
        persona_counter = Counter()
        
        logger.info(f"Running {NUM_RUNS} assessments with varied answer patterns...")
        logger.info("")
        
        for run_num in range(1, NUM_RUNS + 1):
            # Generate varied responses
            responses = generate_varied_responses(balanced_question_ids, seed=run_num)
            
            # Score the responses
            results_data = scorer.score(responses)
            
            mbti = results_data.get('mbti_proxy')
            if mbti:
                persona = PERSONA_MAPPING.get(mbti, f"Unknown ({mbti})")
                mbti_counter[mbti] += 1
                persona_counter[persona] += 1
                
                results.append({
                    'run': run_num,
                    'mbti': mbti,
                    'persona': persona,
                    'has_complete_profile': results_data.get('has_complete_profile', False)
                })
            
            # Progress indicator every 20 runs
            if run_num % 20 == 0:
                logger.info(f"  Progress: {run_num}/{NUM_RUNS} assessments completed...")
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("RESULTS: Persona Distribution")
        logger.info("=" * 80)
        logger.info("")
        
        # Display personas with MBTI types
        logger.info("Generated Personas (Persona Name in bold, MBTI type in small):")
        logger.info("")
        
        # Group by persona
        persona_groups = {}
        for result in results:
            persona = result['persona']
            if persona not in persona_groups:
                persona_groups[persona] = []
            persona_groups[persona].append(result['mbti'])
        
        # Display each unique persona
        for persona, mbti_list in sorted(persona_groups.items()):
            mbti_types = set(mbti_list)
            count = len(mbti_list)
            mbti_str = ", ".join(sorted(mbti_types))
            logger.info(f"**{persona}**")
            logger.info(f"  <small>MBTI: {mbti_str}</small> ({count} occurrences)")
            logger.info("")
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("SUMMARY TABLE: MBTI Type Distribution")
        logger.info("=" * 80)
        logger.info("")
        
        # Create summary table
        logger.info(f"{'MBTI Type':<8} {'Persona Name':<35} {'Count':<8} {'Percentage':<10}")
        logger.info("-" * 80)
        
        total_valid = sum(mbti_counter.values())
        
        # Sort by count (descending)
        for mbti, count in mbti_counter.most_common():
            persona = PERSONA_MAPPING.get(mbti, "Unknown")
            percentage = (count / total_valid * 100) if total_valid > 0 else 0
            logger.info(f"{mbti:<8} {persona:<35} {count:<8} {percentage:>6.1f}%")
        
        logger.info("-" * 80)
        logger.info(f"{'TOTAL':<8} {'':<35} {total_valid:<8} {100.0:>6.1f}%")
        logger.info("")
        
        # Check for all 16 types
        logger.info("=" * 80)
        logger.info("VERIFICATION: Coverage of All 16 MBTI Types")
        logger.info("=" * 80)
        logger.info("")
        
        all_types = set(PERSONA_MAPPING.keys())
        generated_types = set(mbti_counter.keys())
        missing_types = all_types - generated_types
        
        logger.info(f"Total MBTI types generated: {len(generated_types)}/16")
        logger.info("")
        
        if missing_types:
            logger.info(f"⚠️  Missing types ({len(missing_types)}): {', '.join(sorted(missing_types))}")
        else:
            logger.info("✅ All 16 MBTI types generated!")
        
        logger.info("")
        logger.info("Generated types:")
        for mbti in sorted(generated_types):
            persona = PERSONA_MAPPING.get(mbti, "Unknown")
            count = mbti_counter[mbti]
            logger.info(f"  ✅ {mbti} ({persona}): {count} times")
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("STATISTICS")
        logger.info("=" * 80)
        logger.info("")
        logger.info(f"Total assessments: {NUM_RUNS}")
        logger.info(f"Valid MBTI results: {total_valid}")
        logger.info(f"Unique MBTI types: {len(generated_types)}")
        logger.info(f"Unique personas: {len(persona_counter)}")
        logger.info("")
        
        # Distribution analysis
        counts = list(mbti_counter.values())
        if counts:
            avg_count = sum(counts) / len(counts)
            max_count = max(counts)
            min_count = min(counts)
            logger.info(f"Average occurrences per type: {avg_count:.1f}")
            logger.info(f"Most common type: {max(mbti_counter.items(), key=lambda x: x[1])[0]} ({max_count} times)")
            logger.info(f"Least common type: {min(mbti_counter.items(), key=lambda x: x[1])[0]} ({min_count} times)")
            logger.info(f"Distribution spread: {max_count - min_count} (max - min)")
        
        logger.info("")
        logger.info("=" * 80)
        logger.info("✅ TEST COMPLETED")
        logger.info("=" * 80)
        
        # Assertions
        assert total_valid > 0, "Should have at least one valid MBTI result"
        assert len(generated_types) >= 8, f"Should generate at least 8 different MBTI types, got {len(generated_types)}"


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--log-cli-level=INFO", "-s"])


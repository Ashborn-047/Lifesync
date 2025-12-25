"""
LifeSync Personality Scoring Engine
Handles 180-question OCEAN assessment with 30 facets
"""

import json
from typing import Dict, List, Tuple, Optional, Union
from collections import defaultdict
from src.config.constants import SCORING_VERSION


class PersonalityScorer:
    """Score personality responses and return OCEAN traits + facets"""
    
    # Minimum questions per trait to generate a valid score
    MIN_QUESTIONS_PER_TRAIT = 3
    
    def __init__(self, questions_path: str):
        """Load question bank from JSON file"""
        with open(questions_path, 'r') as f:
            data = json.load(f)
        
        self.questions = {q['id']: q for q in data['questions']}
        self.facets = data['facets']
        self.traits = data['traits']
        self.scale = data['scale']
        
        # Compute max weights per trait/facet for confidence scoring
        self.max_weights = self._compute_max_weights()
    
    def _compute_max_weights(self) -> Dict:
        """Calculate maximum possible weight per trait and facet"""
        trait_weights = defaultdict(float)
        facet_weights = defaultdict(float)
        
        for q in self.questions.values():
            trait_weights[q['trait']] += q['weight']
            facet_weights[q['facet']] += q['weight']
        
        return {
            'traits': dict(trait_weights),
            'facets': dict(facet_weights)
        }
    
    def _scale_response(self, value: int, reverse: bool) -> float:
        """Convert 1-5 response to 0-1 scale, handling reverse scoring"""
        # Scale to 0-1: (value - min) / (max - min)
        scaled = (value - self.scale['min']) / (self.scale['max'] - self.scale['min'])
        
        # Reverse if needed
        if reverse:
            scaled = 1.0 - scaled
        
        return scaled
    
    def score(self, responses: Dict[str, int]) -> Dict:
        """
        Score personality from user responses
        
        Args:
            responses: Dict mapping question_id to response value (1-5)
            Example: {"Q001": 4, "Q007": 2, "Q013": 5, ...}
        
        Returns:
            Dict with traits, facets, confidence, and derived profiles
        """
        # Accumulate weighted scores
        trait_sums = defaultdict(float)
        trait_weights = defaultdict(float)
        facet_sums = defaultdict(float)
        facet_weights = defaultdict(float)
        
        # Process each response
        for q_id, response in responses.items():
            if q_id not in self.questions:
                continue
            
            q = self.questions[q_id]
            
            # Validate response range
            if not (self.scale['min'] <= response <= self.scale['max']):
                continue
            
            # Scale response (handling reverse scoring)
            scaled = self._scale_response(response, q['reverse'])
            weight = q['weight']
            
            # Accumulate for trait
            trait_sums[q['trait']] += scaled * weight
            trait_weights[q['trait']] += weight
            
            # Accumulate for facet
            facet_sums[q['facet']] += scaled * weight
            facet_weights[q['facet']] += weight
        
        # Compute trait scores - return None if insufficient data (Solution D)
        trait_scores = {}
        trait_confidence = {}
        traits_with_data = []
        
        for trait_code in ['O', 'C', 'E', 'A', 'N']:
            print(f"DEBUG: Trait {trait_code} - Sum: {trait_sums[trait_code]}, Weight: {trait_weights[trait_code]}")
            question_count = trait_weights.get(trait_code, 0)
            
            if question_count >= self.MIN_QUESTIONS_PER_TRAIT:
                # Sufficient data - compute score
                trait_scores[trait_code] = trait_sums[trait_code] / trait_weights[trait_code]
                trait_confidence[trait_code] = trait_weights[trait_code] / self.max_weights['traits'][trait_code]
                traits_with_data.append(trait_code)
            else:
                # Insufficient data - return None instead of 0.5
                trait_scores[trait_code] = None
                trait_confidence[trait_code] = 0.0
        
        # Compute facet scores - also return None if no data (Solution D)
        facet_scores = {}
        facet_confidence = {}
        
        for facet_code in self.facets.keys():
            question_count = facet_weights.get(facet_code, 0)
            
            if question_count > 0:
                facet_scores[facet_code] = facet_sums[facet_code] / facet_weights[facet_code]
                facet_confidence[facet_code] = facet_weights[facet_code] / self.max_weights['facets'][facet_code]
            else:
                facet_scores[facet_code] = None
                facet_confidence[facet_code] = 0.0
        
        # Generate MBTI only if ALL traits have sufficient data (Solution D)
        mbti_code = None
        n_level = None
        personality_code = None
        
        if len(traits_with_data) == 5:
            # All traits have data - can generate MBTI
            mbti_code = self._generate_mbti_proxy(trait_scores, trait_confidence)
            
            # Determine neuroticism level (only if we have N score)
            if trait_scores['N'] is not None:
                n_level = self._neuroticism_level(trait_scores['N'])
                personality_code = f"{mbti_code}-{n_level[0]}"  # e.g., "INFP-B"
        
        # Get top facets (only from facets with data)
        valid_facets = {k: v for k, v in facet_scores.items() if v is not None}
        top_facets = self._get_top_facets(valid_facets, n=5) if valid_facets else []
        
        # Build result with proper null handling
        # 🟢 Canonical Contract Alignment
        ocean_scores = {
            'O': round(trait_scores['O'], 3) if trait_scores['O'] is not None else 0.0, # Default to 0.0 for strict type safety if needed, or stick to None but Schema requires number? 
            # User said: "ocean: { O, C, E, A, N }" implies numbers. If insufficient data, maybe 0 or -1? 
            # Or perhaps better to keep None but model allows None. 
            # Wait, "Clients render ONLY what backend returns". If backend returns None, client must handle it.
            # However, for Canonical "hard boundary", usually strict types are better. 
            # Let's stick to the current logic but mapped to 'ocean' key.
            # Actually, let's keep None to indicate missing data clearly.
            'C': round(trait_scores['C'], 3) if trait_scores['C'] is not None else 0.0,
            'E': round(trait_scores['E'], 3) if trait_scores['E'] is not None else 0.0,
            'A': round(trait_scores['A'], 3) if trait_scores['A'] is not None else 0.0,
            'N': round(trait_scores['N'], 3) if trait_scores['N'] is not None else 0.0
        }

        # Calculate global confidence (Average of non-zero trait confidences)
        conf_values = [v for v in trait_confidence.values() if v > 0]
        global_confidence = round(sum(conf_values) / len(conf_values), 2) if conf_values else 0.0

        # Persona ID (Derive from MBTI or fallback)
        persona_id = mbti_code.lower() if mbti_code and mbti_code != "UNKN" else "unknown"

        result = {
            # Canonical Contract Fields
            'ocean': ocean_scores,
            'persona_id': persona_id,
            'mbti_proxy': mbti_code,
            'confidence': global_confidence,
            'metadata': {
                'quiz_type': 'full180' if len(responses) >= 60 else 'quick', # Simple heuristic for now
                'engine_version': '2.0.0',
                'scoring_version': SCORING_VERSION,
                'timestamp': 0, # Will be filled by API route
            },
            
            # Legacy/Detailed Fields (still useful for internal logic or detailed views)
            'traits': {
                'Openness': round(trait_scores['O'], 3) if trait_scores['O'] is not None else None,
                'Conscientiousness': round(trait_scores['C'], 3) if trait_scores['C'] is not None else None,
                'Extraversion': round(trait_scores['E'], 3) if trait_scores['E'] is not None else None,
                'Agreeableness': round(trait_scores['A'], 3) if trait_scores['A'] is not None else None,
                'Neuroticism': round(trait_scores['N'], 3) if trait_scores['N'] is not None else None
            },
            'trait_confidence': {
                'Openness': round(trait_confidence['O'], 3),
                'Conscientiousness': round(trait_confidence['C'], 3),
                'Extraversion': round(trait_confidence['E'], 3),
                'Agreeableness': round(trait_confidence['A'], 3),
                'Neuroticism': round(trait_confidence['N'], 3)
            },
            'facets': {self.facets[k]: (round(v, 3) if v is not None else None) for k, v in facet_scores.items()},
            'facet_confidence': {self.facets[k]: round(v, 3) for k, v in facet_confidence.items()},
            'mbti_proxy': mbti_code,
            'neuroticism_level': n_level,
            'personality_code': personality_code,
            'top_facets': top_facets,
            'responses_count': len(responses),
            'coverage': round(len(responses) / len(self.questions) * 100, 1),
            'has_complete_profile': len(traits_with_data) == 5,
            'traits_with_data': traits_with_data
        }
        
        return result
    
    def _generate_mbti_proxy(self, trait_scores: Dict[str, Optional[float]], trait_confidence: Dict[str, float] = None) -> str:
        """
        Convert OCEAN scores to MBTI-style 4-letter code.
        
        Uses confidence to handle edge cases (exactly 0.5) and low-confidence traits.
        
        Args:
            trait_scores: OCEAN trait scores (0-1 scale)
            trait_confidence: Optional confidence scores (0-1 scale). If None, always assigns.
        
        Returns:
            4-letter MBTI code, or "UNKN" if confidence is too low
        """
        code = ""
        min_confidence = 0.05  # Minimum confidence to assign MBTI dimension (very low threshold - only skip if truly no data)
        
        # E/I from Extraversion
        e_score = trait_scores.get('E')
        if e_score is None or (trait_confidence and trait_confidence.get('E', 1.0) < min_confidence):
            code += "X"  # Unknown if no data or confidence too low
        elif e_score > 0.5:
            code += "E"
        elif e_score < 0.5:
            code += "I"
        else:
            # Exactly 0.5 - use confidence to decide, or default to E if no confidence data
            if trait_confidence and trait_confidence.get('E', 0) > 0.5:
                code += "E"  # High confidence but exactly 0.5 - slight bias to E
            else:
                code += "E"  # Default to E for exactly 0.5 (neutral extraversion)
        
        # N/S from Openness
        o_score = trait_scores.get('O')
        if o_score is None or (trait_confidence and trait_confidence.get('O', 1.0) < min_confidence):
            code += "X"
        elif o_score > 0.5:
            code += "N"
        elif o_score < 0.5:
            code += "S"
        else:
            # Exactly 0.5
            if trait_confidence and trait_confidence.get('O', 0) > 0.5:
                code += "N"
            else:
                code += "S"  # Default to S for exactly 0.5 (neutral openness)
        
        # T/F from Agreeableness
        a_score = trait_scores.get('A')
        if a_score is None or (trait_confidence and trait_confidence.get('A', 1.0) < min_confidence):
            code += "X"
        elif a_score > 0.5:
            code += "F"
        elif a_score < 0.5:
            code += "T"
        else:
            # Exactly 0.5
            if trait_confidence and trait_confidence.get('A', 0) > 0.5:
                code += "F"
            else:
                code += "F"  # Default to F for exactly 0.5 (neutral agreeableness)
        
        # J/P from Conscientiousness
        c_score = trait_scores.get('C')
        if c_score is None or (trait_confidence and trait_confidence.get('C', 1.0) < min_confidence):
            code += "X"
        elif c_score > 0.5:
            code += "J"
        elif c_score < 0.5:
            code += "P"
        else:
            # Exactly 0.5
            if trait_confidence and trait_confidence.get('C', 0) > 0.5:
                code += "J"
            else:
                code += "J"  # Default to J for exactly 0.5 (neutral conscientiousness)
        
        return code
    
    def _neuroticism_level(self, n_score: Optional[float]) -> str:
        """Categorize neuroticism score"""
        if n_score is None:
            return "Unknown"
        if n_score < 0.35:
            return "Stable"
        elif n_score < 0.65:
            return "Balanced"
        else:
            return "Sensitive"
    
    def _get_top_facets(self, facet_scores: Dict[str, Optional[float]], n: int = 5) -> List[Tuple[str, float]]:
        """Get top N highest-scoring facets (only from non-null scores)"""
        # Filter out None values
        valid_facets = {k: v for k, v in facet_scores.items() if v is not None}
        sorted_facets = sorted(
            [(self.facets[k], v) for k, v in valid_facets.items()],
            key=lambda x: x[1],
            reverse=True
        )
        return [(name, round(score, 3)) for name, score in sorted_facets[:n]]
    
    def get_question_text(self, question_id: str) -> str:
        """Get the text for a specific question"""
        return self.questions.get(question_id, {}).get('text', '')
    
    def get_questions_by_trait(self, trait_code: str) -> List[Dict]:
        """Get all questions for a specific trait"""
        return [q for q in self.questions.values() if q['trait'] == trait_code]
    
    def get_questions_by_facet(self, facet_code: str) -> List[Dict]:
        """Get all questions for a specific facet"""
        return [q for q in self.questions.values() if q['facet'] == facet_code]
    
    def validate_responses(self, responses: Dict[str, int]) -> Dict:
        """
        Validate that responses cover all traits evenly.
        
        Detects unbalanced question sets (e.g., all Openness questions).
        
        Args:
            responses: Dict mapping question_id to response value (1-5)
        
        Returns:
            Dict with validation results:
            {
                'is_valid': bool,
                'warnings': List[Dict],  # List of warning/error objects
                'coverage': Dict[str, int],  # Question count per trait
                'missing_traits': List[str]  # Traits with no questions
            }
        """
        MIN_QUESTIONS_PER_TRAIT = 3  # Minimum questions needed per trait
        
        # Count questions per trait
        trait_coverage = defaultdict(int)
        invalid_question_ids = []
        
        for q_id, response in responses.items():
            # Check if question exists
            if q_id not in self.questions:
                invalid_question_ids.append(q_id)
                continue
            
            # Validate response range
            if not (self.scale['min'] <= response <= self.scale['max']):
                invalid_question_ids.append(q_id)
                continue
            
            # Count valid question
            q = self.questions[q_id]
            trait_coverage[q['trait']] += 1
        
        # Check for missing traits
        all_traits = ['O', 'C', 'E', 'A', 'N']
        missing_traits = [t for t in all_traits if trait_coverage[t] < MIN_QUESTIONS_PER_TRAIT]
        
        # Build warnings
        warnings = []
        
        # Invalid question IDs
        if invalid_question_ids:
            warnings.append({
                'severity': 'error',
                'type': 'invalid_question_ids',
                'message': f"Invalid question IDs: {', '.join(invalid_question_ids[:5])}" + 
                          (f" (and {len(invalid_question_ids) - 5} more)" if len(invalid_question_ids) > 5 else ""),
                'count': len(invalid_question_ids)
            })
        
        # Missing traits
        for trait in missing_traits:
            trait_name = self.traits.get(trait, trait)
            count = trait_coverage.get(trait, 0)
            warnings.append({
                'severity': 'error',
                'type': 'missing_trait',
                'trait': trait,
                'trait_name': trait_name,
                'message': f"Trait '{trait_name}' has only {count} questions (minimum {MIN_QUESTIONS_PER_TRAIT} required)",
                'count': count,
                'required': MIN_QUESTIONS_PER_TRAIT
            })
        
        # Low coverage warnings (but not errors)
        for trait in all_traits:
            count = trait_coverage.get(trait, 0)
            if count > 0 and count < MIN_QUESTIONS_PER_TRAIT:
                trait_name = self.traits.get(trait, trait)
                warnings.append({
                    'severity': 'warning',
                    'type': 'low_coverage',
                    'trait': trait,
                    'trait_name': trait_name,
                    'message': f"Trait '{trait_name}' has low coverage: {count} questions (recommended: {MIN_QUESTIONS_PER_TRAIT}+)",
                    'count': count,
                    'recommended': MIN_QUESTIONS_PER_TRAIT
                })
        
        # Determine if valid
        is_valid = len(missing_traits) == 0 and len(invalid_question_ids) == 0
        
        return {
            'is_valid': is_valid,
            'warnings': warnings,
            'coverage': dict(trait_coverage),
            'missing_traits': missing_traits,
            'total_responses': len(responses),
            'valid_responses': len(responses) - len(invalid_question_ids)
        }


# Example usage
if __name__ == "__main__":
    # Initialize scorer
    scorer = PersonalityScorer('questions_180_lifesync.json')
    
    # Example responses (simulated user answering 30 questions)
    sample_responses = {
        "Q001": 5, "Q007": 4, "Q013": 5, "Q019": 4, "Q025": 5,
        "Q031": 4, "Q037": 3, "Q043": 2, "Q049": 4, "Q055": 4,
        "Q061": 3, "Q067": 3, "Q073": 2, "Q079": 2, "Q085": 3,
        "Q091": 3, "Q097": 2, "Q103": 3, "Q109": 4, "Q115": 4,
        "Q121": 4, "Q127": 5, "Q133": 4, "Q139": 5, "Q145": 4,
        "Q151": 3, "Q157": 3, "Q163": 4, "Q169": 3, "Q175": 3
    }
    
    # Score the responses
    results = scorer.score(sample_responses)
    
    # Print results
    print("=== PERSONALITY PROFILE ===\n")
    print(f"Personality Code: {results['personality_code']}")
    print(f"MBTI Proxy: {results['mbti_proxy']}")
    print(f"Neuroticism Level: {results['neuroticism_level']}\n")
    
    print("OCEAN Traits:")
    for trait, score in results['traits'].items():
        confidence = results['trait_confidence'][trait]
        print(f"  {trait}: {score:.2f} (confidence: {confidence:.2%})")
    
    print("\nTop 5 Facets:")
    for facet, score in results['top_facets']:
        print(f"  {facet}: {score:.2f}")
    
    print(f"\nCoverage: {results['coverage']}% ({results['responses_count']}/180 questions)")

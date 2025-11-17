export interface Question {
  id: string;
  text: string;
  trait: string;
  facet: string;
  reverse: boolean;
}

// Backend response format (Solution D: supports null for insufficient data)
export interface BackendAssessmentResponse {
  assessment_id: string;
  traits: Record<string, number | null>;  // Can be null if insufficient data
  facets: Record<string, number | null>;  // Can be null if insufficient data
  confidence: Record<string, any>;
  dominant: {
    mbti_proxy: string | null;  // Can be null if incomplete profile
    neuroticism_level?: string | null;
    personality_code?: string | null;
  };
  top_facets: any[];
  coverage: number;
  responses_count: number;
  has_complete_profile?: boolean;  // True if all 5 traits have data
  traits_with_data?: string[];  // List of trait codes with sufficient data
  needs_retake?: boolean;  // Solution C: True if assessment is invalid
  needs_retake_reason?: string;  // Solution C: Reason why retake is needed
}

// Web-friendly format (Solution D: supports null for insufficient data)
export interface AssessmentResult {
  traits: Record<string, number | null>;  // Can be null if insufficient data
  facets: Record<string, number | null>;  // Can be null if insufficient data
  mbti: string | null;  // Can be null if incomplete profile
  assessment_id: string;
  has_complete_profile?: boolean;  // True if all 5 traits have data
  traits_with_data?: string[];  // List of trait codes with sufficient data
  needs_retake?: boolean;  // Solution C: True if assessment is invalid
  needs_retake_reason?: string;  // Solution C: Reason why retake is needed
}

// Request format for submitting answers
export interface AssessmentResponse {
  question_id: string;
  response: number;
}

// Backend explanation response format
export interface ExplanationResponse {
  assessment_id?: string;
  explanation?: string;
  summary?: string;
  steps?: string[];
  confidence_note?: string;
  model_name?: string;
  tokens_used?: number;
  generation_time_ms?: number;
}

// Parsed explanation format for UI (new persona-based format)
export interface ParsedExplanation {
  // New persona format
  persona_title?: string;
  vibe_summary?: string;
  strengths: string[];
  growth_edges?: string[];
  how_you_show_up?: string;
  tagline?: string;
  // Backward compatibility fields
  summary: string;
  cautions: string[];
  tone: string;
}

export interface AssessmentHistoryItem {
  assessment_id: string;
  created_at: string;
  traits: Record<string, number>;
  facets: Record<string, number>;
  mbti: string;
  summary?: string;
}

export interface ShareResponse {
  url: string;
  share_id: string;
}

export interface SharedAssessmentResponse {
  assessment_id: string;
  traits: Record<string, number>;
  facets: Record<string, number>;
  mbti: string;
  created_at: string;
  explanation?: string;
}

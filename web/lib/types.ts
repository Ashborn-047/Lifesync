export interface Question {
  id: string;
  text: string;
  trait: string;
  facet: string;
  reverse?: boolean;
}

export interface AssessmentResponse {
  question_id: string;
  response: number;
}

export interface BackendAssessmentResponse {
  assessment_id: string;
  traits: Record<string, number | null>;
  facets: Record<string, number | null>;
  confidence: Record<string, any>;
  dominant?: {
    mbti_proxy: string | null;
    neuroticism_level?: string | null;
    personality_code?: string | null;
  };
  top_facets?: any[];
  coverage?: number;
  responses_count?: number;
  has_complete_profile?: boolean;
  traits_with_data?: string[];
  needs_retake?: boolean;
  needs_retake_reason?: string;
}

export interface AssessmentResult {
  assessment_id: string;
  traits: Record<string, number | null>;
  facets: Record<string, number | null>;
  mbti: string | null;
  has_complete_profile?: boolean;
  traits_with_data?: string[];
  needs_retake?: boolean;
  needs_retake_reason?: string;
}

export interface AssessmentHistoryItem {
  assessment_id: string;
  created_at: string;
  traits: Record<string, number | null>;
  facets: Record<string, number | null>;
  mbti: string;
  summary?: string | null;
}

export interface ExplanationResponse {
  assessment_id?: string;
  persona_title?: string;
  vibe_summary?: string;
  strengths?: string[];
  growth_edges?: string[];
  cautions?: string[];
  challenges?: string[];
  how_you_show_up?: string;
  summary?: string;
  steps?: string[];
  tagline?: string;
  model_name?: string;
  tokens_used?: number;
  generation_time_ms?: number;
}

export interface ParsedExplanation {
  persona_title?: string;
  vibe_summary?: string;
  strengths: string[];
  growth_edges?: string[];
  cautions: string[];
  how_you_show_up?: string;
  summary: string;
  tagline?: string;
  tone: string;
}

export interface ShareLinkResponse {
  url: string;
  share_id: string;
}

export interface QuizProgress {
  currentIndex: number;
  responses: Map<string, number>;
  questions: Question[];
  startedAt: string;
}

export interface SerializedQuizProgress {
  currentIndex: number;
  responses: [string, number][];
  questions: Question[];
  startedAt: string;
}

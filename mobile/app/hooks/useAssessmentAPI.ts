/**
 * LifeSync Mobile - Assessment API Hook
 * Custom hook for personality assessment API calls
 */

import { useState, useCallback } from 'react';
import { api, ApiError } from '../lib/api';
import { submitAssessment as submitAssessmentAPI, generateExplanation as generateExplanationAPI, getAssessment as getAssessmentAPI } from '../lib/api';
import type { AssessmentResult, ExplanationResponse } from '../types';

// Types
export interface Question {
  id: string;
  text: string;
  trait: string;
  facet: string;
  reverse: boolean;
}

export interface AssessmentRequest {
  user_id: string;
  responses: Record<string, number>; // question_id -> 1-5
  quiz_type?: 'quick' | 'standard' | 'full';
}

export interface AssessmentResponse {
  assessment_id: string;
  traits: Record<string, number>;
  facets: Record<string, number>;
  confidence: {
    traits: Record<string, number>;
    facets: Record<string, number>;
  };
  dominant: {
    mbti_proxy: string;
    neuroticism_level: string;
    personality_code: string;
  };
  top_facets: string[];
  coverage: number;
  responses_count: number;
}

export interface ExplanationRequest {
  provider?: 'gemini' | 'openai' | 'grok';
}

export interface ExplanationResponse {
  assessment_id: string;
  summary: string;
  steps: string[] | Array<{ title: string; content: string }>;
  confidence_note: string;
  model_name: string;
  tokens_used?: number;
  generation_time_ms: number;
}

export interface UseAssessmentAPIResult {
  loading: boolean;
  error: ApiError | null;
  fetchQuestions: () => Promise<Question[]>;
  submitAnswers: (answers: Record<string, number>, userId?: string, quizType?: string) => Promise<AssessmentResponse>;
  generateExplanation: (assessmentId: string, provider?: string) => Promise<ExplanationResponse>;
  clearError: () => void;
}

export const useAssessmentAPI = (): UseAssessmentAPIResult => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const fetchQuestions = useCallback(async (): Promise<Question[]> => {
    setLoading(true);
    setError(null);
    
    try {
      // TODO: Create this endpoint in backend
      // For now, return empty array - backend route needs to be created
      const questions = await api.get<Question[]>('/v1/questions');
      return questions;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  const submitAnswers = useCallback(
    async (
      answers: Record<string, number>,
      userId: string = '00000000-0000-0000-0000-000000000001',
      quizType: string = 'full'
    ): Promise<AssessmentResponse> => {
      setLoading(true);
      setError(null);

      try {
        const request: AssessmentRequest = {
          user_id: userId,
          responses: answers,
          quiz_type: quizType as 'quick' | 'standard' | 'full',
        };

        const response = await api.post<AssessmentResponse>('/v1/assessments', request);
        return response;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const generateExplanation = useCallback(
    async (assessmentId: string, provider?: string): Promise<ExplanationResponse> => {
      setLoading(true);
      setError(null);

      try {
        const response = await generateExplanationAPI(assessmentId, provider);
        return response;
      } catch (err) {
        const apiError = err as ApiError;
        setError(apiError);
        throw apiError;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const submitAssessment = useCallback(async (answers: Record<string, number>): Promise<AssessmentResult> => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await submitAssessmentAPI(answers);
      return result;
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      throw apiError;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    fetchQuestions,
    submitAnswers,
    generateExplanation,
    submitAssessment,
    clearError,
  };
};


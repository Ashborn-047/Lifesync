/**
 * LifeSync Mobile - API Client
 * Universal fetch wrapper with error handling and typed responses
 */

import config from './config';

export interface ApiError {
  message: string;
  status?: number;
  data?: any;
}

export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || config.api.baseUrl;
  }

  /**
   * Universal fetch wrapper with error handling
   */
  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const defaultHeaders: HeadersInit = {
      'Content-Type': 'application/json',
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        },
      });

      // Handle non-JSON responses
      const contentType = response.headers.get('content-type');
      const isJson = contentType?.includes('application/json');

      if (!response.ok) {
        const errorData = isJson ? await response.json().catch(() => null) : await response.text();
        const error: ApiError = {
          message: errorData?.detail || errorData?.message || `HTTP ${response.status}: ${response.statusText}`,
          status: response.status,
          data: errorData,
        };
        throw error;
      }

      // Return parsed JSON or empty object for 204 No Content
      if (response.status === 204 || !isJson) {
        return {} as T;
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error && typeof error === 'object' && 'message' in error) {
        throw error;
      }
      
      // Network or parsing errors
      throw {
        message: error instanceof Error ? error.message : 'Network error occurred',
        status: undefined,
        data: null,
      } as ApiError;
    }
  }

  /**
   * GET request
   */
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'GET',
    });
  }

  /**
   * POST request
   */
  async post<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * PUT request
   */
  async put<T>(endpoint: string, body?: any, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  /**
   * DELETE request
   */
  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: 'DELETE',
    });
  }
}

// Export singleton instance
export const apiClient = new ApiClient();

// Export convenience methods
export const api = {
  get: <T>(endpoint: string, options?: RequestInit) => apiClient.get<T>(endpoint, options),
  post: <T>(endpoint: string, body?: any, options?: RequestInit) => apiClient.post<T>(endpoint, body, options),
  put: <T>(endpoint: string, body?: any, options?: RequestInit) => apiClient.put<T>(endpoint, body, options),
  delete: <T>(endpoint: string, options?: RequestInit) => apiClient.delete<T>(endpoint, options),
};

export default api;

// Question fetching function
import { API_URL } from './config';
import type { Question, BackendAssessmentResponse, AssessmentResult, AssessmentRequest, ExplanationResponse } from '../types';

/**
 * Fetch questions from backend
 * @param limit - Number of questions to fetch (default: 30)
 * @returns Array of questions
 */
export async function fetchQuestions(limit: number = 30): Promise<Question[]> {
  try {
    // Add cache-busting parameters
    const params = new URLSearchParams({
      limit: limit.toString(),
      v: '2024-11-17-v2',
      t: Date.now().toString(),
    });

    const response = await api.get<{ questions: Question[] } | Question[]>(
      `/v1/questions?${params.toString()}`,
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );

    // Handle both wrapped and direct array responses
    if (Array.isArray(response)) {
      return response;
    }
    if (response && 'questions' in response) {
      return response.questions;
    }
    
    throw new Error('Invalid response format from questions API');
  } catch (error) {
    console.error('Failed to fetch questions:', error);
    throw error;
  }
}

/**
 * Submit assessment answers
 * @param answers - Record of question_id -> response value (1-5)
 * @param userId - User ID (UUID format)
 * @param quizType - Type of quiz ('quick', 'standard', 'full')
 * @returns Assessment result
 */
export async function submitAssessment(
  answers: Record<string, number>,
  userId: string = '00000000-0000-0000-0000-000000000001',
  quizType: 'quick' | 'standard' | 'full' = 'quick'
): Promise<AssessmentResult> {
  try {
    const request: AssessmentRequest = {
      user_id: userId,
      responses: answers,
      quiz_type: quizType,
    };

    const backendData = await api.post<BackendAssessmentResponse>('/v1/assessments', request);

    // Transform backend response to mobile-friendly format
    const result: AssessmentResult = {
      assessment_id: backendData.assessment_id,
      traits: backendData.traits,
      facets: backendData.facets,
      mbti: backendData.dominant?.mbti_proxy || null,
      has_complete_profile: backendData.has_complete_profile ?? (backendData.dominant?.mbti_proxy !== null),
      traits_with_data: backendData.traits_with_data,
      needs_retake: backendData.needs_retake,
      needs_retake_reason: backendData.needs_retake_reason,
    };

    return result;
  } catch (error) {
    console.error('Failed to submit assessment:', error);
    throw error;
  }
}

/**
 * Generate explanation for assessment
 * @param assessmentId - Assessment ID
 * @param provider - Optional LLM provider ('gemini', 'openai', 'grok')
 * @returns Explanation response
 */
export async function generateExplanation(
  assessmentId: string,
  provider?: string
): Promise<ExplanationResponse> {
  try {
    const requestBody = provider ? { provider } : {};
    const response = await api.post<ExplanationResponse>(
      `/v1/assessments/${assessmentId}/generate_explanation`,
      requestBody
    );
    return response;
  } catch (error) {
    console.error('Failed to generate explanation:', error);
    throw error;
  }
}

/**
 * Get assessment by ID
 * @param assessmentId - Assessment ID
 * @returns Assessment result
 */
export async function getAssessment(assessmentId: string): Promise<AssessmentResult> {
  try {
    const backendData = await api.get<BackendAssessmentResponse>(
      `/v1/assessments/${assessmentId}`
    );

    // Transform backend response to mobile-friendly format
    const result: AssessmentResult = {
      assessment_id: backendData.assessment_id,
      traits: backendData.traits,
      facets: backendData.facets,
      mbti: backendData.dominant?.mbti_proxy || null,
      has_complete_profile: backendData.has_complete_profile ?? (backendData.dominant?.mbti_proxy !== null),
      traits_with_data: backendData.traits_with_data,
      needs_retake: backendData.needs_retake,
      needs_retake_reason: backendData.needs_retake_reason,
    };

    return result;
  } catch (error) {
    console.error('Failed to get assessment:', error);
    throw error;
  }
}


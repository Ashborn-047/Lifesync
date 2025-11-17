import axios, { AxiosError } from "axios";
import { cache } from "./cache";
import type {
  Question,
  AssessmentResult,
  AssessmentResponse,
  BackendAssessmentResponse,
  ExplanationResponse,
  ParsedExplanation,
  AssessmentHistoryItem,
  ShareResponse,
  SharedAssessmentResponse,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5174";

// Cache busting version - increment this whenever question logic changes
const API_VERSION = '2024-11-17-v2';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Error handler
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError;
    
    // Network error (backend not reachable)
    if (axiosError.code === "ERR_NETWORK" || axiosError.message.includes("Network Error")) {
      throw new Error(
        `Cannot connect to backend API at ${API_BASE_URL}. Please ensure the backend server is running on port 5174.`
      );
    }
    
    // Request failed with status code
    if (axiosError.response) {
      const message =
        (axiosError.response?.data as { detail?: string })?.detail ||
        axiosError.message ||
        `Request failed with status ${axiosError.response.status}`;
      throw new Error(message);
    }
    
    // Other axios errors
    throw new Error(axiosError.message || "An unexpected error occurred");
  }
  throw error;
};

/**
 * Fetch all assessment questions
 * Uses cache to avoid redundant API calls
 * Includes cache-busting parameters to force fresh data
 */
export const getQuestions = async (limit?: number): Promise<Question[]> => {
  try {
    // Clear cache for this request to force fresh fetch (cache busting)
    const cacheKey = `questions_${limit || 'all'}`;
    cache.clear(cacheKey);

    // Request only the number of questions needed (default 30 for quick quiz)
    // Add cache-busting parameters: version and timestamp
    const params: Record<string, string | number> = {
      v: API_VERSION,
      t: Date.now(),
    };
    if (limit) {
      params.limit = limit;
    }
    
    const response = await api.get<Question[] | { questions: Question[] }>("/v1/questions", { 
      params,
      headers: {
        'Cache-Control': 'no-store',
      },
    });
    
    // Handle both response formats:
    // 1. Direct array: [{id, text, ...}, ...]
    // 2. Wrapped object: {questions: [{id, text, ...}, ...], count: 180}
    const data = response.data;
    
    if (Array.isArray(data)) {
      if (data.length === 0) {
        throw new Error("Backend returned an empty questions array. Please check if Supabase has question data.");
      }
      // Validate that all questions have required fields
      const validQuestions = data.filter(
        (q) => q && q.id && q.text && q.trait && q.facet !== undefined
      );
      if (validQuestions.length === 0) {
        throw new Error("No valid questions found in response. All questions are missing required fields (id, text, trait, facet).");
      }
      if (validQuestions.length < data.length && process.env.NODE_ENV === 'development') {
        console.warn(`Filtered out ${data.length - validQuestions.length} invalid questions`);
      }
      
      // VALIDATION: Check that we have balanced traits
      const traitCounts = validQuestions.reduce((acc: Record<string, number>, q: Question) => {
        acc[q.trait] = (acc[q.trait] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Question trait distribution:', traitCounts);
      
      // Warn if unbalanced (should have ~6 per trait for 30 questions)
      if (limit) {
        const expectedPerTrait = Math.floor(limit / 5);
        Object.entries(traitCounts).forEach(([trait, count]) => {
          if (count < expectedPerTrait - 1) {
            console.warn(`⚠️ Trait ${trait} only has ${count} questions (expected ~${expectedPerTrait})`);
          }
        });
      }
      
      // Cache the result (5 minute TTL) - but only after validation
      cache.set(cacheKey, validQuestions, 5 * 60 * 1000);
      return validQuestions;
    } else if (data && typeof data === "object" && "questions" in data) {
      const questions = (data as { questions: Question[] }).questions;
      if (!Array.isArray(questions)) {
        throw new Error("Invalid response format: questions is not an array");
      }
      if (questions.length === 0) {
        throw new Error("Backend returned an empty questions array. Please check if Supabase has question data.");
      }
      // Validate that all questions have required fields
      const validQuestions = questions.filter(
        (q) => q && q.id && q.text && q.trait && q.facet !== undefined
      );
      if (validQuestions.length === 0) {
        throw new Error("No valid questions found in response. All questions are missing required fields (id, text, trait, facet).");
      }
      if (validQuestions.length < questions.length && process.env.NODE_ENV === 'development') {
        console.warn(`Filtered out ${questions.length - validQuestions.length} invalid questions`);
      }
      
      // VALIDATION: Check that we have balanced traits
      const traitCounts = validQuestions.reduce((acc: Record<string, number>, q: Question) => {
        acc[q.trait] = (acc[q.trait] || 0) + 1;
        return acc;
      }, {});
      
      console.log('Question trait distribution:', traitCounts);
      
      // Warn if unbalanced (should have ~6 per trait for 30 questions)
      if (limit) {
        const expectedPerTrait = Math.floor(limit / 5);
        Object.entries(traitCounts).forEach(([trait, count]) => {
          if (count < expectedPerTrait - 1) {
            console.warn(`⚠️ Trait ${trait} only has ${count} questions (expected ~${expectedPerTrait})`);
          }
        });
      }
      
      // Cache the result (5 minute TTL) - but only after validation
      cache.set(cacheKey, validQuestions, 5 * 60 * 1000);
      return validQuestions;
    } else {
      throw new Error(`Invalid response format: expected array or object with questions property, got ${typeof data}`);
    }
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Submit completed assessment
 * 
 * @param responses Array of question responses
 * @param userId Optional user ID (defaults to a generated UUID)
 * @param quizType Type of quiz: 'quick', 'standard', or 'full' (default: 'full')
 * @returns Assessment result with traits, facets, and MBTI
 */
export const submitAssessment = async (
  responses: AssessmentResponse[],
  userId: string = crypto.randomUUID(),
  quizType: string = "full"
): Promise<AssessmentResult> => {
  try {
    // Convert array format to backend's expected dict format
    const responsesDict: Record<string, number> = {};
    responses.forEach((r) => {
      responsesDict[r.question_id] = r.response;
    });

    const requestBody = {
      user_id: userId,
      responses: responsesDict,
      quiz_type: quizType,
    };

    const response = await api.post<BackendAssessmentResponse>(
      "/v1/assessments",
      requestBody
    );

    // Transform backend response to web-friendly format (Solution D: handle null values)
    const backendData = response.data;
    const result: AssessmentResult = {
      assessment_id: backendData.assessment_id,
      traits: backendData.traits,
      facets: backendData.facets,
      mbti: backendData.dominant?.mbti_proxy || null,  // null if incomplete profile
      has_complete_profile: backendData.has_complete_profile ?? (backendData.dominant?.mbti_proxy !== null),
      traits_with_data: backendData.traits_with_data,
      needs_retake: backendData.needs_retake,  // Solution C
      needs_retake_reason: backendData.needs_retake_reason,  // Solution C
    };

    return result;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get assessment data by ID
 * 
 * @param assessmentId The assessment ID
 * @returns Assessment result with traits, facets, and MBTI
 */
export const getAssessment = async (
  assessmentId: string
): Promise<AssessmentResult> => {
  try {
    const response = await api.get<BackendAssessmentResponse>(
      `/v1/assessments/${assessmentId}`
    );

    const backendData = response.data;
    const result: AssessmentResult = {
      assessment_id: backendData.assessment_id,
      traits: backendData.traits,
      facets: backendData.facets,
      mbti: backendData.dominant?.mbti_proxy || null,  // null if incomplete profile
      has_complete_profile: backendData.has_complete_profile ?? (backendData.dominant?.mbti_proxy !== null),
      traits_with_data: backendData.traits_with_data,
      needs_retake: backendData.needs_retake,  // Solution C
      needs_retake_reason: backendData.needs_retake_reason,  // Solution C
    };

    return result;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Generate explanation for assessment results
 * 
 * @param assessmentId The assessment ID
 * @param provider Optional LLM provider ('gemini', 'openai', 'grok')
 * @returns Parsed explanation with structured data
 */
export const generateExplanation = async (
  assessmentId: string,
  provider?: string
): Promise<ParsedExplanation> => {
  try {
    const requestBody = provider ? { provider } : {};
    const response = await api.post<ExplanationResponse>(
      `/v1/assessments/${assessmentId}/generate_explanation`,
      requestBody
    );
    
    const data = response.data as any; // Backend may return new or old format
    
    // Check for new persona format first
    if (data.persona_title || data.vibe_summary) {
      // New persona-based format
      return {
        persona_title: data.persona_title || "",
        vibe_summary: data.vibe_summary || "",
        strengths: Array.isArray(data.strengths) ? data.strengths : [],
        growth_edges: Array.isArray(data.growth_edges) ? data.growth_edges : [],
        how_you_show_up: data.how_you_show_up || "",
        tagline: data.tagline || "",
        // Backward compatibility
        summary: data.vibe_summary || data.summary || "",
        cautions: Array.isArray(data.growth_edges) ? data.growth_edges : (Array.isArray(data.challenges) ? data.challenges : []),
        tone: "Balanced",
      };
    }
    
    // Fallback to old format parsing
    const strengths: string[] = [];
    const cautions: string[] = [];
    
    // Try to get strengths and challenges directly
    if (Array.isArray(data.strengths)) {
      strengths.push(...data.strengths);
    }
    if (Array.isArray(data.challenges)) {
      cautions.push(...data.challenges);
    }
    
    // Parse steps if available (old format)
    if (data.steps && Array.isArray(data.steps)) {
      data.steps.forEach((step: any) => {
        const stepText = typeof step === "string" ? step : String(step || "");
        if (!stepText || stepText.trim() === "") return;
        
        const lowerStep = stepText.toLowerCase();
        if (
          lowerStep.includes("challenge") ||
          lowerStep.includes("caution") ||
          lowerStep.includes("watch") ||
          lowerStep.includes("avoid") ||
          lowerStep.includes("risk") ||
          lowerStep.includes("difficulty") ||
          lowerStep.includes("struggle") ||
          lowerStep.includes("weakness") ||
          lowerStep.includes("growth edge")
        ) {
          // Remove prefix if present
          const cleanText = stepText.replace(/^(Challenge|Growth Edge):\s*/i, "").trim();
          if (cleanText) cautions.push(cleanText);
        } else {
          // Remove prefix if present
          const cleanText = stepText.replace(/^Strength:\s*/i, "").trim();
          if (cleanText) strengths.push(cleanText);
        }
      });
    }
    
    // Extract tone from confidence_note or default
    const tone = data.confidence_note
      ? data.confidence_note.toLowerCase().includes("high")
        ? "Confident"
        : data.confidence_note.toLowerCase().includes("moderate")
        ? "Moderate"
        : "Balanced"
      : "Balanced";
    
    return {
      summary: data.summary || "",
      strengths: strengths.length > 0 ? strengths : ["No specific strengths identified."],
      cautions: cautions.length > 0 ? cautions : ["No specific challenges identified."],
      tone: tone,
    };
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Fetch assessment history for a user
 */
export const fetchHistory = async (
  userId: string = "default"
): Promise<AssessmentHistoryItem[]> => {
  try {
    const response = await api.get<AssessmentHistoryItem[]>(
      `/v1/assessments/${userId}/history`
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Create a shareable link for an assessment
 */
export const shareResult = async (
  assessmentId: string
): Promise<ShareResponse> => {
  try {
    const response = await api.post<ShareResponse>(
      `/v1/assessments/${assessmentId}/share`,
      {}
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Get a shared assessment by share ID
 */
export const getSharedAssessment = async (
  shareId: string
): Promise<SharedAssessmentResponse> => {
  try {
    const response = await api.get<SharedAssessmentResponse>(
      `/v1/share/${shareId}`
    );
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

/**
 * Download PDF for an assessment
 */
export const downloadPDF = async (assessmentId: string): Promise<Blob> => {
  try {
    const response = await api.get(`/v1/assessments/${assessmentId}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  } catch (error) {
    throw handleApiError(error);
  }
};

import axios, { AxiosError } from "axios";
import type {
  AssessmentHistoryItem,
  AssessmentResponse,
  AssessmentResult,
  BackendAssessmentResponse,
  ExplanationResponse,
  ParsedExplanation,
  Question,
  ShareLinkResponse,
} from "@/lib/types";

const DEFAULT_USER_ID = "00000000-0000-0000-0000-000000000001";
const CACHE_BUSTER_VERSION = "2024-11-17-web";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5174")
  .trim()
  .replace(/\/+$/, "");

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

type AxiosErrorBody = {
  detail?: string;
  message?: string;
  error?: string;
};

function handleApiError(error: unknown): never {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<AxiosErrorBody>;
    const message =
      axiosError.response?.data?.detail ||
      axiosError.response?.data?.message ||
      axiosError.response?.data?.error ||
      axiosError.message ||
      "Request failed";

    throw new Error(message);
  }

  throw error instanceof Error ? error : new Error("Unexpected API error");
}

function normalizeQuestion(question: any): Question | null {
  const id = question?.id ?? question?.question_id;
  const text = question?.text ?? question?.prompt;

  if (!id || !text) {
    return null;
  }

  return {
    id,
    text,
    trait: question?.trait ?? question?.trait_code ?? "Unknown",
    facet: question?.facet ?? question?.facet_code ?? "General",
    reverse:
      question?.reverse ??
      question?.reverse_scored ??
      question?.reverse_score ??
      false,
  };
}

function mapAssessmentResponse(
  data: BackendAssessmentResponse
): AssessmentResult {
  const hasCompleteProfile =
    data.has_complete_profile ??
    (data.traits
      ? Object.values(data.traits).every(
          (value) => typeof value === "number" && value !== null
        )
      : undefined);

  return {
    assessment_id: data.assessment_id,
    traits: data.traits ?? {},
    facets: data.facets ?? {},
    mbti: data.dominant?.mbti_proxy ?? null,
    has_complete_profile: hasCompleteProfile,
    traits_with_data: data.traits_with_data,
    needs_retake: data.needs_retake,
    needs_retake_reason: data.needs_retake_reason,
  };
}

function parseExplanation(
  data: ExplanationResponse | ParsedExplanation
): ParsedExplanation {
  const fallbackSteps =
    "steps" in data && Array.isArray((data as ExplanationResponse).steps)
      ? (data as ExplanationResponse).steps!
      : [];

  const fallbackChallenges =
    "challenges" in data &&
    Array.isArray((data as ExplanationResponse).challenges)
      ? (data as ExplanationResponse).challenges!
      : [];

  const strengths = data.strengths ?? fallbackSteps;
  const cautions =
    data.growth_edges ?? data.cautions ?? fallbackChallenges;

  return {
    persona_title: data.persona_title,
    vibe_summary: data.vibe_summary,
    strengths,
    growth_edges: data.growth_edges ?? undefined,
    cautions,
    how_you_show_up: data.how_you_show_up,
    summary: data.summary ?? data.vibe_summary ?? "",
    tagline: data.tagline,
    tone: data.tagline ? "persona" : "balanced",
  };
}

interface SubmitAssessmentOptions {
  userId?: string;
  quizType?: "quick" | "standard" | "full";
}

export async function getQuestions(limit: number = 30): Promise<Question[]> {
  try {
    const { data } = await apiClient.get<{ questions?: any[] } | any[]>(
      "/v1/questions",
      {
        params: {
          limit,
          v: CACHE_BUSTER_VERSION,
          t: Date.now(),
        },
        headers: {
          "Cache-Control": "no-store",
        },
      }
    );

    const rawQuestions = Array.isArray(data)
      ? data
      : Array.isArray(data?.questions)
      ? data.questions
      : [];

    const normalized = rawQuestions
      .map(normalizeQuestion)
      .filter((question): question is Question => Boolean(question));

    if (normalized.length === 0) {
      throw new Error("No questions returned from API");
    }

    return normalized;
  } catch (error) {
    handleApiError(error);
  }
}

export async function submitAssessment(
  responses: AssessmentResponse[],
  options: SubmitAssessmentOptions = {}
): Promise<AssessmentResult> {
  try {
    const payloadResponses = responses.reduce<Record<string, number>>(
      (acc, item) => {
        if (item.question_id) {
          acc[item.question_id] = item.response;
        }
        return acc;
      },
      {}
    );

    if (Object.keys(payloadResponses).length === 0) {
      throw new Error("No responses to submit");
    }

    const inferredQuizType =
      options.quizType ??
      (responses.length >= 60 ? "full" : responses.length >= 30 ? "standard" : "quick");

    const { data } = await apiClient.post<BackendAssessmentResponse>(
      "/v1/assessments",
      {
        user_id: options.userId ?? DEFAULT_USER_ID,
        responses: payloadResponses,
        quiz_type: inferredQuizType,
      }
    );

    return mapAssessmentResponse(data);
  } catch (error) {
    handleApiError(error);
  }
}

export async function getAssessment(
  assessmentId: string
): Promise<AssessmentResult> {
  try {
    const { data } = await apiClient.get<BackendAssessmentResponse>(
      `/v1/assessments/${assessmentId}`
    );

    return mapAssessmentResponse(data);
  } catch (error) {
    handleApiError(error);
  }
}

export async function fetchHistory(
  userId: string
): Promise<AssessmentHistoryItem[]> {
  try {
    const { data } = await apiClient.get<AssessmentHistoryItem[]>(
      `/v1/assessments/${userId}/history`
    );

    return Array.isArray(data) ? data : [];
  } catch (error) {
    handleApiError(error);
  }
}

export async function generateExplanation(
  assessmentId: string,
  provider?: string
): Promise<ParsedExplanation> {
  try {
    const { data } = await apiClient.post<ExplanationResponse>(
      `/v1/assessments/${assessmentId}/generate_explanation`,
      provider ? { provider } : undefined
    );

    return parseExplanation(data);
  } catch (error) {
    handleApiError(error);
  }
}

export async function shareResult(
  assessmentId: string
): Promise<ShareLinkResponse> {
  try {
    const { data } = await apiClient.post<ShareLinkResponse>(
      `/v1/assessments/${assessmentId}/share`,
      {}
    );

    return data;
  } catch (error) {
    handleApiError(error);
  }
}

export async function downloadPDF(assessmentId: string): Promise<Blob> {
  try {
    const response = await apiClient.get<ArrayBuffer>(
      `/v1/assessments/${assessmentId}/pdf`,
      {
        responseType: "arraybuffer",
        headers: {
          Accept: "application/pdf",
        },
      }
    );

    return new Blob([response.data], { type: "application/pdf" });
  } catch (error) {
    handleApiError(error);
  }
}

export { API_BASE_URL };

/**
 * Answer and response type definitions
 */
export interface Answer {
    question_id: string;
    response: number; // 1-5 Likert scale
}

export interface AssessmentResponse {
    question_id: string;
    response: number;
}

export type AnswerMap = Record<string, number>;

/**
 * Apply reverse scoring to questions marked as reverse-scored
 * Reverse scoring: 1→5, 2→4, 3→3, 4→2, 5→1
 */
import type { Question, AnswerMap } from '../types';

export function applyReverseScoring(
    answers: AnswerMap,
    questions: Question[]
): AnswerMap {
    const reversed: AnswerMap = {};

    for (const [questionId, response] of Object.entries(answers)) {
        const question = questions.find(q => q.id === questionId);

        if (!question) {
            console.warn(`Question ${questionId} not found in question bank`);
            reversed[questionId] = response;
            continue;
        }

        if (question.reverse) {
            // Reverse the score: 1→5, 2→4, 3→3, 4→2, 5→1
            reversed[questionId] = 6 - response;
        } else {
            reversed[questionId] = response;
        }
    }

    return reversed;
}

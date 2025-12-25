/**
 * Question type definition
 * Represents a single personality assessment question
 */
export interface Question {
    id: string;
    text: string;
    trait: 'O' | 'C' | 'E' | 'A' | 'N';
    facet: string;
    reverse: boolean;
    weight: number;
}

export interface QuestionBank {
    version: string;
    name: string;
    description: string;
    scale: {
        min: number;
        max: number;
        type: string;
        labels: Record<string, string>;
    };
    traits: Record<string, { name: string; description: string }>;
    facets: Record<string, string>;
    questions: Question[];
}

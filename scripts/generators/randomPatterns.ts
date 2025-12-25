import { Question } from '../../packages/personality-engine/types';

type AnswerMap = Record<string, number | null>;

// Deterministic RNG (Linear Congruential Generator)
class RNG {
    private seed: number;
    constructor(seed: number) {
        this.seed = seed;
    }
    next(): number {
        this.seed = (this.seed * 1664525 + 1013904223) % 4294967296;
        return this.seed / 4294967296;
    }
    range(min: number, max: number): number {
        return Math.floor(this.next() * (max - min + 1)) + min;
    }
}

export const generators = {
    uniformLow: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        questions.forEach(q => answers[q.id] = 1);
        return answers;
    },

    uniformHigh: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        questions.forEach(q => answers[q.id] = 5);
        return answers;
    },

    uniformMid: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        questions.forEach(q => answers[q.id] = 3);
        return answers;
    },

    alternating: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        questions.forEach((q, i) => answers[q.id] = i % 2 === 0 ? 1 : 5);
        return answers;
    },

    blockExtremes: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        const mid = Math.floor(questions.length / 2);
        questions.forEach((q, i) => answers[q.id] = i < mid ? 1 : 5);
        return answers;
    },

    noiseClusterLow: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            const r = rng.next();
            answers[q.id] = r < 0.8 ? 1 : (r < 0.95 ? 2 : 3);
        });
        return answers;
    },

    noiseClusterHigh: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            const r = rng.next();
            answers[q.id] = r < 0.8 ? 5 : (r < 0.95 ? 4 : 3);
        });
        return answers;
    },

    gaussianMid: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            let u = 0, v = 0;
            while (u === 0) u = rng.next();
            while (v === 0) v = rng.next();
            const num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
            let val = Math.round(num + 3);
            if (val < 1) val = 1;
            if (val > 5) val = 5;
            answers[q.id] = val;
        });
        return answers;
    },

    triangularDistribution: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            const r = rng.next();
            if (r < 0.4) answers[q.id] = rng.range(1, 2);
            else if (r > 0.6) answers[q.id] = rng.range(4, 5);
            else answers[q.id] = 3;
        });
        return answers;
    },

    entropyChaos: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => answers[q.id] = rng.range(1, 5));
        return answers;
    },

    adversarialSymmetry: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        questions.forEach((q, i) => {
            const pattern = i % 4;
            answers[q.id] = (pattern < 2) ? 1 : 5;
        });
        return answers;
    },

    pathologicalBoundary: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            const r = rng.next();
            answers[q.id] = r < 0.5 ? 2 : 3;
        });
        return answers;
    },

    driftingPattern: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        const len = questions.length;
        questions.forEach((q, i) => {
            const val = 1 + (i / len) * 4;
            answers[q.id] = Math.max(1, Math.min(5, Math.round(val)));
        });
        return answers;
    },

    degenerateSetFewItems: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            if (rng.next() > 0.1) { // 10% missing
                answers[q.id] = rng.range(1, 5);
            } else {
                answers[q.id] = null;
            }
        });
        return answers;
    },

    ladderUpDown: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        const pattern = [1, 2, 3, 4, 5, 4, 3, 2];
        questions.forEach((q, i) => {
            answers[q.id] = pattern[i % pattern.length];
        });
        return answers;
    },

    skewedHighOpenness: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            // Heuristic: If ID contains 'openness' or 'O', bias high. Else random.
            // Since we don't have category in Question type here easily, we'll just bias 20% of questions high
            // Assuming questions are mixed.
            const isTarget = (q.category === 'openness' || q.id.includes('openness') || rng.next() < 0.2);
            if (isTarget) {
                answers[q.id] = rng.range(4, 5);
            } else {
                answers[q.id] = rng.range(1, 5);
            }
        });
        return answers;
    },

    skewedLowConscientiousness: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            const isTarget = (q.category === 'conscientiousness' || q.id.includes('conscientiousness') || rng.next() < 0.2);
            if (isTarget) {
                answers[q.id] = rng.range(1, 2);
            } else {
                answers[q.id] = rng.range(1, 5);
            }
        });
        return answers;
    },

    socialPulse: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        questions.forEach((q, i) => {
            // Spike every 5th question
            answers[q.id] = (i % 5 === 0) ? 5 : 2;
        });
        return answers;
    },

    randomClusters: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        let currentVal = rng.range(1, 5);
        let remainingInCluster = rng.range(3, 10);

        questions.forEach(q => {
            if (remainingInCluster <= 0) {
                currentVal = rng.range(1, 5);
                remainingInCluster = rng.range(3, 10);
            }
            answers[q.id] = currentVal;
            remainingInCluster--;
        });
        return answers;
    },

    staircasePartial: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        questions.forEach((q, i) => {
            // Blocks of 10 increasing
            const block = Math.floor(i / 10) % 5;
            answers[q.id] = block + 1;
        });
        return answers;
    },

    alternatingClusters: (questions: Question[], seed: number): AnswerMap => {
        const answers: AnswerMap = {};
        questions.forEach((q, i) => {
            // 1,1, 5,5, 1,1, 5,5
            const p = Math.floor(i / 2) % 2;
            answers[q.id] = p === 0 ? 1 : 5;
        });
        return answers;
    },

    boundaryBounce: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            // Bounce between 2 and 4 (skipping 3)
            answers[q.id] = rng.next() < 0.5 ? 2 : 4;
        });
        return answers;
    },

    deliberateNoise: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        questions.forEach(q => {
            // 95% consistent (3), 5% outlier (1 or 5)
            if (rng.next() < 0.95) {
                answers[q.id] = 3;
            } else {
                answers[q.id] = rng.next() < 0.5 ? 1 : 5;
            }
        });
        return answers;
    },

    mirrorPattern: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        const half = Math.floor(questions.length / 2);
        const firstHalf: number[] = [];

        questions.forEach((q, i) => {
            if (i < half) {
                const val = rng.range(1, 5);
                firstHalf.push(val);
                answers[q.id] = val;
            } else {
                const mirrorIndex = i - half;
                if (mirrorIndex < firstHalf.length) {
                    answers[q.id] = firstHalf[mirrorIndex];
                } else {
                    answers[q.id] = 3; // filler
                }
            }
        });
        return answers;
    },

    syntheticPersonaSeed: (questions: Question[], seed: number): AnswerMap => {
        const rng = new RNG(seed);
        const answers: AnswerMap = {};
        // Randomly pick a target profile (High O, Low C, etc.)
        const targetO = rng.next() > 0.5 ? 5 : 1;
        const targetC = rng.next() > 0.5 ? 5 : 1;

        questions.forEach(q => {
            // Crude heuristic mapping
            if (q.category === 'openness') answers[q.id] = targetO;
            else if (q.category === 'conscientiousness') answers[q.id] = targetC;
            else answers[q.id] = rng.range(1, 5);
        });
        return answers;
    }
};

export const allGenerators = Object.keys(generators);

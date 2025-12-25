import { Question } from '../../engines/ts-engine/types';

export type PatternType =
    | "uniformLow" | "uniformMid" | "uniformHigh"
    | "alternating" | "alternatingClusters"
    | "deliberateNoise"
    | "gaussianMid" | "gaussianHigh" | "gaussianLow"
    | "skewedHighOpenness" | "skewedLowConscientiousness"
    | "blockExtremes" | "mirrorPattern"
    | "noiseClusterLow" | "noiseClusterHigh"
    | "entropyChaos" | "syntheticPersonaSeed"
    | "driftingPattern" | "adversarialSymmetry"
    | "triangularDistribution" | "randomClusters"
    | "staircasePartial" | "pathologicalBoundary"
    | "boundaryBounce" | "degenerateSetFewItems";

export function generatePattern(type: string, questions: Question[]): Record<string, number> {
    const answers: Record<string, number> = {};
    const questionIds = questions.map(q => q.id);

    switch (type) {
        case "uniformLow":
            questionIds.forEach(id => answers[id] = 1);
            break;
        case "uniformMid":
            questionIds.forEach(id => answers[id] = 3);
            break;
        case "uniformHigh":
            questionIds.forEach(id => answers[id] = 5);
            break;
        case "alternating":
            questionIds.forEach((id, i) => answers[id] = i % 2 === 0 ? 1 : 5);
            break;
        case "alternatingClusters":
            questionIds.forEach((id, i) => answers[id] = Math.floor(i / 3) % 2 === 0 ? 1 : 5);
            break;
        case "deliberateNoise":
            questionIds.forEach(id => answers[id] = Math.floor(Math.random() * 5) + 1);
            break;
        case "gaussianMid":
            questionIds.forEach(id => answers[id] = clamp(Math.round(randomGaussian(3, 1))));
            break;
        case "gaussianHigh":
            questionIds.forEach(id => answers[id] = clamp(Math.round(randomGaussian(4.5, 0.5))));
            break;
        case "gaussianLow":
            questionIds.forEach(id => answers[id] = clamp(Math.round(randomGaussian(1.5, 0.5))));
            break;
        case "skewedHighOpenness":
            questions.forEach(q => {
                if (q.trait === 'O') answers[q.id] = 5;
                else answers[q.id] = Math.floor(Math.random() * 5) + 1;
            });
            break;
        case "skewedLowConscientiousness":
            questions.forEach(q => {
                if (q.trait === 'C') answers[q.id] = 1;
                else answers[q.id] = Math.floor(Math.random() * 5) + 1;
            });
            break;
        case "blockExtremes":
            questionIds.forEach(id => answers[id] = Math.random() > 0.5 ? 1 : 5);
            break;
        case "mirrorPattern":
            const pattern = [1, 2, 3, 4, 5, 5, 4, 3, 2, 1];
            questionIds.forEach((id, i) => answers[id] = pattern[i % pattern.length]);
            break;
        case "noiseClusterLow":
            questionIds.forEach(id => answers[id] = Math.floor(Math.random() * 2) + 1); // 1 or 2
            break;
        case "noiseClusterHigh":
            questionIds.forEach(id => answers[id] = Math.floor(Math.random() * 2) + 4); // 4 or 5
            break;
        case "entropyChaos":
            // Maximize entropy? Just random is high entropy.
            // Let's do a pattern that changes probability distribution every 10 questions
            questionIds.forEach((id, i) => {
                const block = Math.floor(i / 10);
                if (block % 3 === 0) answers[id] = 1;
                else if (block % 3 === 1) answers[id] = 5;
                else answers[id] = Math.floor(Math.random() * 5) + 1;
            });
            break;
        case "syntheticPersonaSeed":
            // Simulate a consistent persona (e.g., High O, High C, Low N)
            questions.forEach(q => {
                let base = 3;
                if (q.trait === 'O') base = 4.5;
                if (q.trait === 'C') base = 4.5;
                if (q.trait === 'N') base = 1.5;
                // Add some noise
                answers[q.id] = clamp(Math.round(randomGaussian(base, 0.8)));
            });
            break;
        case "driftingPattern":
            // Start high, drift low
            questionIds.forEach((id, i) => {
                const progress = i / questionIds.length;
                const val = 5 - (4 * progress); // 5 -> 1
                answers[id] = clamp(Math.round(val + (Math.random() - 0.5)));
            });
            break;
        case "adversarialSymmetry":
            // 1, 5, 2, 4, 3, 3...
            questionIds.forEach((id, i) => {
                const mod = i % 5;
                if (mod === 0) answers[id] = 1;
                if (mod === 1) answers[id] = 5;
                if (mod === 2) answers[id] = 2;
                if (mod === 3) answers[id] = 4;
                if (mod === 4) answers[id] = 3;
            });
            break;
        case "triangularDistribution":
            // Peak at 3, low at 1 and 5
            questionIds.forEach(id => {
                const r = Math.random() + Math.random(); // 0-2
                const val = Math.floor(r * 2.5) + 1; // Approx 1-5 with peak at 3
                answers[id] = clamp(val);
            });
            break;
        case "randomClusters":
            let currentVal = 3;
            questionIds.forEach((id, i) => {
                if (i % 5 === 0) currentVal = Math.floor(Math.random() * 5) + 1;
                answers[id] = currentVal;
            });
            break;
        case "staircasePartial":
            // 1,1,1, 2,2,2, 3,3,3...
            questionIds.forEach((id, i) => {
                const val = (Math.floor(i / 5) % 5) + 1;
                answers[id] = val;
            });
            break;
        case "pathologicalBoundary":
            // All 3s except one trait all 5s
            questions.forEach(q => {
                if (q.trait === 'E') answers[q.id] = 5;
                else answers[q.id] = 3;
            });
            break;
        case "boundaryBounce":
            // 1, 5, 1, 5...
            questionIds.forEach((id, i) => answers[id] = i % 2 === 0 ? 1 : 5);
            break;
        case "degenerateSetFewItems":
            // Only answer first 10 questions (others 0 or missing? System expects 1-5)
            // Let's say we answer all but with minimal variance
            questionIds.forEach(id => answers[id] = 3);
            break;
        default:
            questionIds.forEach(id => answers[id] = 3);
            break;
    }

    return answers;
}

function clamp(val: number): number {
    return Math.max(1, Math.min(5, val));
}

function randomGaussian(mean: number, stdev: number): number {
    const u = 1 - Math.random(); // Converting [0,1) to (0,1]
    const v = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return z * stdev + mean;
}

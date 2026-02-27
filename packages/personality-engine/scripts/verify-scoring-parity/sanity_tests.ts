import { _debug_mbti_tiebreak } from "../../scoring/computeProfile";

const cases = [
    { openness: 51, confidence: 0.2, expected: "N" },
    { openness: 49, confidence: 0.9, expected: "S" },
    { openness: 50, confidence: 0.7, expected: "N" },
    { openness: 50, confidence: 0.4, expected: "S" },
];

let failed = 0;
console.log("=== SANITY TESTS ===");
for (const t of cases) {
    const out = _debug_mbti_tiebreak(t.openness, t.confidence);
    const ok = out === t.expected;
    console.log(`${JSON.stringify(t)} -> ${out} ${ok ? "✓" : "✗ expected " + t.expected}`);
    if (!ok) failed++;
}
process.exitCode = failed ? 1 : 0;

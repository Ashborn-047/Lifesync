# Mega Stress-Test Verification Report
Generated: 2025-11-29T13:36:50.491Z

## Executive Summary
This report summarizes the results of the stress test runs across Mobile and Web platforms.

## Test Configuration
- **Runs per Combo**: 1000 (Target)
- **Generators**: 25+ variants (Uniform, Noise, Gaussian, Adversarial, etc.)
- **Parity Check**: Local Engine vs Backend API

## Results by Combination

### mobile_full180_results
- **Total Runs**: 1000
- **Match Rate**: 0.00% (0/1000)
- **Top Mismatch Reasons**:
- **1000** cases: Backend Error: timeout of 5000ms exceeded

![Persona Distribution](../charts/persona_distribution_mobile_full180_results.png)
![Confidence Histogram](../charts/confidence_histogram_mobile_full180_results.png)

### mobile_smart30_results
- **Total Runs**: 1000
- **Match Rate**: 0.00% (0/1000)
- **Top Mismatch Reasons**:
- **1000** cases: Backend Error: timeout of 5000ms exceeded

![Persona Distribution](../charts/persona_distribution_mobile_smart30_results.png)
![Confidence Histogram](../charts/confidence_histogram_mobile_smart30_results.png)

### web_full180_results
- **Total Runs**: 1000
- **Match Rate**: 0.00% (0/1000)
- **Top Mismatch Reasons**:
- **1000** cases: Backend Error: timeout of 5000ms exceeded

![Persona Distribution](../charts/persona_distribution_web_full180_results.png)
![Confidence Histogram](../charts/confidence_histogram_web_full180_results.png)

### web_smart30_results
- **Total Runs**: 1000
- **Match Rate**: 0.00% (0/1000)
- **Top Mismatch Reasons**:
- **1000** cases: Backend Error: timeout of 5000ms exceeded

![Persona Distribution](../charts/persona_distribution_web_smart30_results.png)
![Confidence Histogram](../charts/confidence_histogram_web_smart30_results.png)

## Pattern Alignment Matrix
See [pattern_alignment_matrix.csv](./pattern_alignment_matrix.csv) for full details.

| Generator | Match Rate |
|-----------|------------|
| deliberateNoise | 0.00% |
| skewedLowConscientiousness | 0.00% |
| gaussianMid | 0.00% |
| uniformHigh | 0.00% |
| driftingPattern | 0.00% |
| noiseClusterHigh | 0.00% |
| uniformMid | 0.00% |
| ladderUpDown | 0.00% |
| skewedHighOpenness | 0.00% |
| alternating | 0.00% |
    
## Global Statistics
- **Total Runs Executed**: 4000
- **Global Match Rate**: 0.00%

## Conclusion
⚠️ Issues detected. Review mismatch reasons.

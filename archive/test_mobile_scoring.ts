/**
 * Mobile vs Web Scoring Diagnostic Test
 * This script simulates the same quiz responses and compares scoring
 */

import axios from 'axios';
import { randomUUID } from 'crypto';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const API_URL = 'http://localhost:8000';

// Sample quiz responses - identical answers for both platforms
const sampleResponses = {
    Q001: 4, Q007: 5, Q013: 4, Q019: 5, Q025: 5, Q031: 4,
    Q037: 4, Q043: 5, Q049: 3, Q055: 4, Q061: 3, Q067: 2,
    Q073: 3, Q079: 3, Q085: 4, Q091: 4, Q097: 3, Q103: 4,
    Q109: 4, Q115: 3, Q121: 4, Q127: 4, Q133: 3, Q139: 4,
    Q145: 3, Q151: 3, Q157: 3, Q163: 3, Q169: 3, Q175: 3
};

interface TraitScore {
    name: string;
    score: number;
    percentage: string;
}

function createScoreBar(percentage: number, width: number = 40): string {
    const filled = Math.round((percentage / 100) * width);
    const empty = width - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

function formatTraitScores(traits: Record<string, number>): TraitScore[] {
    return [
        { name: 'Openness', score: traits.Openness || 0, percentage: ((traits.Openness || 0) * 100).toFixed(1) + '%' },
        { name: 'Conscientiousness', score: traits.Conscientiousness || 0, percentage: ((traits.Conscientiousness || 0) * 100).toFixed(1) + '%' },
        { name: 'Extraversion', score: traits.Extraversion || 0, percentage: ((traits.Extraversion || 0) * 100).toFixed(1) + '%' },
        { name: 'Agreeableness', score: traits.Agreeableness || 0, percentage: ((traits.Agreeableness || 0) * 100).toFixed(1) + '%' },
        { name: 'Neuroticism', score: traits.Neuroticism || 0, percentage: ((traits.Neuroticism || 0) * 100).toFixed(1) + '%' }
    ];
}

async function runTest() {
    console.log('═══════════════════════════════════════════════════════');
    console.log('  MOBILE vs WEB SCORING DIAGNOSTIC TEST');
    console.log('═══════════════════════════════════════════════════════\n');

    try {
        // Generate UUID for user_id
        const userId = randomUUID();

        // Make API call
        console.log('📡 Submitting quiz to backend...\n');
        const response = await axios.post(`${API_URL}/v1/assessments`, {
            user_id: userId,
            responses: sampleResponses,
            quiz_type: 'quick'
        });

        const result = response.data;

        console.log('✅ Assessment ID:', result.assessment_id);
        console.log('✅ Is Complete:', result.is_complete);
        console.log('✅ Coverage:', result.coverage + '%');
        console.log('✅ Responses Count:', result.responses_count);
        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  TRAIT SCORES (0-1 scale from backend)');
        console.log('═══════════════════════════════════════════════════════\n');

        const traitScores = formatTraitScores(result.traits);

        traitScores.forEach(trait => {
            const percentageNum = parseFloat(trait.percentage);
            const bar = createScoreBar(percentageNum);

            console.log(`${trait.name.padEnd(20)} ${trait.percentage.padStart(7)}  ${bar}`);
            console.log(`  Raw Score: ${trait.score.toFixed(4)}`);
            console.log('');
        });

        console.log('═══════════════════════════════════════════════════════');
        console.log('  DOMINANT TRAITS');
        console.log('═══════════════════════════════════════════════════════\n');
        console.log('MBTI Proxy:', result.dominant?.mbti_proxy || 'N/A');
        console.log('Neuroticism Level:', result.dominant?.neuroticism_level || 'N/A');
        console.log('Personality Code:', result.dominant?.personality_code || 'N/A');

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  TOP FACETS');
        console.log('═══════════════════════════════════════════════════════\n');
        result.top_facets?.slice(0, 5).forEach((facet: any, i: number) => {
            console.log(`${i + 1}. ${facet.facet}: ${(facet.score * 100).toFixed(1)}%`);
        });

        console.log('\n═══════════════════════════════════════════════════════');
        console.log('  DIAGNOSTIC INFO');
        console.log('═══════════════════════════════════════════════════════\n');

        // Check for potential issues
        const allScoresLow = traitScores.every(t => parseFloat(t.percentage) < 30);
        const anyScoreVeryLow = traitScores.some(t => parseFloat(t.percentage) < 10);

        if (allScoresLow) {
            console.log('⚠️  WARNING: All trait scores are below 30%');
            console.log('   This suggests a potential scoring algorithm issue.');
        }

        if (anyScoreVeryLow) {
            console.log('⚠️  WARNING: Some scores are below 10%');
            console.log('   This is unusual for a 30-question balanced quiz.');
        }

        const avgScore = traitScores.reduce((sum, t) => sum + parseFloat(t.percentage), 0) / 5;
        console.log(`\nAverage Score: ${avgScore.toFixed(1)}%`);
        console.log('Expected Range: 30-70% for typical responses\n');

        // Save detailed results
        const detailedReport = {
            timestamp: new Date().toISOString(),
            assessment_id: result.assessment_id,
            is_complete: result.is_complete,
            coverage: result.coverage,
            responses_count: result.responses_count,
            traits: result.traits,
            trait_percentages: traitScores,
            dominant: result.dominant,
            top_facets: result.top_facets,
            input_responses: sampleResponses,
            diagnostics: {
                all_scores_low: allScoresLow,
                any_score_very_low: anyScoreVeryLow,
                average_score: avgScore
            }
        };

        return detailedReport;

    } catch (error: any) {
        console.error('❌ Test Failed:', error.message);
        if (error.response) {
            console.error('Response Status:', error.response.status);
            console.error('Response Data:', JSON.stringify(error.response.data, null, 2));
        }
        throw error;
    }
}

// Run the test
runTest()
    .then(report => {
        const outputPath = __dirname + '/mobile_scoring_test_results.json';
        writeFileSync(outputPath, JSON.stringify(report, null, 2));
        console.log('📄 Full results saved to:', outputPath);
    })
    .catch(err => {
        console.error('Test execution failed:', err);
        process.exit(1);
    });

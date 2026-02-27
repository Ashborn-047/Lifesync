import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { submitAssessment } from './client';

// 1. Mock setup
vi.mock('axios', () => {
    const mockPost = vi.fn();
    const mockInstance = {
        post: mockPost,
        get: vi.fn(),
        defaults: { headers: {} },
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        }
    };
    const mockCreate = vi.fn(() => mockInstance);
    return {
        default: {
            create: mockCreate,
            isAxiosError: (err: any) => !!err.isAxiosError
        },
        create: mockCreate,
        isAxiosError: (err: any) => !!err.isAxiosError
    };
});

// Mock personality-engine constants
vi.mock('@lifesync/personality-engine', async (importOriginal) => {
    const actual = await importOriginal() as any;
    return {
        ...actual,
        SCORING_VERSION: '1.0.0',
    };
});

describe('Backend-First Scoring Flow (Canonical Contract)', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should return Canonical Response from Edge Function', async () => {
        const apiInstance = axios.create();
        const mockPost = apiInstance.post as any;

        // Mock Canonical Edge Response
        const mockResponseData = {
            ocean: { O: 0.8, C: 0.5, E: 0.3, A: 0.7, N: 0.2 },
            persona_id: "architect",
            mbti_proxy: "INTJ",
            confidence: 0.95,
            metadata: {
                quiz_type: "full180",
                engine_version: "2.0.0",
                scoring_version: "1.0.0",
                timestamp: 1234567890
            },
            assessment_id: "EDGE_ID_123"
        };

        mockPost.mockResolvedValue({ data: mockResponseData });

        const responses = [{ question_id: 'Q001', response: 5 }];
        const result = await submitAssessment(responses);

        // Verify Edge Function was called
        expect(mockPost).toHaveBeenCalledWith('/score-assessment', expect.any(Object));

        // Strictly verify Contract
        expect(result.ocean.O).toBe(0.8);
        expect(result.persona_id).toBe("architect");
        expect(result.assessment_id).toBe("EDGE_ID_123");
    });

    it('should successfully sync offline results using Edge Function', async () => {
        const apiInstance = axios.create();
        const mockPost = apiInstance.post as any;

        // Reset mocks
        mockPost.mockReset();

        // Mock Edge Response for sync
        mockPost.mockResolvedValue({
            data: {
                ocean: { O: 0.5, C: 0.5, E: 0.5, A: 0.5, N: 0.5 },
                persona_id: "balanced",
                mbti_proxy: "XXXX",
                confidence: 1.0,
                metadata: {},
                assessment_id: "NEW_1"
            }
        });

        const { syncOfflineResults } = await import('./client');

        const offlineItems = [{
            offline_id: "OFF_1",
            responses: { "Q001": 5 },
            timestamp: Date.now(),
            quiz_type: "full"
        }];

        const result = await syncOfflineResults(offlineItems);

        // Should call /score-assessment
        expect(mockPost).toHaveBeenCalledWith('/score-assessment', expect.any(Object));
        expect(result.synced).toHaveLength(1);
        expect(result.synced[0].status).toBe("synced");
        expect(result.synced[0].new_id).toBe("NEW_1");
    });
});

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

    it('should return Canonical Response directly from Backend', async () => {
        const apiInstance = axios.create();
        const mockPost = apiInstance.post as any;

        // Mock Canonical Backend Response
        const mockResponseData = {
            ocean: { O: 0.8, C: 0.5, E: 0.3, A: 0.7, N: 0.2 },
            persona_id: "architect",
            mbti_proxy: "INTJ",
            confidence: 0.95,
            metadata: {
                quiz_type: "full180",
                engine_version: "2.0.0",
                scoring_version: "1.0.0",
                timestamp: 1234567890,
                is_fallback: false
            },
            assessment_id: "BACKEND_ID_123"
        };

        mockPost.mockResolvedValue({ data: mockResponseData });

        const responses = [{ question_id: 'Q001', response: 5 }];
        const result = await submitAssessment(responses);

        expect(mockPost).toHaveBeenCalledWith('/v1/assessments', expect.any(Object));

        // Strictly verify Contract
        expect(result.ocean.O).toBe(0.8);
        expect(result.persona_id).toBe("architect");
        expect(result.metadata.is_fallback).toBe(false);
        expect(result.assessment_id).toBe("BACKEND_ID_123");
    });

    it('should fallback to Local Engine and produce Canonical Response', async () => {
        const apiInstance = axios.create();
        const mockPost = apiInstance.post as any;

        mockPost.mockRejectedValue({
            isAxiosError: true,
            code: 'ERR_NETWORK',
            message: 'Network Error',
            response: undefined
        });

        // Use valid responses for local engine calculation
        const responses = [
            { question_id: 'Q001', response: 5 }, // +O
            { question_id: 'Q007', response: 5 }, // +O
            { question_id: 'Q013', response: 5 }, // +O
            { question_id: 'Q037', response: 5 }, // +C
        ];

        const result = await submitAssessment(responses);

        // Verify Fallback Contract
        expect(result.metadata.is_fallback).toBe(true);
        expect(result.metadata.engine_version).toContain("fallback");
        expect(result.ocean).toBeDefined();
        expect(result.ocean.O).toBeGreaterThan(0);
        expect(result.persona_id).toBeDefined();
        expect(result.mbti_proxy).toBeDefined();
        expect(result.confidence).toBeDefined();
    });

    it('should successfully sync offline results', async () => {
        const apiInstance = axios.create();
        const mockPost = apiInstance.post as any;

        // Reset mocks
        mockPost.mockReset();

        mockPost.mockResolvedValue({
            data: {
                synced: [
                    { offline_id: "OFF_1", new_id: "NEW_1", status: "synced" }
                ]
            }
        });

        // Import sync function dynamically or assume it's exported
        const { syncOfflineResults } = await import('./client');

        const offlineItems = [{
            offline_id: "OFF_1",
            responses: { "Q001": 5 },
            timestamp: Date.now(),
            quiz_type: "full180"
        }];

        const result = await syncOfflineResults(offlineItems);

        expect(mockPost).toHaveBeenCalledWith('/v1/assessments/sync', expect.any(Array));
        expect(result.synced).toHaveLength(1);
        expect(result.synced[0].status).toBe("synced");
        expect(result.synced[0].new_id).toBe("NEW_1");
    });
});

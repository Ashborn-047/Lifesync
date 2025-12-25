import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// 1. Must mock BEFORE import
vi.mock('axios', () => {
    // Create the mock function for post
    const mockPost = vi.fn();

    // Create the mock instance that 'create' will return
    const mockInstance = {
        post: mockPost,
        get: vi.fn(),
        defaults: { headers: {} },
        interceptors: {
            request: { use: vi.fn() },
            response: { use: vi.fn() }
        }
    };

    // Create the mock 'create' function
    const mockCreate = vi.fn(() => mockInstance);

    return {
        default: {
            create: mockCreate,
            isAxiosError: (err: any) => !!err.isAxiosError
        },
        // Also named export if needed
        create: mockCreate,
        isAxiosError: (err: any) => !!err.isAxiosError
    };
});

// 2. Import *after* mock
import { submitAssessment } from './client';
import axios from 'axios';

describe('Backend-First Scoring Flow', () => {

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should attempt to call Backend API first', async () => {
        // Access the mocked instance through the imported axios module
        // We know axios.create returns our specific mock instance object
        const apiInstance = axios.create();
        const mockPost = apiInstance.post as any; // This is the shared spy we defined in factory?

        // Wait, the factory returns a NEW mock instance every time axios.create is called?
        // No, in my factory above I defined mockInstance OUTSIDE mockCreate? 
        // No, I defined it inside. So it returns a new one.
        // We need to control the return value of post.

        // Let's adjust the mock factory to be simpler or use spyOn.
        // Actually, let's just use the `submitAssessment` imports.

        // BETTER STRATEGY: 
        // Access the mock `post` method. 
        // Since `client.ts` calls `axios.create()` at top level, the `api` instance is already created.
        // We need to capture THAT instance.
        // But `vi.mock` runs before imports. 

        // Let's just define the behavior on the mock that `axios.create` returns.

        mockPost.mockResolvedValue({
            data: {
                assessment_id: 'BACKEND_ID_123',
                traits: { Openness: 0.8 },
                facets: {},
                dominant: { mbti_proxy: 'ENTP' },
                is_complete: true,
                traits_with_data: ['O', 'C', 'E', 'A', 'N']
            }
        });

        const responses = [{ question_id: 'Q001', response: 5 }];
        const result = await submitAssessment(responses);

        expect(mockPost).toHaveBeenCalledWith('/v1/assessments', expect.any(Object));
        expect(result.assessment_id).toBe('BACKEND_ID_123');
        expect(result.is_offline).toBeFalsy();
    });

    it('should fallback to Local Engine on network failure', async () => {
        const apiInstance = axios.create();
        const mockPost = apiInstance.post as any;

        mockPost.mockRejectedValue({
            isAxiosError: true,
            code: 'ERR_NETWORK',
            message: 'Network Error',
            response: undefined
        });

        // We assume valid responses for fallback calculation
        const responses = [
            { question_id: 'Q001', response: 5 },
            { question_id: 'Q007', response: 5 },
            { question_id: 'Q013', response: 5 }
        ];

        const result = await submitAssessment(responses);

        expect(mockPost).toHaveBeenCalled();
        expect(result.is_offline).toBe(true);
        expect(result.assessment_id).toContain('OFFLINE_');
    });
});

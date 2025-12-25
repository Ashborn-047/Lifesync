
import { AssessmentResult } from './assessment';

export interface UserProfile {
    id: string; // Profile ID
    user_id: string;
    current_assessment_id: string;
    created_at: string;
    updated_at: string;
    current_assessment?: AssessmentResult; // Expanded details
}

/**
 * LifeSync Mobile - Hook to fetch latest assessment
 * Similar to web app's sessionStorage approach
 */

import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAssessment } from '../lib/api';
import type { AssessmentResult } from '../types';

const STORAGE_KEY = 'assessmentResult';
const ASSESSMENT_ID_KEY = 'latestAssessmentId';

export function useLatestAssessment() {
  const [result, setResult] = useState<AssessmentResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssessment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Try to get assessment ID from storage
      const assessmentId = await AsyncStorage.getItem(ASSESSMENT_ID_KEY);
      
      if (assessmentId) {
        try {
          // Fetch fresh data from backend
          const assessmentData = await getAssessment(assessmentId);
          setResult(assessmentData);
          // Store in AsyncStorage for offline access
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assessmentData));
        } catch (fetchError) {
          // If backend fetch fails, try stored data
          console.warn('Failed to fetch from backend, using stored data:', fetchError);
          const storedData = await AsyncStorage.getItem(STORAGE_KEY);
          if (storedData) {
            const parsed = JSON.parse(storedData);
            if (parsed.assessment_id === assessmentId) {
              setResult(parsed);
            } else {
              // Assessment ID mismatch, clear storage
              await AsyncStorage.removeItem(STORAGE_KEY);
              await AsyncStorage.removeItem(ASSESSMENT_ID_KEY);
              setResult(null);
            }
          } else {
            setResult(null);
          }
        }
      } else {
        // No assessment ID, try stored data
        const storedData = await AsyncStorage.getItem(STORAGE_KEY);
        if (storedData) {
          const parsed = JSON.parse(storedData);
          setResult(parsed);
        } else {
          setResult(null);
        }
      }
    } catch (err) {
      console.error('Failed to load assessment:', err);
      setError(err instanceof Error ? err.message : 'Failed to load assessment');
      setResult(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAssessment();
  }, [loadAssessment]);

  const saveAssessment = useCallback(async (assessment: AssessmentResult) => {
    try {
      setResult(assessment);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(assessment));
      await AsyncStorage.setItem(ASSESSMENT_ID_KEY, assessment.assessment_id);
    } catch (err) {
      console.error('Failed to save assessment:', err);
    }
  }, []);

  const clearAssessment = useCallback(async () => {
    try {
      setResult(null);
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(ASSESSMENT_ID_KEY);
    } catch (err) {
      console.error('Failed to clear assessment:', err);
    }
  }, []);

  return {
    result,
    loading,
    error,
    refetch: loadAssessment,
    saveAssessment,
    clearAssessment,
  };
}


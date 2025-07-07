import { useState, useCallback } from 'react';
import { listAllMentors, approveMentor, rejectMentor } from '@/lib/adminApi';
import { MentorResponse, ApiError } from '@/types/api';

export function useMentors() {
    const [mentors, setMentors] = useState<MentorResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [actionInProgress, setActionInProgress] = useState<string | null>(null);

    const fetchMentors = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);
            const allMentors = await listAllMentors();
            setMentors(allMentors);
        } catch (err) {
            const apiError = err as ApiError;
            console.error('Failed to fetch mentors:', apiError);
            setError(apiError.message || 'Failed to fetch mentors data');
        } finally {
            setIsLoading(false);
        }
    }, []);

    const handleApprove = async (mentorId: string) => {
        try {
            setActionInProgress(mentorId);
            await approveMentor(mentorId);
            await fetchMentors();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to approve mentor');
        } finally {
            setActionInProgress(null);
        }
    };

    const handleReject = async (mentorId: string) => {
        try {
            setActionInProgress(mentorId);
            await rejectMentor(mentorId);
            await fetchMentors();
        } catch (err) {
            const apiError = err as ApiError;
            setError(apiError.message || 'Failed to reject mentor');
        } finally {
            setActionInProgress(null);
        }
    };

    return {
        mentors,
        isLoading,
        error,
        actionInProgress,
        fetchMentors,
        handleApprove,
        handleReject,
    };
}
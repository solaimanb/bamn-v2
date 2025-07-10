import { useState, useCallback, useRef } from 'react'
import { MentorResponse } from '@/types/api'
import { listAllMentors } from '@/lib/adminApi'
import { useAdminStore } from '@/store/adminStore'

interface CacheData {
  data: MentorResponse[]
  timestamp: number
}

export function useMentors() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const { pendingMentors: mentors, setPendingMentors } = useAdminStore()
  const cache = useRef<CacheData | null>(null)
  const cacheDuration = useRef(5 * 60 * 1000)

  const fetchMentors = useCallback(async (force = false) => {
    // Return cached data if available and not expired
    if (!force && cache.current && Date.now() - cache.current.timestamp < cacheDuration.current) {
      setPendingMentors(cache.current.data)
      return
    }

    setIsLoading(true)
    setError(null)
    try {
      // Fetch all mentors instead of just pending ones
      const response = await listAllMentors()
      setPendingMentors(response)
      cache.current = { data: response, timestamp: Date.now() }
    } catch (err) {
      setError(err as Error)
      // Keep showing old data if available
      if (cache.current?.data) {
        setPendingMentors(cache.current.data)
      }
    } finally {
      setIsLoading(false)
    }
  }, [setPendingMentors])

  const updateMentorStatus = useCallback(async (
    mentorId: string,
    newStatus: 'approved' | 'rejected',
    updateFn: () => Promise<void>
  ) => {
    // Store current state for rollback
    const originalMentors = [...mentors] as MentorResponse[]
    
    // Optimistically update UI
    const mentorIndex = mentors.findIndex(m => m.id === mentorId)
    if (mentorIndex === -1) return

    const updatedMentors = [...mentors] as MentorResponse[]
    updatedMentors[mentorIndex] = {
      ...mentors[mentorIndex],
      moderation_status: newStatus
    } as MentorResponse

    setPendingMentors(updatedMentors)

    try {
      await updateFn()
      // Update cache
      if (cache.current) {
        cache.current.data = updatedMentors
      }
    } catch (error) {
      // Rollback on error
      setPendingMentors(originalMentors)
      if (cache.current) {
        cache.current.data = originalMentors
      }
      throw error
    }
  }, [mentors, setPendingMentors])

  return {
    mentors: mentors as MentorResponse[],
    isLoading,
    error,
    fetchMentors,
    updateMentorStatus
  }
}
import useSWR from 'swr'
import { apiEndpoints } from '../api/batchApi'
import { JobRunSummary, JobRunSummaryParams, PageResponse } from '../types/batch'

export function useJobRunSummaries(params: JobRunSummaryParams = {}) {
  const { data, error, isLoading, mutate } = useSWR<PageResponse<JobRunSummary>>(
    apiEndpoints.jobRunSummaries(params)
  )

  return {
    jobRunSummaries: data,
    isLoading,
    isError: !!error,
    error,
    mutate
  }
}

import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { DateTime } from '../components/DateTime'
import { Table, TableColumn } from '../components/Table'
import { useJobInstances } from '../hooks/useJobInstances'
import { JobInstance, JobInstancesParams } from '../types/batch'
import { useSearchState } from '../context/SearchStateContext'
import { formatDuration } from '../utils/duration'

type SortBy = NonNullable<JobInstancesParams['sortBy']>
type SortOrder = NonNullable<JobInstancesParams['sortOrder']>

const DEFAULT_INSTANCES_PARAMS: JobInstancesParams = {
  page: 0,
  size: 20,
  sortBy: 'jobInstanceId',
  sortOrder: 'desc'
}

const JobInstancesList = () => {
  const { searchState, setJobInstancesState } = useSearchState()
  const [searchParams, setSearchParams] = useSearchParams()

  const hasUrlManagedFilters = ['jobName', 'parameterName', 'parameterValue', 'sortBy', 'sortOrder'].some((key) =>
    searchParams.has(key)
  )
  const initialParams = hasUrlManagedFilters ? { ...DEFAULT_INSTANCES_PARAMS } : { ...searchState.jobInstances }

  const urlJobName = searchParams.get('jobName')
  const urlParameterName = searchParams.get('parameterName')
  const urlParameterValue = searchParams.get('parameterValue')
  const urlSortBy = searchParams.get('sortBy')
  const urlSortOrder = searchParams.get('sortOrder')
  const normalizedUrlSortBy =
    urlSortBy && ['jobInstanceId', 'jobName', 'startTime', 'endTime', 'durationSeconds', 'status'].includes(urlSortBy)
      ? (urlSortBy as SortBy)
      : undefined
  const normalizedUrlSortOrder =
    urlSortOrder === 'asc' || urlSortOrder === 'desc' ? (urlSortOrder as SortOrder) : undefined

  if (urlJobName) {
    initialParams.jobName = urlJobName
  }
  if (urlParameterName) {
    initialParams.parameterName = urlParameterName
  }
  if (urlParameterValue) {
    initialParams.parameterValue = urlParameterValue
  }
  if (normalizedUrlSortBy) {
    initialParams.sortBy = normalizedUrlSortBy
  }
  if (normalizedUrlSortOrder) {
    initialParams.sortOrder = normalizedUrlSortOrder
  }

  const [params, setParams] = useState<JobInstancesParams>(initialParams)
  const [jobNameFilter, setJobNameFilter] = useState(urlJobName || initialParams.jobName || '')
  const [parameterNameFilter, setParameterNameFilter] = useState(urlParameterName || initialParams.parameterName || '')
  const [parameterValueFilter, setParameterValueFilter] = useState(urlParameterValue || initialParams.parameterValue || '')

  const { jobInstances, isLoading, isError, error } = useJobInstances(params)

  useEffect(() => {
    setJobInstancesState(params)
  }, [params, setJobInstancesState])

  useEffect(() => {
    const newSearchParams = new URLSearchParams()

    if (params.jobName) {
      newSearchParams.set('jobName', params.jobName)
    }
    if (params.parameterName) {
      newSearchParams.set('parameterName', params.parameterName)
    }
    if (params.parameterValue) {
      newSearchParams.set('parameterValue', params.parameterValue)
    }
    if (params.sortBy) {
      newSearchParams.set('sortBy', params.sortBy)
    }
    if (params.sortOrder) {
      newSearchParams.set('sortOrder', params.sortOrder)
    }

    if (newSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(newSearchParams)
    }
  }, [params, setSearchParams, searchParams])

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }))
  }

  const handleSortChange = (sortBy: SortBy) => {
    setParams((prev) => {
      const currentSortBy = prev.sortBy ?? DEFAULT_INSTANCES_PARAMS.sortBy ?? 'jobInstanceId'
      const currentSortOrder = prev.sortOrder ?? DEFAULT_INSTANCES_PARAMS.sortOrder ?? 'desc'
      const nextSortOrder: SortOrder =
        currentSortBy === sortBy ? (currentSortOrder === 'asc' ? 'desc' : 'asc') : 'desc'

      return {
        ...prev,
        sortBy,
        sortOrder: nextSortOrder,
        page: 0
      }
    })
  }

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setParams((prev) => ({
      ...prev,
      jobName: jobNameFilter || undefined,
      parameterName: parameterNameFilter || undefined,
      parameterValue: parameterValueFilter || undefined,
      page: 0
    }))
  }

  const handleFilterReset = () => {
    setJobNameFilter('')
    setParameterNameFilter('')
    setParameterValueFilter('')
    setParams({ ...DEFAULT_INSTANCES_PARAMS })
    setSearchParams(new URLSearchParams())
  }

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  if (isError) {
    return <ErrorMessage error={error} />
  }

  const columns: TableColumn<JobInstance>[] = [
    {
      key: 'jobInstanceId',
      title: 'ID',
      sortable: true,
      render: (instance) => (
        <Link
          to={`/job-instances/${instance.jobInstanceId}`}
          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {instance.jobInstanceId}
        </Link>
      )
    },
    {
      key: 'jobName',
      title: 'Job Name',
      sortable: true,
      render: (instance) => instance.jobName
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (instance) =>
        instance.latestExecution ? (
          <StatusBadge status={instance.latestExecution.status} />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'startTime',
      title: 'Start Time',
      sortable: true,
      render: (instance) =>
        instance.latestExecution?.startTime ? (
          <DateTime date={instance.latestExecution.startTime} />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'endTime',
      title: 'End Time',
      sortable: true,
      render: (instance) =>
        instance.latestExecution?.endTime ? (
          <DateTime date={instance.latestExecution.endTime} />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'durationSeconds',
      title: 'Duration',
      sortable: true,
      render: (instance) =>
        formatDuration(
          instance.latestExecution?.durationSeconds,
          instance.latestExecution?.startTime,
          instance.latestExecution?.endTime
        )
    },
    {
      key: 'parameters',
      title: 'Parameters',
      render: (instance) =>
        instance.parameters && instance.parameters.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {instance.parameters.map((param) => (
              <span
                key={param.name}
                className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                title={`${param.name}=${param.value}`}
              >
                {param.name}: {param.value.length > 20 ? `${param.value.substring(0, 20)}...` : param.value}
              </span>
            ))}
          </div>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (instance) => (
        <Link to={`/job-instances/${instance.jobInstanceId}`} className="btn btn-outline py-1 px-2 text-xs">
          Details
        </Link>
      )
    }
  ]

  return (
    <div>
      <div className="mb-6">
        <Card title="Filters">
          <form onSubmit={handleFilterSubmit}>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label htmlFor="jobName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Name
                </label>
                <input
                  type="text"
                  id="jobName"
                  className="input"
                  value={jobNameFilter}
                  onChange={(e) => setJobNameFilter(e.target.value)}
                  placeholder="Filter by job name"
                />
              </div>

              <div>
                <label htmlFor="parameterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parameter Name
                </label>
                <input
                  type="text"
                  id="parameterName"
                  className="input"
                  value={parameterNameFilter}
                  onChange={(e) => setParameterNameFilter(e.target.value)}
                  placeholder="e.g., date, batch-id"
                />
              </div>

              <div>
                <label htmlFor="parameterValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parameter Value
                </label>
                <input
                  type="text"
                  id="parameterValue"
                  className="input"
                  value={parameterValueFilter}
                  onChange={(e) => setParameterValueFilter(e.target.value)}
                  placeholder="e.g., 2024-01-01"
                />
              </div>

              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Apply Filters
                </button>
                <button type="button" className="btn-secondary" onClick={handleFilterReset}>
                  Reset
                </button>
              </div>
            </div>
          </form>
        </Card>
      </div>

      <Card title="Job Instances">
        <Table
          columns={columns}
          data={jobInstances?.content ?? []}
          rowKey={(instance) => instance.jobInstanceId}
          emptyMessage="No job instances found."
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSortChange={(sortBy) => handleSortChange(sortBy as SortBy)}
        />

        {jobInstances && (
          <div className="mt-4">
            <Pagination currentPage={jobInstances.page} totalPages={jobInstances.totalPages} onPageChange={handlePageChange} />
          </div>
        )}
      </Card>
    </div>
  )
}

export default JobInstancesList

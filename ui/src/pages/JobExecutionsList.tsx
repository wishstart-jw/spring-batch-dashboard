import React, { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Card } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { DateTime } from '../components/DateTime'
import { Table, TableColumn } from '../components/Table'
import { useJobExecutions } from '../hooks/useJobExecutions'
import { JobExecution, JobExecutionsParams, JobStatus } from '../types/batch'
import { useSearchState } from "../context/SearchStateContext"

const JOB_STATUSES: JobStatus[] = [
  'COMPLETED',
  'FAILED',
  'ABANDONED',
  'STARTED',
  'STOPPING',
  'STOPPED',
  'STARTING',
  'UNKNOWN'
]

type SortBy = NonNullable<JobExecutionsParams['sortBy']>
type SortOrder = NonNullable<JobExecutionsParams['sortOrder']>

const DEFAULT_EXECUTIONS_PARAMS: JobExecutionsParams = {
  page: 0,
  size: 20,
  sortBy: 'startTime',
  sortOrder: 'desc'
}

const JobExecutionsList = () => {
  const { searchState, setJobExecutionsState } = useSearchState();
  const [searchParams, setSearchParams] = useSearchParams();

  const hasUrlManagedFilters = [
    'jobName',
    'status',
    'startDateFrom',
    'startDateTo',
    'parameterName',
    'parameterValue',
    'sortBy',
    'sortOrder'
  ].some((key) => searchParams.has(key));
  
  // Initialize params with URL params or saved state
  const initialParams: JobExecutionsParams = hasUrlManagedFilters
    ? { ...DEFAULT_EXECUTIONS_PARAMS }
    : { ...searchState.jobExecutions };
  
  // Hydrate selected filters from URL params when available.
  const urlJobName = searchParams.get("jobName");
  const urlStatus = searchParams.get("status");
  const urlStartDateFrom = searchParams.get("startDateFrom");
  const urlStartDateTo = searchParams.get("startDateTo");
  const urlParameterName = searchParams.get("parameterName");
  const urlParameterValue = searchParams.get("parameterValue");
  const urlSortBy = searchParams.get('sortBy');
  const urlSortOrder = searchParams.get('sortOrder');
  const normalizedUrlStatus =
    urlStatus && JOB_STATUSES.includes(urlStatus as JobStatus)
      ? (urlStatus as JobStatus)
      : undefined;
  const normalizedUrlSortBy =
    urlSortBy && ['jobExecutionId', 'jobName', 'jobInstanceId', 'createTime', 'startTime', 'endTime', 'status'].includes(urlSortBy)
      ? (urlSortBy as SortBy)
      : undefined;
  const normalizedUrlSortOrder =
    urlSortOrder === 'asc' || urlSortOrder === 'desc' ? (urlSortOrder as SortOrder) : undefined;

  if (urlJobName) {
    initialParams.jobName = urlJobName;
  }
  if (normalizedUrlStatus) {
    initialParams.status = normalizedUrlStatus;
  }
  if (urlStartDateFrom) {
    initialParams.startDateFrom = urlStartDateFrom;
  }
  if (urlStartDateTo) {
    initialParams.startDateTo = urlStartDateTo;
  }
  if (urlParameterName) {
    initialParams.parameterName = urlParameterName;
  }
  if (urlParameterValue) {
    initialParams.parameterValue = urlParameterValue;
  }
  if (normalizedUrlSortBy) {
    initialParams.sortBy = normalizedUrlSortBy;
  }
  if (normalizedUrlSortOrder) {
    initialParams.sortOrder = normalizedUrlSortOrder;
  }
  
  // State for filter and pagination
  const [params, setParams] = useState<JobExecutionsParams>(initialParams);
  
  // State for filter form - initialize with URL params or saved state
  const [jobNameFilter, setJobNameFilter] = useState(urlJobName || initialParams.jobName || '');
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>(initialParams.status || normalizedUrlStatus || '');
  const [startDateFrom, setStartDateFrom] = useState(urlStartDateFrom || initialParams.startDateFrom || '');
  const [startDateTo, setStartDateTo] = useState(urlStartDateTo || initialParams.startDateTo || '');
  const [parameterNameFilter, setParameterNameFilter] = useState(urlParameterName || initialParams.parameterName || '');
  const [parameterValueFilter, setParameterValueFilter] = useState(urlParameterValue || initialParams.parameterValue || '');

  const handleSortChange = (sortBy: SortBy) => {
    setParams((prev) => {
      const currentSortBy = prev.sortBy ?? DEFAULT_EXECUTIONS_PARAMS.sortBy ?? 'startTime'
      const currentSortOrder = prev.sortOrder ?? DEFAULT_EXECUTIONS_PARAMS.sortOrder ?? 'desc'
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
  
  // Fetch job executions with current params
  const {
    jobExecutions,
    isLoading,
    isError,
    error
  } = useJobExecutions(params)
  
  // Update context when params change
  useEffect(() => {
    setJobExecutionsState(params);
  }, [params, setJobExecutionsState]);
  
  // Sync URL with params when they change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (params.jobName) {
      newSearchParams.set("jobName", params.jobName);
    }
    if (params.status) {
      newSearchParams.set("status", params.status);
    }
    if (params.startDateFrom) {
      newSearchParams.set("startDateFrom", params.startDateFrom);
    }
    if (params.startDateTo) {
      newSearchParams.set("startDateTo", params.startDateTo);
    }
    if (params.parameterName) {
      newSearchParams.set("parameterName", params.parameterName);
    }
    if (params.parameterValue) {
      newSearchParams.set("parameterValue", params.parameterValue);
    }
    if (params.sortBy) {
      newSearchParams.set('sortBy', params.sortBy)
    }
    if (params.sortOrder) {
      newSearchParams.set('sortOrder', params.sortOrder)
    }
    
    // Only update if search params have changed
    if (newSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(newSearchParams);
    }
  }, [params, setSearchParams, searchParams]);
  
  // Handle page change
  const handlePageChange = (newPage: number) => {
    setParams(prev => ({ ...prev, page: newPage }))
  }
  
  // Handle filter submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setParams(prev => ({
      ...prev,
      jobName: jobNameFilter || undefined,
      status: statusFilter as JobStatus || undefined,
      startDateFrom: startDateFrom || undefined,
      startDateTo: startDateTo || undefined,
      parameterName: parameterNameFilter || undefined,
      parameterValue: parameterValueFilter || undefined,
      page: 0 // Reset to first page when filtering
    }))
  }
  
  // Handle filter reset
  const handleFilterReset = () => {
    setJobNameFilter('')
    setStatusFilter('')
    setStartDateFrom('')
    setStartDateTo('')
    setParameterNameFilter('')
    setParameterValueFilter('')
    setParams({ ...DEFAULT_EXECUTIONS_PARAMS })
    
    // Clear URL parameters
    setSearchParams(new URLSearchParams())
  }
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }
  
  // Error state
  if (isError) {
    return <ErrorMessage error={error} />
  }

  const columns: TableColumn<JobExecution>[] = [
    {
      key: 'jobExecutionId',
      title: 'ID',
      sortable: true,
      render: (execution) => (
        <Link
          to={`/job-executions/${execution.jobExecutionId}`}
          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {execution.jobExecutionId}
        </Link>
      )
    },
    {
      key: 'jobName',
      title: 'Job Name',
      sortable: true,
      render: (execution) => execution.jobName
    },
    {
      key: 'jobInstanceId',
      title: 'Instance ID',
      sortable: true,
      render: (execution) => (
        <Link
          to={`/job-instances/${execution.jobInstanceId}`}
          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {execution.jobInstanceId}
        </Link>
      )
    },
    {
      key: 'createTime',
      title: 'Create Time',
      sortable: true,
      render: (execution) => <DateTime date={execution.createTime} />
    },
    {
      key: 'startTime',
      title: 'Start Time',
      sortable: true,
      render: (execution) => <DateTime date={execution.startTime} />
    },
    {
      key: 'endTime',
      title: 'End Time',
      sortable: true,
      render: (execution) =>
        execution.endTime ? (
          <DateTime date={execution.endTime} />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (execution) => <StatusBadge status={execution.status} />
    },
    {
      key: 'parameters',
      title: 'Parameters',
      render: (execution) =>
        execution.parameters && execution.parameters.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {execution.parameters.map((param) => (
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
      render: (execution) => (
        <Link
          to={`/job-executions/${execution.jobExecutionId}`}
          className="btn btn-outline py-1 px-2 text-xs"
        >
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label htmlFor="jobName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Job Name
                </label>
                <input
                  type="text"
                  id="jobName"
                  className="input w-full"
                  value={jobNameFilter}
                  onChange={(e) => setJobNameFilter(e.target.value)}
                  placeholder="Filter by job name"
                />
              </div>
              
              <div>
                <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Status
                </label>
                <select
                  id="status"
                  className="select w-full"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as JobStatus | '')}
                >
                  <option value="">All Statuses</option>
                  {JOB_STATUSES.map(status => (
                    <option key={status} value={status}>{status}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label htmlFor="startDateFrom" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date From
                </label>
                <input
                  type="datetime-local"
                  id="startDateFrom"
                  className="input w-full"
                  value={startDateFrom}
                  onChange={(e) => setStartDateFrom(e.target.value)}
                />
              </div>
              
              <div>
                <label htmlFor="startDateTo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date To
                </label>
                <input
                  type="datetime-local"
                  id="startDateTo"
                  className="input w-full"
                  value={startDateTo}
                  onChange={(e) => setStartDateTo(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="parameterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parameter Name
                </label>
                <input
                  type="text"
                  id="parameterName"
                  className="input w-full"
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
                  className="input w-full"
                  value={parameterValueFilter}
                  onChange={(e) => setParameterValueFilter(e.target.value)}
                  placeholder="e.g., 2024-01-01"
                />
              </div>
            </div>
            
            <div className="mt-4 flex gap-2">
              <button type="submit" className="btn-primary">
                Apply Filters
              </button>
              <button 
                type="button" 
                className="btn-secondary"
                onClick={handleFilterReset}
              >
                Reset
              </button>
            </div>
          </form>
        </Card>
      </div>
      
      <Card title="Job Executions">
        <Table
          columns={columns}
          data={jobExecutions?.content ?? []}
          rowKey={(execution) => execution.jobExecutionId}
          emptyMessage="No job executions found."
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSortChange={(sortBy) => handleSortChange(sortBy as SortBy)}
        />
        
        {/* Pagination */}
        {jobExecutions && (
          <div className="mt-4">
            <Pagination
              currentPage={jobExecutions.page}
              totalPages={jobExecutions.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default JobExecutionsList

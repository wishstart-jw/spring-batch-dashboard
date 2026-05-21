// No longer need useState since we don't have tabs anymore
import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Card } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { StatusBadge } from '../components/StatusBadge'
import { DateTime } from '../components/DateTime'
import { Table, TableColumn } from '../components/Table'
import { useJobExecutionDetail } from '../hooks/useJobExecutionDetail'
import { StepExecutionSummary } from '../types/batch'
import { formatDuration, resolveDurationSeconds } from '../utils/duration'

type SortOrder = 'asc' | 'desc'
type StepSortBy =
  | 'stepExecutionId'
  | 'stepName'
  | 'startTime'
  | 'endTime'
  | 'durationSeconds'
  | 'status'
  | 'readCount'
  | 'filterCount'
  | 'writeCount'

const JobExecutionDetail = () => {
  // No need for tabs anymore as we only have parameters
  
  // Get job execution ID from URL params
  const { jobExecutionId } = useParams<{ jobExecutionId: string }>()
  const id = jobExecutionId ? parseInt(jobExecutionId) : null
  const navigate = useNavigate()
  
  // Fetch job execution detail
  const {
    jobExecutionDetail,
    isLoading,
    isError,
    error
  } = useJobExecutionDetail(id)

  const [stepsSortBy, setStepsSortBy] = useState<StepSortBy>('stepExecutionId')
  const [stepsSortOrder, setStepsSortOrder] = useState<SortOrder>('desc')

  const handleStepsSortChange = (sortBy: StepSortBy) => {
    setStepsSortOrder((prevSortOrder) => {
      if (stepsSortBy !== sortBy) {
        return 'desc'
      }

      return prevSortOrder === 'asc' ? 'desc' : 'asc'
    })
    setStepsSortBy(sortBy)
  }

  const sortedSteps = useMemo(() => {
    const compareNullableDate = (left?: string, right?: string) => {
      if (!left && !right) {
        return 0
      }
      if (!left) {
        return 1
      }
      if (!right) {
        return -1
      }

      return new Date(left).getTime() - new Date(right).getTime()
    }

    const compareValues = (left: string | number, right: string | number) => {
      if (typeof left === 'number' && typeof right === 'number') {
        return left - right
      }

      return String(left).localeCompare(String(right))
    }

    const steps = jobExecutionDetail?.steps ?? []

    return [...steps].sort((left, right) => {
      let comparison = 0

      switch (stepsSortBy) {
        case 'stepExecutionId':
          comparison = compareValues(left.stepExecutionId, right.stepExecutionId)
          break
        case 'stepName':
          comparison = compareValues(left.stepName, right.stepName)
          break
        case 'startTime':
          comparison = compareValues(left.startTime, right.startTime)
          break
        case 'endTime':
          comparison = compareNullableDate(left.endTime, right.endTime)
          break
        case 'durationSeconds':
          comparison = compareValues(
            resolveDurationSeconds(left.durationSeconds, left.startTime, left.endTime) ?? -1,
            resolveDurationSeconds(right.durationSeconds, right.startTime, right.endTime) ?? -1
          )
          break
        case 'status':
          comparison = compareValues(left.status, right.status)
          break
        case 'readCount':
          comparison = compareValues(left.readCount, right.readCount)
          break
        case 'filterCount':
          comparison = compareValues(left.filterCount, right.filterCount)
          break
        case 'writeCount':
          comparison = compareValues(left.writeCount, right.writeCount)
          break
      }

      return stepsSortOrder === 'asc' ? comparison : -comparison
    })
  }, [jobExecutionDetail?.steps, stepsSortBy, stepsSortOrder])

  const stepColumns: TableColumn<StepExecutionSummary>[] = [
    {
      key: 'stepExecutionId',
      title: 'ID',
      sortable: true,
      render: (step) => (
        <Link
          to={`/step-executions/${step.stepExecutionId}`}
          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {step.stepExecutionId}
        </Link>
      )
    },
    {
      key: 'stepName',
      title: 'Step Name',
      sortable: true,
      render: (step) => step.stepName
    },
    {
      key: 'startTime',
      title: 'Start Time',
      sortable: true,
      render: (step) => <DateTime date={step.startTime} />
    },
    {
      key: 'endTime',
      title: 'End Time',
      sortable: true,
      render: (step) =>
        step.endTime ? (
          <DateTime date={step.endTime} />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'durationSeconds',
      title: 'Duration',
      sortable: true,
      render: (step) => formatDuration(step.durationSeconds, step.startTime, step.endTime)
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (step) => <StatusBadge status={step.status} />
    },
    {
      key: 'readCount',
      title: 'Read',
      sortable: true,
      render: (step) => step.readCount
    },
    {
      key: 'filterCount',
      title: 'Filter',
      sortable: true,
      render: (step) => step.filterCount
    },
    {
      key: 'writeCount',
      title: 'Write',
      sortable: true,
      render: (step) => step.writeCount
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (step) => (
        <Link
          to={`/step-executions/${step.stepExecutionId}`}
          className="btn btn-outline py-1 px-2 text-xs"
        >
          Details
        </Link>
      )
    }
  ]
  
  // Loading state
  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }
  
  // Error state
  if (isError) {
    return <ErrorMessage error={error} />
  }
  
  if (!jobExecutionDetail) {
    return <div>No job execution details found.</div>
  }
  
  // Calculate duration in seconds
  const getDuration = () => {
    return formatDuration(
      jobExecutionDetail.durationSeconds,
      jobExecutionDetail.startTime,
      jobExecutionDetail.endTime,
      'N/A'
    )
  }
  
  return (
    <div className="space-y-6">
      {/* Job Execution Info */}
      <Card title="Job Execution Details">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
            <p className="font-medium">{jobExecutionDetail.jobExecutionId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Job Name</p>
            <p className="font-medium">{jobExecutionDetail.jobName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Instance ID</p>
            <p className="font-medium">
              <Link 
                to={`/job-instances/${jobExecutionDetail.jobInstanceId}`}
                className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
              >
                {jobExecutionDetail.jobInstanceId}
              </Link>
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Create Time</p>
            <p className="font-medium">
              <DateTime date={jobExecutionDetail.createTime} />
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Start Time</p>
            <p className="font-medium">
              <DateTime date={jobExecutionDetail.startTime} />
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">End Time</p>
            <p className="font-medium">
              {jobExecutionDetail.endTime ? (
                <DateTime date={jobExecutionDetail.endTime} />
              ) : (
                <span className="text-gray-500 dark:text-gray-400">-</span>
              )}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Duration</p>
            <p className="font-medium">{getDuration()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
            <p className="font-medium">
              <StatusBadge status={jobExecutionDetail.status} />
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Exit Code</p>
            <p className="font-medium">{jobExecutionDetail.exitCode}</p>
          </div>
          {jobExecutionDetail.exitMessage && (
            <div className="md:col-span-3">
              <p className="text-sm text-gray-500 dark:text-gray-400">Exit Message</p>
              <p className="font-medium">{jobExecutionDetail.exitMessage}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last Updated</p>
            <p className="font-medium">
              <DateTime date={jobExecutionDetail.lastUpdated} />
            </p>
          </div>
        </div>
      </Card>
      
      {/* Parameters */}
      <Card title="Parameters">
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">Name</th>
                <th className="table-header-cell">Type</th>
                <th className="table-header-cell">Value</th>
                <th className="table-header-cell">Identifying</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {jobExecutionDetail.parameters.map((param, index) => (
                <tr key={index} className="table-row">
                  <td className="table-cell">{param.name}</td>
                  <td className="table-cell">{param.type}</td>
                  <td className="table-cell">
                    <div className="max-w-xs truncate" title={param.value}>
                      {param.value}
                    </div>
                  </td>
                  <td className="table-cell">
                    {param.identifying ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
              
              {/* No parameters message */}
              {jobExecutionDetail.parameters.length === 0 && (
                <tr>
                  <td colSpan={4} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    No parameters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
      
      {/* Steps Table */}
      <Card title="Step Executions">
        <Table
          columns={stepColumns}
          data={sortedSteps}
          rowKey={(step) => step.stepExecutionId}
          emptyMessage="No step executions found."
          sortBy={stepsSortBy}
          sortOrder={stepsSortOrder}
          onSortChange={(sortBy) => handleStepsSortChange(sortBy as StepSortBy)}
        />
      </Card>
      
      <div className="flex gap-4">
        <button 
          onClick={() => navigate('/job-executions')} 
          className="btn-outline"
        >
          Back to Job Executions
        </button>
        <Link to={`/job-instances/${jobExecutionDetail.jobInstanceId}`} className="btn-outline">
          View Job Instance
        </Link>
      </div>
    </div>
  )
}

export default JobExecutionDetail

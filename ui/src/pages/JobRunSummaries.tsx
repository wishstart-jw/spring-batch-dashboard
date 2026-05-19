import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { DateTime } from '../components/DateTime'
import { ErrorMessage } from '../components/ErrorMessage'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { Table, TableColumn } from '../components/Table'
import { useJobRunSummaries } from '../hooks/useJobRunSummaries'
import { JobRunSummary, JobRunSummaryParams } from '../types/batch'

type SortBy = NonNullable<JobRunSummaryParams['sortBy']>
type SortOrder = NonNullable<JobRunSummaryParams['sortOrder']>

const DEFAULT_SIZE = 20

const JobRunSummaries = () => {
  const [params, setParams] = useState<JobRunSummaryParams>({
    page: 0,
    size: DEFAULT_SIZE,
    sortBy: 'lastStartTime',
    sortOrder: 'desc'
  })

  const { jobRunSummaries, isLoading, isError, error } = useJobRunSummaries(params)

  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }))
  }

  const handleSortChange = (sortBy: SortBy) => {
    setParams((prev) => {
      const currentSortBy = prev.sortBy ?? 'lastStartTime'
      const currentSortOrder = prev.sortOrder ?? 'desc'
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

  const columns: TableColumn<JobRunSummary>[] = [
    {
      key: 'jobName',
      title: 'Job Name',
      sortable: true,
      render: (job) => (
        <Link
          to={`/job-executions?jobName=${encodeURIComponent(job.jobName)}`}
          className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
        >
          {job.jobName}
        </Link>
      )
    },
    {
      key: 'executions',
      title: 'Executions (60 days)',
      sortable: true,
      render: (job) => job.executions
    },
    {
      key: 'lastExecutionId',
      title: 'Last Execution ID',
      sortable: true,
      render: (job) =>
        job.lastExecutionId ? (
          <Link
            to={`/job-executions/${job.lastExecutionId}`}
            className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {job.lastExecutionId}
          </Link>
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'lastExecutionStatus',
      title: 'Last Status',
      sortable: true,
      render: (job) =>
        job.lastExecutionStatus ? (
          <StatusBadge status={job.lastExecutionStatus} />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'lastStartTime',
      title: 'Last Start',
      sortable: true,
      render: (job) =>
        job.lastStartTime ? (
          <DateTime date={job.lastStartTime} />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'lastEndTime',
      title: 'Last End',
      sortable: true,
      render: (job) =>
        job.lastEndTime ? (
          <DateTime date={job.lastEndTime} />
        ) : (
          <span className="text-gray-500 dark:text-gray-400">-</span>
        )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (job) => (
        <div className="flex gap-2">
          <Link to={`/statistics/${job.jobName}`} className="btn btn-outline py-1 px-2 text-xs">
            Statistics
          </Link>
          <Link to={`/job-instances?jobName=${encodeURIComponent(job.jobName)}`} className="btn btn-outline py-1 px-2 text-xs">
            Instances
          </Link>
          <Link to={`/job-executions?jobName=${encodeURIComponent(job.jobName)}`} className="btn btn-outline py-1 px-2 text-xs">
            Executions
          </Link>
        </div>
      )
    }
  ]

  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }

  if (isError) {
    return <ErrorMessage error={error} />
  }

  return (
    <div className="space-y-6">
      <Card title="Job Run Summaries (Last 60 Days)">
        <Table
          columns={columns}
          data={jobRunSummaries?.content ?? []}
          rowKey={(job) => job.jobName}
          emptyMessage="No job runs found in the last 60 days."
          sortBy={params.sortBy}
          sortOrder={params.sortOrder}
          onSortChange={(sortBy) => handleSortChange(sortBy as SortBy)}
        />

        {jobRunSummaries && (
          <div className="mt-4">
            <Pagination
              currentPage={jobRunSummaries.page}
              totalPages={jobRunSummaries.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}
      </Card>
    </div>
  )
}

export default JobRunSummaries

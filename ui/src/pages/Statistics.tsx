// Statistics component
import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Card } from '../components/Card'
import { LoadingSpinner } from '../components/LoadingSpinner'
import { ErrorMessage } from '../components/ErrorMessage'
import { Table, TableColumn } from '../components/Table'
import { useJobStatistics } from '../hooks/useJobStatistics'
import { useJobSpecificStatistics } from '../hooks/useJobSpecificStatistics'
import { useRecentJobExecutions } from '../hooks/useRecentJobExecutions'
import { DailyJobStats, JobStatus, RecentJobExecution } from '../types/batch'

type RecentStatsSortBy = 'date' | 'completed' | 'failed' | 'abandoned' | 'total'
type JobsSortBy = 'jobName' | 'executions'

const Statistics = () => {
  // Get job name from URL if available (for specific job stats)
  const { jobName } = useParams<{ jobName?: string }>()
  
  // Fetch global job statistics
  const { 
    jobStatistics, 
    isLoading: globalStatsLoading, 
    isError: globalStatsError,
    error: globalStatsErrorData
  } = useJobStatistics()
  
  // Fetch job-specific statistics if jobName is provided
  const {
    jobSpecificStatistics,
    isLoading: specificStatsLoading,
    isError: specificStatsError,
    error: specificStatsErrorData
  } = useJobSpecificStatistics(jobName || null)
  
  // Fetch recent job executions data (last 60 days)
  const {
    recentJobExecutions,
    isLoading: recentExecutionsLoading,
    isError: recentExecutionsError,
    error: recentExecutionsErrorData
  } = useRecentJobExecutions()

  const [recentStatsSortBy, setRecentStatsSortBy] = useState<RecentStatsSortBy>('date')
  const [recentStatsSortOrder, setRecentStatsSortOrder] = useState<'asc' | 'desc'>('desc')
  const [jobsSortBy, setJobsSortBy] = useState<JobsSortBy>('executions')
  const [jobsSortOrder, setJobsSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Loading state
  const isLoading = globalStatsLoading || (jobName && specificStatsLoading) || (!jobName && recentExecutionsLoading)
  if (isLoading) {
    return <LoadingSpinner size="lg" />
  }
  
  // Error state
  if (globalStatsError) {
    return <ErrorMessage error={globalStatsErrorData} />
  }
  
  if (jobName && specificStatsError) {
    return <ErrorMessage error={specificStatsErrorData} />
  }
  
  if (!jobName && recentExecutionsError) {
    return <ErrorMessage error={recentExecutionsErrorData} />
  }
  
  // No data state
  if (!jobStatistics) {
    return <div>No statistics data available.</div>
  }
  
  // Function to format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString()
  }

  const toDateTimeLocal = (date: Date) => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const hours = String(date.getHours()).padStart(2, '0')
    const minutes = String(date.getMinutes()).padStart(2, '0')

    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const buildJobExecutionsLink = (dateStr: string, status?: JobStatus) => {
    const date = new Date(dateStr)
    if (Number.isNaN(date.getTime())) {
      return '/job-executions'
    }

    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 0, 0)

    const params = new URLSearchParams({
      startDateFrom: toDateTimeLocal(startOfDay),
      startDateTo: toDateTimeLocal(endOfDay)
    })

    if (status) {
      params.set('status', status)
    }

    return `/job-executions?${params.toString()}`
  }

  const renderLinkedCount = (
    count: number,
    dateStr: string,
    label: string,
    className: string,
    status?: JobStatus
  ) => {
    if (count === 0) {
      return (
        <span
          className={`${className} opacity-50 cursor-not-allowed`}
          title={`No ${label} job executions for ${formatDate(dateStr)}`}
          aria-label={`No ${label} job executions for ${formatDate(dateStr)}`}
        >
          {count}
        </span>
      )
    }

    return (
      <Link
        to={buildJobExecutionsLink(dateStr, status)}
        className={`${className} underline-offset-2 hover:underline`}
        title={`View ${label} job executions for ${formatDate(dateStr)}`}
      >
        {count}
      </Link>
    )
  }

  const handleRecentStatsSortChange = (sortBy: RecentStatsSortBy) => {
    setRecentStatsSortOrder((prevOrder) => (recentStatsSortBy === sortBy ? (prevOrder === 'asc' ? 'desc' : 'asc') : 'desc'))
    setRecentStatsSortBy(sortBy)
  }

  const handleJobsSortChange = (sortBy: JobsSortBy) => {
    setJobsSortOrder((prevOrder) => (jobsSortBy === sortBy ? (prevOrder === 'asc' ? 'desc' : 'asc') : 'desc'))
    setJobsSortBy(sortBy)
  }

  const sortedRecentStats = [...(jobStatistics?.recentJobStatuses ?? [])].sort((a, b) => {
    const aTotal = a.completed + a.failed + a.abandoned
    const bTotal = b.completed + b.failed + b.abandoned

    let comparison = 0
    switch (recentStatsSortBy) {
      case 'date':
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case 'completed':
        comparison = a.completed - b.completed
        break
      case 'failed':
        comparison = a.failed - b.failed
        break
      case 'abandoned':
        comparison = a.abandoned - b.abandoned
        break
      case 'total':
        comparison = aTotal - bTotal
        break
    }

    return recentStatsSortOrder === 'asc' ? comparison : -comparison
  })

  const sortedRecentJobs = [...(recentJobExecutions ?? [])].sort((a, b) => {
    const comparison = jobsSortBy === 'jobName' ? a.jobName.localeCompare(b.jobName) : a.executions - b.executions

    return jobsSortOrder === 'asc' ? comparison : -comparison
  })

  const recentStatsColumns: TableColumn<DailyJobStats>[] = [
    {
      key: 'date',
      title: 'Date',
      sortable: true,
      render: (dailyStat) => formatDate(dailyStat.date)
    },
    {
      key: 'completed',
      title: 'Completed',
      sortable: true,
      render: (dailyStat) =>
        renderLinkedCount(
          dailyStat.completed,
          dailyStat.date,
          'COMPLETED',
          'text-success-600 dark:text-success-400 font-medium',
          'COMPLETED'
        )
    },
    {
      key: 'failed',
      title: 'Failed',
      sortable: true,
      render: (dailyStat) =>
        renderLinkedCount(
          dailyStat.failed,
          dailyStat.date,
          'FAILED',
          'text-danger-600 dark:text-danger-400 font-medium',
          'FAILED'
        )
    },
    {
      key: 'abandoned',
      title: 'Abandoned',
      sortable: true,
      render: (dailyStat) =>
        renderLinkedCount(
          dailyStat.abandoned,
          dailyStat.date,
          'ABANDONED',
          'text-warning-600 dark:text-warning-400 font-medium',
          'ABANDONED'
        )
    },
    {
      key: 'total',
      title: 'Total',
      sortable: true,
      cellClassName: 'font-medium',
      render: (dailyStat) => {
        const total = dailyStat.completed + dailyStat.failed + dailyStat.abandoned
        return renderLinkedCount(total, dailyStat.date, 'all', 'font-medium')
      }
    }
  ]

  const recentJobsColumns: TableColumn<RecentJobExecution>[] = [
    {
      key: 'jobName',
      title: 'Job Name',
      sortable: true,
      render: (job) => job.jobName
    },
    {
      key: 'executions',
      title: 'Executions Count (60 days)',
      sortable: true,
      render: (job) => job.executions
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (job) => (
        <div className="flex gap-2">
          <Link to={`/statistics/${job.jobName}`} className="btn btn-outline py-1 px-2 text-xs">
            Statistics
          </Link>
          <Link to={`/job-instances?jobName=${job.jobName}`} className="btn btn-outline py-1 px-2 text-xs">
            Instances
          </Link>
          <Link to={`/job-executions?jobName=${job.jobName}`} className="btn btn-outline py-1 px-2 text-xs">
            Executions
          </Link>
        </div>
      )
    }
  ]
  
  return (
    <div className="space-y-6">
      {/* Global statistics */}
      {!jobName && (
        <>
          <Card title="Job Statistics">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold">Total Jobs</h3>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {jobStatistics.totalJobs}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold">Completed</h3>
                <p className="text-3xl font-bold text-success-600 dark:text-success-400">
                  {jobStatistics.jobsByStatus.COMPLETED}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold">Failed</h3>
                <p className="text-3xl font-bold text-danger-600 dark:text-danger-400">
                  {jobStatistics.jobsByStatus.FAILED}
                </p>
              </div>
            </div>
          </Card>
          
          <Card title="Recent Job Statistics">
            <Table
              columns={recentStatsColumns}
              data={sortedRecentStats}
              rowKey={(dailyStat) => dailyStat.date}
              emptyMessage="No recent job statistics available."
              sortBy={recentStatsSortBy}
              sortOrder={recentStatsSortOrder}
              onSortChange={(sortBy) => handleRecentStatsSortChange(sortBy as RecentStatsSortBy)}
            />
          </Card>

          <Card title="Job Runs Panel">
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              View run counts, last execution ID, last status, and last start/end times for each job in the past 60 days.
            </p>
            <Link to="/statistics/job-runs" className="btn-primary">
              Open Job Run Summaries
            </Link>
          </Card>
        </>
      )}
      
      {/* Job-specific statistics */}
      {jobName && jobSpecificStatistics && (
        <>
          <Card title={`Statistics for ${jobSpecificStatistics.jobName}`}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold">Total Executions</h3>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {jobSpecificStatistics.totalExecutions}
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold">Success Rate</h3>
                <p className="text-3xl font-bold text-success-600 dark:text-success-400">
                  {jobSpecificStatistics.successRate.toFixed(1)}%
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold">Avg. Duration</h3>
                <p className="text-3xl font-bold text-primary-600 dark:text-primary-400">
                  {Math.floor(jobSpecificStatistics.averageDuration / 60)} min {Math.floor(jobSpecificStatistics.averageDuration % 60)} sec
                </p>
              </div>
              
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-bold">Last Execution</h3>
                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">
                  {new Date(jobSpecificStatistics.lastExecutionTime).toLocaleString()}
                </p>
              </div>
            </div>
          </Card>
          
          <Card title="Execution Status Distribution">
            <div className="table-container">
              <table className="table">
                <thead className="table-header">
                  <tr>
                    <th className="table-header-cell">Status</th>
                    <th className="table-header-cell">Count</th>
                    <th className="table-header-cell">Percentage</th>
                  </tr>
                </thead>
                <tbody className="table-body">
                  {Object.entries(jobSpecificStatistics.executionsByStatus)
                    .filter(([, count]) => count > 0)
                    .sort(([, countA], [, countB]) => (countB as number) - (countA as number))
                    .map(([status, count]) => (
                      <tr key={status} className="table-row">
                        <td className="table-cell">
                          <span className={`
                            ${status === 'COMPLETED' ? 'text-success-600 dark:text-success-400' : ''}
                            ${status === 'FAILED' ? 'text-danger-600 dark:text-danger-400' : ''}
                            ${status === 'ABANDONED' ? 'text-warning-600 dark:text-warning-400' : ''}
                            font-medium
                          `}>
                            {status}
                          </span>
                        </td>
                        <td className="table-cell">{count}</td>
                        <td className="table-cell">
                          {((count as number) / jobSpecificStatistics.totalExecutions * 100).toFixed(1)}%
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </Card>
          
          <div className="flex gap-4">
            <Link to="/statistics" className="btn-outline">
              Back to Global Statistics
            </Link>
            <Link to={`/job-instances?jobName=${jobSpecificStatistics.jobName}`} className="btn-outline">
              View Job Instances
            </Link>
            <Link to={`/job-executions?jobName=${jobSpecificStatistics.jobName}`} className="btn-primary">
              View Job Executions
            </Link>
          </div>
        </>
      )}
      
      {/* Job list table (only on global stats page) */}
      {!jobName && jobStatistics && recentJobExecutions && (
        <Card title="Jobs">
          <Table
            columns={recentJobsColumns}
            data={sortedRecentJobs}
            rowKey={(job) => job.jobName}
            emptyMessage="No job execution data available for the last 60 days"
            sortBy={jobsSortBy}
            sortOrder={jobsSortOrder}
            onSortChange={(sortBy) => handleJobsSortChange(sortBy as JobsSortBy)}
          />
        </Card>
      )}
    </div>
  )
}

export default Statistics

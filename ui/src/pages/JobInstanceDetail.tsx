// JobInstanceDetail component
import { useMemo, useState } from 'react'
import { useParams, Link, useNavigate } from "react-router-dom";
import { Card } from "../components/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { StatusBadge } from "../components/StatusBadge";
import { DateTime } from "../components/DateTime";
import { Table, TableColumn } from '../components/Table'
import { useJobInstanceDetail } from "../hooks/useJobInstanceDetail";
import { JobExecution } from '../types/batch'
import { formatDuration, resolveDurationSeconds } from '../utils/duration'

type SortOrder = 'asc' | 'desc'
type ExecutionSortBy = 'jobExecutionId' | 'createTime' | 'startTime' | 'endTime' | 'durationSeconds' | 'status' | 'exitCode'

const JobInstanceDetail = () => {
  // Get job instance ID from URL params
  const { jobInstanceId } = useParams<{ jobInstanceId: string }>();
  const id = jobInstanceId ? parseInt(jobInstanceId) : null;
  const navigate = useNavigate();

  // Fetch job instance detail
  const { jobInstanceDetail, isLoading, isError, error } = useJobInstanceDetail(id);

  const [executionsSortBy, setExecutionsSortBy] = useState<ExecutionSortBy>('jobExecutionId')
  const [executionsSortOrder, setExecutionsSortOrder] = useState<SortOrder>('desc')

  const handleExecutionsSortChange = (sortBy: ExecutionSortBy) => {
    setExecutionsSortOrder((prevSortOrder) => {
      if (executionsSortBy !== sortBy) {
        return 'desc'
      }

      return prevSortOrder === 'asc' ? 'desc' : 'asc'
    })
    setExecutionsSortBy(sortBy)
  }

  const sortedExecutions = useMemo(() => {
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

    const executions = jobInstanceDetail?.executions ?? []

    return [...executions].sort((left, right) => {
      let comparison = 0

      switch (executionsSortBy) {
        case 'jobExecutionId':
          comparison = compareValues(left.jobExecutionId, right.jobExecutionId)
          break
        case 'createTime':
          comparison = compareValues(left.createTime, right.createTime)
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
        case 'exitCode':
          comparison = compareValues(left.exitCode, right.exitCode)
          break
      }

      return executionsSortOrder === 'asc' ? comparison : -comparison
    })
  }, [executionsSortBy, executionsSortOrder, jobInstanceDetail?.executions])

  const executionColumns: TableColumn<JobExecution>[] = [
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
      key: 'durationSeconds',
      title: 'Duration',
      sortable: true,
      render: (execution) => formatDuration(execution.durationSeconds, execution.startTime, execution.endTime)
    },
    {
      key: 'status',
      title: 'Status',
      sortable: true,
      render: (execution) => <StatusBadge status={execution.status} />
    },
    {
      key: 'exitCode',
      title: 'Exit Code',
      sortable: true,
      render: (execution) => (
        <div className="group relative">
          <div>{execution.exitCode}</div>
          {execution.exitMessage && (
            <div className="hidden group-hover:block absolute left-0 top-full z-10 p-2 bg-white dark:bg-gray-800 shadow-lg rounded border border-gray-200 dark:border-gray-700 text-xs max-w-md">
              {execution.exitMessage}
            </div>
          )}
        </div>
      )
    },
    {
      key: 'actions',
      title: 'Actions',
      render: (execution) => (
        <Link to={`/job-executions/${execution.jobExecutionId}`} className="btn btn-outline py-1 px-2 text-xs">
          Details
        </Link>
      )
    }
  ]

  // Loading state
  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  // Error state
  if (isError) {
    return <ErrorMessage error={error} />;
  }

  if (!jobInstanceDetail) {
    return <div>No job instance details found.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Job Instance Info */}
      <Card title="Job Instance Details">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">ID</p>
            <p className="font-medium">{jobInstanceDetail.jobInstanceId}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Job Name</p>
            <p className="font-medium">{jobInstanceDetail.jobName}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Job Key</p>
            <p className="font-medium break-all">{jobInstanceDetail.jobKey}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Version</p>
            <p className="font-medium">{jobInstanceDetail.version}</p>
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
              {jobInstanceDetail.parameters && jobInstanceDetail.parameters.length > 0 ? (
                jobInstanceDetail.parameters.map((param, index) => (
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
                ))
              ) : (
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

      {/* Job Executions Table */}
      <Card title="Job Executions">
        <Table
          columns={executionColumns}
          data={sortedExecutions}
          rowKey={(execution) => execution.jobExecutionId}
          emptyMessage="No job executions found."
          sortBy={executionsSortBy}
          sortOrder={executionsSortOrder}
          onSortChange={(sortBy) => handleExecutionsSortChange(sortBy as ExecutionSortBy)}
        />
      </Card>

      <div className="flex gap-4">
        <button
          onClick={() => navigate('/job-instances')}
          className="btn-outline"
        >
          Back to Job Instances
        </button>
      </div>
    </div>
  );
};

export default JobInstanceDetail;

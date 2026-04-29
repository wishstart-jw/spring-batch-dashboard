import React, { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Card } from "../components/Card";
import { LoadingSpinner } from "../components/LoadingSpinner";
import { ErrorMessage } from "../components/ErrorMessage";
import { Pagination } from "../components/Pagination";
import { StatusBadge } from "../components/StatusBadge";
import { DateTime } from "../components/DateTime";
import { useJobInstances } from "../hooks/useJobInstances";
import { JobInstancesParams } from "../types/batch";
import { useSearchState } from "../context/SearchStateContext";

const JobInstancesList = () => {
  const { searchState, setJobInstancesState } = useSearchState();
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Initialize params with URL params or saved state
  const initialParams = { ...searchState.jobInstances };
  
  // Check if jobName is in URL params
  const urlJobName = searchParams.get("jobName");
  if (urlJobName) {
    initialParams.jobName = urlJobName;
  }
  
  // Initialize params state
  const [params, setParams] = useState<JobInstancesParams>(initialParams);

  // State for filter form - initialize with URL param or saved state
  const [jobNameFilter, setJobNameFilter] = useState(urlJobName || initialParams.jobName || "");
  const [parameterNameFilter, setParameterNameFilter] = useState(initialParams.parameterName || "");
  const [parameterValueFilter, setParameterValueFilter] = useState(initialParams.parameterValue || "");

  // Fetch job instances with current params
  const { jobInstances, isLoading, isError, error } = useJobInstances(params);

  // Update context when params change
  useEffect(() => {
    setJobInstancesState(params);
  }, [params, setJobInstancesState]);
  
  // Sync URL with params when they change
  useEffect(() => {
    const newSearchParams = new URLSearchParams();
    
    if (params.jobName) {
      newSearchParams.set("jobName", params.jobName);
    }
    
    // Only update if search params have changed
    if (newSearchParams.toString() !== searchParams.toString()) {
      setSearchParams(newSearchParams);
    }
  }, [params, setSearchParams, searchParams]);

  // Handle page change
  const handlePageChange = (newPage: number) => {
    setParams((prev) => ({ ...prev, page: newPage }));
  };

  // Handle filter submission
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams((prev) => ({
      ...prev,
      jobName: jobNameFilter || undefined,
      parameterName: parameterNameFilter || undefined,
      parameterValue: parameterValueFilter || undefined,
      page: 0, // Reset to first page when filtering
    }));
  };

  // Handle filter reset
  const handleFilterReset = () => {
    setJobNameFilter("");
    setParameterNameFilter("");
    setParameterValueFilter("");
    setParams({
      page: 0,
      size: 20,
      sort: "jobInstanceId,desc",
    });
    
    // Clear URL parameters
    setSearchParams(new URLSearchParams());
  };

  // Get unique parameter names from the current page results (for autocomplete hints)
  const allParameterNames = new Set<string>();
  jobInstances?.content.forEach((instance) => {
    instance.parameters?.forEach((param) => {
      allParameterNames.add(param.name);
    });
  });

  // Loading state
  if (isLoading) {
    return <LoadingSpinner size="lg" />;
  }

  // Error state
  if (isError) {
    return <ErrorMessage error={error} />;
  }

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
                <input type="text" id="jobName" className="input" value={jobNameFilter} onChange={(e) => setJobNameFilter(e.target.value)} placeholder="Filter by job name" />
              </div>

              <div>
                <label htmlFor="parameterName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parameter Name
                </label>
                <input type="text" id="parameterName" className="input" value={parameterNameFilter} onChange={(e) => setParameterNameFilter(e.target.value)} placeholder="e.g., date, batch-id" />
              </div>

              <div>
                <label htmlFor="parameterValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Parameter Value
                </label>
                <input type="text" id="parameterValue" className="input" value={parameterValueFilter} onChange={(e) => setParameterValueFilter(e.target.value)} placeholder="e.g., 2024-01-01" />
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
        <div className="table-container">
          <table className="table">
            <thead className="table-header">
              <tr>
                <th className="table-header-cell">ID</th>
                <th className="table-header-cell">Job Name</th>
                <th className="table-header-cell">Status</th>
                <th className="table-header-cell">Start Time</th>
                <th className="table-header-cell">End Time</th>
                <th className="table-header-cell">Parameters</th>
                <th className="table-header-cell">Actions</th>
              </tr>
            </thead>
            <tbody className="table-body">
              {jobInstances?.content.map((instance) => (
                <tr key={instance.jobInstanceId} className="table-row">
                  <td className="table-cell">
                    <Link 
                      to={`/job-instances/${instance.jobInstanceId}`} 
                      className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-300"
                    >
                      {instance.jobInstanceId}
                    </Link>
                  </td>
                  <td className="table-cell">{instance.jobName}</td>
                  <td className="table-cell">
                    {instance.latestExecution ? 
                      <StatusBadge status={instance.latestExecution.status} /> : 
                      <span className="text-gray-500 dark:text-gray-400">-</span>
                    }
                  </td>
                  <td className="table-cell">
                    {instance.latestExecution?.startTime ? 
                      <DateTime date={instance.latestExecution.startTime} /> : 
                      <span className="text-gray-500 dark:text-gray-400">-</span>
                    }
                  </td>
                  <td className="table-cell">
                    {instance.latestExecution?.endTime ? 
                      <DateTime date={instance.latestExecution.endTime} /> : 
                      <span className="text-gray-500 dark:text-gray-400">-</span>
                    }
                  </td>
                  <td className="table-cell">
                    {instance.parameters && instance.parameters.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {instance.parameters.map((param) => (
                          <span 
                            key={param.name}
                            className="inline-block bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs px-2 py-1 rounded"
                            title={`${param.name}=${param.value}`}
                          >
                            {param.name}: {param.value.length > 20 ? param.value.substring(0, 20) + '...' : param.value}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-gray-500 dark:text-gray-400">-</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <Link 
                      to={`/job-instances/${instance.jobInstanceId}`} 
                      className="btn btn-outline py-1 px-2 text-xs"
                    >
                      Details
                    </Link>
                  </td>
                </tr>
              ))}

              {/* No results message */}
              {jobInstances?.content.length === 0 && (
                <tr>
                  <td colSpan={8} className="table-cell text-center py-8 text-gray-500 dark:text-gray-400">
                    No job instances found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {jobInstances && (
          <div className="mt-4">
            <Pagination 
              currentPage={jobInstances.page} 
              totalPages={jobInstances.totalPages} 
              onPageChange={handlePageChange} 
            />
          </div>
        )}
      </Card>
    </div>
  );
};

export default JobInstancesList;

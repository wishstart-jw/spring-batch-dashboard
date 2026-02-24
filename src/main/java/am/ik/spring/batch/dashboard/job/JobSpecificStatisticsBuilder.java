package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import java.util.Map;

public class JobSpecificStatisticsBuilder {

	private String jobName;

	private long totalExecutions;

	private Map<JobStatus, Long> executionsByStatus;

	private double averageDuration;

	private LocalDateTime lastExecutionTime;

	private double successRate;

	public static JobSpecificStatisticsBuilder jobSpecificStatistics() {
		return new JobSpecificStatisticsBuilder();
	}

	public JobSpecificStatisticsBuilder jobName(String jobName) {
		this.jobName = jobName;
		return this;
	}

	public JobSpecificStatisticsBuilder totalExecutions(long totalExecutions) {
		this.totalExecutions = totalExecutions;
		return this;
	}

	public JobSpecificStatisticsBuilder executionsByStatus(Map<JobStatus, Long> executionsByStatus) {
		this.executionsByStatus = executionsByStatus;
		return this;
	}

	public JobSpecificStatisticsBuilder averageDuration(double averageDuration) {
		this.averageDuration = averageDuration;
		return this;
	}

	public JobSpecificStatisticsBuilder lastExecutionTime(LocalDateTime lastExecutionTime) {
		this.lastExecutionTime = lastExecutionTime;
		return this;
	}

	public JobSpecificStatisticsBuilder successRate(double successRate) {
		this.successRate = successRate;
		return this;
	}

	public JobSpecificStatistics build() {
		return new JobSpecificStatistics(this.jobName, this.totalExecutions, this.executionsByStatus,
				this.averageDuration, this.lastExecutionTime, this.successRate);
	}

}

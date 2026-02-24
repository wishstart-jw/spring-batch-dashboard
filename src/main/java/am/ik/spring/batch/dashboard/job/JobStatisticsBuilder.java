package am.ik.spring.batch.dashboard.job;

import java.util.List;
import java.util.Map;

public class JobStatisticsBuilder {

	private long totalJobs;

	private Map<JobStatus, Long> jobsByStatus;

	private List<DailyJobStats> recentJobStatuses;

	public static JobStatisticsBuilder jobStatistics() {
		return new JobStatisticsBuilder();
	}

	public JobStatisticsBuilder totalJobs(long totalJobs) {
		this.totalJobs = totalJobs;
		return this;
	}

	public JobStatisticsBuilder jobsByStatus(Map<JobStatus, Long> jobsByStatus) {
		this.jobsByStatus = jobsByStatus;
		return this;
	}

	public JobStatisticsBuilder recentJobStatuses(List<DailyJobStats> recentJobStatuses) {
		this.recentJobStatuses = recentJobStatuses;
		return this;
	}

	public JobStatistics build() {
		return new JobStatistics(this.totalJobs, this.jobsByStatus, this.recentJobStatuses);
	}

}

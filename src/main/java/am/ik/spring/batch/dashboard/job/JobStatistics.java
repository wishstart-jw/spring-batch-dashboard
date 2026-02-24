package am.ik.spring.batch.dashboard.job;

import java.util.List;
import java.util.Map;

public record JobStatistics(long totalJobs, Map<JobStatus, Long> jobsByStatus, List<DailyJobStats> recentJobStatuses) {
}

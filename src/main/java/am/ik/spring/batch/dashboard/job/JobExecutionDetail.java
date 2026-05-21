package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.lang.Nullable;

public record JobExecutionDetail(long jobExecutionId, long jobInstanceId, String jobName, LocalDateTime createTime,
		LocalDateTime startTime, @Nullable LocalDateTime endTime, @Nullable Long durationSeconds, JobStatus status,
		String exitCode, @Nullable String exitMessage, LocalDateTime lastUpdated, List<JobParameter> parameters,
		List<StepExecutionSummary> steps) {
}

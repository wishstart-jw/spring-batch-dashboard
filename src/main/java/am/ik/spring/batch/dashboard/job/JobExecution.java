package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.lang.Nullable;

public record JobExecution(long jobExecutionId, long jobInstanceId, String jobName, LocalDateTime createTime,
		LocalDateTime startTime, @Nullable LocalDateTime endTime, JobStatus status, String exitCode,
		@Nullable String exitMessage, @Nullable List<JobParameter> parameters) {
}
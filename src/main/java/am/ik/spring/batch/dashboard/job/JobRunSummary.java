package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import org.springframework.lang.Nullable;

public record JobRunSummary(String jobName, long executions, Long lastExecutionId, JobStatus lastExecutionStatus,
		LocalDateTime lastStartTime, LocalDateTime lastEndTime, @Nullable Long lastDurationSeconds) {
}
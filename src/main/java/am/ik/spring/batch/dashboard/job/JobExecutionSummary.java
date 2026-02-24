package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import org.springframework.lang.Nullable;

public record JobExecutionSummary(long jobExecutionId, LocalDateTime startTime, @Nullable LocalDateTime endTime,
		JobStatus status) {
}

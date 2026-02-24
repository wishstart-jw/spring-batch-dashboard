package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import org.springframework.lang.Nullable;

public record StepExecutionSummary(long stepExecutionId, String stepName, StepStatus status, long readCount,
		long writeCount, long filterCount, LocalDateTime startTime, @Nullable LocalDateTime endTime) {
}
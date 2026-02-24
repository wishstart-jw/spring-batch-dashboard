package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import org.springframework.lang.Nullable;

public record JobExecutionsParams(@Nullable String jobName, @Nullable JobStatus status,
		@Nullable LocalDateTime startDateFrom, @Nullable LocalDateTime startDateTo, @Nullable Integer page,
		@Nullable Integer size, @Nullable String sort) {
}

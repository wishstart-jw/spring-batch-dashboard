package am.ik.spring.batch.dashboard.job;

import org.springframework.lang.Nullable;

public record JobRunSummaryParams(@Nullable Integer page, @Nullable Integer size, @Nullable String sortBy,
		@Nullable String sortOrder) {
}
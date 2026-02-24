package am.ik.spring.batch.dashboard.job;

import org.springframework.lang.Nullable;

public record JobInstancesParams(@Nullable String jobName, @Nullable Integer page, @Nullable Integer size,
		@Nullable String sort) {
}
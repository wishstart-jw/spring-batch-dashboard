package am.ik.spring.batch.dashboard.job;

import org.springframework.lang.Nullable;

public record JobInstance(long jobInstanceId, String jobName, String jobKey, int version,
		@Nullable JobExecutionSummary latestExecution) {
}

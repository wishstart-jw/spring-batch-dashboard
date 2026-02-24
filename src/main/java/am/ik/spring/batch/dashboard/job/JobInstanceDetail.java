package am.ik.spring.batch.dashboard.job;

import java.util.List;
import org.springframework.lang.Nullable;

public record JobInstanceDetail(long jobInstanceId, String jobName, String jobKey, int version,
		@Nullable JobExecutionSummary latestExecution, List<JobExecution> executions) {
}
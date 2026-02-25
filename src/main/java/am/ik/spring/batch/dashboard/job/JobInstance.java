package am.ik.spring.batch.dashboard.job;

import org.springframework.lang.Nullable;
import java.util.List;

public record JobInstance(long jobInstanceId, String jobName, String jobKey, int version,
		@Nullable JobExecutionSummary latestExecution, @Nullable List<JobParameter> parameters) {
}

package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import org.springframework.lang.Nullable;

public class JobExecutionSummaryBuilder {

	private long jobExecutionId;

	private LocalDateTime startTime;

	@Nullable
	private LocalDateTime endTime;

	private JobStatus status;

	public static JobExecutionSummaryBuilder jobExecutionSummary() {
		return new JobExecutionSummaryBuilder();
	}

	public JobExecutionSummaryBuilder jobExecutionId(long jobExecutionId) {
		this.jobExecutionId = jobExecutionId;
		return this;
	}

	public JobExecutionSummaryBuilder startTime(LocalDateTime startTime) {
		this.startTime = startTime;
		return this;
	}

	public JobExecutionSummaryBuilder endTime(@Nullable LocalDateTime endTime) {
		this.endTime = endTime;
		return this;
	}

	public JobExecutionSummaryBuilder status(JobStatus status) {
		this.status = status;
		return this;
	}

	public JobExecutionSummary build() {
		return new JobExecutionSummary(this.jobExecutionId, this.startTime, this.endTime, this.status);
	}

}

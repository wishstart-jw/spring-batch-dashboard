package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import org.springframework.lang.Nullable;

public class StepExecutionSummaryBuilder {

	private long stepExecutionId;

	private String stepName;

	private StepStatus status;

	private long readCount;

	private long writeCount;

	private long filterCount;

	private LocalDateTime startTime;

	@Nullable
	private LocalDateTime endTime;

	public static StepExecutionSummaryBuilder stepExecutionSummary() {
		return new StepExecutionSummaryBuilder();
	}

	public StepExecutionSummaryBuilder stepExecutionId(long stepExecutionId) {
		this.stepExecutionId = stepExecutionId;
		return this;
	}

	public StepExecutionSummaryBuilder stepName(String stepName) {
		this.stepName = stepName;
		return this;
	}

	public StepExecutionSummaryBuilder status(StepStatus status) {
		this.status = status;
		return this;
	}

	public StepExecutionSummaryBuilder readCount(long readCount) {
		this.readCount = readCount;
		return this;
	}

	public StepExecutionSummaryBuilder writeCount(long writeCount) {
		this.writeCount = writeCount;
		return this;
	}

	public StepExecutionSummaryBuilder filterCount(long filterCount) {
		this.filterCount = filterCount;
		return this;
	}

	public StepExecutionSummaryBuilder startTime(LocalDateTime startTime) {
		this.startTime = startTime;
		return this;
	}

	public StepExecutionSummaryBuilder endTime(@Nullable LocalDateTime endTime) {
		this.endTime = endTime;
		return this;
	}

	public StepExecutionSummary build() {
		return new StepExecutionSummary(this.stepExecutionId, this.stepName, this.status, this.readCount,
				this.writeCount, this.filterCount, this.startTime, this.endTime);
	}

}

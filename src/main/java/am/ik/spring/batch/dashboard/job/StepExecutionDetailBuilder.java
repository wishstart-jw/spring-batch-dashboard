package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import org.springframework.lang.Nullable;

public class StepExecutionDetailBuilder {

	private long stepExecutionId;

	private String stepName;

	private StepStatus status;

	private long readCount;

	private long writeCount;

	private long filterCount;

	private LocalDateTime startTime;

	@Nullable
	private LocalDateTime endTime;

	private long jobExecutionId;

	private int version;

	private LocalDateTime createTime;

	private long commitCount;

	private long readSkipCount;

	private long writeSkipCount;

	private long processSkipCount;

	private long rollbackCount;

	private String exitCode;

	@Nullable
	private String exitMessage;

	private LocalDateTime lastUpdated;

	public static StepExecutionDetailBuilder stepExecutionDetail() {
		return new StepExecutionDetailBuilder();
	}

	public StepExecutionDetailBuilder stepExecutionId(long stepExecutionId) {
		this.stepExecutionId = stepExecutionId;
		return this;
	}

	public StepExecutionDetailBuilder stepName(String stepName) {
		this.stepName = stepName;
		return this;
	}

	public StepExecutionDetailBuilder status(StepStatus status) {
		this.status = status;
		return this;
	}

	public StepExecutionDetailBuilder readCount(long readCount) {
		this.readCount = readCount;
		return this;
	}

	public StepExecutionDetailBuilder writeCount(long writeCount) {
		this.writeCount = writeCount;
		return this;
	}

	public StepExecutionDetailBuilder filterCount(long filterCount) {
		this.filterCount = filterCount;
		return this;
	}

	public StepExecutionDetailBuilder startTime(LocalDateTime startTime) {
		this.startTime = startTime;
		return this;
	}

	public StepExecutionDetailBuilder endTime(@Nullable LocalDateTime endTime) {
		this.endTime = endTime;
		return this;
	}

	public StepExecutionDetailBuilder jobExecutionId(long jobExecutionId) {
		this.jobExecutionId = jobExecutionId;
		return this;
	}

	public StepExecutionDetailBuilder version(int version) {
		this.version = version;
		return this;
	}

	public StepExecutionDetailBuilder createTime(LocalDateTime createTime) {
		this.createTime = createTime;
		return this;
	}

	public StepExecutionDetailBuilder commitCount(long commitCount) {
		this.commitCount = commitCount;
		return this;
	}

	public StepExecutionDetailBuilder readSkipCount(long readSkipCount) {
		this.readSkipCount = readSkipCount;
		return this;
	}

	public StepExecutionDetailBuilder writeSkipCount(long writeSkipCount) {
		this.writeSkipCount = writeSkipCount;
		return this;
	}

	public StepExecutionDetailBuilder processSkipCount(long processSkipCount) {
		this.processSkipCount = processSkipCount;
		return this;
	}

	public StepExecutionDetailBuilder rollbackCount(long rollbackCount) {
		this.rollbackCount = rollbackCount;
		return this;
	}

	public StepExecutionDetailBuilder exitCode(String exitCode) {
		this.exitCode = exitCode;
		return this;
	}

	public StepExecutionDetailBuilder exitMessage(@Nullable String exitMessage) {
		this.exitMessage = exitMessage;
		return this;
	}

	public StepExecutionDetailBuilder lastUpdated(LocalDateTime lastUpdated) {
		this.lastUpdated = lastUpdated;
		return this;
	}

	public StepExecutionDetail build() {
		return new StepExecutionDetail(this.stepExecutionId, this.stepName, this.status, this.readCount,
				this.writeCount, this.filterCount, this.startTime, this.endTime, this.jobExecutionId, this.version,
				this.createTime, this.commitCount, this.readSkipCount, this.writeSkipCount, this.processSkipCount,
				this.rollbackCount, this.exitCode, this.exitMessage, this.lastUpdated);
	}

}

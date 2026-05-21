package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import org.springframework.lang.Nullable;

public class JobExecutionBuilder {

	private long jobExecutionId;

	private long jobInstanceId;

	private String jobName;

	private LocalDateTime createTime;

	private LocalDateTime startTime;

	@Nullable
	private LocalDateTime endTime;

	@Nullable
	private Long durationSeconds;

	private JobStatus status;

	private String exitCode;

	@Nullable
	private String exitMessage;

	@Nullable
	private java.util.List<JobParameter> parameters;

	public static JobExecutionBuilder jobExecution() {
		return new JobExecutionBuilder();
	}

	public static JobExecutionBuilder from(JobExecution src) {
		JobExecutionBuilder b = new JobExecutionBuilder();
		b.jobExecutionId = src.jobExecutionId();
		b.jobInstanceId = src.jobInstanceId();
		b.jobName = src.jobName();
		b.createTime = src.createTime();
		b.startTime = src.startTime();
		b.endTime = src.endTime();
		b.durationSeconds = src.durationSeconds();
		b.status = src.status();
		b.exitCode = src.exitCode();
		b.exitMessage = src.exitMessage();
		b.parameters = src.parameters();
		return b;
	}

	public JobExecutionBuilder jobExecutionId(long jobExecutionId) {
		this.jobExecutionId = jobExecutionId;
		return this;
	}

	public JobExecutionBuilder jobInstanceId(long jobInstanceId) {
		this.jobInstanceId = jobInstanceId;
		return this;
	}

	public JobExecutionBuilder jobName(String jobName) {
		this.jobName = jobName;
		return this;
	}

	public JobExecutionBuilder createTime(LocalDateTime createTime) {
		this.createTime = createTime;
		return this;
	}

	public JobExecutionBuilder startTime(LocalDateTime startTime) {
		this.startTime = startTime;
		return this;
	}

	public JobExecutionBuilder endTime(@Nullable LocalDateTime endTime) {
		this.endTime = endTime;
		return this;
	}

	public JobExecutionBuilder durationSeconds(@Nullable Long durationSeconds) {
		this.durationSeconds = durationSeconds;
		return this;
	}

	public JobExecutionBuilder status(JobStatus status) {
		this.status = status;
		return this;
	}

	public JobExecutionBuilder exitCode(String exitCode) {
		this.exitCode = exitCode;
		return this;
	}

	public JobExecutionBuilder exitMessage(@Nullable String exitMessage) {
		this.exitMessage = exitMessage;
		return this;
	}

	public JobExecutionBuilder parameters(@Nullable java.util.List<JobParameter> parameters) {
		this.parameters = parameters;
		return this;
	}

	public JobExecution build() {
		return new JobExecution(this.jobExecutionId, this.jobInstanceId, this.jobName, this.createTime, this.startTime,
				this.endTime, this.durationSeconds, this.status, this.exitCode, this.exitMessage, this.parameters);
	}

}

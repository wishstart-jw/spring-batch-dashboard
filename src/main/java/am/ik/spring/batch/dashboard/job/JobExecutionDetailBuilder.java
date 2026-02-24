package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import java.util.List;
import org.springframework.lang.Nullable;

public class JobExecutionDetailBuilder {

	private long jobExecutionId;

	private long jobInstanceId;

	private String jobName;

	private LocalDateTime createTime;

	private LocalDateTime startTime;

	@Nullable
	private LocalDateTime endTime;

	private JobStatus status;

	private String exitCode;

	@Nullable
	private String exitMessage;

	private LocalDateTime lastUpdated;

	private List<JobParameter> parameters;

	private List<StepExecutionSummary> steps;

	public static JobExecutionDetailBuilder jobExecutionDetail() {
		return new JobExecutionDetailBuilder();
	}

	public static JobExecutionDetailBuilder from(JobExecutionDetail src) {
		JobExecutionDetailBuilder b = new JobExecutionDetailBuilder();
		b.jobExecutionId = src.jobExecutionId();
		b.jobInstanceId = src.jobInstanceId();
		b.jobName = src.jobName();
		b.createTime = src.createTime();
		b.startTime = src.startTime();
		b.endTime = src.endTime();
		b.status = src.status();
		b.exitCode = src.exitCode();
		b.exitMessage = src.exitMessage();
		b.lastUpdated = src.lastUpdated();
		b.parameters = src.parameters();
		b.steps = src.steps();
		return b;
	}

	public JobExecutionDetailBuilder jobExecutionId(long jobExecutionId) {
		this.jobExecutionId = jobExecutionId;
		return this;
	}

	public JobExecutionDetailBuilder jobInstanceId(long jobInstanceId) {
		this.jobInstanceId = jobInstanceId;
		return this;
	}

	public JobExecutionDetailBuilder jobName(String jobName) {
		this.jobName = jobName;
		return this;
	}

	public JobExecutionDetailBuilder createTime(LocalDateTime createTime) {
		this.createTime = createTime;
		return this;
	}

	public JobExecutionDetailBuilder startTime(LocalDateTime startTime) {
		this.startTime = startTime;
		return this;
	}

	public JobExecutionDetailBuilder endTime(@Nullable LocalDateTime endTime) {
		this.endTime = endTime;
		return this;
	}

	public JobExecutionDetailBuilder status(JobStatus status) {
		this.status = status;
		return this;
	}

	public JobExecutionDetailBuilder exitCode(String exitCode) {
		this.exitCode = exitCode;
		return this;
	}

	public JobExecutionDetailBuilder exitMessage(@Nullable String exitMessage) {
		this.exitMessage = exitMessage;
		return this;
	}

	public JobExecutionDetailBuilder lastUpdated(LocalDateTime lastUpdated) {
		this.lastUpdated = lastUpdated;
		return this;
	}

	public JobExecutionDetailBuilder parameters(List<JobParameter> parameters) {
		this.parameters = parameters;
		return this;
	}

	public JobExecutionDetailBuilder steps(List<StepExecutionSummary> steps) {
		this.steps = steps;
		return this;
	}

	public JobExecutionDetail build() {
		return new JobExecutionDetail(this.jobExecutionId, this.jobInstanceId, this.jobName, this.createTime,
				this.startTime, this.endTime, this.status, this.exitCode, this.exitMessage, this.lastUpdated,
				this.parameters, this.steps);
	}

}

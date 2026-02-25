package am.ik.spring.batch.dashboard.job;

import java.util.List;
import org.springframework.lang.Nullable;

public class JobInstanceDetailBuilder {

	private long jobInstanceId;

	private String jobName;

	private String jobKey;

	private int version;

	@Nullable
	private JobExecutionSummary latestExecution;

	private List<JobExecution> executions;

	@Nullable
	private List<JobParameter> parameters;

	public static JobInstanceDetailBuilder jobInstanceDetail() {
		return new JobInstanceDetailBuilder();
	}

	public static JobInstanceDetailBuilder from(JobInstanceDetail src) {
		JobInstanceDetailBuilder b = new JobInstanceDetailBuilder();
		b.jobInstanceId = src.jobInstanceId();
		b.jobName = src.jobName();
		b.jobKey = src.jobKey();
		b.version = src.version();
		b.latestExecution = src.latestExecution();
		b.executions = src.executions();
		b.parameters = src.parameters();
		return b;
	}

	public JobInstanceDetailBuilder jobInstanceId(long jobInstanceId) {
		this.jobInstanceId = jobInstanceId;
		return this;
	}

	public JobInstanceDetailBuilder jobName(String jobName) {
		this.jobName = jobName;
		return this;
	}

	public JobInstanceDetailBuilder jobKey(String jobKey) {
		this.jobKey = jobKey;
		return this;
	}

	public JobInstanceDetailBuilder version(int version) {
		this.version = version;
		return this;
	}

	public JobInstanceDetailBuilder latestExecution(@Nullable JobExecutionSummary latestExecution) {
		this.latestExecution = latestExecution;
		return this;
	}

	public JobInstanceDetailBuilder executions(List<JobExecution> executions) {
		this.executions = executions;
		return this;
	}

	public JobInstanceDetailBuilder parameters(@Nullable List<JobParameter> parameters) {
		this.parameters = parameters;
		return this;
	}

	public JobInstanceDetail build() {
		return new JobInstanceDetail(this.jobInstanceId, this.jobName, this.jobKey, this.version, this.latestExecution,
				this.executions, this.parameters);
	}

}

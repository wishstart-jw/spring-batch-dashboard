package am.ik.spring.batch.dashboard.job;

import org.springframework.lang.Nullable;

public class JobInstanceBuilder {

	private long jobInstanceId;

	private String jobName;

	private String jobKey;

	private int version;

	@Nullable
	private JobExecutionSummary latestExecution;

	public static JobInstanceBuilder jobInstance() {
		return new JobInstanceBuilder();
	}

	public JobInstanceBuilder jobInstanceId(long jobInstanceId) {
		this.jobInstanceId = jobInstanceId;
		return this;
	}

	public JobInstanceBuilder jobName(String jobName) {
		this.jobName = jobName;
		return this;
	}

	public JobInstanceBuilder jobKey(String jobKey) {
		this.jobKey = jobKey;
		return this;
	}

	public JobInstanceBuilder version(int version) {
		this.version = version;
		return this;
	}

	public JobInstanceBuilder latestExecution(@Nullable JobExecutionSummary latestExecution) {
		this.latestExecution = latestExecution;
		return this;
	}

	public JobInstance build() {
		return new JobInstance(this.jobInstanceId, this.jobName, this.jobKey, this.version, this.latestExecution);
	}

}

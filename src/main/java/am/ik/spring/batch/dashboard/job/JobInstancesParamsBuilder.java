package am.ik.spring.batch.dashboard.job;

import org.springframework.lang.Nullable;

public class JobInstancesParamsBuilder {

	@Nullable
	private String jobName;

	@Nullable
	private Integer page;

	@Nullable
	private Integer size;

	@Nullable
	private String sort;

	public static JobInstancesParamsBuilder jobInstancesParams() {
		return new JobInstancesParamsBuilder();
	}

	public JobInstancesParamsBuilder jobName(@Nullable String jobName) {
		this.jobName = jobName;
		return this;
	}

	public JobInstancesParamsBuilder page(@Nullable Integer page) {
		this.page = page;
		return this;
	}

	public JobInstancesParamsBuilder size(@Nullable Integer size) {
		this.size = size;
		return this;
	}

	public JobInstancesParamsBuilder sort(@Nullable String sort) {
		this.sort = sort;
		return this;
	}

	public JobInstancesParams build() {
		return new JobInstancesParams(this.jobName, this.page, this.size, this.sort);
	}

}

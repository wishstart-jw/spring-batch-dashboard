package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import org.springframework.lang.Nullable;

public class JobExecutionsParamsBuilder {

	@Nullable
	private String jobName;

	@Nullable
	private JobStatus status;

	@Nullable
	private LocalDateTime startDateFrom;

	@Nullable
	private LocalDateTime startDateTo;

	@Nullable
	private Integer page;

	@Nullable
	private Integer size;

	@Nullable
	private String sort;

	@Nullable
	private String parameterName;

	@Nullable
	private String parameterValue;

	public static JobExecutionsParamsBuilder jobExecutionsParams() {
		return new JobExecutionsParamsBuilder();
	}

	public JobExecutionsParamsBuilder jobName(@Nullable String jobName) {
		this.jobName = jobName;
		return this;
	}

	public JobExecutionsParamsBuilder status(@Nullable JobStatus status) {
		this.status = status;
		return this;
	}

	public JobExecutionsParamsBuilder startDateFrom(@Nullable LocalDateTime startDateFrom) {
		this.startDateFrom = startDateFrom;
		return this;
	}

	public JobExecutionsParamsBuilder startDateTo(@Nullable LocalDateTime startDateTo) {
		this.startDateTo = startDateTo;
		return this;
	}

	public JobExecutionsParamsBuilder page(@Nullable Integer page) {
		this.page = page;
		return this;
	}

	public JobExecutionsParamsBuilder size(@Nullable Integer size) {
		this.size = size;
		return this;
	}

	public JobExecutionsParamsBuilder sort(@Nullable String sort) {
		this.sort = sort;
		return this;
	}

	public JobExecutionsParamsBuilder parameterName(@Nullable String parameterName) {
		this.parameterName = parameterName;
		return this;
	}

	public JobExecutionsParamsBuilder parameterValue(@Nullable String parameterValue) {
		this.parameterValue = parameterValue;
		return this;
	}

	public JobExecutionsParams build() {
		return new JobExecutionsParams(this.jobName, this.status, this.startDateFrom, this.startDateTo, this.page,
				this.size, this.sort, this.parameterName, this.parameterValue);
	}

}

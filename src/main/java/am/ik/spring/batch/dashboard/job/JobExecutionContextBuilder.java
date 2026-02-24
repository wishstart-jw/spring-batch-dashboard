package am.ik.spring.batch.dashboard.job;

public class JobExecutionContextBuilder {

	private String shortContext;

	private String serializedContext;

	public static JobExecutionContextBuilder jobExecutionContext() {
		return new JobExecutionContextBuilder();
	}

	public JobExecutionContextBuilder shortContext(String shortContext) {
		this.shortContext = shortContext;
		return this;
	}

	public JobExecutionContextBuilder serializedContext(String serializedContext) {
		this.serializedContext = serializedContext;
		return this;
	}

	public JobExecutionContext build() {
		return new JobExecutionContext(this.shortContext, this.serializedContext);
	}

}

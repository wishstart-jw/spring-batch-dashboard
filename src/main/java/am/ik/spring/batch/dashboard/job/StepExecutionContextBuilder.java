package am.ik.spring.batch.dashboard.job;

public class StepExecutionContextBuilder {

	private String shortContext;

	private String serializedContext;

	public static StepExecutionContextBuilder stepExecutionContext() {
		return new StepExecutionContextBuilder();
	}

	public StepExecutionContextBuilder shortContext(String shortContext) {
		this.shortContext = shortContext;
		return this;
	}

	public StepExecutionContextBuilder serializedContext(String serializedContext) {
		this.serializedContext = serializedContext;
		return this;
	}

	public StepExecutionContext build() {
		return new StepExecutionContext(this.shortContext, this.serializedContext);
	}

}

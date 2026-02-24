package am.ik.spring.batch.dashboard.job;

public class JobParameterBuilder {

	private String name;

	private String type;

	private String value;

	private boolean identifying;

	public static JobParameterBuilder jobParameter() {
		return new JobParameterBuilder();
	}

	public JobParameterBuilder name(String name) {
		this.name = name;
		return this;
	}

	public JobParameterBuilder type(String type) {
		this.type = type;
		return this;
	}

	public JobParameterBuilder value(String value) {
		this.value = value;
		return this;
	}

	public JobParameterBuilder identifying(boolean identifying) {
		this.identifying = identifying;
		return this;
	}

	public JobParameter build() {
		return new JobParameter(this.name, this.type, this.value, this.identifying);
	}

}

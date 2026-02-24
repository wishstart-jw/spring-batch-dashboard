package am.ik.spring.batch.dashboard.job;

public record JobParameter(String name, String type, String value, boolean identifying) {
}
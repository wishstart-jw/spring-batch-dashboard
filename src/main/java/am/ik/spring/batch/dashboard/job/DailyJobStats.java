package am.ik.spring.batch.dashboard.job;

public record DailyJobStats(String date, long completed, long failed, long abandoned) {
}

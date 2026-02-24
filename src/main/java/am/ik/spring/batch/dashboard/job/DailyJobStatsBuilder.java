package am.ik.spring.batch.dashboard.job;

public class DailyJobStatsBuilder {

	private String date;

	private long completed;

	private long failed;

	private long abandoned;

	public static DailyJobStatsBuilder dailyJobStats() {
		return new DailyJobStatsBuilder();
	}

	public DailyJobStatsBuilder date(String date) {
		this.date = date;
		return this;
	}

	public DailyJobStatsBuilder completed(long completed) {
		this.completed = completed;
		return this;
	}

	public DailyJobStatsBuilder failed(long failed) {
		this.failed = failed;
		return this;
	}

	public DailyJobStatsBuilder abandoned(long abandoned) {
		this.abandoned = abandoned;
		return this;
	}

	public DailyJobStats build() {
		return new DailyJobStats(this.date, this.completed, this.failed, this.abandoned);
	}

}

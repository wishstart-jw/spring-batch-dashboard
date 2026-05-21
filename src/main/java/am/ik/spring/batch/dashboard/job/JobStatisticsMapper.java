package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;
import java.util.EnumMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JobStatisticsMapper {

	private static final Set<String> ALLOWED_SORT_COLUMNS = Set.of("jobName", "executions", "lastExecutionId",
			"lastExecutionStatus", "lastStartTime", "lastEndTime", "lastDurationSeconds");

	private final JdbcClient jdbcClient;

	public JobStatisticsMapper(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public JobStatistics getJobStatistics(int days) {
		long totalJobs = this.jdbcClient
			.sql("SELECT COUNT(DISTINCT ji.JOB_NAME) AS totalJobs FROM BATCH_JOB_INSTANCE ji")
			.query((rs, rowNum) -> rs.getLong("totalJobs"))
			.single();

		Map<JobStatus, Long> jobsByStatus = new EnumMap<>(JobStatus.class);
		this.jdbcClient.sql("""
				SELECT je.STATUS, COUNT(*) AS cnt
				FROM BATCH_JOB_EXECUTION je
				GROUP BY je.STATUS
				""").query((rs, rowNum) -> {
			try {
				JobStatus status = JobStatus.valueOf(rs.getString("STATUS"));
				jobsByStatus.put(status, rs.getLong("cnt"));
			}
			catch (IllegalArgumentException ignored) {
			}
			return null;
		}).list();

		List<DailyJobStats> recentJobStatuses = this.jdbcClient.sql("""
				SELECT *
				FROM (
				    SELECT
				        TO_CHAR(TRUNC(je.START_TIME), 'YYYY-MM-DD') AS date_str,
				        SUM(CASE WHEN je.STATUS = 'COMPLETED' THEN 1 ELSE 0 END) AS completed,
				        SUM(CASE WHEN je.STATUS = 'FAILED' THEN 1 ELSE 0 END) AS failed,
				        SUM(CASE WHEN je.STATUS = 'ABANDONED' THEN 1 ELSE 0 END) AS abandoned
				    FROM BATCH_JOB_EXECUTION je
				    WHERE je.START_TIME IS NOT NULL
				      AND je.START_TIME >= TRUNC(SYSDATE) - :days
				    GROUP BY TRUNC(je.START_TIME)
				    ORDER BY TRUNC(je.START_TIME) DESC
				)
				WHERE ROWNUM <= :days
				""")
			.param("days", days)
			.query((rs, rowNum) -> DailyJobStatsBuilder.dailyJobStats()
				.date(rs.getString("date_str"))
				.completed(rs.getLong("completed"))
				.failed(rs.getLong("failed"))
				.abandoned(rs.getLong("abandoned"))
				.build())
			.list();

		return JobStatisticsBuilder.jobStatistics()
			.totalJobs(totalJobs)
			.jobsByStatus(jobsByStatus)
			.recentJobStatuses(recentJobStatuses)
			.build();
	}

	public Optional<JobSpecificStatistics> getJobStatisticsByJobName(String jobName) {
		record TotalStats(long totalExecutions, LocalDateTime lastExecutionTime, double averageDuration,
				double successRate) {
		}

		Optional<TotalStats> totalStatsOpt = this.jdbcClient.sql("""
				SELECT
				    COUNT(*) AS totalExecutions,
				    MAX(je.START_TIME) AS lastExecutionTime,
				    AVG((CAST(je.END_TIME AS DATE) - CAST(je.START_TIME AS DATE)) * 86400) AS averageDuration,
				    SUM(CASE WHEN je.STATUS = 'COMPLETED' THEN 1 ELSE 0 END) * 100.0
				        / NULLIF(COUNT(*), 0) AS successRate
				FROM BATCH_JOB_EXECUTION je
				JOIN BATCH_JOB_INSTANCE ji ON je.JOB_INSTANCE_ID = ji.JOB_INSTANCE_ID
				WHERE ji.JOB_NAME = :jobName
				""")
			.param("jobName", jobName)
			.query((rs, rowNum) -> new TotalStats(rs.getLong("totalExecutions"),
					rs.getObject("lastExecutionTime", LocalDateTime.class), rs.getDouble("averageDuration"),
					rs.getDouble("successRate")))
			.optional();

		if (totalStatsOpt.isEmpty() || totalStatsOpt.get().totalExecutions() == 0) {
			return Optional.empty();
		}

		TotalStats ts = totalStatsOpt.get();

		Map<JobStatus, Long> executionsByStatus = new EnumMap<>(JobStatus.class);
		this.jdbcClient.sql("""
				SELECT je.STATUS, COUNT(*) AS cnt
				FROM BATCH_JOB_EXECUTION je
				JOIN BATCH_JOB_INSTANCE ji ON je.JOB_INSTANCE_ID = ji.JOB_INSTANCE_ID
				WHERE ji.JOB_NAME = :jobName
				GROUP BY je.STATUS
				""").param("jobName", jobName).query((rs, rowNum) -> {
			try {
				JobStatus status = JobStatus.valueOf(rs.getString("STATUS"));
				executionsByStatus.put(status, rs.getLong("cnt"));
			}
			catch (IllegalArgumentException ignored) {
			}
			return null;
		}).list();

		return Optional.of(JobSpecificStatisticsBuilder.jobSpecificStatistics()
			.jobName(jobName)
			.totalExecutions(ts.totalExecutions())
			.executionsByStatus(executionsByStatus)
			.averageDuration(ts.averageDuration())
			.lastExecutionTime(ts.lastExecutionTime())
			.successRate(ts.successRate())
			.build());
	}

	public List<JobExecutionStats> getJobExecutionStats(int days) {
		return this.jdbcClient.sql("""
				SELECT
				    ji.JOB_NAME AS jobName,
				    COUNT(je.JOB_EXECUTION_ID) AS executions
				FROM BATCH_JOB_INSTANCE ji
				JOIN BATCH_JOB_EXECUTION je ON ji.JOB_INSTANCE_ID = je.JOB_INSTANCE_ID
				WHERE je.START_TIME >= TRUNC(SYSDATE) - :days
				GROUP BY ji.JOB_NAME
				ORDER BY executions DESC, jobName
				""").param("days", days).query(JobExecutionStats.class).list();
	}

	public PageResponse<JobRunSummary> findJobRunSummaries(int days, JobRunSummaryParams params) {
		Integer page = params.page() != null && params.page() >= 0 ? params.page() : 0;
		Integer size = params.size() != null && params.size() > 0 ? params.size() : 20;
		int offset = page * size;

		String sortBy = ALLOWED_SORT_COLUMNS.contains(params.sortBy()) ? params.sortBy() : "lastStartTime";
		String sortOrder = "asc".equalsIgnoreCase(params.sortOrder()) ? "ASC" : "DESC";
		String orderBy = buildOrderBy(sortBy, sortOrder);

		String query = """
				SELECT
				    jobName,
				    executions,
				    lastExecutionId,
				    lastExecutionStatus,
				    lastStartTime,
				    lastEndTime,
				    lastDurationSeconds
				FROM (
				    SELECT
				        s.jobName,
				        s.executions,
				        s.lastExecutionId,
				        s.lastExecutionStatus,
				        s.lastStartTime,
				        s.lastEndTime,
				        s.lastDurationSeconds,
				        ROW_NUMBER() OVER (ORDER BY %s) AS rn
				    FROM (
				        SELECT
				            je_agg.JOB_NAME AS jobName,
				            je_agg.executions AS executions,
				            je_agg.lastExecutionId AS lastExecutionId,
				            je_agg.lastExecutionStatus AS lastExecutionStatus,
				            je_agg.lastStartTime AS lastStartTime,
				            je_agg.lastEndTime AS lastEndTime,
				            je_agg.lastDurationSeconds AS lastDurationSeconds
				        FROM (
				            SELECT
				                ji.JOB_NAME,
				                COUNT(*) AS executions,
				                MAX(je.JOB_EXECUTION_ID) KEEP (DENSE_RANK LAST ORDER BY je.START_TIME, je.JOB_EXECUTION_ID) AS lastExecutionId,
				                MAX(je.STATUS) KEEP (DENSE_RANK LAST ORDER BY je.START_TIME, je.JOB_EXECUTION_ID) AS lastExecutionStatus,
				                MAX(je.START_TIME) AS lastStartTime,
				                MAX(je.END_TIME) KEEP (DENSE_RANK LAST ORDER BY je.START_TIME, je.JOB_EXECUTION_ID) AS lastEndTime,
				                MAX(CASE
				                    WHEN je.START_TIME IS NOT NULL AND je.END_TIME IS NOT NULL
				                        THEN ROUND((CAST(je.END_TIME AS DATE) - CAST(je.START_TIME AS DATE)) * 86400)
				                END) KEEP (DENSE_RANK LAST ORDER BY je.START_TIME, je.JOB_EXECUTION_ID) AS lastDurationSeconds
				            FROM BATCH_JOB_INSTANCE ji
				            JOIN BATCH_JOB_EXECUTION je ON ji.JOB_INSTANCE_ID = je.JOB_INSTANCE_ID
				            WHERE je.START_TIME >= TRUNC(SYSDATE) - :days
				            GROUP BY ji.JOB_NAME
				        ) je_agg
				    ) s
				) numbered
				WHERE rn > %d AND rn <= %d
				"""
			.formatted(orderBy, offset, offset + size);

		List<JobRunSummary> content = this.jdbcClient.sql(query).param("days", days).query((rs, rowNum) -> {
			String status = rs.getString("lastExecutionStatus");
			JobStatus lastExecutionStatus = status != null ? JobStatus.valueOf(status) : null;
			return new JobRunSummary(rs.getString("jobName"), rs.getLong("executions"),
					rs.getObject("lastExecutionId", Long.class), lastExecutionStatus,
					rs.getObject("lastStartTime", LocalDateTime.class),
					rs.getObject("lastEndTime", LocalDateTime.class), rs.getObject("lastDurationSeconds", Long.class));
		}).list();

		long count = this.jdbcClient.sql("""
				SELECT COUNT(*)
				FROM (
				    SELECT ji.JOB_NAME
				    FROM BATCH_JOB_INSTANCE ji
				    JOIN BATCH_JOB_EXECUTION je ON ji.JOB_INSTANCE_ID = je.JOB_INSTANCE_ID
				    WHERE je.START_TIME >= TRUNC(SYSDATE) - :days
				    GROUP BY ji.JOB_NAME
				)
				""").param("days", days).query(Long.class).single();

		return PageResponseBuilder.<JobRunSummary>pageResponse()
			.content(content)
			.page(page)
			.size(size)
			.totalElements(count)
			.totalPages((int) (count / size) + 1)
			.build();
	}

	private String buildOrderBy(String sortBy, String sortOrder) {
		return switch (sortBy) {
			case "jobName" -> "s.jobName " + sortOrder + ", s.lastStartTime DESC, s.jobName ASC";
			case "executions" -> "s.executions " + sortOrder + ", s.lastStartTime DESC, s.jobName ASC";
			case "lastExecutionId" ->
				"s.lastExecutionId " + sortOrder + " NULLS LAST, s.lastStartTime DESC NULLS LAST, s.jobName ASC";
			case "lastExecutionStatus" ->
				"s.lastExecutionStatus " + sortOrder + " NULLS LAST, s.lastStartTime DESC NULLS LAST, s.jobName ASC";
			case "lastEndTime" -> "s.lastEndTime " + sortOrder + " NULLS LAST, s.lastStartTime DESC, s.jobName ASC";
			case "lastDurationSeconds" ->
				"s.lastDurationSeconds " + sortOrder + " NULLS LAST, s.lastStartTime DESC, s.jobName ASC";
			default -> "s.lastStartTime " + sortOrder + " NULLS LAST, s.jobName ASC";
		};
	}

}

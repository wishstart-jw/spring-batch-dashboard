package am.ik.spring.batch.dashboard.job;

import java.sql.Types;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JobInstanceMapper {

	private final JdbcClient jdbcClient;

	public JobInstanceMapper(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public PageResponse<JobInstance> findJobInstances(JobInstancesParams params) {
		Integer page = Objects.requireNonNullElse(params.page(), 0);
		Integer size = Objects.requireNonNullElse(params.size(), 20);
		int offset = page * size;

		// Build base SQL query
		String baseQuery = """
				SELECT *
				FROM (
				    SELECT
				        ji.JOB_INSTANCE_ID,
				        ji.JOB_NAME,
				        ji.JOB_KEY,
				        ji.VERSION,
				        je.JOB_EXECUTION_ID,
				        je.START_TIME,
				        je.END_TIME,
				        je.STATUS,
				        ROW_NUMBER() OVER (ORDER BY ji.JOB_INSTANCE_ID DESC) as rn
				    FROM
				        BATCH_JOB_INSTANCE ji
				        LEFT JOIN
				            (
				                SELECT
				                    je1.*
				                FROM
				                    BATCH_JOB_EXECUTION je1
				                    JOIN
				                        (
				                            SELECT
				                                JOB_INSTANCE_ID,
				                                MAX(JOB_EXECUTION_ID) as MAX_EXECUTION_ID
				                            FROM
				                                BATCH_JOB_EXECUTION
				                            GROUP BY
				                                JOB_INSTANCE_ID
				                        ) je2
				                    ON  je1.JOB_EXECUTION_ID = je2.MAX_EXECUTION_ID
				            ) je
				        ON  ji.JOB_INSTANCE_ID = je.JOB_INSTANCE_ID
				    WHERE
				        (
				            :jobName IS NULL
				        OR  ji.JOB_NAME = :jobName
				        )
				) sub
				WHERE rn > %d AND rn <= %d
				""".formatted(offset, offset + size);

		List<JobInstance> content = this.jdbcClient.sql(baseQuery)
			.param("jobName", params.jobName(), Types.VARCHAR)
			.<JobInstance>query((rs, rowNum) -> {
				String statusStr = rs.getString("STATUS");
				JobExecutionSummary latestExecution = statusStr == null ? null
						: JobExecutionSummaryBuilder.jobExecutionSummary()
							.jobExecutionId(rs.getLong("JOB_EXECUTION_ID"))
							.startTime(rs.getObject("START_TIME", LocalDateTime.class))
							.endTime(rs.getObject("END_TIME", LocalDateTime.class))
							.status(JobStatus.valueOf(statusStr))
							.build();

				long jobExecutionId = rs.getLong("JOB_EXECUTION_ID");
				List<JobParameter> parameters = jobExecutionId > 0 ? fetchJobParameters(jobExecutionId) : List.of();

				return JobInstanceBuilder.jobInstance()
					.jobInstanceId(rs.getLong("JOB_INSTANCE_ID"))
					.jobName(rs.getString("JOB_NAME"))
					.jobKey(rs.getString("JOB_KEY"))
					.version(rs.getInt("VERSION"))
					.latestExecution(latestExecution)
					.parameters(parameters.isEmpty() ? null : parameters)
					.build();
			})
			.list();

		long count = this.jdbcClient.sql("""
				SELECT COUNT(*)
				FROM BATCH_JOB_INSTANCE ji
				WHERE (:jobName IS NULL OR ji.JOB_NAME = :jobName)
				""").param("jobName", params.jobName(), Types.VARCHAR).query(Long.class).single();

		return PageResponseBuilder.<JobInstance>pageResponse()
			.content(content)
			.page(page)
			.size(size)
			.totalElements(count)
			.totalPages((int) (count / size) + 1)
			.build();
	}

	private List<JobParameter> fetchJobParameters(long jobExecutionId) {
		return this.jdbcClient.sql("""
				SELECT
				    PARAMETER_NAME,
				    PARAMETER_TYPE,
				    PARAMETER_VALUE,
				    IDENTIFYING
				FROM
				    BATCH_JOB_EXECUTION_PARAMS
				WHERE
				    JOB_EXECUTION_ID = :jobExecutionId
				ORDER BY
				    PARAMETER_NAME
				""")
			.param("jobExecutionId", jobExecutionId)
			.<JobParameter>query((rs, rowNum) -> JobParameterBuilder.jobParameter()
				.name(rs.getString("PARAMETER_NAME"))
				.type(rs.getString("PARAMETER_TYPE"))
				.value(rs.getString("PARAMETER_VALUE"))
				.identifying(rs.getBoolean("IDENTIFYING"))
				.build())
			.list();
	}

	public Optional<JobInstanceDetail> getJobInstanceDetail(long jobInstanceId) {
		return this.jdbcClient.sql("""
				SELECT
				    ji.JOB_INSTANCE_ID,
				    ji.JOB_NAME,
				    ji.JOB_KEY,
				    ji.VERSION,
				    je.JOB_EXECUTION_ID,
				    je.CREATE_TIME,
				    je.START_TIME,
				    je.END_TIME,
				    je.STATUS,
				    je.EXIT_CODE,
				    je.EXIT_MESSAGE,
				    je.LAST_UPDATED
				FROM
				    BATCH_JOB_INSTANCE ji
				    JOIN
				        BATCH_JOB_EXECUTION je
				    ON  ji.JOB_INSTANCE_ID = je.JOB_INSTANCE_ID
				WHERE
				    ji.JOB_INSTANCE_ID = :jobInstanceId
				""")
			.param("jobInstanceId", jobInstanceId)
			.<JobInstanceDetail>query((rs, rowNum) -> JobInstanceDetailBuilder.jobInstanceDetail()
				.jobInstanceId(rs.getLong("JOB_INSTANCE_ID"))
				.jobName(rs.getString("JOB_NAME"))
				.jobKey(rs.getString("JOB_KEY"))
				.version(rs.getInt("VERSION"))
				.latestExecution(JobExecutionSummaryBuilder.jobExecutionSummary()
					.jobExecutionId(rs.getLong("JOB_EXECUTION_ID"))
					.startTime(rs.getObject("START_TIME", LocalDateTime.class))
					.endTime(rs.getObject("END_TIME", LocalDateTime.class))
					.status(JobStatus.valueOf(rs.getString("STATUS")))
					.build())
				.executions(List.of())
				.build())
			.optional()
			.map(jobInstanceDetail -> JobInstanceDetailBuilder.from(jobInstanceDetail)
				.executions(this.jdbcClient.sql("""
						SELECT
						    je.JOB_EXECUTION_ID,
						    je.JOB_INSTANCE_ID,
						    ji.JOB_NAME,
						    je.CREATE_TIME,
						    je.START_TIME,
						    je.END_TIME,
						    je.STATUS,
						    je.EXIT_CODE,
						    je.EXIT_MESSAGE
						FROM
						    BATCH_JOB_EXECUTION je
						    JOIN
						        BATCH_JOB_INSTANCE ji
						    ON  je.JOB_INSTANCE_ID = ji.JOB_INSTANCE_ID
						WHERE
						    je.JOB_INSTANCE_ID = :jobInstanceId
						ORDER BY
						    je.START_TIME DESC
						""")
					.param("jobInstanceId", jobInstanceId)
					.<JobExecution>query((rs, rowNum) -> JobExecutionBuilder.jobExecution()
						.jobExecutionId(rs.getLong("JOB_EXECUTION_ID"))
						.jobInstanceId(rs.getLong("JOB_INSTANCE_ID"))
						.jobName(rs.getString("JOB_NAME"))
						.createTime(rs.getObject("CREATE_TIME", LocalDateTime.class))
						.startTime(rs.getObject("START_TIME", LocalDateTime.class))
						.endTime(rs.getObject("END_TIME", LocalDateTime.class))
						.status(JobStatus.valueOf(rs.getString("STATUS")))
						.exitCode(rs.getString("EXIT_CODE"))
						.exitMessage(rs.getString("EXIT_MESSAGE"))
						.build())
					.list())
				.parameters(jobInstanceDetail.latestExecution() != null
						? fetchJobParameters(jobInstanceDetail.latestExecution().jobExecutionId()) : null)
				.build());
	}

}

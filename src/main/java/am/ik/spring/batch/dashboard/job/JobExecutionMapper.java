package am.ik.spring.batch.dashboard.job;

import java.sql.Types;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;

@Repository
public class JobExecutionMapper {

	private final JdbcClient jdbcClient;

	public JobExecutionMapper(JdbcClient jdbcClient) {
		this.jdbcClient = jdbcClient;
	}

	public PageResponse<JobExecution> findJobExecutions(JobExecutionsParams params) {
		Integer page = Objects.requireNonNullElse(params.page(), 0);
		Integer size = Objects.requireNonNullElse(params.size(), 20);
		int offset = page * size;

		// Build base SELECT with optional parameter JOIN
		String parameterJoin = (params.parameterName() != null && params.parameterValue() != null) ? """
				LEFT JOIN BATCH_JOB_EXECUTION_PARAMS jp
				ON je.JOB_EXECUTION_ID = jp.JOB_EXECUTION_ID
				AND jp.PARAMETER_NAME = :parameterName
				AND jp.PARAMETER_VALUE = :parameterValue
				""" : "";

		// Build WHERE clause for parameter filtering
		String parameterWhere = (params.parameterName() != null && params.parameterValue() != null)
				? "AND jp.JOB_EXECUTION_ID IS NOT NULL" : "";

		String query = """
				SELECT *
				FROM (
				    SELECT
				        je.JOB_EXECUTION_ID,
				        je.JOB_INSTANCE_ID,
				        ji.JOB_NAME,
				        je.CREATE_TIME,
				        je.START_TIME,
				        je.END_TIME,
				        je.STATUS,
				        je.EXIT_CODE,
				        je.EXIT_MESSAGE,
				        ROW_NUMBER() OVER (ORDER BY je.START_TIME DESC) as rn
				    FROM
				        BATCH_JOB_EXECUTION je
				        JOIN
				            BATCH_JOB_INSTANCE ji
				        ON  je.JOB_INSTANCE_ID = ji.JOB_INSTANCE_ID
				        %s
				    WHERE
				        (
				            :jobName IS NULL
				        OR  ji.JOB_NAME = :jobName
				        )
				    AND (
				            :status IS NULL
				        OR  je.STATUS = :status
				        )
				    AND (
				            :startDateFrom IS NULL
				        OR  je.START_TIME >= :startDateFrom
				        )
				    AND (
				            :startDateTo IS NULL
				        OR  je.START_TIME <= :startDateTo
				        )
				    %s
				) sub
				WHERE rn > %d AND rn <= %d
				""".formatted(parameterJoin, parameterWhere, offset, offset + size);

		var sqlClient = this.jdbcClient.sql(query)
			.param("jobName", params.jobName(), Types.VARCHAR)
			.param("status", params.status(), Types.VARCHAR)
			.param("startDateFrom", params.startDateFrom(), Types.TIMESTAMP)
			.param("startDateTo", params.startDateTo(), Types.TIMESTAMP);

		if (params.parameterName() != null && params.parameterValue() != null) {
			sqlClient = sqlClient.param("parameterName", params.parameterName(), Types.VARCHAR)
				.param("parameterValue", params.parameterValue(), Types.VARCHAR);
		}

		List<JobExecution> content = sqlClient
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
			.list();

		// Fetch parameters for each execution
		for (int i = 0; i < content.size(); i++) {
			JobExecution execution = content.get(i);
			List<JobParameter> parameters = fetchJobParameters(execution.jobExecutionId());
			content.set(i, JobExecutionBuilder.from(execution).parameters(parameters).build());
		}

		String countQuery = """
				SELECT
				    COUNT(DISTINCT je.JOB_EXECUTION_ID)
				FROM
				    BATCH_JOB_EXECUTION je
				    JOIN
				        BATCH_JOB_INSTANCE ji
				    ON  je.JOB_INSTANCE_ID = ji.JOB_INSTANCE_ID
				    %s
				WHERE
				    (
				        :jobName IS NULL
				    OR  ji.JOB_NAME = :jobName
				    )
				AND (
				        :status IS NULL
				    OR  je.STATUS = :status
				    )
				AND (
				        :startDateFrom IS NULL
				    OR  je.START_TIME >= :startDateFrom
				    )
				AND (
				        :startDateTo IS NULL
				    OR  je.START_TIME <= :startDateTo
				    )
				    %s
				""".formatted(parameterJoin, parameterWhere);

		var countClient = this.jdbcClient.sql(countQuery)
			.param("jobName", params.jobName(), Types.VARCHAR)
			.param("status", params.status(), Types.VARCHAR)
			.param("startDateFrom", params.startDateFrom(), Types.TIMESTAMP)
			.param("startDateTo", params.startDateTo(), Types.TIMESTAMP);

		if (params.parameterName() != null && params.parameterValue() != null) {
			countClient = countClient.param("parameterName", params.parameterName(), Types.VARCHAR)
				.param("parameterValue", params.parameterValue(), Types.VARCHAR);
		}

		long count = countClient.query(Long.class).single();

		return PageResponseBuilder.<JobExecution>pageResponse()
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

	public Optional<JobExecutionDetail> getJobExecutionDetail(long jobExecutionId) {
		Optional<JobExecutionDetail> jobExecutionDetail = jdbcClient.sql("""
				SELECT
				    je.JOB_EXECUTION_ID,
				    je.JOB_INSTANCE_ID,
				    ji.JOB_NAME,
				    je.CREATE_TIME,
				    je.START_TIME,
				    je.END_TIME,
				    je.STATUS,
				    je.EXIT_CODE,
				    je.EXIT_MESSAGE,
				    je.LAST_UPDATED
				FROM
				    BATCH_JOB_EXECUTION je
				    JOIN
				        BATCH_JOB_INSTANCE ji
				    ON  je.JOB_INSTANCE_ID = ji.JOB_INSTANCE_ID
				WHERE
				    je.JOB_EXECUTION_ID = :jobExecutionId
				""")
			.param("jobExecutionId", jobExecutionId)
			.<JobExecutionDetail>query((rs, rowNum) -> JobExecutionDetailBuilder.jobExecutionDetail()
				.jobExecutionId(rs.getLong("JOB_EXECUTION_ID"))
				.jobInstanceId(rs.getLong("JOB_INSTANCE_ID"))
				.jobName(rs.getString("JOB_NAME"))
				.createTime(rs.getObject("CREATE_TIME", LocalDateTime.class))
				.startTime(rs.getObject("START_TIME", LocalDateTime.class))
				.endTime(rs.getObject("END_TIME", LocalDateTime.class))
				.status(JobStatus.valueOf(rs.getString("STATUS")))
				.exitCode(rs.getString("EXIT_CODE"))
				.exitMessage(rs.getString("EXIT_MESSAGE"))
				.lastUpdated(rs.getObject("LAST_UPDATED", LocalDateTime.class))
				.parameters(List.of())
				.steps(List.of())
				.build())
			.optional();
		return jobExecutionDetail.map(je -> {
			List<JobParameter> jobParameters = this.jdbcClient.sql("""
					SELECT
					    jp.PARAMETER_NAME AS NAME,
					    jp.PARAMETER_TYPE AS TYPE,
					    jp.PARAMETER_VALUE AS VALUE,
					    jp.IDENTIFYING
					FROM
					    BATCH_JOB_EXECUTION_PARAMS jp
					WHERE
					    jp.JOB_EXECUTION_ID = :jobExecutionId
					ORDER BY
					    jp.PARAMETER_NAME ASC
					""").param("jobExecutionId", jobExecutionId).query(JobParameter.class).list();
			List<StepExecutionSummary> stepExecutions = this.jdbcClient.sql("""
					SELECT
					    se.STEP_EXECUTION_ID,
					    se.STEP_NAME,
					    se.STATUS,
					    se.READ_COUNT,
					    se.WRITE_COUNT,
					    se.FILTER_COUNT,
					    se.START_TIME,
					    se.END_TIME
					FROM
					    BATCH_STEP_EXECUTION se
					WHERE
					    se.JOB_EXECUTION_ID = :jobExecutionId
					ORDER BY
					    se.START_TIME DESC
					""").param("jobExecutionId", jobExecutionId).query(StepExecutionSummary.class).list();
			return JobExecutionDetailBuilder.from(je).parameters(jobParameters).steps(stepExecutions).build();
		});
	}

}

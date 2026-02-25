package am.ik.spring.batch.dashboard.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.batch")
public class BatchDashboardProperties {

	private JobParameters jobParameters;

	public JobParameters getJobParameters() {
		return jobParameters;
	}

	public void setJobParameters(JobParameters jobParameters) {
		this.jobParameters = jobParameters;
	}

	public static class JobParameters {

		/**
		 * List of parameter names to display in job instances and executions lists
		 */
		private List<String> watchedList = List.of();

		public List<String> getWatchedList() {
			return watchedList;
		}

		public void setWatchedList(List<String> watchedList) {
			this.watchedList = watchedList;
		}

	}

}

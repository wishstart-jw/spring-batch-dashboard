package am.ik.spring.batch.dashboard;

import org.springframework.boot.SpringApplication;

public class TestSpringBatchDashboardApplication {

	public static void main(String[] args) {
		SpringApplication.from(SpringBatchDashboardApplication::main)
			.run("--spring.sql.init.mode=always", "--spring.profiles.active=test",
					"--spring.docker.compose.enabled=false");
	}

}

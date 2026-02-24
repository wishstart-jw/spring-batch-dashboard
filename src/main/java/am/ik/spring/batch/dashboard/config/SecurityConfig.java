package am.ik.spring.batch.dashboard.config;

import static org.springframework.security.web.util.matcher.AntPathRequestMatcher.antMatcher;

import javax.sql.DataSource;

import org.springframework.boot.actuate.autoconfigure.security.servlet.EndpointRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.factory.PasswordEncoderFactories;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.JdbcUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.LoginUrlAuthenticationEntryPoint;
import org.springframework.security.web.util.matcher.MediaTypeRequestMatcher;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

	@Bean
	public UserDetailsService userDetailsService(DataSource dataSource) {
		JdbcUserDetailsManager jdbcUserDetailsManager = new JdbcUserDetailsManager(dataSource);
		jdbcUserDetailsManager
			.setUsersByUsernameQuery("select membername, pass, active from members where membername = ?");
		jdbcUserDetailsManager
			.setAuthoritiesByUsernameQuery("select membername, rolename from roles where membername = ?");

		return jdbcUserDetailsManager;
	}

	@Bean
	public PasswordEncoder passwordEncoder() {
		return PasswordEncoderFactories.createDelegatingPasswordEncoder();
	}

	@Bean
	@Order(2)
	public SecurityFilterChain defaultSecurityFilterChain(HttpSecurity http) throws Exception {
		http.authorizeHttpRequests((authorize) -> authorize.requestMatchers(EndpointRequest.toAnyEndpoint())
			.permitAll()
			.requestMatchers("/login", "/error")
			.permitAll()
			.anyRequest()
			.authenticated()).exceptionHandling(exceptionHandling -> {
				MediaTypeRequestMatcher mediaTypeRequestMatcher = new MediaTypeRequestMatcher(MediaType.TEXT_HTML);
				mediaTypeRequestMatcher.setUseEquals(true);
				exceptionHandling
					.defaultAuthenticationEntryPointFor(new LoginUrlAuthenticationEntryPoint("/login"),
							mediaTypeRequestMatcher)
					.defaultAuthenticationEntryPointFor(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED),
							antMatcher("/api/**"))
					.defaultAuthenticationEntryPointFor(new LoginUrlAuthenticationEntryPoint("/login"),
							antMatcher("/**"));
			})
			.formLogin(form -> form.loginPage("/login").defaultSuccessUrl("/", true))
			.rememberMe(Customizer.withDefaults())
			.logout(logout -> logout.logoutUrl("/logout"));
		return http.build();
	}

}

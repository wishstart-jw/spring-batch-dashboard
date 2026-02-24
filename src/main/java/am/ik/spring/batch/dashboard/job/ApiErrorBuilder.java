package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;

public class ApiErrorBuilder {

	private LocalDateTime timestamp;

	private int status;

	private String error;

	private String message;

	private String path;

	public static ApiErrorBuilder apiError() {
		return new ApiErrorBuilder();
	}

	public ApiErrorBuilder timestamp(LocalDateTime timestamp) {
		this.timestamp = timestamp;
		return this;
	}

	public ApiErrorBuilder status(int status) {
		this.status = status;
		return this;
	}

	public ApiErrorBuilder error(String error) {
		this.error = error;
		return this;
	}

	public ApiErrorBuilder message(String message) {
		this.message = message;
		return this;
	}

	public ApiErrorBuilder path(String path) {
		this.path = path;
		return this;
	}

	public ApiError build() {
		return new ApiError(this.timestamp, this.status, this.error, this.message, this.path);
	}

}

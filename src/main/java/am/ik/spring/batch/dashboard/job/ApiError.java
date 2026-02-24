package am.ik.spring.batch.dashboard.job;

import java.time.LocalDateTime;

public record ApiError(LocalDateTime timestamp, int status, String error, String message, String path) {
}

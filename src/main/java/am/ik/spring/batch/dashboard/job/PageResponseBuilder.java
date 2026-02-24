package am.ik.spring.batch.dashboard.job;

import java.util.List;

public class PageResponseBuilder<T> {

	private List<T> content;

	private int page;

	private int size;

	private long totalElements;

	private int totalPages;

	public static <T> PageResponseBuilder<T> pageResponse() {
		return new PageResponseBuilder<>();
	}

	public PageResponseBuilder<T> content(List<T> content) {
		this.content = content;
		return this;
	}

	public PageResponseBuilder<T> page(int page) {
		this.page = page;
		return this;
	}

	public PageResponseBuilder<T> size(int size) {
		this.size = size;
		return this;
	}

	public PageResponseBuilder<T> totalElements(long totalElements) {
		this.totalElements = totalElements;
		return this;
	}

	public PageResponseBuilder<T> totalPages(int totalPages) {
		this.totalPages = totalPages;
		return this;
	}

	public PageResponse<T> build() {
		return new PageResponse<>(this.content, this.page, this.size, this.totalElements, this.totalPages);
	}

}

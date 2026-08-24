# Module: posts

Quản lý bài viết (đơn vị nội dung chính của trang). Đây là lát cắt đầu tiên
của walking skeleton, đi trọn từ DB tới API.

## Các lớp

- `models.py`     : bảng `posts` (domain).
- `schemas.py`    : hình dạng request và response (api).
- `repository.py` : truy vấn DB, không biết HTTP.
- `service.py`    : logic nghiệp vụ, tự sinh slug từ title nếu thiếu.
- `router.py`     : endpoint GET /posts, GET /posts/{slug}, POST /posts.

## Quyết định nội bộ

- Body bài viết lưu dạng Markdown (text), frontend render sau.
- Slug là id thân thiện dùng trong URL, phải unique.
- Giai đoạn skeleton dùng `create_all` để tạo bảng. Khi schema ổn định sẽ chuyển
  sang Alembic migration. Lý do: không over-engineer khi model còn thay đổi nhiều.

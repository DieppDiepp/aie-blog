# Runbook - Chạy và vận hành dự án

File này trả lời: cần chuẩn bị gì, chạy lệnh nào, và vì sao.
Cập nhật ngay khi thêm hoặc đổi bất kỳ script nào.

## Techstack tổng quan

- Frontend: Next.js (App Router), Tailwind, shadcn/ui, TypeScript.
- Backend: FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2. Quản lý môi trường bằng uv.
- Database: PostgreSQL.
- Hạ tầng: Docker Compose, Caddy (reverse proxy, HTTPS). CI/CD bằng GitHub Actions.

## Môi trường phát triển: WSL2

- Repo sống trong WSL tại `~/projects/aie-blog` (Ubuntu), không phải ở ổ Windows.
- Lý do: giống VPS Linux nhất, I/O nhanh, tránh lỗi CRLF. Không dùng `/mnt/d`.
- Sửa code: VS Code với extension WSL, hoặc path `\\wsl.localhost\Ubuntu\home\nguyen\projects\aie-blog`.
- Mọi lệnh dưới đây chạy trong terminal WSL (gõ `wsl` để vào).

## Yêu cầu môi trường (cài trước một lần)

- Docker và Docker Compose (đã có sẵn qua Docker Desktop backend WSL2).
- Node.js (cho frontend khi chạy ngoài Docker).
- uv (quản lý Python env và dependency cho backend).
- gh CLI để xác thực và push GitHub: cài rồi chạy `gh auth login` một lần.

## Các lệnh chính

### Chạy toàn hệ thống ở môi trường dev

- Chuẩn bị: copy `.env.example` thành `.env` ở thư mục gốc.
- Lệnh: `docker compose up --build`
- Vì sao: dựng đồng thời db, api, web trong container để giống môi trường thật.
- Sau khi chạy: web ở http://localhost:3000, api docs ở http://localhost:8000/docs.

### Thêm một bài viết mới (theo ADR-0004)

- Tạo thư mục `frontend/content/posts/<slug>/` với file `index.mdx` bên trong.
- Đầu file cần frontmatter: `title`, `summary`, `date` (YYYY-MM-DD), `tags`
  (mảng `{label, variant}`, variant là `topic`/`easy`/`mid`/`hard`), và tuỳ
  chọn `draft: true` nếu chưa muốn xuất hiện ở danh sách bài.
- Thân bài viết bằng Markdown/MDX ngay dưới frontmatter. Trang chủ, `/brain`
  và `/brain/[slug]` đọc thẳng từ thư mục này, không qua DB.
- Xem thử: `docker compose up --build` (hoặc `npm run dev` nếu chạy FE
  ngoài Docker), rồi mở `/brain/<slug>`.
- Lưu ý: endpoint `POST /posts` trên backend vẫn còn nhưng FE không đọc DB
  cho nội dung bài nữa (xem ADR-0004); DB sẽ dùng lại khi làm bước đồng bộ
  metadata cho tìm kiếm và Knowledge Graph.

### Dừng hệ thống

- Lệnh: `docker compose down` (thêm `-v` nếu muốn xoá luôn dữ liệu Postgres).

## Ghi chú backend với uv

- Chạy backend ngoài Docker: trong `backend/` gõ `uv sync` rồi
  `uv run uvicorn app.main:app --reload`.
- Lý do: mỗi service quản lý phụ thuộc riêng; uv dựng môi trường từ `pyproject.toml`.

## Lưu ý giai đoạn skeleton

- Bảng DB được tạo tự động bằng `create_all` lúc app khởi động.
- Khi schema ổn định sẽ chuyển sang Alembic migration (chưa làm bây giờ).

## CI/CD

- CI (`.github/workflows/ci.yml`): chạy trên máy ảo của GitHub, KHÔNG đụng VPS.
  Mỗi push hoặc pull request: check backend (uv sync + import) và frontend (npm build).
  Mục đích: chặn code hỏng lọt vào `main`.
- CD (deploy lên VPS): CHƯA làm. Khi làm sẽ cần quyền VPS, secrets (SSH key), và domain.
  Hướng dự kiến: GitHub Actions build image rồi đẩy lên VPS và chạy `docker compose up`.

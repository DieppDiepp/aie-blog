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

### Tạo bài viết đầu tiên để kiểm tra walking skeleton

- Lệnh (PowerShell):
  `Invoke-RestMethod -Method Post http://localhost:8000/posts -ContentType 'application/json' -Body '{"title":"Bai dau tien","summary":"Chao knowledge graph"}'`
- Vì sao: bơm dữ liệu để trang /brain có nội dung hiển thị, xác nhận DB tới API tới FE.

### Dừng hệ thống

- Lệnh: `docker compose down` (thêm `-v` nếu muốn xoá luôn dữ liệu Postgres).

## Ghi chú backend với uv

- Chạy backend ngoài Docker: trong `backend/` gõ `uv sync` rồi
  `uv run uvicorn app.main:app --reload`.
- Lý do: mỗi service quản lý phụ thuộc riêng; uv dựng môi trường từ `pyproject.toml`.

## Lưu ý giai đoạn skeleton

- Bảng DB được tạo tự động bằng `create_all` lúc app khởi động.
- Khi schema ổn định sẽ chuyển sang Alembic migration (chưa làm bây giờ).

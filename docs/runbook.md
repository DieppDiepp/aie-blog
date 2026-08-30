# Runbook - Chạy và vận hành dự án

File này trả lời: cần chuẩn bị gì, chạy lệnh nào, và vì sao.
Cập nhật ngay khi thêm hoặc đổi bất kỳ script nào.

## Techstack tổng quan

- Frontend: Next.js (App Router), Tailwind, shadcn/ui, TypeScript.
- Backend: FastAPI, SQLAlchemy 2.0, Alembic, Pydantic v2. Quản lý môi trường bằng uv.
- Database: PostgreSQL.
- Hạ tầng: Docker Compose. Dev dùng file `docker-compose.yml`; prod dùng
  `compose.prod.yml`. Ra Internet qua Cloudflare Tunnel (không dùng Caddy). CI/CD bằng
  GitHub Actions.

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
- Thân bài viết bằng Markdown/MDX ngay dưới frontmatter. Trang chủ, `/blog`
  và `/blog/[slug]` đọc thẳng từ thư mục này, không qua DB.
- Xem thử: `docker compose up --build` (hoặc `npm run dev` nếu chạy FE
  ngoài Docker), rồi mở `/blog/<slug>`.
- Lưu ý: endpoint `POST /posts` trên backend vẫn còn nhưng FE không đọc DB
  cho nội dung bài nữa (xem ADR-0004); DB sẽ dùng lại khi làm bước đồng bộ
  metadata cho tìm kiếm và Knowledge Graph.

### Thêm ảnh vào bài (media trên Cloudflare R2)

Ảnh KHÔNG commit vào Git (xem ADR-0005). Ảnh nằm trên Cloudflare R2, đọc công
khai qua CDN tại `https://media.aiengineerblog.com`, tác giả upload bằng rclone.
Chi tiết khái niệm ở hai bài draft object-storage-minio-vs-r2 và
setup-cloudflare-r2-rclone.

Chuẩn bị một lần (đã làm 2026-08-30):

- Bucket R2 `aie-blog-media` (private).
- Custom domain `media.aiengineerblog.com` gắn vào bucket. KHÔNG dùng public
  r2.dev URL (bị bóp băng thông).
- R2 API token loại Account, quyền Object Read & Write, scope đúng bucket đó.
- Cấu hình rclone tại `~/.config/rclone/rclone.conf` (remote tên `r2`,
  `chmod 600`). Khóa chỉ nằm trên máy dev, không vào git, VPS, hay image.

Mỗi lần thêm ảnh:

- Tuỳ chọn nén về webp cho nhẹ: `cwebp input.png -q 82 -o ten.webp`.
- Upload theo quy ước path `posts/<slug>/<ten>.webp`:
  `rclone copyto ./ten.webp r2:aie-blog-media/posts/<slug>/ten.webp --header-upload "Cache-Control: public, max-age=31536000, immutable" --s3-no-check-bucket`
- Chèn vào MDX bằng URL public:
  `![alt](https://media.aiengineerblog.com/posts/<slug>/ten.webp)`. Ảnh bìa để ở
  frontmatter `thumbnail: <url>`.
- Kiểm chứng: `curl -I <url>` thấy `HTTP/2 200` và `cache-control` đúng; gọi lần
  hai thấy `cf-cache-status: HIT` là CDN đã cache.

Ghi chú: `rclone lsd r2:` báo 403 là BÌNH THƯỜNG (token scope hẹp không liệt kê
được toàn tài khoản); dùng `rclone ls r2:aie-blog-media` để xem bên trong bucket.

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
- CD (`.github/workflows/cd.yml`): đang dựng từng bước. Giai đoạn 1 ĐÃ CÓ: mỗi push
  lên `main` sẽ build hai Docker image (api, web) và đẩy lên GHCR
  (`ghcr.io/dieppdiepp/aie-blog-api|web`), gắn tag `latest` và tag git SHA. Dùng
  `GITHUB_TOKEN` tự cấp (quyền `packages: write`), không cần secret thủ công cho bước này.
- CD giai đoạn 2 (deploy lên VPS): ĐÃ CÓ (job `deploy` trong `cd.yml`, chạy sau khi
  build xong). Job SSH vào VPS, copy `compose.prod.yml` lên, rồi chạy
  `docker compose -f compose.prod.yml --env-file .env.prod pull && up -d` với
  `IMAGE_TAG=<git sha>` để VPS chạy đúng bản của commit.
  - `compose.prod.yml`: stack prod, dùng `image:` từ GHCR thay vì `build:`, không mở
    cổng ra host, có `restart: unless-stopped` và healthcheck.
  - Secrets đã đặt sẵn trên GitHub: `VPS_SSH_KEY` (deploy key riêng), `VPS_HOST`,
    `VPS_USER`, `VPS_SSH_PORT`.
  - GHCR để private: đã `docker login ghcr.io` một lần trên VPS bằng PAT
    `read:packages`, Docker nhớ credential nên pull sau không cần login lại.
  - `.env.prod` (mật khẩu DB, ...) nằm trên VPS tại `~/aie-blog/`, không vào git.
  - Ra Internet bằng Cloudflare quick tunnel (`cloudflared tunnel --url http://web:3000`),
    không token, không domain. URL ngẫu nhiên `*.trycloudflare.com`, đọc trong log
    cloudflared (job deploy tự in ra). Muốn URL ổn định thì đổi sang named tunnel + domain.

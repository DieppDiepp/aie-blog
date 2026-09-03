# Skills - Kinh nghiệm và ghi chú vận hành

Nơi tích luỹ những gì học được khi làm thật mà tài liệu chính thức không có.
Ví dụ: VPS có điều khác lạ cần script riêng, lỗi hay gặp và cách xử, mẹo tối ưu.

## Cách ghi

- Mỗi kinh nghiệm là một mục ngắn: bối cảnh, vấn đề, cách giải, lý do.
- Khi một kinh nghiệm đủ lớn và ổn định, tách thành file riêng trong thư mục này.

## Mẫu một mục

### [Ngày] Tiêu đề ngắn

- Bối cảnh: gặp ở đâu, khi làm gì.
- Vấn đề: hiện tượng cụ thể.
- Cách giải: làm gì để qua.
- Lý do: vì sao cách đó đúng, hoặc vì sao môi trường này khác biệt.

## Các mục

### [2026-08-24] Môi trường phát triển dùng WSL2, repo nằm trong Linux

- Bối cảnh: máy dev là Windows, nhưng production là Linux VPS + Docker.
- Vấn đề: chạy trực tiếp trên Windows dễ lệch môi trường; file đặt ở ổ Windows
  rồi truy cập qua `/mnt/d` thì I/O rất chậm.
- Cách giải: đặt repo hẳn trong WSL tại `~/projects/aie-blog` (không để ở `/mnt/d`).
  Chạy mọi lệnh (docker, git, uv) bên trong WSL. Sửa code bằng VS Code với extension
  WSL, hoặc trỏ vào path `\\wsl.localhost\Ubuntu\home\nguyen\projects\aie-blog`.
- Lý do: file nằm trong hệ thống file Linux thì nhanh và giống VPS nhất, tránh cả
  vấn đề xuống dòng CRLF.

### [2026-08-30] Quy ước ảnh và sơ đồ minh hoạ trong bài viết

- Bối cảnh: bài Docker viết lại có nhiều sơ đồ; chốt cách làm ảnh để tái dùng khi
  sau này dịch bài qua Anh/Việt.
- Quy ước:
  - Ảnh/sơ đồ dùng CHỮ TIẾNG ANH đơn giản, chỉ giữ NHÃN ngắn (tên service, cổng,
    thuật ngữ). Mọi câu diễn giải để ở TEXT trong MDX, KHÔNG nhét vào ảnh, để dịch
    Anh/Việt không phải vẽ lại ảnh.
  - Không dùng em dash trong ảnh lẫn text (luật chung repo).
  - Sơ đồ vẽ tay bằng SVG theo design system: nền Paper, accent #2F5FE0, thẻ trắng
    bo góc, mũi tên đặc = gọi trong mạng, đứt = port/host, hình trụ = volume. Sơ đồ
    codebase thêm icon file kiểu VS Code explorer.
  - Ảnh mỗi bài giờ tách hai vai (từ 2026-09-03, xem mục riêng bên dưới):
    `thumbnail.svg` chỉ gồm logo techstack, cho ô thẻ nhỏ 150x88; `cover.svg` tỉ lệ
    16/9 trên nền `#f3f2f2`, cho các dải full-bleed (masthead Home, đầu bài, lead
    trang blog). Frontmatter khai báo cả `thumbnail` và `cover`; nếu thiếu `cover`
    thì `lib/posts.ts` tự fallback về `thumbnail`. Vì cover đã chuẩn 16/9,
    `COVERS_FIXED_RATIO = true` trong `lib/site.ts` nên dải lớn chạy `object-cover`
    lấp đầy khung; thẻ nhỏ vẫn `object-contain` (mặc định của `Thumbnail`).
  - Ảnh nằm trên R2 (`media.aiengineerblog.com`), chèn bằng `next/image`
    (`unoptimized` cho SVG) + `remotePatterns` cho host đó (đã cấu hình trong
    `next.config.ts` và `components/mdx/mdx-components.tsx`).
  - Code block tô màu bằng Shiki theme `github-dark`, gắn ở `rehypePlugins` trong
    `app/blog/[slug]/page.tsx`. Từ ADR-0006, fenced block nằm trên nền ink của
    `CodeBlock`, nên theme phải là theme tối (đổi từ `light-plus` cũ). Một
    transformer nhỏ gắn `data-language` lên `<pre>` để header in đúng tên ngôn ngữ.
- Lý do: ảnh không dịch được nên tách chữ ra text; `next/image` bỏ cảnh báo LCP của
  `<img>`; Shiki `github-dark` khớp nền ink của khung code trong hệ Modernist.

### [2026-09-03] Vẽ lại toàn bộ hình theo Modernist v2, tách thumbnail và cover

- Bối cảnh: web đã đổi sang giao diện Modernist (ADR-0006) nhưng hình vẫn theo hệ
  cũ (nền `#FCFCFA`, bo góc `rx=16`, accent xanh `#2F5FE0`). Đóng gói ảnh hiện tại
  và logo cho Claude Design vẽ lại, rồi lấy output về.
- Đã làm: 5 bài, mỗi bài có `thumbnail.svg` (chỉ logo techstack, đọc được ở ô thẻ
  150x88) và `cover.svg` (16/9, nền `#f3f2f2`, dải full-bleed), cộng các sơ đồ thân
  bài vẽ lại giữ nguyên tên. Tất cả nền `#f3f2f2`, bo góc 0, kẻ 2px, logo nhúng
  base64, nhãn tiếng Anh, không em dash.
- Frontend: thêm field `cover` vào `lib/types.ts` và `lib/posts.ts` (fallback về
  `thumbnail` khi thiếu); thẻ nhỏ dùng `thumbnail`, dải lớn và ảnh OG/JSON-LD dùng
  `cover`; bật `COVERS_FIXED_RATIO = true`.
- Cảnh báo key R2: bài Docker có slug `hoc-docker-qua-du-an-web-that` nhưng key R2
  là `posts/docker-co-ban-cho-python-dev/`. Bốn bài kia key trùng slug.
- Upload: `rclone copyto <file> r2:aie-blog-media/posts/<key>/<file> --header-upload
  "Content-Type: image/svg+xml" --s3-no-check-bucket`, rồi tăng `?v=N` trong
  frontmatter và thân bài để phá cache edge (query là một phần cache key).
- Còn tồn: file thumbnail/cover khá nặng (logo nhúng base64, có file tới ~220KB),
  chưa tối ưu SVG. Có thể ép logo nhẹ hơn ở vòng sau nếu cần.

### [2026-08-30] R2: mấy lỗi hay gặp khi upload ảnh bằng rclone

- `rclone.conf` thiếu dòng `[r2]` -> "didn't find section". Thư mục
  `~/.config/rclone` chưa có -> `mkdir -p` trước khi ghi.
- `rclone lsd r2:` trả 403 là BÌNH THƯỜNG với token scope một bucket; kiểm bằng
  `rclone ls r2:<bucket>`.
- Ảnh đã cache immutable ở edge; sửa ảnh cùng key thì thêm `?v=N` vào URL trong MDX
  để phá cache (query string là một phần cache key), khỏi phải purge.
- Chi tiết đầy đủ ở `content/drafts/setup-cloudflare-r2-rclone.md`.

### [2026-08-24] Push GitHub từ WSL cần xác thực riêng

- Bối cảnh: WSL là môi trường Linux tách biệt, không dùng chung đăng nhập với Windows.
- Vấn đề: `gh` CLI chưa cài, chưa xác thực nên không push được lên GitHub.
- Cách giải: cài `gh` rồi chạy `gh auth login` (người dùng tự làm, nhập token hoặc
  đăng nhập qua trình duyệt). Sau đó git dùng lại thông tin này để push.
- Lý do: agent không được nhập token thay người dùng. Xác thực phải do chủ máy thực hiện.

### [2026-08-24] Walking skeleton đã chạy xanh lần đầu trong WSL

- Bối cảnh: kiểm chứng `docker compose up --build` cho cả db, api, web trong WSL2.
- Kết quả: build thành công, cả 3 container Up. `GET /health` ok, `POST /posts` tạo
  bài và tự sinh slug, `GET /brain` render đúng bài vừa tạo. Xác nhận trọn đường
  Postgres tới FastAPI tới Next.js tới màn hình.
- Lưu ý: khi cần script kiểm tra nhiều lệnh trong WSL, viết file `.sh` rồi chạy
  `wsl bash -lc 'bash <path>'`, tránh truyền lệnh nhiều dòng trực tiếp qua nhiều
  lớp shell (PowerShell hoặc git-bash bọc ngoài dễ vỡ quote và `$(...)`).

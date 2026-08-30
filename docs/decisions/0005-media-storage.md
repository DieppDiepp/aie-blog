# ADR-0005: Media (ảnh) lưu ở Cloudflare R2, tách khỏi Git

Trạng thái: Accepted. Ngày: 2026-08-30.

## Bối cảnh

Thân bài là MDX file-based trong repo và Git là source of truth (ADR-0004).
Text hợp với Git, nhưng ẢNH thì không: Git giữ toàn bộ lịch sử blob nhị phân,
mỗi lần sửa ảnh sinh một blob mới nằm lại vĩnh viễn, làm phình `.git`, chậm
`clone` và chậm CI (npm build, build Docker image). Cần tách media ra một nơi
lưu riêng và chèn vào MDX bằng URL ổn định.

Ràng buộc hạ tầng: ra Internet CHỈ qua Cloudflare named tunnel, VPS không mở
cổng public nào (xem `compose.prod.yml`, runbook). Ưu tiên: dịch vụ miễn phí đủ
dùng, chuẩn công nghiệp để học, không over-engineer. Ảnh RẤT ÍT.

## Quyết định

Dùng Cloudflare R2 (object storage, S3-compatible) làm nơi lưu media, phục vụ
qua một custom domain của Cloudflare.

1. Bucket private (ví dụ `aie-blog-media`). Đọc công khai CHỈ qua custom domain
   gắn thẳng vào bucket: `media.aiengineerblog.com`. Đây là read-only và được
   cache ở edge Cloudflare. Endpoint S3 gốc không để public list.
2. R2 nằm trong hạ tầng Cloudflare, KHÔNG đi qua VPS và KHÔNG qua tunnel. Đường
   phục vụ ảnh là `user -> Cloudflare edge -> R2`. VPS chỉ còn Postgres là volume
   stateful; không thêm container hay volume media nào trên VPS.
3. Quyền ghi (upload) bằng R2 API token scope hẹp: chỉ Object Read & Write trên
   đúng bucket đó, không quyền admin. Token là cặp access key kiểu S3, lưu trong
   `.env` trên máy dev (WSL), KHÔNG vào git, KHÔNG lên VPS, KHÔNG vào image
   Docker. "Chỉ tác giả upload" được bảo đảm bằng quyền sở hữu credential, độc
   lập với việc VPS không mở cổng.
4. Định danh và URL ổn định. Path soi gương cấu trúc bài:
   `posts/<slug>/<ten-anh>.<ext>`, cho URL
   `https://media.aiengineerblog.com/posts/<slug>/<ten-anh>.webp`. Ảnh có thể
   đổi thì nhét hash nội dung ngắn vào tên (`diagram.a1b2c3.webp`) để URL
   immutable và cache vĩnh viễn; ảnh gần như không đổi thì để tên trơn.
5. Tham chiếu trong MDX:
   - Ảnh trong thân bài: Markdown chuẩn `![alt](https://media.../...webp)`,
     chạy được ngay với pipeline MDX hiện tại (render ra `<img>`).
   - Ảnh bìa/thumbnail: là metadata, đặt ở frontmatter (ví dụ field
     `thumbnail`), không nhét trong thân bài.
6. Tối ưu ảnh thủ công về webp/avif trước khi upload (ảnh ít nên không cần dịch
   vụ transform). Upload bằng công cụ S3 chuẩn (rclone/aws-cli/mc).

## Các phương án đã cân nhắc

- Commit ảnh vào Git: đúng vấn đề cần tránh (phình history vĩnh viễn). Loại.
- Git LFS: cột vòng đời ảnh vào git, thêm phụ thuộc LFS server, quota băng thông
  GitHub LFS quá nhỏ để phục vụ ảnh. Loại.
- MinIO self-host trên VPS (S3-compatible): học ops object storage sâu nhất,
  nhưng thêm một container + volume stateful phải backup, creds nằm trên VPS,
  upload qua tunnel vướng hơn. Over-engineer so với "ảnh rất ít". ĐỂ DÀNH cho
  một buổi riêng như bài blog tự-host; vì cả hai đều S3-compatible, khi đó chỉ
  cần `mc mirror` từ R2 sang, không mất gì.
- Static file server (nginx) sau tunnel: đơn giản nhưng không học được S3 API,
  và khâu upload chỉ-tác-giả phải tự chế. Không chọn.
- Cloudflare Images (trả phí): có resize/format tự động, thừa cho nhu cầu hiện
  tại. Cân nhắc lại nếu sau này cần transform.

## Hệ quả

- Free đủ dùng: R2 free tier khoảng 10 GB, egress = 0, thừa cho ảnh rất ít.
- Ops thấp nhất: không thêm container/volume/backup trên VPS. Muốn bản sao thì
  `rclone sync` R2 sang nơi khác định kỳ.
- Bảo mật tốt hơn: credential ghi không nằm trên VPS và không trong image
  web/api; site chỉ tham chiếu URL public read. VPS bị xâm nhập không kéo theo
  quyền ghi/xoá media.
- Học đúng kỹ năng chuẩn công nghiệp: S3 API (boto3/aws-cli/rclone/mc), Cache
  Rules và credential scoping của Cloudflare.
- Di cư dễ: S3-compatible, chuyển sang MinIO/AWS S3 bất kỳ lúc nào; giữ URL ổn
  định nếu giữ custom domain.
- Việc kế tiếp (ngoài phạm vi ADR này, khi thực thi): tạo bucket + custom domain
  + API token, viết ghi chú upload vào runbook, và (tuỳ chọn) thêm map `img`
  trong mdx-components hoặc `images.remotePatterns` cho `next/image`.
- Không đụng phần DB dynamic (comments, likes, subscriptions), vẫn để làm sau.

## Đã thực thi (2026-08-30)

- Bucket `aie-blog-media` (private) đã tạo; custom domain
  `media.aiengineerblog.com` đã gắn vào bucket (không dùng r2.dev).
- R2 API token loại Account, quyền Object Read & Write, scope đúng bucket đó;
  khóa cấu hình trong rclone trên máy dev, không lên VPS, git, hay image.
- Đã upload thử và kiểm chứng end-to-end: `curl -I` trả HTTP/2 200,
  `content-type: image/webp`, `cache-control` immutable đúng, phục vụ qua
  Cloudflare edge (có `cf-cache-status`). Object test đã xóa.
- Quy trình vận hành "Thêm ảnh vào bài" ghi ở `docs/runbook.md`; các lỗi hay gặp
  ghi ở draft `setup-cloudflare-r2-rclone`.
- Chưa làm (để sau, phía frontend): map phần tử `img` trong mdx-components hoặc
  `images.remotePatterns` cho `next/image`; sẽ làm khi có bài thật dùng ảnh.

# ADR-0007: Section Projects và trang tác giả

Trạng thái: Accepted. Ngày: 2026-09-03.

## Bối cảnh

Blog cần một chỗ để tác giả kể lại dự án mình đã làm một cách dài và có cấu
trúc, khác với bài viết thường. Đồng thời cần một trang cá nhân cho từng tác
giả gom cả dự án lẫn bài viết, để mở đường cho nhiều người viết về sau. Hai
trang được thiết kế trong vòng này: `/projects` (danh sách gom theo lĩnh vực)
và `/authors/<slug>` (trang tác giả). Trang chi tiết một dự án
(`/projects/<slug>`) chưa được thiết kế nên chưa dựng.

## Quyết định

1. Nội dung dự án nằm trong repo dưới dạng MDX như bài viết, theo đúng tinh
   thần ADR-0004: `content/projects/<slug>/index.mdx` là source of truth, DB
   không giữ gì về thân bài. `lib/projects.ts` đọc thư mục này bằng
   `gray-matter`, cùng một hợp đồng với `lib/posts.ts`. Frontmatter khai báo
   `title`, `summary`, `date`, `author`, `field`, `tags`, `metrics` (đúng ba),
   `chapters`, `artifacts`, và tuỳ chọn `cover`, `thumbnail`, `draft`.

2. Lĩnh vực (`field`) là trục gom nhóm của `/projects`. Danh sách
   `PROJECT_FIELDS` nằm trong `lib/project-types.ts`; mỗi lĩnh vực in một dải
   ink rồi tới các dự án của nó. Lĩnh vực chưa có dự án vẫn hiện trong thanh lọc
   nhưng bị làm mờ, cố ý: thanh lọc là bản đồ hướng đi chứ không phải danh sách
   đầy.

3. Tác giả được resolve theo slug qua `getAuthor`, không hard-code tên ở đâu.
   Thêm tác giả là thêm một entry trong `AUTHORS` (`lib/authors.ts`) cộng một
   ảnh chân dung; route `/authors/<slug>` xuất hiện ngay nhờ
   `generateStaticParams`. Đây là chỗ mở đường cho nhiều người viết dù hiện chỉ
   có một.

## Ghi chú thiết kế đã chốt

- Kiểu của section nằm riêng ở `lib/project-types.ts`; `lib/types.ts` là hợp
  đồng của pipeline bài viết (ADR-0004) nên không thêm gì vào đó. Chip dự án
  dùng lại `PostTag` và component `Tag` của bài viết để hai section đồng nhất.
- Trang tác giả không có kệ thành tựu, timeline hay huy hiệu: portfolio chứng
  minh bằng dự án và số liệu.
- Trang chi tiết dự án chưa dựng. `PROJECT_DETAIL_READY = false` trong
  `lib/project-types.ts` giữ mọi link dự án trỏ về `/projects` để không 404.
  Khi có thiết kế, thêm `app/projects/[slug]/page.tsx` và bật cờ trong cùng
  commit.

## Hệ quả

- Đăng một dự án bằng một commit, giống bài viết: tạo
  `content/projects/<slug>/index.mdx`, không cần đổi code.
- DB chưa dùng cho dự án; khi cần tìm kiếm hoặc Knowledge Graph thì đồng bộ
  frontmatter như kế hoạch của ADR-0004.

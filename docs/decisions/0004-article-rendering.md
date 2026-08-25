# ADR-0004: Article rendering - mỗi bài là FE tùy biến trong repo

Trạng thái: Accepted. Ngày: 2026-08-25.

## Bối cảnh

Mỗi bài viết không vừa một template markdown chung. Bài cần trình bày riêng:
màu sắc, hình ảnh, biểu đồ, sơ đồ, phần tương tác. Ý định là để agent viết FE
riêng cho từng bài dựa trên nội dung. ADR-0002 từng đặt DB làm nơi chứa nội
dung, nhưng "nội dung" giờ là code giao diện tùy biến, không nhét vừa DB dạng
text. Ràng buộc: tùy biến tự do, an toàn, review được, hợp stack, và vẫn dựng
được Knowledge Graph.

## Quyết định

1. Thân bài là file trong repo, không nằm trong DB. Định dạng MDX là chính
   (văn xuôi cộng component React nhúng vào); bài cực kỳ tùy biến được phép
   viết hẳn một route TSX riêng. Đề xuất vị trí: `frontend/content/posts/<slug>/`
   với `index.mdx` và các component riêng của bài đặt cạnh nếu cần.
2. Nguyên tắc bảo mật cứng: KHÔNG lưu và KHÔNG thực thi code bài viết lấy từ
   DB. Mọi code bài đi qua git và CI (review, type-check, build). Bề mặt tấn
   công vì thế tối thiểu.
3. DB (Postgres) là chỉ mục truy vấn được, dựng từ file: metadata bài (title,
   slug, summary, ngày, trạng thái), tag, cạnh Knowledge Graph (topic, liên
   kết bài với bài), và một bản plaintext hoặc excerpt để search và RSS. DB
   không còn chứa thân bài bespoke.
4. Nguồn khai báo metadata là frontmatter trong file MDX (title, slug,
   summary, date, tags kèm mức độ, topic, links, draft). File là source of
   truth; DB là bản dẫn xuất. Cơ chế đồng bộ frontmatter vào DB là việc kế
   tiếp (bước build hoặc script seed), chưa chốt chi tiết ở đây.
5. Bộ component nội dung dựng dần theo design system (Callout, Figure,
   CodeBlock, Chart, Diagram, NodeGraph, StepThrough, ...). Bài MDX lắp ghép
   các component này; bài đặc biệt tự viết component riêng. Thêm khi cần,
   không dựng sẵn hết.

## Các phương án đã cân nhắc

- Block JSON trong DB cộng bộ component cố định: an toàn, đăng nhanh, nhưng
  không thật sự bespoke vì bị giới hạn trong thư viện block dựng sẵn.
- Lưu code React hoặc HTML trong DB rồi eval lúc render: tùy biến được nhưng
  mở ra thực thi code lạ (RCE, XSS), không type-check, khó review. Loại thẳng.
- Hybrid ngay từ đầu (bespoke ở repo, ghi chú nhanh gõ thẳng vào DB): linh
  hoạt hơn nhưng phải làm thêm trang editor. Để dành nâng cấp sau, không phải
  làm lại.

## Hệ quả

- Xuất bản một bài bằng một commit hoặc PR rồi CI build. Chưa có nút "đăng
  ngay" cho tới khi làm editor. Hợp mô hình agent viết bài, có review và
  rollback qua git.
- ADR-0002 được tinh chỉnh, không phủ định: DB vẫn là store chính cho metadata
  và quan hệ Knowledge Graph, chỉ có thân bài bespoke chuyển sang file repo.
- Việc kế tiếp cần chốt: cấu trúc thư mục content, schema frontmatter, pipeline
  MDX trong Next, và cơ chế sync frontmatter vào DB.
- Renderer đọc `body` từ DB ở `/brain/[slug]` hiện tại là tạm thời cho walking
  skeleton, sẽ chuyển dần sang đọc file MDX.
- Cộng tác multi-author tương lai đi qua PR trên repo, hoặc thêm editor khi lên
  Hybrid.

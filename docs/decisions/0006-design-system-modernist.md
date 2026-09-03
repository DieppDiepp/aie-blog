# ADR-0006: Design System v2 (Modernist)

Trạng thái: Accepted. Ngày: 2026-09-02.
Thay thế: ADR-0003 (Editorial Calm).

## Bối cảnh

Giao diện v1 "Editorial Calm" đúng về mặt bình tĩnh nhưng chưa đủ dấu ấn: card
bo góc 16px trên nền trắng, accent xanh dùng rộng, glow gradient ở hero, và
layout `max-w` căn giữa làm mọi trang trông giống nhau. Chủ blog muốn một
giao diện hiện đại, sang, có chút chất editorial cổ điển kiểu tạp chí in.

## Quyết định

Chuyển sang hệ **Modernist**: lưới module hiện rõ, bo góc 0, kẻ 2px, chữ flush
left, và chất editorial cổ điển nằm ở phần đọc (serif, drop cap, ornament).

### Màu

- Ground và surface cùng một giá trị `#f3f2f2`. Không có gì "nổi": phân tách
  bằng kẻ, không bằng đổ bóng hay độ cao.
- Ink `#201e1d` là màu mặc định của mọi element. Body dài dùng `#2b2927`.
- Accent `#ec3013` (đỏ cam) dùng **tiết chế**: nút chính, gạch dưới nav đang
  active, đúng một poster band ở Home, badge chân dung About, drop cap, tint
  của tag độ khó. Pull quote, caption ảnh bìa và band kết About là ink.
- Accent là một biến duy nhất `--accent`, ba biến còn lại (`--accent-tint`,
  `--accent-tint-soft`, `--accent-deep`) suy ra bằng `color-mix`. Đổi một giá
  trị là đổi cả site.

### Hình

- `--card-radius: 0px`. Bo góc 0 ở mọi nơi.
- Kẻ phân đoạn lớn 2px (`--rule`), kẻ giữa hàng 1px (`--hairline`).
- Layout full-bleed, padding ngang cố định 56px, không `max-w` căn giữa. Các
  dải màu chạy hết chiều ngang.
- Danh sách bài là **bảng**, không phải card: các cột thẳng hàng, chia bằng kẻ
  1px, cả hàng tint khi hover.

### Chữ

- Archivo cho display và UI: wordmark, heading, nav, nhãn, tag, meta.
- Newsreader cho thân bài, deck italic, caption, blurb.
- Geist Mono cho code. Geist sans bị bỏ.
- Heading trong bài là nhãn nhỏ chữ hoa tracking rộng nằm dưới kẻ 2px, không
  phải serif cỡ lớn. Cỡ lớn dành cho tiêu đề trang.

### Ngoại lệ so với Modernist gốc

Hệ Modernist yêu cầu ảnh đen trắng. Blog này **giữ nguyên màu ảnh**, theo yêu
cầu của chủ blog: sơ đồ pipeline dùng màu để phân biệt thành phần, bỏ màu là
mất thông tin.

### Luật copy

- Không dùng em dash `—`.
- Không dùng `·` làm ký tự nối chữ.
- Không đặt nhãn nhỏ ngay trên một heading lớn (giữ từ ADR-0003).

## Hệ quả

- Dark mode vẫn làm được sau: mọi màu là biến, chỉ cần định nghĩa bộ giá trị
  thứ hai. Chưa có bộ tối.
- Mobile cần một vòng thiết kế riêng: v2 hiện chỉ có desktop.
- Ảnh cover muốn chạy full-bleed thì cần gen lại ở tỉ lệ 16/9 trên nền
  `#f3f2f2`, và bật cờ `COVERS_FIXED_RATIO` trong `lib/site.ts`. Trước đó ảnh
  vẫn hiển thị nguyên vẹn ở chế độ contain.

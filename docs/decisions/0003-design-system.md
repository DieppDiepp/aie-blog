# ADR-0003: Design System v1 (Editorial Calm)

Trạng thái: Accepted. Ngày: 2026-08-25.

## Bối cảnh

Frontend walking skeleton chỉ là khung trần. Cần một hệ thiết kế đủ để dựng
giao diện đẹp, nhất quán, ở mức Apple/Vercel/Linear thay vì template generic.
Hướng thẩm mỹ đã được duyệt qua mock-up canvas trước khi code.

## Quyết định

Vibe "Editorial Calm": tối giản, sang, typography là nhân vật chính, nhiều
khoảng trắng. Nền sáng "Paper" là mặc định, Dark làm sau.

- Màu (tokens.css, mọi màu là CSS variable): bg #FCFCFA, surface #FFFFFF,
  ink #16181D, ink-body #25272E, muted #6B6F76, hairline #E7E7E2, accent
  Refined Blue #2F5FE0 (hover #1E40AF).
- Blue dùng TIẾT CHẾ làm điểm nhấn: box tint mờ (accent-wash rgba ~0.05),
  link, nút phụ. Nút chính để nền ink cho sang.
- Font: Newsreader (serif, tiêu đề) + Geist (sans, thân bài và UI) + Geist
  Mono (label và code), nạp qua next/font. Có subset Vietnamese cho serif.
- Motif node-connector (chấm + đường nối) DỒN cho Knowledge Graph, không rải
  khắp nơi để tránh rối.
- Không đặt nhãn/eyebrow nhỏ ngay trên tiêu đề lớn. Danh mục là TAG chip đặt
  ở chỗ hợp lý (footer thẻ, dưới byline). Một bài có nhiều tag: chủ đề và độ
  khó. Độ khó có tint nhẹ (dễ xanh rêu, trung cấp nâu đất, khó đỏ).
- Không dùng em dash, không spam icon, không chấm tròn trang trí vô nghĩa.

## Hệ quả

- Tokens map vào Tailwind theme qua `@theme` trong globals.css, nên bật Dark
  sau này chỉ cần thêm một bộ giá trị biến, không sửa component.
- Brand kit đầy đủ (logo, hệ icon, minh hoạ) để giai đoạn sau.
- Knowledge Graph mới dựng bố cục và vùng cụm màu ở mức mock, sẽ trau chuốt
  khi có module `topics` ở backend.

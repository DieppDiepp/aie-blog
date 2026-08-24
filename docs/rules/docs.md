# Luật viết tài liệu

## Nguyên tắc

- Viết bằng tiếng Việt, cô đọng, trọng tâm. Không dài dòng.
- Một file một mục đích. Trùng lặp thì link tới nhau, không copy.
- Không em dash, không spam icon.

## Hai tầng tài liệu

1. Quyết định lớn (kiến trúc): đặt ở `docs/decisions/` dạng ADR đánh số.
2. Ngữ cảnh cục bộ (một tính năng): đặt 1 file `README.md` ngay trong module đó.

Không tạo folder `.md` cho mọi cấp thư mục. Chỉ module tính năng mới có README.

## Nội dung một README module nên có

- Module này làm gì (1 đến 2 câu).
- Các quyết định nội bộ đáng nhớ và lý do.
- Điểm cần lưu ý khi sửa (cạm bẫy, ràng buộc).

## Cơ chế đồng bộ (bắt buộc)

- Đổi code trong module nào thì cập nhật README module đó trong CÙNG commit.
- Đổi script hay techstack thì cập nhật `docs/runbook.md`.
- Phát hiện kinh nghiệm vận hành thì ghi vào `docs/skills/`.

## ADR viết gì

Bối cảnh, quyết định, các phương án đã cân nhắc, hệ quả. Ngắn gọn.
Không xoá ADR cũ. Khi thay thế, đánh dấu "Superseded by ADR-XXXX".

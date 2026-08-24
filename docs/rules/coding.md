# Luật viết code

## Triết lý

- Tối ưu cho người ĐỌC, không cho người viết. Code được đọc nhiều hơn viết.
- 100 dòng rõ ràng thắng 500 dòng "thông minh". Ít trừu tượng khi chưa cần.
- Chỉ thêm lớp abstraction khi có ít nhất 2 chỗ thật sự cần dùng lại.

## Comment và ngôn ngữ

- Comment, tên biến, tên hàm: tiếng Anh.
- Comment giải thích "vì sao", không lặp lại "cái gì" mà code đã nói rõ.

## Ký tự và trình bày

- Không dùng em dash trong code lẫn output.
- Không spam icon hay emoji. Chỉ dùng khi làm rõ nghĩa (ví dụ trong log trạng thái).

## Naming convention

- Python: file va ham `snake_case`, class `PascalCase`.
- TypeScript: bien/ham `camelCase`, component `PascalCase`, file component `PascalCase.tsx`.
- Bảng DB: `snake_case` số nhiều (ví dụ `posts`, `topics`).
- Route API: số nhiều, dạng danh từ (ví dụ `/posts`, `/topics/{id}`).

## Dependency

- Mỗi thư viện mới phải giải thích lý do khi thêm. Tránh phình phụ thuộc.
- Ưu tiên thư viện chuẩn của hệ sinh thái (FastAPI, SQLAlchemy, shadcn/ui).

## Backend layering (Clean Architecture)

Phụ thuộc chỉ đi một chiều: api -> service -> repository -> domain.
Lớp trong không được import lớp ngoài. Ví dụ `domain` không biết FastAPI.

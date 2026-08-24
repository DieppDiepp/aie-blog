# ADR-0002: PostgreSQL thay vì MongoDB

Trạng thái: Accepted. Ngày: 2026-08-24.

## Bối cảnh

Trái tim của trang là quan hệ: Post thuộc Topic, Topic có cây cha con, Post gắn
nhiều Tag, Post liên kết Post khác. Đây chính là các cạnh của Knowledge Graph.

## Quyết định

Dùng PostgreSQL. Truy vấn quan hệ để suy ra Knowledge Graph, không cần graph DB
riêng ở giai đoạn này. Cần field linh hoạt thì dùng kiểu JSONB của Postgres.

## Các phương án đã cân nhắc

- MongoDB: mạnh cho dữ liệu rời rạc, schema hay đổi, ghi nhiều. Nhưng phải tự nhồi
  logic quan hệ vào tay, ngược sở trường, làm phần graph phức tạp hơn.

## Hệ quả

- Toàn vẹn dữ liệu tốt, thuận cho tính năng multi-author tương lai.
- Nếu sau này lưu log chạy agent (dữ liệu rời), có thể cân nhắc thêm store phù hợp.

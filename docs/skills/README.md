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

### [2026-08-24] Push GitHub từ WSL cần xác thực riêng

- Bối cảnh: WSL là môi trường Linux tách biệt, không dùng chung đăng nhập với Windows.
- Vấn đề: `gh` CLI chưa cài, chưa xác thực nên không push được lên GitHub.
- Cách giải: cài `gh` rồi chạy `gh auth login` (người dùng tự làm, nhập token hoặc
  đăng nhập qua trình duyệt). Sau đó git dùng lại thông tin này để push.
- Lý do: agent không được nhập token thay người dùng. Xác thực phải do chủ máy thực hiện.

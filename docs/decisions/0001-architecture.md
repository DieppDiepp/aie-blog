# ADR-0001: Modular Monolith thay vì Microservices

Trạng thái: Accepted. Ngày: 2026-08-24.

## Bối cảnh

Dự án do một người làm, một site, tải thấp. Cần kiến trúc sạch, dễ học system
design, dễ test, và có thể tách service về sau nếu thật sự cần.

## Quyết định

Dùng Modular Monolith với Clean Architecture (pragmatic).
Backend chia theo feature module (posts, topics, graph, projects, auth).
Mỗi module có đủ 4 lớp: api, service, repository, domain.

## Các phương án đã cân nhắc

- Microservices: mạnh cho nhiều team và scale độc lập. Với một dev thì chỉ toàn
  chi phí vận hành (nhiều service, network, orchestration), không có lợi ích.
- CQRS hoặc Event Sourcing: hợp domain phức tạp. Với CRUD blog thì thừa.

## Hệ quả

- Đơn giản, một lần deploy, dễ debug.
- Khi cần chạy demo agentic gọi API, tách phần đó thành một service riêng là hợp lý.

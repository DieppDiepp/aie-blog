# Luật quy trình làm việc

## Cách dựng tính năng: walking skeleton trước

Dựng xuyên suốt một đường mỏng (DB -> API -> FE hiển thị) cho chạy được,
rồi mới mở rộng. Không làm xong toàn bộ backend mới đụng frontend.

## Chống scope creep

Agent không tự thêm tính năng ngoài yêu cầu. Thấy cần mở rộng thì đề xuất và hỏi.

## Commit convention (Conventional Commits)

Dạng: `type(scope): mô tả ngắn`. Ví dụ:
- `feat(posts): them endpoint tao bai viet`
- `fix(graph): sua loi thieu canh khi topic khong co con`
- `docs(runbook): cap nhat lenh build`

Các type hay dùng: feat, fix, docs, refactor, chore, test.

## Secrets

- Không bao giờ commit `.env` thật. Luôn cập nhật `.env.example` khi thêm biến mới.

## Definition of Done (một tính năng coi là xong khi)

1. Code chạy được, đọc dễ, đúng layering.
2. Có test tối thiểu cho phần logic (service).
3. Đã cập nhật README của module.
4. Đã cập nhật `runbook.md` nếu có thêm hoặc đổi script.

# AIE_Blog - Agent Contract

Đây là file đầu tiên mọi agent phải đọc trước khi làm việc trên repo này.
Mục tiêu: một personal website (second brain + portfolio) cho AI Engineer.
Kiến trúc: monorepo. Frontend Next.js, Backend FastAPI, DB PostgreSQL.

## Nguyên tắc tối cao

1. Không over-engineer. 100 dòng đọc dễ thắng 500 dòng thông minh. Tối ưu cho ĐỌC và BẢO TRÌ.
2. Không tự thêm tính năng ngoài yêu cầu. Nghi ngờ thì HỎI trước.
3. Code comment và convention viết bằng tiếng Anh. File `.md` viết bằng tiếng Việt.
4. Không dùng em dash trong code lẫn `.md`. Không spam icon. Chỉ dùng icon khi thật sự làm rõ nghĩa.
5. Mỗi thay đổi code phải cập nhật `.md` liên quan trong CÙNG commit (xem `docs/rules/workflow.md`).

## Bản đồ tài liệu (đọc theo nhu cầu)

- `docs/README.md`        : mục lục toàn bộ docs.
- `docs/rules/`           : luật code, luật docs, luật workflow.
- `docs/decisions/`       : các quyết định kiến trúc và lý do (ADR).
- `docs/runbook.md`       : techstack, chuẩn bị gì, chạy lệnh nào, vì sao.
- `docs/skills/`          : kinh nghiệm và ghi chú vận hành tích luỹ khi làm.

## Design system (đã chốt, không tự đổi)

- Vibe: Editorial Calm. Nền sáng "Paper" là mặc định, Dark làm sau.
- Accent: Refined Blue #2F5FE0 (hover #1E40AF).
- Signature motif: node-connector (chấm + đường nối), dùng chung cho Knowledge Graph.
- Mọi màu khai báo bằng CSS variables để bật Dark sau này không phải refactor.

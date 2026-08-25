# Docs - Mục lục

Đây là "bộ nhớ ngữ cảnh" của repo. Đọc file phù hợp với việc đang làm.

## Luật (rules/)

- `rules/coding.md`   : cách viết code (readability, naming, dependency, style).
- `rules/docs.md`     : cách viết và đồng bộ tài liệu `.md`.
- `rules/workflow.md` : quy trình làm việc, commit, Definition of Done.

## Quyết định kiến trúc (decisions/)

Mỗi file là một ADR (Architecture Decision Record) đánh số, ghi lại lý do.
Không xoá ADR cũ, chỉ đánh dấu "Superseded" khi thay bằng quyết định mới.

- `decisions/0001-architecture.md` : kiến trúc tổng thể.
- `decisions/0002-database.md`     : chọn PostgreSQL.
- `decisions/0003-design-system.md`: hệ thiết kế v1 (Editorial Calm), font, màu, tag.
- `decisions/0004-article-rendering.md`: mỗi bài là FE tùy biến (MDX) trong repo.

## Vận hành

- `runbook.md`  : techstack, yêu cầu môi trường, mọi script và lý do.
- `skills/`     : kinh nghiệm thực chiến (VPS khác lạ, lỗi hay gặp, mẹo).

## Quy tắc vàng về docs

Ngắn, cô đọng, trọng tâm. Một file `.md` không nên dài dòng.
Đổi code thì cập nhật `.md` liên quan ngay trong cùng commit.

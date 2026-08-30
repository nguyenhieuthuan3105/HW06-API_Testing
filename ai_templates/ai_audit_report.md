# AI Audit Report & AI Critique - HW06 API Testing

---

## I. AI DECLARATION (TUYÊN BỐ SỬ DỤNG AI)

Tôi tuyên bố có sử dụng các công cụ AI (như Gemini 3.7 Flash, ChatGPT, Claude, Cursor) để hỗ trợ quá trình thực hiện bài tập HW06 - API Testing theo đúng quy định Guiding Principles của môn học. Toàn bộ các kết quả sinh ra từ AI đều đã qua quá trình rà soát (Human Audit), kiểm thử thực tế (Execution) và đánh giá độc lập bởi sinh viên.

---

## II. AI AUDIT LOG (NHẬT KÝ TƯƠNG TÁC AI CHI TIẾT)

Mỗi phiên tương tác với AI hỗ trợ thực hiện bài tập lớn được ghi lại đầy đủ dưới đây theo thứ tự thời gian và phân nhóm giai đoạn công việc.

## Thiết lập môi trường, Lựa chọn API & Lập kế hoạch (Guiding & Environment Setup)

### Prompt 1:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 08:35 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  @[2026.HW06.API Testing_En.pdf] dựa vào file yêu cầu sau đây, lập 1 bản guiding hoàn chỉnh cho tôi biết mình cần phải làm gì, từng bước làm như thế nào, trình tự ra sao, file cần nộp có những gì. Phần phân tích toàn bộ cho vào trong 1 file guiding.md. Đồng thời chỉnh sửa file @[agent_skills/automation_audit_logs.md] cho phù hợp với bài tập hw06 hiện tại, và tiến hành thực thi log ngay.
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Phân tích toàn diện đề bài HW06 - API Testing:
     - 4 nguyên tắc cốt lõi: AI-First, Human Review, AI Audit Report, Anti-AI-Cheat.
     - Quy tắc chọn 3 API độc lập từ 3 Pools (Pool A, Pool B, Pool C) không trùng lặp trong nhóm.
     - Pipeline 5 giai đoạn cho mỗi API: Generate AI (>= 35 tests) -> Human Audit -> Extend (>= 5 tests) -> Execute Newman (kèm header X-Student-Id) -> Bug Report (GitHub Issues).
     - Các yêu cầu kỹ thuật: Postman Advanced features (Data-driven, Environments, Variables, Monitors, Mocks), CI/CD GitHub Actions (2 commit: Pass & Fail), Agent Skill tự động sinh test case (G9.5 Create), AI Critique (200-300 từ).
  2. Tạo tài liệu hướng dẫn hoàn chỉnh `guiding.md`:
     - Lộ trình 12 bước chi tiết từ setup, phân tích spec, prompting AI, audit, extension, Postman/Newman scripting, GitHub Issues, CI/CD, Agent Skill đến đóng gói nộp bài.
     - Bộ Prompt Templates chuẩn mực cho từng kỹ thuật kiểm thử API (Domain Partitioning, State Transitions, Security SEC-01..07, Schema Validation).
     - Script mẫu hoàn chỉnh cho Pre-request script (X-Student-Id), Test Assertions, JSON Schema Validation, GitHub Actions CI/CD YAML, Python Agent Skill generator.
     - Bảng Checklist deliverables, quy cách đặt tên file zip, và Assessment Template tự đánh giá.
  3. Cập nhật `agent_skills/automation_audit_logs.md` theo chuẩn HW06 và khởi tạo nhật ký `ai_templates/ai_audit_report.md`.
  ```

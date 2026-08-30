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

### Prompt 2:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 08:45 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  tôi cần thực hiện  fr.6 fr.9 fr.17.
  hãy chỉnh sửa lại file @[d:\STD\Y3\Y3S3\KiemThuPM\hw\hw6\guiding.md] cho phù hợp nhé. Danh sách các API được cung cấp nằm ở file @[help/api_specification.md] . Còn về phần đặc tả, bạn có thể xem ở dưới đây (nếu cần):
  "FR-06: Xem chi tiết sản phẩm
  Hiển thị đầy đủ: Ảnh lớn, Tên, Giá, Mô tả, Danh mục.
  Có ô nhập Số lượng (chỉ nhận số nguyên dương, tối thiểu là 1).
  Nút Thêm vào giỏ hàng — sau khi bấm hiển thị phản hồi trực quan (toast notification hoặc badge cập nhật).
  FR-09: Mã Giảm Giá (Coupon)
  Tại bước Checkout, người dùng có thể nhập mã giảm giá. Hệ thống áp dụng giảm giá dựa trên 5 điều kiện sau, tất cả phải thỏa mãn:

  #	Điều kiện	Mô tả
  C1	Mã tồn tại	Mã phải có trong CSDL và đang hoạt động (is_active = 1)
  C2	Còn hạn sử dụng	Ngày hiện tại phải trước expired_at
  C3	Đủ ngưỡng đơn hàng	Tổng đơn hàng >= (lớn hơn hoặc bằng) min_order_amount
  C4	Đã đăng nhập	Người dùng phải có JWT Token hợp lệ
  C5	Chưa dùng hết lượt	Số lần đã dùng mã này của user < max_uses_per_user
  Công thức tính giảm giá:

  Loại percent: discount_amount = total × discount_value / 100
  Loại fixed: discount_amount = discount_value
  final_amount = total - discount_amount
  Mã giảm giá mẫu trong hệ thống:

  Mã	Loại	Giá trị	Ngưỡng tối thiểu	Hạn dùng	Số lần/người
  SAVE10	percent	10%	300,000 ₫	2099-12-31	1
  BIGBUY	fixed	50,000 ₫	500,000 ₫	2099-12-31	1
  VIP100	fixed	100,000 ₫	300,000 ₫	2099-12-31	2
  EXPIRED	percent	20%	100,000 ₫	2020-01-01	1

  FR-17: Quản lý Mã Giảm Giá (Coupon CRUD)
  Admin có thể Thêm / Xem / Xóa mã giảm giá.
  Các trường bắt buộc: code (duy nhất), type (percent/fixed), discount_value (dương), expired_at, min_order_amount (>= 0), max_uses_per_user (>= 1).
  "
  Về thông tin đăn nhập nếu cần thiết:
  "
  Tổng quan Hệ thống
  Hệ thống EShop là nền tảng thương mại điện tử bao gồm 4 thành phần:

  Thành phần	Công nghệ	URL mặc định
  Backend API	Node.js + Express + SQLite	http://localhost:3000
  Frontend Web	React + Vite + Tailwind CSS	http://localhost:5173
  Web Admin	React + Vite + Tailwind CSS	http://localhost:5174
  Mobile App	React Native + Expo	IP LAN của máy chủ
  Tài khoản mặc định:

  Admin: admin@eshop.com / Admin123!
  User test: test@eshop.com / Test1234!"
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Điều chỉnh và chuyên biệt hóa toàn bộ tài liệu guiding.md cho bộ 3 APIs:
     - API 1 (Pool A - FR-06): Xem chi tiết sản phẩm (`GET /api/products/:id`) - Phân tích tham số path, boundary, SQLite SQLi, schema chi tiết sản phẩm.
     - API 2 (Pool B - FR-09): Áp dụng mã giảm giá (`POST /api/apply-coupon`) - Chi tiết hóa 5 ràng buộc cốt lõi (C1->C5), công thức tính percent/fixed, bộ dữ liệu coupon mẫu (SAVE10, BIGBUY, VIP100, EXPIRED), bảo mật Bearer JWT Token và IDOR.
     - API 3 (Pool C - FR-17): Quản lý mã giảm giá Admin CRUD (`POST/GET/DELETE /api/admin/coupons`) - Phân quyền RBAC (Admin vs User thường 403), toàn vẹn dữ liệu và kiểm tra ràng buộc trường.
  2. Tích hợp cấu hình môi trường SUT thực tế:
     - Backend Express + SQLite tại http://localhost:3000.
     - Tài khoản mặc định: Admin (admin@eshop.com / Admin123!) và User (test@eshop.com / Test1234!).
  3. Cập nhật bộ Prompt Templates, Postman Scripting, Data-Driven CSV mẫu, GitHub Actions YAML, Script Python Agent Skill và Bảng tự đánh giá số liệu riêng cho FR-06, FR-09, FR-17.
  ```

### Prompt 3:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:31 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  bay gio de bat dau toi can lam gi @[d:\STD\Y3\Y3S3\KiemThuPM\hw\hw6\guiding.md] @[help/2026.HW06.API Testing_En.pdf]
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung hướng dẫn khởi động:
  1. Xác định 3 bước hành động ngay:
     - Bước A (Scaffolding): Tự động tạo cấu trúc toàn bộ cây thư mục dự án (postman/, reports/, bugs/, evidences/, .github/workflows/, ai_templates/, README.md, report.md).
     - Bước B (SUT Environment): Kiểm tra và khởi chạy Backend Express SUT tại http://localhost:3000, kiểm tra 2 tài khoản mặc định và dữ liệu SQLite.
     - Bước C (Thực thi Pipeline API 1): Bắt đầu ngay việc sinh kịch bản >= 35 Test Cases cho FR-06 (GET /api/products/:id) theo 4 kỹ thuật.
  2. Đề xuất phương án thực hiện từng bước tuần tự để đảm bảo đúng quy chuẩn AI-First và Git Commit Log.
  ```

### Prompt 4:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:33 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  hay thuc hien buoc 1 nhe, con buoc 2 (khoi chay...) toi da hoan thanh xong va dang chay roi
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện Bước 1 (Scaffolding):
  1. Khởi tạo toàn bộ cấu trúc thư mục và file mẫu chuẩn của dự án HW06:
     - postman/: Tạo eshop_environment.json, data_driven_coupons.csv, postman_features_used.md.
     - .github/workflows/: Tạo file CI/CD pipeline api-test.yml.
     - reports/: Tạo cicd_report.md.
     - bugs/: Tạo bug_report.md và thư mục screenshots/.
     - evidences/: Tạo thư mục lưu bằng chứng anti-cheat.
     - agent_skills/: Tạo mã nguồn Python api_test_generator.py, sơ đồ/mã giả generator_pseudocode.md, demo_video_link.txt.
     - ai_templates/: Tạo ai_critique.md (200-300 từ).
     - Thư mục gốc: Tạo README.md với Bảng tự chấm điểm (Self-Assessment Table) và report.md (Báo cáo chính).
  2. Toàn bộ cây thư mục đã sẵn sàng để chuyển sang Bước 3: Triển khai kiểm thử chuyên sâu cho API 1 (FR-06).
  ```

# AI Audit Report & AI Critique - HW06 API Testing

---

## I. AI DECLARATION (TUYÊN BỐ SỬ DỤNG AI)

Tôi tuyên bố có sử dụng các công cụ AI (như Gemini 3.7 Flash, ChatGPT, Claude, Cursor) để hỗ trợ quá trình thực hiện bài tập HW06 - API Testing theo đúng quy định Guiding Principles của môn học. Toàn bộ các kết quả sinh ra từ AI đều đã qua quá trình rà soát (Human Audit), kiểm thử thực tế (Execution) và đánh giá độc lập bởi sinh viên.

---

## II. AI AUDIT REPORT (BÁO CÁO KIỂM THỬ BỞI AI)

### Sản phẩm 1 (Artifact 1): Thiết kế Kịch bản Kiểm thử Tự động cho API 1 — FR-06 (Xem chi tiết sản phẩm `GET /api/products/:id`)

- **(1) Prompt + Tool:**
  - **Tool:** Gemini 3.7 Flash (High) (Antigravity IDE)
  - **Thời gian:** 30/08/2026
  - **Prompt:** `Sinh bộ kịch bản kiểm thử API tự động tối thiểu 35 test cases cho tính năng FR-06: Xem chi tiết sản phẩm (GET /api/products/:id), bao phủ Domain Partitioning (ID = 1, 2, 0, -1, Float, Max Int 32-bit, string 'abc', UUID), State Transitions, Security SEC-01..07 (SQL Injection, Stacked Queries, Path Traversal) và JSON Schema Validation.`
- **(2) AI output:** AI sinh ra 39 test cases rất nhanh với cấu trúc JSON và phân nhóm logic. Tuy nhiên, AI mắc phải lỗi tư duy nghiêm trọng: **"Bẫy dung túng lỗi SUT" (Tolerant Assertion Anti-pattern)** — AI viết assertions chấp nhận đồng thời cả `200` và `404`/`400` (`pm.expect([200, 404]).to.include(pm.response.code)` hoặc `pm.expect([200, 400]).to.include(...)`) cho các ca kiểm thử ID không tồn tại hoặc ID chứa ký tự lạ/SQLi. Điều này khiến bài kiểm thử bị "pass giả tạo" (False Positive), hoàn toàn che giấu lỗi thực tế của SUT (SUT trả về HTTP `200 OK` với body `{}`). Ngoài ra, AI bỏ sót việc kiểm tra tính toàn vẹn kiểu dữ liệu trường `price` của sản phẩm ID=2.
- **(3) Kết luận:** CHƯA HOÀN THIỆN (INCOMPLETE) & KHÔNG HỢP LỆ (INVALID)
- **(4) Lý do:** AI có xu hướng "chiều theo phản hồi của server" và viết assertions quá lỏng lẻo nhằm tránh việc test suite bị fail, làm mất đi mục tiêu cốt lõi của kiểm thử là phát hiện lỗi (Defect Detection) theo chuẩn đặc tả RESTful API.
- **(5) Chỉnh sửa:** Tôi đã trực tiếp thực hiện Human Audit:
  - Sửa lại 11 test cases vi phạm từ Tolerant Assertions sang Strict Assertions (`pm.response.to.have.status(404)` cho ca ID không tồn tại và `pm.response.to.have.status(400)` cho ca ID chữ/SQLi).
  - Bổ sung 5 test cases mở rộng chuyên sâu (`TC_FR06_EXT_01..05`), bao gồm kiểm thử kiểu dữ liệu số học của trường `price`, bắt thành công **3 Bugs thực tế của SUT** (Bug 1: 200 rỗng khi ID sai; Bug 2: Thiếu validation chấp nhận SQLi; Bug 3: Trường `price` bị lưu dạng chuỗi `"28000000"`).

---

### Sản phẩm 2 (Artifact 2): Thiết kế Kịch bản Kiểm thử Ma trận Điều kiện & Data-Driven cho API 2 — FR-09 (Áp dụng mã giảm giá `POST /api/apply-coupon`)

- **(1) Prompt + Tool:**
  - **Tool:** Gemini 3.7 Flash (High) (Antigravity IDE)
  - **Thời gian:** 30/08/2026 - 31/08/2026
  - **Prompt:** `Thiết kế ma trận kiểm thử API tự động tối thiểu 35 test cases cho tính năng FR-09: Áp dụng mã giảm giá (POST /api/apply-coupon), bao phủ toàn diện 5 điều kiện kết hợp C1..C5, BVA trên tổng tiền đơn hàng (min_order = 300k, 299.999, 300.001, 0, âm, số cực lớn), Security SEC-01..07 (Auth Bearer JWT, IDOR sửa user_id, Parameter Tampering discount_amount) và Schema Chai.js kiểm tra công thức tính tiền chính xác.`
- **(2) AI output:** AI sinh ra 40 test cases với phân vùng dữ liệu tương đối đa dạng. Tuy nhiên, AI gặp phải 3 thiếu sót lớn:
  1. *Thiếu Script kiểm tra công thức số học sâu:* Không viết script Chai.js độc lập để tính toán lại `discount_amount` và `final_amount`, chỉ kiểm tra sơ sài `pm.response.to.have.status(200)`, dẫn đến ban đầu bỏ sót lỗi nghiêm trọng của SUT (công thức tính percent của SUT bị âm `(1 - discount_value)` làm đơn 500k bị đội lên 5 triệu).
  2. *Thiếu kịch bản xác thực Auth Điều kiện C4:* AI tự động chèn Token vào mọi request mà không tạo đầy đủ các ca vi phạm thiếu Header `Authorization`, gửi Token giả, Token hết hạn để kiểm tra phản hồi `401 Unauthorized`.
  3. *Lỗi so sánh giá trị biên C3:* Bỏ sót ca kiểm thử tại đúng điểm biên `total_amount == min_order_amount` (300,000 ₫).
- **(3) Kết luận:** CHƯA HOÀN THIỆN (INCOMPLETE)
- **(4) Lý do:** AI chỉ tập trung sinh biến thể payload mà thiếu năng lực mô phỏng tính toán logic nghiệp vụ độc lập (Deep Business Logic Assertion) và chưa bao quát các lỗ hổng phân quyền đa tầng.
- **(5) Chỉnh sửa:** Tôi đã tiến hành hiệu chỉnh:
  - Viết lại 8 test cases nghiệp vụ với script Chai.js tính toán số học độc lập: `pm.expect(data.discount_amount).to.equal(50000)` và `pm.expect(data.final_amount).to.equal(450000)`.
  - Bổ sung 5 test cases mở rộng (`TC_FR09_EXT_01..05`) kiểm tra biên C3, Auth C4, IDOR và tích hợp bộ dữ liệu Data-Driven CSV 10 Iterations (`data_driven_coupons.csv`), bắt trọn **3 Bugs thực tế của SUT** (Bug 4: Auth Bypass C4; Bug 5: Công thức tính % ra số âm; Bug 6: Lỗi so sánh biên `>` thay vì `>=`).

---

### Sản phẩm 3 (Artifact 3): Thiết kế Kịch bản Kiểm thử Chuỗi Trạng thái CRUD & Phân quyền RBAC cho API 3 — FR-17 (Quản lý Mã giảm giá Admin `POST/GET/DELETE /api/admin/coupons`)

- **(1) Prompt + Tool:**
  - **Tool:** Gemini 3.7 Flash (High) (Antigravity IDE)
  - **Thời gian:** 31/08/2026
  - **Prompt:** `Thiết kế bộ kịch bản kiểm thử API tự động cho FR-17: Quản lý mã giảm giá Admin CRUD (POST/GET/DELETE /api/admin/coupons), bao phủ chuỗi trạng thái vòng đời 6 bước (Tạo -> Xem -> Sửa -> Xóa -> Kiểm tra biến mất 404), Phân quyền RBAC (Admin vs User thường 403), BVA toàn bộ các trường (discount_value, min_order_amount, max_uses_per_user, expired_at) và xử lý lỗi CSDL.`
- **(2) AI output:** AI sinh ra 40 test cases nhưng mắc các lỗi kiến trúc nghiêm trọng:
  1. *Lỗi đụng độ CSDL SQLite (Non-Idempotency):* AI hardcode mã coupon `code: "SAVE20"` cố định trong body tạo mới, khiến test suite khi chạy Newman lần thứ 2 bị văng lỗi CSDL `500 Internal Server Error (UNIQUE constraint failed)`.
  2. *Đứt gãy chuỗi trạng thái CRUD:* Các request POST và DELETE nằm rời rạc, không sử dụng biến môi trường Postman (`pm.environment.set("created_coupon_id", data.id)`) để truyền ID động giữa các bước.
  3. *Bỏ sót kiểm thử leo quyền RBAC:* Không tạo kịch bản dùng Token của User thông thường gọi vào API Admin để kiểm tra cơ chế chặn phân quyền.
- **(3) Kết luận:** CHƯA HOÀN THIỆN (INCOMPLETE) & KHÔNG HỢP LỆ (INVALID)
- **(4) Lý do:** AI thiếu nhận thức về tính bền vững (Persistence) của CSDL SQLite giữa các lần thực thi lặp lại và chưa làm chủ kỹ thuật quản lý biến môi trường động trong Postman Collection Runner.
- **(5) Chỉnh sửa:** Tôi đã tái cấu trúc 14 test cases:
  - Tích hợp hàm sinh mã động kèm Timestamp `Date.now()` trong Pre-request script để đảm bảo tính **Bất biến (Idempotency 100%)**.
  - Xây dựng chuỗi kịch bản CRUD 6 bước liên hoàn với biến môi trường `created_coupon_id`.
  - Bổ sung các kịch bản kiểm thử RBAC User thường (`TC_FR17_SEC_01..02`) và 5 ca mở rộng (`TC_FR17_EXT_01..05`), phát hiện **3 Bugs thực tế của SUT** (Bug 7: User thường gọi được API Admin tạo/xóa mã; Bug 8: Lỗi 500 & rò rỉ CSDL khi trùng code; Bug 9: Thiếu validation cho phép giảm > 100%, ngưỡng đơn âm).

---

### Sản phẩm 4 (Artifact 4): Xây dựng Cấu hình CI/CD Pipeline GitHub Actions & Tự Động Hóa Thực Thi Báo Cáo HTML

- **(1) Prompt + Tool:**
  - **Tool:** Gemini 3.7 Flash (High) (Antigravity IDE)
  - **Thời gian:** 31/08/2026 - 01/09/2026
  - **Prompt:** `Xây dựng workflow CI/CD GitHub Actions (.github/workflows/api-test.yml) tự động clone SUT backend, khởi động server ngầm tại port 3000, chạy Newman CLI cho cả 3 collections (FR-06, FR-09, FR-17), tải artifacts báo cáo HTML Extra và cấu hình 2 lần chạy: 1 lần Pass toàn bộ và 1 lần Fail do test case bắt lỗi SUT.`
- **(2) AI output:** AI sinh ra file YAML ban đầu nhưng gặp sự cố thực thi trên GitHub runner:
  1. *Lỗi ngắt tiến trình ngầm:* Dùng `npm start &` bị ngắt tiến trình khi shell background đóng lại.
  2. *Cảnh báo môi trường cũ:* Cấu hình Node.js 18.x bị cảnh báo deprecated trên runner `ubuntu-latest`.
  3. *Lỗi Race Condition khởi động server:* Dùng lệnh chờ `sleep 5` thụ động khiến Newman chạy trước khi server SUT kịp kết nối CSDL SQLite.
- **(3) Kết luận:** CHƯA HOÀN THIỆN (INCOMPLETE)
- **(4) Lý do:** AI áp dụng template CI/CD tổng quát chưa qua kiểm chứng thực tế với môi trường máy ảo Ubuntu headless và thiếu công cụ kiểm tra cổng mạng chủ động.
- **(5) Chỉnh sửa:** Tôi đã tối ưu hóa pipeline:
  - Nâng cấp runner lên **Node.js 20.x**.
  - Chuyển lệnh khởi động sang `node server.js &` và sử dụng `npx wait-on tcp:3000 -t 30000` để đảm bảo cổng 3000 đã sẵn sàng 100%.
  - Thiết lập cờ `--suppress-exit-code` cho commit Pass (🟢) và chạy kịch bản bắt 25 lỗi của FR-06 cho commit Fail (🔴), tạo thành công 2 ảnh minh chứng [`cicd_all_passed.png`](file:///d:/STD/Y3/Y3S3/KiemThuPM/hw/hw6/evidences/cicd_all_passed.png) và [`cicd_one_failed.png`](file:///d:/STD/Y3/Y3S3/KiemThuPM/hw/hw6/evidences/cicd_one_failed.png).

---

### Sản phẩm 5 (Artifact 5): Đóng gói Universal AI-Driven API Test Generator Agent Skill (Level G9.5 Create)

- **(1) Prompt + Tool:**
  - **Tool:** Gemini 3.7 Flash (High) (Antigravity IDE) & Node.js Engine
  - **Thời gian:** 01/09/2026
  - **Prompt:** `Xây dựng Universal Agent Skill (api_test_generator.js, SKILL.md, README.md, api_specification_template.md, generator_pseudocode.md) nhận bất kỳ file đặc tả API nào qua cờ --spec <path>, tự động kiểm tra môi trường (Step 0), sinh tối thiểu 35 test cases đa chiều, xuất file tài liệu Markdown [feature]_api_test_case.md TRƯỚC làm Single Source of Truth, đóng gói Collection JSON v2.1.0 và chạy Newman xuất HTML report.`
- **(2) AI output:** AI ban đầu triển khai bằng Python và có thiên kiến kiểm thử hộp trắng (White-box mentality): cố tình tìm cách đọc mã nguồn Backend của SUT (`server.js`, `/controllers`), sinh các script tạm thử-sai gây yêu cầu xác nhận `.fs` nhiều lần, và đảo lộn quy trình khi ghi Collection JSON trước file Markdown.
- **(3) Kết luận:** CHƯA HOÀN THIỆN (INCOMPLETE)
- **(4) Lý do:** AI bị vướng vào thói quen phân tích code nội bộ (White-box bias) khi không tự tin về việc suy luận schema động, đồng thời thiếu cơ chế quản lý vòng đời ghi file tuần tự theo chuẩn thác nước.
- **(5) Chỉnh sửa:** Tôi đã trực tiếp tái thiết kế toàn diện Agent Skill:
  - Chuyển đổi 100% sang JavaScript/Node.js độc lập (`agent_skills/api_test_generator/api_test_generator.js`).
  - Bổ sung **3 Ràng buộc Kỹ thuật nghiêm ngặt** vào `SKILL.md`: *Strict Pure Black-Box Testing* (cấm duyệt mã nguồn backend), *Clean Execution Environment* (không sinh file tạm), và *Sequential Pipeline Rule* (bắt buộc xuất file Markdown Test Cases TRƯỚC làm Single Source of Truth rồi mới đóng gói Collection JSON).
  - Hoàn thiện bộ Engine tổng quát hóa 100%, tự động suy luận kiểu dữ liệu (`String`, `Number`, `Boolean`, `Object`) từ payload bất kỳ để sinh trọn vẹn ma trận Domain, BVA, Security SEC-01..07, Schema và SLA.

---

### Tổng kết và Kết luận

**1. Tỷ lệ chính xác của AI (AI Accuracy Ratio):**
Dựa trên 5 Artifacts cốt lõi trong quá trình thực thi bài tập HW06:

- **VALID:** ~20% (AI làm tốt ở phần sinh khung dữ liệu JSON, cú pháp Postman Collection schema v2.1.0 và tài liệu tổng quan ban đầu).
- **INVALID:** ~20% (Các lỗi nghiêm trọng: Bẫy dung túng lỗi SUT *Tolerant Assertion Anti-pattern*, Hardcode payload gây lỗi *Non-Idempotency* CSDL SQLite, và thiên kiến cố tình đọc mã nguồn backend vi phạm Black-box).
- **INCOMPLETE:** ~60% (Thiếu logic tính toán số học sâu, bỏ sót kịch bản xác thực Auth C4, thiếu kiểm thử phân quyền RBAC đa vai trò, lỗi thiết lập CI/CD runner và đảo lộn thứ tự quy trình tạo tài liệu).

**2. Kết luận:**
Qua quá trình kiểm toán toàn diện các phiên tương tác AI trong bài tập HW06, tôi rút ra các nguyên tắc cốt lõi:

- **KHI NÀO NÊN DÙNG AI:** AI phát huy tối đa hiệu quả trong việc tạo khung kịch bản nhanh (Scaffolding), sinh ma trận phân vùng tương đương cơ bản, trích xuất cấu trúc dữ liệu JSON Schema, và hỗ trợ soạn thảo tài liệu kỹ thuật chuẩn mực.
- **KHI NÀO KHÔNG NÊN DÙNG AI:** Tuyệt đối không giao phó hoàn toàn cho AI việc viết assertions logic nghiệp vụ (nhất là công thức tính toán tiền tệ và kiểm tra biên chặt chẽ) hoặc kiểm tra phân quyền bảo mật (RBAC, IDOR). AI rất dễ rơi vào bẫy "dung túng lỗi" để giữ cho test case pass, hoặc hardcode dữ liệu làm mất tính bất biến của hệ thống.
- **VAI TRÒ CỦA CON NGƯỜI (HUMAN-IN-THE-LOOP):** Sự can thiệp của Kỹ sư QA con người thông qua việc rà soát độc lập (Human Audit), siết chặt Assertions theo đúng đặc tả, và bổ sung các kịch bản kiểm thử biên chuyên sâu (Human Extension) là yếu tố quyết định để biến các kịch bản sinh tự động thành công cụ săn lỗi (Bug Hunting) thực thụ trên hệ thống SUT.

---

## III. AI AUDIT LOG (NHẬT KÝ TƯƠNG TÁC AI CHI TIẾT)

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

---

## Sinh kịch bản kiểm thử API bằng AI (Prompting >= 35 Test Cases / API)

### Prompt 5:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:40 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  Tôi đang thực hiện kiểm thử API cho tính năng FR-06: Xem chi tiết sản phẩm của hệ thống EShop.
  - Endpoint: GET /api/products/:id
  - Mô tả: Trả về thông tin chi tiết của sản phẩm (id, name, price, description, imageUrl, category_id).

  Hãy áp dụng các kỹ thuật kiểm thử API chuyên nghiệp để thiết kế ít nhất 35 test cases cho endpoint này, chia theo 4 nhóm:
  1. Domain Partitioning & Boundary Value Analysis trên tham số Path :id (ID hợp lệ 1..N, ID = 0, ID âm, ID cực lớn, ID là chuỗi chữ, ID chứa ký tự đặc biệt, ID là số thực thập phân).
  2. State Transitions & Existence (Sản phẩm đang bán, sản phẩm hết hàng, sản phẩm đã bị xóa khỏi hệ thống -> 404).
  3. Security Testing SEC-01..07 (Tấn công SQL Injection qua path :id như "1 OR 1=1", "1; DROP TABLE products", XSS payload, DoS request spam).
  4. Schema Validation (Kiểm tra Response JSON Schema có đủ các trường bắt buộc, đúng kiểu dữ liệu, status code 200/400/404).

  Xuất kết quả dạng bảng Markdown: TestID, Tên Test Case, Kỹ thuật áp dụng, Path Param (:id), Expected Status Code, Expected Response / Schema Assertion.
  "Lập Bảng Human Audit (phân loại VALID / INVALID / INCOMPLETE và giải trình sửa lỗi). Bổ sung ≥5 Test Cases mở rộng tự thiết kế." 2 việc này sẽ do tôi tự mình thực hiện
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung sinh kịch bản cho API 1 (FR-06: GET /api/products/:id):
  1. Thiết kế tổng cộng 39 Test Cases chuyên sâu (vượt chỉ tiêu >= 35 TCs):
     - Nhóm 1 (Domain Partitioning & Boundary Values - 15 TCs): Bao phủ ID hợp lệ (1, 2, 10), biên 0, số âm (-1, -99999), biên 32-bit (2147483647, 2147483648), số cực lớn 64-bit/overflow, số thực thập phân (1.5, 1.0), chuỗi chữ (abc), alphanumeric (prod123), UUID và ký tự đặc biệt.
     - Nhóm 2 (State Transitions & Existence - 8 TCs): Sản phẩm active, hết hàng, không tồn tại (999999), soft-deleted, category bị xóa, kiểm tra tính Idempotent, tạo mới và xóa cứng.
     - Nhóm 3 (Security SEC-01..07 - 10 TCs): Chống SQL Injection (Tautology 1 OR 1=1, Comment '--', Union-based, Stacked queries DROP TABLE, SQLite Time-based DoS), XSS trong path, Path Traversal, Null byte, Buffer overflow DoS và Error handling disclosure.
     - Nhóm 4 (Schema Validation & Protocols - 6 TCs): JSON Schema validation (id, name, price, description, imageUrl, category_id), 404/400 schemas, HTTP Method 405, Content-Type header và Response time < 500ms.
  2. Xuất dữ liệu bảng Markdown chi tiết để phục vụ sinh viên tự thực hiện Human Audit và Extension.
  ```

### Prompt 6:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:42 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  chuyển hết danh sách các test case bạn vừa tạo ra ở trên vào trong file fr_06_api_test_case.md cho tôi
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Tạo file fr_06_api_test_case.md chứa toàn bộ 39 test cases của tính năng FR-06 (GET /api/products/:id).
  2. Đầy đủ bảng phân loại 4 nhóm kỹ thuật:
     - Nhóm 1: Domain Partitioning & Boundary Values (15 TCs).
     - Nhóm 2: State Transitions & Existence (8 TCs).
     - Nhóm 3: Security Testing SEC-01..07 (10 TCs).
     - Nhóm 4: Schema Validation & Protocols (6 TCs).
  3. Bổ sung đoạn mã Postman Test Script mẫu xác thực JSON Schema bằng thư viện Ajv cho sinh viên sử dụng khi import vào Postman.
  ```

### Prompt 18 (Sinh kịch bản cho API 2 - FR-09: POST /api/apply-coupon):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:34 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  Tôi đang thực hiện kiểm thử API cho tính năng FR-09: Áp dụng mã giảm giá của hệ thống EShop.
  - Endpoint: POST /api/apply-coupon
  - Headers: Authorization: Bearer <user_token>, Content-Type: application/json
  - Body: {"code": "SAVE10", "total_amount": 500000, "user_id": 1}
  - 5 Ràng buộc điều kiện (Tất cả phải thỏa mãn): C1 (Active), C2 (Hạn dùng), C3 (Ngưỡng đơn), C4 (Đăng nhập), C5 (Lượt dùng)
  - Mã mẫu: SAVE10 (10%, min 300k), BIGBUY (50k, min 500k), VIP100 (100k, min 300k, max 2), EXPIRED (20%, hạn 2020-01-01).
  - Công thức: percent và fixed.

  Hãy thiết kế ít nhất 35 test cases bao phủ toàn diện: Ma trận kết hợp C1-C5, BVA trên total_amount, Security SEC-01..07 (IDOR, Auth bypass, SQLi, Tampering), Schema Validation & Chai.js math.
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung sinh kịch bản cho API 2 (FR-09: POST /api/apply-coupon):
  1. Thiết kế tổng cộng 40 Test Cases chuyên sâu (vượt chỉ tiêu >= 35 TCs) được lưu trữ tại file fr_09_api_test_case.md:
     - Nhóm 1 (Ma trận 5 Điều kiện C1-C5 - 14 TCs): Bao phủ thỏa mãn cả 5 điều kiện (SAVE10, BIGBUY, VIP100), vi phạm đơn lẻ từng điều kiện C1 (mã sai/inactive), C2 (hết hạn EXPIRED), C3 (dưới min 300k), C4 (không token 401), C5 (hết lượt) và vi phạm kết hợp nhiều điều kiện (C1+C3, C2+C3, C3+C4), kiểm tra lượt dùng đa lần VIP100 (lần 1 và lần 2).
     - Nhóm 2 (BVA & Domain trên total_amount - 10 TCs): Biên chính xác 300k, biên dưới 299,999, biên trên 300,001, bằng 0, số âm (-1, -500k), số cực lớn 999,999,999, số thập phân 500000.50, sai kiểu dữ liệu chữ và thiếu trường bắt buộc.
     - Nhóm 3 (Security Testing SEC-01..07 - 10 TCs): Lỗ hổng IDOR SEC-03 (Token User 1 gửi user_id=2), Auth missing/tampered/expired SEC-02, SQL Injection SEC-01 (Tautology, Stacked queries), Client-side Parameter Tampering SEC-04 (gửi discount_amount khống), XSS trong code, Race condition SEC-06 và Error disclosure SEC-07.
     - Nhóm 4 (Schema Validation & Math Logic - 6 TCs): JSON Schema Ajv, công thức tính toán % và fixed chính xác 100%, Error schema 400/401, HTTP method 405 và SLA response time < 500ms.
  2. Xuất dữ liệu bảng Markdown chi tiết kèm mã Postman Chai.js assertion mẫu xác thực công thức tính toán tiền tệ.
  ```

### Prompt 25 (Sinh kịch bản cho API 3 - FR-17: Admin Coupon CRUD):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 21:50 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  Tôi đang thực hiện kiểm thử API cho tính năng FR-17: Quản lý mã giảm giá Admin của hệ thống EShop.
  - Endpoints: POST /api/admin/coupons, GET /api/coupons, DELETE /api/admin/coupons/:id
  - Yêu cầu Header: Authorization: Bearer <admin_token>

  Hãy thiết kế ít nhất 35 test cases bao phủ toàn diện: Domain Partitioning, CRUD State Flow, Security & RBAC, Schema Validation.
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung sinh kịch bản cho API 3 (FR-17: Admin Coupon CRUD):
  1. Thiết kế tổng cộng 40 Test Cases chuyên sâu (vượt chỉ tiêu >= 35 TCs) được lưu trữ tại file fr_17_api_test_case.md:
     - Nhóm 1 (Domain Partitioning & Boundaries khi Tạo Mã - 16 TCs): Tạo mã percent/fixed hợp lệ, code rỗng/trùng UNIQUE, type sai enum, discount_value = 0 / < 0 / > 100% / = 100%, min_order = 0 / < 0, max_uses = 0 / < 0, expired_at quá khứ và sai định dạng ngày.
     - Nhóm 2 (CRUD Lifecycle Flow - 8 TCs): Chuỗi 6 bước trọn vẹn (Tạo mã -> Kiểm tra có trong List -> Áp dụng thành công -> Xóa mã -> Kiểm tra biến mất khỏi List -> Áp dụng lại báo lỗi 404), xóa với ID 999999 và ID chữ cái.
     - Nhóm 3 (Security & RBAC - 10 TCs): Phân quyền RBAC (User thường gọi POST/DELETE bị 403 Forbidden), thiếu token (401 Unauthorized), token giả mạo, token hết hạn, SQLi trong code và param id xóa, Information disclosure.
     - Nhóm 4 (Schema Validation & Protocols - 6 TCs): JSON Schema cho cả 3 endpoints POST (message, id), GET (mảng 8 trường), DELETE (message), HTTP method compliance PUT 405, Content-Type và SLA < 500ms.
  2. Xuất dữ liệu bảng Markdown chi tiết kèm mã Postman Chai.js assertion mẫu xác thực schema danh sách coupon.
  ```

---

## Rà soát (Audit) & Mở rộng (Extend >= 5 Test Cases) kịch bản kiểm thử

### Prompt 7:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 11:02 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  đối với phần NHÓM 1, các test case có expected status ngoài 200 ok thì còn có trường hợp 404 not found (này vẫn là hợp lệ) nếu như db thật sự không có sản phẩm đó (vd sut eshop chỉ có 5 sản phẩm, thì khả năng id:10 sẽ ra 404).

  Ở nhóm thứ 2, có 1 số test case không được thực tế lắm: ví dụ check stock (sut không có stock), admin ẩn sản phẩm (hoàn toàn không có)
  Đây là kết quả thực tế trả về của 1 response:
  "{
      "id": 1,
      "name": "iPhone 15 Pro Max",
      "price": 30000000,
      "description": "Điện thoại cao cấp của Apple",
      "imageUrl": "https://placehold.co/300x300/png?text=iPhone+15",
      "category_id": 1
  }"
  có khá nhiều test case bị hallucinate, hãy rà soát lại và đánh dấu
  Ghi nhận những cái này vào @[human_fix.md] 

  Bây giờ tôi đang không biết nên tạo thêm 5 test case nào, bạn có thể gợi ý giúp tôi được không? Chạy thử khi tắt server rồi check xem có trả lỗi server down không có được tính là 1 test case không?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Phân tích rà soát con người (Human Audit) trên thực tế phản hồi của SUT:
     - Chỉ ra và gắn nhãn INVALID cho 2 test cases ảo giác của AI: TC_FR06_ST_02 (bịa đặt trường stock) và TC_FR06_ST_04 (bịa đặt tính năng soft-delete/ẩn sản phẩm).
     - Gắn nhãn INCOMPLETE cho TC_FR06_DP_03 (phụ thuộc vào số lượng seed data thực tế trong DB) và TC_FR06_DP_11 (xử lý số thực 1.0).
  2. Tạo tài liệu human_fix.md ghi nhận toàn bộ Bảng Human Audit 39 test cases và bản sửa lỗi chuẩn hóa.
  3. Giải đáp câu hỏi về ca kiểm thử 'Tắt server': Đây là kiểm thử hạ tầng/sẵn sàng (Resilience), gây lỗi kết nối TCP (ECONNREFUSED) không có HTTP response nên KHÔNG được tính là test case API chức năng.
  4. Đề xuất 6 test cases mở rộng (Human Extension) chuyên sâu:
     - Leading zeros / Octal confusion (id=00001).
     - SQLi Boolean-Blind SQLite (id=1 AND 1=1).
     - URL-encoded Whitespace (id=%201%20).
     - Unicode Full-Width digit (id=１ U+FF11).
     - Caching Header ETag / If-None-Match (304 Not Modified).
     - Concurrent requests kiểm tra SQLite database file locking.
  ```

### Prompt 8:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 11:36 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  bỏ cái thứ 06 đi, còn cái thứ 05 thực sự là làm gì, kiểm tra như thế nào vậy?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Điều chỉnh file human_fix.md để giữ lại chuẩn 5 Test Cases mở rộng (loại bỏ TC_FR06_EXT_06 concurrency).
  2. Giải thích chi tiết bản chất kỹ thuật của TC_FR06_EXT_05 (Conditional Caching với ETag và If-None-Match):
     - Cơ chế: Express.js tự động tạo mã băm ETag cho nội dung phản hồi. Client gửi lại mã ETag này trong header If-None-Match để server đối chiếu.
     - Kỳ vọng: Nếu dữ liệu sản phẩm chưa thay đổi, Server phản hồi mã HTTP 304 Not Modified kèm body rỗng để tiết kiệm băng thông mạng.
     - Hướng dẫn thực thi 2 bước trong Postman: Request 1 lưu ETag vào biến môi trường; Request 2 gửi kèm header If-None-Match: {{product_1_etag}} và viết assertion kiểm tra status code 304/200.
  ```

### Prompt 9:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 11:40 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  cập nhật thêm 5 cái này vòa @[d:\STD\Y3\Y3S3\KiemThuPM\hw\hw6\fr_06_api_test_case.md] , sau đó cho tôi biết tính khả thi của việc chạy 1 run collection chứa các test case này
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Cập nhật file fr_06_api_test_case.md thành tổng cộng 44 Test Cases hoàn chỉnh (39 test cases AI đã qua Audit + 5 test cases Human Extension).
  2. Đánh giá tính khả thi (Feasibility Analysis) của việc chạy 1 lần Postman Collection Runner / Newman:
     - Tính khả thi: 100% khả thi và rất tối ưu (thời gian thực thi chỉ mất khoảng 1.5 - 3 giây cho 44 requests trên localhost).
     - Phân tích phụ thuộc thứ tự: Đặt Request lấy ETag trước Request kiểm tra If-None-Match; các test case đọc (GET) không làm biến đổi CSDL (Idempotent) nên chạy tuần tự hoàn toàn an toàn.
     - Dự đoán kết quả thực tế & Săn Bug: Một số ca kiểm thử SQLi/Chuỗi có thể trả về 500 thay vì 400 do backend Express/SQLite chưa bắt lỗi kỹ -> Đây chính là cơ sở để báo cáo Bug Report hợp lệ.
  ```

### Prompt 19 (Rà soát & Mở rộng Kịch bản FR-09):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 11:06 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  chỉ tập trung về phần api req và res, tái kiểm tra mọi test case mà bạn đã tạo ra trong @[d:\STD\Y3\Y3S3\KiemThuPM\hw\hw6\fr_09_api_test_case.md] có hợp lệ không? có thể gợi ý cho tôi 5 test case không?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung rà soát & đề xuất mở rộng FR-09:
  1. Rà soát cấu trúc Request & Response thực tế trên SUT:
     - Chuẩn hóa Response Schema: SUT trả về `{ success: true, coupon_id, discount_amount, final_amount, message }` thay vì key `valid` hay `original_total` của AI sinh.
     - Phát hiện lỗ hổng C4: SUT thực tế không gắn middleware authenticateToken (đây là Security Bug cần săn).
     - Cơ chế C5: Bảng coupon_usage chỉ được ghi khi gọi API riêng /api/coupon-usage, do đó test case hết lượt cần có Pre-request script để trigger lịch sử sử dụng.
  2. Đề xuất 5 Test Cases Mở Rộng độc đáo (Human Extension):
     - EXT_01: Bắt lỗi toán tử so sánh biên `total_amount == min_order_amount` (300k vs 300k).
     - EXT_02: Giảm giá Fixed lớn hơn đơn hàng (`final_amount >= 0`).
     - EXT_03: Chuẩn hóa chữ thường/hoa (`save10` vs `SAVE10`).
     - EXT_04: Lọc khoảng trắng thừa (`" SAVE10 "`).
     - EXT_05: Kiểm thử tự động Data-Driven Testing quét 10 bộ dữ liệu từ file CSV data_driven_coupons.csv.
  ```

### Prompt 23 (Ghi nhận Rà soát Chống Assertion Lỏng lẻo vào Human Fix):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 21:42 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  ghi nhận luôn phần chưa xác định chặt các điều kiện status code... ở phía trên vào human_fix nữa nhé
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Cập nhật tài liệu human_fix.md và help/human_fix.md ghi nhận chi tiết bản phân tích Rà soát Con người (Human Audit) cho cả FR-06 và FR-09.
  2. Bổ sung mục phân tích kỹ thuật quan trọng: "Chống lỗi Assertion lỏng lẻo (Tolerant Assertion Anti-Pattern)":
     - Phân tích nguyên nhân: Việc dùng `pm.expect([200, 401]).to.include(code)` khiến các lỗi nghiêm trọng của SUT (như thiếu Auth C4 trả về 200, lỗi toán học %, lỗi so sánh biên C3) bị đánh giá nhầm là PASSED (False Positive).
     - Giải pháp Human Fix: Chuyển toàn bộ assertions sang chuẩn nghiêm ngặt theo đặc tả (Strict Specification Assertions), giúp Newman bắt trúng 100% các lỗi thực tế để đưa vào Bug Report.
  3. Cung cấp đầy đủ Bảng Audit 40 test cases FR-09 và 5 test cases Human Extension.
  ```

---

## Xây dựng Postman Collection, Environments & Advanced Scripting

### Prompt 10:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 11:44 30/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  TC_FR06_ST_07	Xem sản phẩm ngay sau khi Admin vừa tạo mới	State: Post-Creation	{newly_created_id}	200 OK	Dữ liệu trả về đúng với thông tin Admin vừa tạo
  TC_FR06_ST_08	Xem sản phẩm ngay sau khi Admin vừa xóa vĩnh viễn	State: Post-Hard-Delete	{deleted_id}	404 Not Found	Chuyển trạng thái sang không tồn tại ngay lập tức
  có 1 cắp testcase yêu cầu sửa đổi dữ liệu như thế này, ta có thể xử lý như thế nào? tạo thêm 1 sản phẩm trong pre-request, sau đó chạy TC_FR06_ST_07, rồi xóa sp đó ở post-response, sau đó chạy TC_FR06_ST_08	?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung hướng dẫn xử lý State Transitions:
  1. Xác nhận ý tưởng của sinh viên (Setup/Teardown Pattern qua Pre-request và Post-response) là hoàn toàn chính xác và rất chuyên nghiệp.
  2. Phân tích và hướng dẫn 2 phương án thực thi trong Postman:
     - Cách 1 (Khuyến nghị chuẩn Postman Flow): Tạo chuỗi 4 Requests tuần tự trong sub-folder (POST tạo SP -> GET kiểm tra 200 -> DELETE xóa SP -> GET kiểm tra 404). Hiển thị trực quan 100% trên báo cáo Newman HTML.
     - Cách 2 (Dùng pm.sendRequest trong Script): Viết pm.sendRequest() trong Pre-request của ST_07 để POST tạo SP, và trong Tests script của ST_07 để DELETE xóa SP trước khi ST_08 chạy.
  3. Cung cấp đoạn mã JavaScript hoàn chỉnh cho cả 2 phương án để sinh viên dễ dàng áp dụng.
  ```

### Prompt 11:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:11 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  tôi muốn mỗi collection chỉ tập trung vào xử lý đúng việc của nó là được, các việc setup và dọn dẹp hãy cứ để vào prerequest và postresponse. Chiếu theo hướng dẫn @[d:\STD\Y3\Y3S3\KiemThuPM\hw\hw6\guiding.md] và @[help/2026.HW06.API Testing_En.pdf] thì tôi nên làm gì tiếp theo, tiếp tục yêu cầu bạn thực hiện tọa test case cho fr09 hay yêu cầu bạn chuyển hóa các test case vừa rồi thành bộ collection & envitronment để chạy trên postman?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung tư vấn lộ trình:
  1. Thống nhất phương án kỹ thuật: Tích hợp logic Setup (tạo SP tạm) vào Pre-request script và Teardown (xóa SP tạm) vào Post-response script để giữ danh sách Collection thuần túy 44 test cases của endpoint FR-06.
  2. Phân tích lộ trình chuẩn theo PDF Đề bài & guiding.md (Tiêu chuẩn Section 6 & 12 - Git Commit per step):
     - Khuyến nghị thực hiện theo chu trình trọn vẹn từng API (Per-API Full Pipeline): Chuyển hóa 44 test cases của FR-06 thành Postman Collection JSON & Environment -> Chạy thử trên Newman -> Bắt lỗi SUT thực tế.
     - Lợi ích: Đảm bảo luồng kiểm thử thực tế hoạt động trơn tru, có ngay bằng chứng HTML report và commit Git cho API 1 trước khi mở rộng sang API 2 (FR-09).
  ```

### Prompt 12:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:16 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  hãy làm như thế nhé:
  chuyển hóa ngay 44 test cases của FR-06 thành file postman/fr06_product_detail_collection.json hoàn chỉnh kèm scripts Pre-request (tự inject header X-Student-Id và setup/teardown ngầm), sẵn sàng để bạn chạy thử nghiệm với Newman.
  Tạo luôn cả file environement nêu cần thiết. Mỗi test case đều phải có các script test đầy đủ. Các test case đặc biệt yêu cầu cả pre request và post response cũng cần được lưu ý. 
  Ngoài ra có 1 câu hỏi về cấu trúc. Mỗi fr sẽ có 1 file collection riêng hay sẽ là 2 folder collections lồng vào 1 collection tổng? file environment sẽ được xây dựng cho từng fr hay dùng chung. 
  Thực hiện ngay giúp tôi nhé
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Tạo file Postman Collection hoàn chỉnh postman/fr06_product_detail_collection.json gồm 44 requests được phân chia thành 5 sub-folders:
     - 01_Domain_Partitioning_and_Boundaries (15 TCs).
     - 02_State_Transitions_and_Existence (8 TCs).
     - 03_Security_Testing_SEC_01_to_07 (10 TCs).
     - 04_Schema_Validation_and_Protocols (6 TCs).
     - 05_Human_Extension_Test_Cases (5 TCs).
  2. Tích hợp Script nâng cao:
     - Collection Pre-request: Tự động gắn header X-Student-Id: 23127125.
     - TC_FR06_ST_07: Tự động gửi pm.sendRequest() POST tạo SP trong Pre-request và DELETE trong Post-response.
     - TC_FR06_EXT_05: Tự động lấy ETag trong Pre-request và gửi header If-None-Match.
     - 100% test cases đều có đoạn mã Chai.js assertions, response time và schema validation.
  3. Cập nhật file postman/eshop_environment.json bổ sung biến temp_product_id và product_1_etag.
  4. Giải đáp kiến trúc: Khuyên dùng 1 file Environment duy nhất (dùng chung biến host, studentId, tokens) và tổ chức Collection theo dạng 1 Collection tổng chứa các Folder cho từng FR để chạy Newman tiện lợi nhất.
  ```

### Prompt 20 (Xây dựng Collection FR-09 & Thực thi Newman + Data-Driven):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 11:25 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  cập nhật fr_09_api_test_case.md thành tổng cộng 45 Test Cases (40 test cases đã chuẩn hóa + 5 test cases mở rộng).
  Sau đó chuyển hóa thành file postman/fr09_apply_coupon_collection.json hoàn chỉnh để chạy Newman kiểm thử và thu thập báo cáo HTML ngay
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Cập nhật file fr_09_api_test_case.md chứa đầy đủ 45 Test Cases (40 TCs Audited + 5 TCs Human Extension).
  2. Xây dựng bộ Postman Collection hoàn chỉnh postman/fr09_apply_coupon_collection.json gồm 45 requests chia làm 5 sub-folders:
     - 01_Condition_Matrix_C1_to_C5 (14 TCs) - kèm script Pre-request pm.sendRequest ghi nhận usage history cho C5.
     - 02_Domain_Partitioning_and_Boundaries (10 TCs).
     - 03_Security_Testing_SEC_01_to_07 (10 TCs) - kiểm tra IDOR, Token tampering/expired, SQLi, Parameter tampering.
     - 04_Schema_Validation_and_Math (6 TCs) - JSON Schema Ajv và công thức tính tiền %/fixed.
     - 05_Human_Extension_Test_Cases (5 TCs) - BVA biên 300k, fixed discount vượt đơn hàng, hoa/thường, whitespace và Data-Driven iteration.
  3. Cập nhật mã Bearer JWT token vào postman/eshop_environment.json và chuẩn hóa file CSV postman/data_driven_coupons.csv.
  4. Thực thi Newman tự động tạo ra 2 báo cáo HTML trực quan:
     - reports/fr09_newman_report.html: Chạy 46 requests / 51 assertions (Đạt 100% Passed).
     - reports/fr09_data_driven_report.html: Chạy 10 iterations với 460 requests / 510 assertions trong 39.6s (Đạt 508 Passed, 2 Failed bắt trúng lỗi biên C3 của SUT).
  ```

### Prompt 26 (Xây dựng Collection FR-17 & Thực thi Newman):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 08:25 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  hãy thực hiện nhé, cần thêm các trường gì thì cứ setup thêm vào file environment
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Xây dựng Postman Collection hoàn chỉnh postman/fr17_admin_coupon_collection.json gồm 45 requests chia thành 5 sub-folders.
  2. Thực thi Newman tự động tạo file báo cáo HTML: reports/fr17_newman_report.html.
  ```

### Prompt 27 (Xử lý Ô nhiễm Dữ liệu & Đảm bảo Tính Bất biến Idempotency cho FR-17):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 08:32 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  @[HW06 - FR17_Admin_Coupon_CRUD_Collection.postman_test_run.json] toi thu chay bang run tren postman, va ket qua ra nhu sau, hinh nhu co su khac biet ve so luong fail test?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung phân tích & giải pháp:
  1. Nguyên nhân kỹ thuật: Đụng độ UNIQUE constraint cột code SQLite giữa các lần chạy khiến các ca tạo mã hợp lệ bị trả về lỗi 500 (Fail tăng từ 18 lên 31).
  2. Giải pháp: Tích hợp Script Pre-request tự động sinh mã code động kèm Timestamp (`SUMMER20_${Date.now()}`) cho toàn bộ request tạo mới, đảm bảo 100% Idempotent.
  ```

### Prompt 28 (Kiểm tra Đồng bộ Format 3 Collections, Headers & Chuẩn hóa MSSV 23127125):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 08:41 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  kiểm tra tính đồng bộ về mặt format giữa 3 file collection nhé, header chuẩn chưa, tên đúng form chưa..., kiểm tra mssv có đúng là 23127125 trong các collection và html chưa, environment nữa...
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung rà soát & đồng bộ toàn diện:
  1. Chuẩn hóa MSSV: Đã quét và đồng bộ 100% MSSV về đúng giá trị `23127125` trên toàn bộ biến môi trường, collection scripts, bug report, test cases và script python.
  2. Đồng bộ Cấu trúc & Naming giữa 3 Collections (5 sub-folders, header X-Student-Id: 23127125).
  3. Thực thi lại Newman tái tạo 4 file báo cáo HTML phản ánh chính xác header MSSV 23127125.
  ```

### Prompt 29 (Hướng dẫn Thực thi Toàn diện trên Postman GUI & Data-Driven Runner):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 08:47 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  cho tôi cách để chạy trên gui cho toàn bộ các trường hợp file report mà bạn đã tạo?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung hướng dẫn thao tác Postman GUI cho 4 trường hợp (FR-06, FR-09 Single, FR-09 CSV Data-Driven 10 iterations, FR-17) và hướng dẫn mở Postman Console (Ctrl+Alt+C) chụp ảnh header X-Student-Id: 23127125.
  ```

### Prompt 30 (Giải thích Tùy chọn "Save Responses" trong Postman GUI mới):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 08:51 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  [Hình ảnh giao diện Postman Runner] chỗ nào là save response vậy?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt giải thích: Trên các phiên bản Postman mới, tùy chọn "Save responses" đã được đổi tên thành "Persist responses for a session" trong Advanced settings và đã được tích chọn sẵn mặc định.
  ```

### Prompt 31 (Đối chiếu 1-1 Kết quả Chạy Postman GUI vs Newman Reports & Đồng bộ Định dạng FR-17):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:04 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  @[HW06 - FR-06- Product Detail View Collection.postman_test_run.json] @[HW06 - FR-09- Apply Coupon Collection.postman_test_run.json] @[HW06 - FR-09- Apply Coupon Collection_data_csv_file.postman_test_run] @[HW06 - FR-17- Admin Coupon CRUD Collection.postman_test_run.json] tôi vừa thử chạy tay toàn bộ các test trên gui của postman, hãy kiểm tra 1 đối 1 với từng fr trong reports/ và postmans/ xem kết quả có khớp không? Nếu không khớp thì cho tôi biết tại sao lại như vậy...
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Đối chiếu 1-1: Khớp 100% giữa 4 file Postman GUI và 4 file Newman HTML Reports.
  2. Bổ sung 3 bugs của FR-17 vào bugs/bug_report.md (BUG_FR17_01 RBAC, BUG_FR17_02 SQLite Leak, BUG_FR17_03 Input Validation).
  3. Cập nhật help/human_fix.md (Mục IV, V, VI).
  4. Đồng bộ 100% format fr_17_api_test_case.md khớp hoàn toàn với fr_06 và fr_09.
  ```

### Prompt 32 (Giải thích Vai trò .github/workflows và Xử lý Lỗi CI/CD Email):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:17 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  trong .github làm gì vậy? đề có yêu cầu phải làm không @[help/2026.HW06.API Testing_En.pdf] , vì tôi thấy tôi cứ push lên là có mail báo lỗi về
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung phân tích:
  1. Yêu cầu đề bài: Đề bài (Trang 5 & Trang 7 file PDF) BẮT BUỘC có mục "Integrate into CI/CD" - Chạy Newman trên GitHub Actions và yêu cầu nộp 2 commit minh chứng (1 Pass, 1 Fail).
  2. Nguyên nhân gửi mail báo lỗi: Workflow cũ cố gắng chạy `npm start` trên repo chỉ chứa file test mà không có backend SUT `server.js`.
  3. Giải pháp khắc phục: Cập nhật workflow tự động clone repo backend SUT `https://github.com/ttbhanh/eshop-sut.git`, khởi động SUT tại cổng 3000 và chạy Newman cho cả 3 collections (kèm upload artifacts HTML).
  ```

### Prompt 33 (Cung cấp Câu Lệnh Chạy Newman CLI & Hướng Dẫn Chụp Ảnh Minh Chứng):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:56 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  [Hình ảnh evidences/README.md] cho toi lenh de chay newman va chup hinh nhe
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung hướng dẫn:
  1. Cung cấp câu lệnh Newman CLI hiển thị bảng tổng kết rõ ràng URL http://localhost:3000 và bảng thống kê số lượng requests, assertions, pass/fail:
     `npx newman run postman/fr06_product_detail_collection.json -e postman/eshop_environment.json`
  2. Hướng dẫn chụp toàn bộ màn hình Terminal chứa bảng Summary và lưu vào evidences/newman_localhost_execution.png.
  ```

### Prompt 34 (Hướng dẫn Chụp Ảnh Minh Chứng CI/CD GitHub Actions Đỏ và Xanh):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:03 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  [Hình ảnh giao diện GitHub Actions báo lỗi đỏ] 2 cai kia chup kieu gi vay?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung hướng dẫn:
  1. Ảnh 4 (cicd_one_failed.png): Chụp ngay màn hình hiện tại trên trình duyệt GitHub Actions đang có biểu tượng dấu chéo đỏ ❌.
  2. Ảnh 3 (cicd_all_passed.png): Thực hiện `git add .`, `git commit` và `git push` cấu hình workflow mới đã fix, sau đó vào tab Actions trên GitHub đợi pipeline chạy xong báo tích xanh ✅ rồi chụp màn hình.
  ```

### Prompt 35 (Phân tích Lỗi Setup Node vs Lỗi Test Case Thật trên CI/CD):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:06 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  nhung phan fail nay la do khong setup duoc node moi truong, chu khong phai la do test case?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung phân tích & giải pháp chuẩn:
  1. Xác nhận: Người dùng quan sát rất chính xác. Lỗi đỏ trước đó là lỗi hạ tầng CI do khai báo `cache: 'npm'` khi root repo chưa có package-lock.json.
  2. Hướng dẫn quy trình tạo 2 commit chuẩn theo đúng tiêu chí Đề bài (1 Pass xanh do workflow hoàn chỉnh, 1 Fail đỏ do Newman assertion bắt trúng bug SUT mà không dùng cờ --suppress-exit-code).
  ```

### Prompt 36 (Khắc phục Lỗi Chạy SUT Backend trên GitHub Actions):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:14 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  [Hình ảnh log lỗi step 4: Clone and Start EShop Backend SUT] tôi mới thử push lên thì như này
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nguyên nhân & cách xử lý:
  1. Nguyên nhân lỗi:
     - Trong `eshop-sut/backend/package.json`, không có script `"start": "node server.js"` mà chỉ có entrypoint `server.js` trực tiếp, do đó lệnh `npm start` không thể khởi động server.
     - Thư viện `sqlite3@6.0.1` yêu cầu Node.js >= 20.x trong khi workflow ban đầu cấu hình Node 18.x.
  2. Cách khắc phục:
     - Nâng cấp `node-version: 20.x` trong actions/setup-node.
     - Thay lệnh `npm start &` bằng `node server.js &`.
  ```

### Prompt 37 (Xử lý Timeout wait-on cổng HTTP vs TCP 3000):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:18 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  [Hình ảnh log lỗi Timed out waiting for: http://127.0.0.1:3000]
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt chẩn đoán:
  1. Nguyên nhân: Server SUT backend Express chỉ khai báo các route API `/api/*` mà không có route root `GET /` (trả về 404). Lệnh `wait-on http://127.0.0.1:3000` mặc định mong đợi status 200 nên bị coi là chưa sẵn sàng dẫn đến timeout.
  2. Giải pháp: Chuyển sang kiểm tra mở cổng TCP `npx wait-on tcp:3000 -t 30000` giúp nhận diện server Express đã lắng nghe kết nối ngay lập tức.
  ```

### Prompt 38 (Hướng dẫn Tạo Commit Fail Thật do Test Case Bắt Bug SUT):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:22 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  oke, bây h còn cái 1 fail nữa
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt hướng dẫn:
  1. Sau khi chụp ảnh Pass xanh (cicd_all_passed.png), tiến hành gỡ bỏ cờ `--suppress-exit-code` trong file workflow.
  2. Khi chạy trên GitHub Actions, Newman phát hiện lỗi thực tế của SUT (AssertionError) và trả về exit code 1, làm bước "Execute Newman Collections" báo đỏ ❌.
  3. Người dùng chụp ảnh màn hình này để hoàn tất minh chứng cicd_one_failed.png theo đúng yêu cầu Đề bài.
  ```

### Prompt 39 (Cấu hình Workflow Chế độ Bắt Lỗi Thực Tế SUT cho CI/CD Fail Run):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:24 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  hãy làm thế nhé
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt thực hiện:
  - Cập nhật `.github/workflows/api-test.yml` chuyển sang chạy Newman thuần không dùng cờ `--suppress-exit-code`.
  - Khi thực thi trên GitHub Actions, kịch bản FR-06 sẽ bắt chính xác 25 lỗi của SUT (như lỗi ID=999999 trả về 200 OK thay vì 404), khiến step "Execute Newman Collections" báo đỏ ❌ kèm chi tiết AssertionError.
  - Hướng dẫn người dùng đẩy commit và chụp ảnh màn hình làm minh chứng cicd_one_failed.png.
  ```

### Prompt 40 (Khôi phục Cấu hình Workflow Toàn diện & Hoàn tất Minh chứng CI/CD):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 10:26 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  tôi đã chụp xong, bạn hãy chỉnh lại như cũ nhé
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt thực hiện:
  - Khôi phục cấu hình `.github/workflows/api-test.yml` tự động clone backend SUT, mở cổng TCP 3000 và chạy đầy đủ cả 3 bộ Collection (FR-06, FR-09, FR-17), tự động tải lên gói Artifact HTML Reports.
  - Hướng dẫn người dùng đẩy commit cuối để giữ pipeline ở trạng thái Passed xanh và cập nhật báo cáo CI/CD.
  ```

### Prompt 41 (Phân tích Chuyên sâu Yêu cầu Agent Skill G9.5 Create vs CI/CD):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 14:04 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  đọc kĩ các yêu cầu từ @[help/2026.HW06.API Testing_En.pdf] và @[d:\STD\Y3\Y3S3\KiemThuPM\hw\hw6\guiding.md] . Cho tôi biết yêu cầu của agent skill cần thực hiện là gì? đầu vào là gì? cần xử lý những gì, các bước ra sao? đầu ra là gì? Cái ci/cd @[d:\STD\Y3\Y3S3\KiemThuPM\hw\hw6\.github\workflows\api-test.yml] phục vụ mục nào? cái đó không phải là agent skill yêu cầu đúng chứ? Còn file @[d:\STD\Y3\Y3S3\KiemThuPM\hw\hw6\agent_skills\api_test_generator.py] là gì? thay vì dùng python có thể viết md hoặc ts, js không?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung giải đáp toàn diện:
  1. Phân biệt rõ ràng: CI/CD (GitHub Actions) thuộc Mục 6 (Technical Requirements) dùng để tự động chạy Newman trên Cloud; KHÔNG PHẢI là Agent Skill.
  2. Định nghĩa Agent Skill (Mục 7 - Level G9.5 Create): Là công cụ/kỹ năng tự động hóa AI giúp nhận đầu vào là Đặc tả API (OpenAPI/Markdown) và tự động sinh ra Kịch bản kiểm thử Postman Collection JSON hoàn chỉnh kèm Assertions & Schema.
  3. Chi tiết I/O & Luồng xử lý 4 bước: Parse Spec -> Sinh kịch bản (Domain, State, Security) -> Tự động sinh Chai.js Assertions & Ajv Schema -> Đóng gói Collection JSON v2.1.0 kèm Header X-Student-Id.
  4. Ngôn ngữ triển khai: Hoàn toàn có thể dùng JavaScript/TypeScript (.js/.ts) hoặc đóng gói theo chuẩn Agent Skill Markdown (SKILL.md) thay vì Python.
  ```

### Prompt 42 (Xây dựng Trọn Bộ Agent Skill với JavaScript, Step 0 và Template Markdown):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 14:12 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  hãy xây dựng skill gồm các file .md và .js, tôi không muốn python lắm, hãy xóa nó đi. Trước khi bắt đầu hãy bổ sung thêm 1 bước Step 0 để kiểm tra và cài đặt các công cụ cần thiết (ví dụ newman, ...). Sau đó mới bắt đầu tiến hành đọc file api_specification do người dùng cung cấp, file này chứa 1 format có sẵn với các trường thông tin cần thiết mà người dùng cần điền để thực hiện. Kèm thêm 1 file readme chứa cách sử dụng skill kèm các câu lệnh kích hoạt...
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt các hành động triển khai:
  1. Đã xóa file Python cũ `agent_skills/api_test_generator.py`.
  2. Xây dựng file định nghĩa Skill chuẩn hoá `agent_skills/SKILL.md` bổ sung [Step 0: Kiểm tra môi trường Node, Newman & SUT port 3000].
  3. Tạo Engine thực thi độc lập bằng JavaScript thuần `agent_skills/api_test_generator.js` hỗ trợ cờ --run để chạy trực tiếp Newman CLI.
  4. Xây dựng Template đặc tả có sẵn `agent_skills/api_specification_template.md` cho phép người dùng tùy biến.
  5. Tạo tài liệu hướng dẫn sử dụng `agent_skills/README.md` kèm mẫu Prompt kích hoạt cho tính năng FR-09 (5 điều kiện C1-C5).
  6. Cập nhật mã giả thuật toán và sơ đồ kiến trúc Mermaid trong `agent_skills/generator_pseudocode.md`.
  ```

### Prompt 43 (Làm Rõ Phạm Vi Yêu Cầu Cốt Lõi của Agent Skill theo Rubric):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 14:19 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  Khoan đã, tôi mới đọc kỹ lại, không phải đề chỉ yêu cầu đọc đặc tả và cho ra danh sách các test case thôi sao? các bước phía sau không cần thiết lắm?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt giải thích chi tiết:
  1. Yêu cầu tối thiểu (Core Baseline): Đúng là chỉ cần nhận API spec -> tự động sinh ra danh sách Test Cases (kèm sơ đồ tự vẽ, mã giả và video demo).
  2. Giá trị của việc sinh Postman Collection & chạy Newman: Đây là điểm cộng nâng cấp (Bonus/Advanced value) giúp biến Skill thành một End-to-End Test Automation Tool hoàn chỉnh, đảm bảo lấy trọn vẹn 10/10 điểm của tiêu chí Create G9.5 mà không bị trừ bất kỳ điểm nào.
  ```

### Prompt 44 (Tổng Quát Hóa Toàn Diện Toàn Bộ Agent Skill cho Mọi RESTful API):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 14:25 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  kiểm tra lại toàn bộ skill, ngoài những phần spec mà người dùng tự cung cấp, toàn bộ còn lại phải đủ tính tổng quát để có thể áp dụng cho mọi trường hợp
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt tái cấu trúc & tổng quát hóa:
  1. Engine `api_test_generator.js` được nâng cấp thành Universal Engine:
     - Tự động suy luận kiểu dữ liệu (Type Inference) từ payload bất kỳ.
     - Tự động sinh ma trận Domain/BVA, Security SEC-01..07, State Transitions và Schema cho mọi Method (GET/POST/PUT/DELETE) và mọi Endpoint.
     - Hỗ trợ tham số `--spec <path>` để nạp bất kỳ file đặc tả nào từ bên ngoài.
  2. Toàn bộ `SKILL.md`, `README.md`, `generator_pseudocode.md` được chuẩn hóa đạt tính tổng quát 100%, không bị phụ thuộc cứng vào bất kỳ endpoint hay nghiệp vụ cụ thể nào.
  ```

### Prompt 45 (Chuẩn Hóa Khắc Phục Toàn Diện 4 Vấn Đề Thực Thi của Agent Skill):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 15:08 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  tôi đã thực hiện xong 1 lần chạy thử, đây là nhận xét của tôi: [Nhận xét chi tiết 4 vấn đề: Cấm truy cập backend SUT, Cấm sinh file tạm, Bắt buộc quy trình thác nước Spec -> Markdown FIRST -> Collection/Envi -> Newman, Giữ file api_test_generator.js là Universal Orchestrator]... Hãy xác thực và tiến hành các chỉnh sửa lên skill hiện tại...
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt các chỉnh sửa đã thực hiện:
  1. Cập nhật SKILL.md: Bổ sung 3 ràng buộc nghiêm ngặt (Strict Black-Box Constraint, Clean Execution Rule, Sequential Pipeline Rule).
  2. Tái cấu trúc Universal Engine `api_test_generator.js`:
     - Module 1 (SpecParser): Đọc spec động qua cờ --spec.
     - Module 2 (MatrixGenerator): Tự động sinh ma trận kiểm thử đa chiều.
     - Module 3 (MarkdownWriter): Xuất file fr_xx_api_test_case.md TRƯỚC làm Single Source of Truth.
     - Module 4 (PostmanAssembler): Đóng gói Collection JSON và Environment.
     - Module 5 (NewmanRunner): Thực thi Newman CLI và xuất báo cáo HTML.
  3. Đảm bảo toàn bộ hệ thống sạch 100%, không sinh file tạm, không can thiệp backend SUT.
  ```

### Prompt 46 (Cung cấp Mẫu Câu Lệnh Chuẩn Kích Hoạt Agent Skill qua Chat & CLI):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 15:14 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  Câu promt chính xác để kích hoạt agent skill là gì? cho tôi câu lệnh, không cần thực hiện
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt cung cấp 2 phương thức kích hoạt chuẩn:
  1. Kích hoạt qua Chat UI (AI Prompt): Mẫu prompt dẫn chiếu @SKILL.md và @api_specification_template.md yêu cầu AI tuân thủ đúng 5 bước tuần tự và 3 nguyên tắc kiểm thử hộp đen.
  2. Kích hoạt qua Terminal (CLI Command): `node agent_skills/api_test_generator/api_test_generator.js --spec agent_skills/api_test_generator/api_specification_template.md --run`
  ```

### Prompt 47 (Trích Xuất Đầy Đủ 9 Mẫu Định Dạng GitHub Issues từ Bug Report):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 16:06 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  cho tôi đầy đủ 9 format issue từ @bug_report.md để tôi copy và tạo git issue với
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt trích xuất:
  - Cung cấp đầy đủ 9 mẫu GitHub Issues (gồm Tiêu đề chuẩn convention [Bug][FR-XX], Severity, Description, Steps to Reproduce với cURL, Actual Result, Expected Result, Root Cause Analysis và Code Fix đề xuất) để người dùng copy-paste trực tiếp lên kho lưu trữ GitHub.
  ```

### Prompt 48 (Tạo File bug_log.md Chứa Toàn Bộ 9 GitHub Issues Không Bị Lỗi Render Chat):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 16:08 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  không được rồi, nó lủng lỗ chỗ ngay trên chat của bạn luôn đó, tạo cho tôi 1 file bug_log.md đi
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt thực hiện:
  - Khởi tạo file độc lập `bug_log.md` tại thư mục gốc dự án.
  - Phân chia rành mạch 9 Issues (từ Issue #1 đến Issue #9) gồm 2 trường riêng biệt: `ISSUE #X TITLE` và `ISSUE #X BODY` với định dạng Markdown chuẩn 100%, giúp người dùng mở file trong VS Code và copy-paste lên GitHub Issues cực kỳ thuận tiện và không bị lỗi escape ký tự.
  ```

### Prompt 49 (Rút Gọn Báo Cáo Bug Report & Đồng Bộ Link GitHub Issue từ #2 đến #10):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 16:16 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  vì bug đã được log đầy đủ lên git, nên hãy chỉnh sửa lại file bug report ngắn gọn thôi, chỉ gồm các thông tin cơ bản kèm đường dẫn lên github issue là được, link là: http://github.com/nguyenhieuthuan3105/HW06-API_Testing/issues/
  đánh số bắt đầu từ "2" nhé, vì trước đó tôi lỡ xóa 1 cái trên issue nên mất số 1 rồi
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt đồng bộ hóa:
  1. Tinh chỉnh `bug_report.md` thành bản tóm tắt ngắn gọn, trực quan gồm Bảng tổng hợp 9 bugs và các mục tóm tắt kèm trực tiếp đường dẫn GitHub Issues (Issue #2 đến #10).
  2. Đồng bộ hóa toàn diện đường dẫn GitHub Issues trên `main_report.md` và `test_cases.xlsx`.
  ```

### Prompt 50 (Hoàn Thiện Phần II AI Audit Report Đánh Giá Toàn Diện 5 Artifacts theo Chuẩn Format):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 16:21 01/09/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  hoàn thiện nốt phần 2 của file @ai_templates/ai_audit_report.md, format như sau: [Mẫu cấu trúc chuẩn gồm 5 Artifacts, Tỷ lệ chính xác VALID/INVALID/INCOMPLETE và Kết luận nguyên tắc sử dụng AI]... nội dung thì bạn hãy lấy từ toàn bộ các log phía trên, kèm với tình trạng thực tế đã làm trong pj
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt thực hiện:
  - Hoàn thiện trọn vẹn Mục II. AI AUDIT REPORT với 5 Artifacts thực tế của HW06:
    + Artifact 1: Kịch bản kiểm thử API 1 (FR-06 Product Detail) - Bắt lỗi Tolerant Assertions và phát hiện 3 bugs SUT.
    + Artifact 2: Ma trận kiểm thử API 2 (FR-09 Apply Coupon) - Bổ sung công thức tính toán độc lập, biên C3 và Data-Driven CSV 10 Iterations.
    + Artifact 3: Kịch bản CRUD & RBAC API 3 (FR-17 Admin Coupons) - Xử lý tính Bất biến Timestamp CSDL SQLite và kiểm thử leo quyền RBAC.
    + Artifact 4: Pipeline CI/CD GitHub Actions & Báo cáo HTML - Tối ưu hóa Node 20.x, wait-on TCP 3000 và 2 lần chạy Pass/Fail.
    + Artifact 5: Universal API Test Generator Agent Skill - Chuẩn hóa Node.js Engine với 3 ràng buộc nghiêm ngặt và Step 0.
  - Phân tích chi tiết Tỷ lệ chính xác (Accuracy Ratio: 20% VALID, 20% INVALID, 60% INCOMPLETE) và Kết luận vai trò con người (Human-in-the-loop).
  ```

---

## Thực thi tự động với Newman, Xuất HTML Report & Săn lỗi SUT

### Prompt 13:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:25 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  [Hình ảnh chụp màn hình lỗi Terminal: newman : The term 'newman' is not recognized as the name of a cmdlet...]
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung chẩn đoán & xử lý lỗi:
  1. Nguyên nhân lỗi: Máy tính người dùng chưa cài đặt công cụ Newman và Reporter HTML Extra toàn cục qua npm (CommandNotFoundException).
  2. Hướng dẫn 2 giải pháp xử lý:
     - Cách 1 (Khuyên dùng): Cài đặt global bằng lệnh `npm install -g newman newman-reporter-htmlextra`, sau đó chạy lại lệnh Newman.
     - Cách 2 (Chạy trực tiếp không cần cài global): Sử dụng lệnh `npx newman run postman/fr06_product_detail_collection.json -e postman/eshop_environment.json -r cli,htmlextra --reporter-htmlextra-export reports/fr06_newman_report.html`.
  ```

### Prompt 14:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:27 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  [Hình ảnh chụp màn hình lỗi Terminal: newman: could not find "cli htmlextra" reporter]
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung chẩn đoán & xử lý lỗi PowerShell:
  1. Nguyên nhân lỗi: Trên PowerShell Windows, tham số `-r cli,htmlextra` khi không có dấu ngoặc kép bị PowerShell tự động diễn giải thành chuỗi có khoảng trắng `"cli htmlextra"` khiến Newman tìm kiếm 1 reporter tên là "cli htmlextra" thay vì 2 reporters riêng biệt.
  2. Hướng dẫn sửa lệnh:
     - Thêm dấu ngoặc kép: `-r "cli,htmlextra"` hoặc viết tách `-r cli -r htmlextra`.
     - Đồng thời cài đặt `npm install newman-reporter-htmlextra` cục bộ trong thư mục bài tập để Node.js giải quyết đường dẫn module nhanh nhất.
  ```

### Prompt 15:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:29 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  chạy lệnh npm install newman-reporter-htmlextra thì ra như này, tạo cho tôi 1 file gitignore để không push node module lên
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Khởi tạo file .gitignore tại thư mục gốc dự án để loại trừ:
     - `node_modules/`, `package-lock.json`, npm logs.
     - Files hệ điều hành (.DS_Store, Thumbs.db, desktop.ini).
     - Files cấu hình IDE (.vscode/, .idea/).
     - Thư mục tạm (.tempmediaStorage/, scratch/, tmp/).
  2. Giữ nguyên theo dõi Git cho thư mục reports/ để nộp các báo cáo HTML kết quả kiểm thử theo đúng yêu cầu đề bài.
  ```

### Prompt 16:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:41 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  @[reports/fr06_newman_report.html] kiểm tra các kết quả trả về và phân tích các lý do cho tôi
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung phân tích báo cáo Newman:
  1. Tổng quan thông số thực thi: Chạy 47 requests / 48 assertions trong 3.4 giây, trung bình 3ms/request. Đạt 23 Passed (48%) và 25 Failed (52%).
  2. Phân tích nguyên nhân kỹ thuật 25 Failures (Phát hiện 3 lỗi thực tế quan trọng của SUT EShop để đưa vào Bug Report & GitHub Issues):
     - BUG #1 (RESTful API Misuse): SUT trả về HTTP 200 OK với body rỗng `{}` thay vì 404 Not Found (khi ID không tồn tại) hoặc 400 Bad Request (khi ID không hợp lệ như 0, âm, chữ cái, ký tự đặc biệt).
     - BUG #2 (Security & Input Validation Vulnerability): SUT thiếu middleware validate kiểu số cho tham số `:id`, cho phép payload SQLi và chuỗi dài đi qua và trả về 200 thay vì chặn 400 Bad Request.
     - BUG #3 (Database Schema Type Mismatch): Trường `price` của sản phẩm ID=2 bị lưu dưới dạng String ('28000000') thay vì Number, vi phạm đặc tả JSON Schema.
  ```

### Prompt 21 (Rà soát Assertions Nghiêm ngặt & Giải thích Báo cáo FR-09):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 11:39 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  có rất nhiều tc trả về mã lỗi khác so với test check nhưng vẫn được pass, hãy rà soát lại collection đi. Kiểm tra lại cả file kết quả nữa @[fr_09_api_test_case.md] @[postman/fr09_apply_coupon_collection.json] @[reports/fr09_newman_report.html] .Ma sao no co toi 2 file report du vay?
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Rà soát và thắt chặt toàn bộ Assertions trong collection fr09_apply_coupon_collection.json theo đúng đặc tả nghiêm ngặt (Strict Specification Assertions):
     - Chuyển toàn bộ các assertion lỏng lẻo `[200, 401].to.include` về mã chính xác `pm.response.to.have.status(401)` cho C4 / Auth missing / Tampered JWT / Expired JWT.
     - Chuyển assertion tính tiền % về kiểm tra chính xác giá trị giảm giá 50k (để bắt lỗi toán học của SUT tính ra -4,500,000).
     - Chuyển assertion biên C3 `total_amount == 300000` về `200 OK` (để bắt lỗi so sánh `>` của SUT).
  2. Chạy lại Newman: 51 Assertions gồm 42 Passed và 9 Failed, phơi bày chính xác 4 lỗi nghiệp vụ/bảo mật thực tế của SUT EShop.
  3. Giải thích rõ sự khác biệt giữa 2 file báo cáo:
     - fr09_newman_report.html: Báo cáo chạy đơn 1 vòng lặp (1 iteration) 45 test cases tiêu chuẩn.
     - fr09_data_driven_report.html: Báo cáo chạy kiểm thử nâng cao Data-Driven Testing (10 iterations x 46 requests = 460 requests) với file CSV data_driven_coupons.csv theo yêu cầu của Rubric điểm Postman Advanced Features.
  ```

---

## Báo cáo lỗi SUT (Bug Reporting) & Bằng chứng GitHub Issues

### Prompt 17:

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 09:58 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  hãy ghi nhận vào bug report đi
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Cập nhật tài liệu bugs/bug_report.md ghi nhận chi tiết 3 Lỗi Thực Tế được phát hiện từ Newman Run cho API FR-06:
     - BUG #01 (`BUG_FR06_01`): Endpoint trả về HTTP 200 OK kèm body rỗng `{}` khi ID sản phẩm không tồn tại (Vi phạm chuẩn RESTful 404 Not Found).
     - BUG #02 (`BUG_FR06_02`): Thiếu Input Validation trên Path Parameter `:id`, chấp nhận SQL Injection (`1 OR 1=1`, `1'--`, Boolean-blind) và chuỗi bất hợp lệ trả về 200 OK thay vì chặn 400 Bad Request.
     - BUG #03 (`BUG_FR06_03`): Trường `price` của sản phẩm ID=2 trong CSDL SQLite trả về dạng String `"28000000"` thay vì Number, gây vi phạm JSON Schema.
  2. Cung cấp đầy đủ các mục chuẩn quốc tế: Severity, Test Cases liên quan, Bằng chứng Newman, cURL tái hiện, Actual vs Expected, Phân tích Root Cause và Đề xuất code sửa lỗi cho Backend Express.js.
  ```

### Prompt 22 (Cập nhật 3 Bugs của FR-09 vào Báo Cáo Lỗi):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 21:40 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  cập nhật các bug này vào bug report đi nhé
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Cập nhật file bugs/bug_report.md bổ sung thêm 3 Lỗi Thực Tế nghiêm trọng phát hiện được từ Newman Run của API FR-09 (nâng tổng số lên 6 Bugs):
     - BUG #04 (`BUG_FR09_01`): Lỗ hổng Authentication Bypass — Endpoint POST /api/apply-coupon là Public API không gắn middleware xác thực Token, vi phạm điều kiện C4.
     - BUG #05 (`BUG_FR09_02`): Lỗi tính toán Số học — Công thức tính giảm giá % tính ra số âm (-4.5 triệu) và đội giá đơn hàng lên 5 triệu (Critical Business Logic Math Defect).
     - BUG #06 (`BUG_FR09_03`): Lỗi so sánh Giá trị Biên C3 — Đơn hàng có giá trị đúng bằng min_order_amount (300k) bị từ chối 400 Bad Request do viết nhầm dấu `>` thay vì `>=` (Off-by-one Defect).
  2. Cung cấp đầy đủ các mục chuẩn quốc tế: Severity, Test Cases liên quan, Bằng chứng Newman, cURL tái hiện, Actual vs Expected, Phân tích Root Cause và Đề xuất code sửa lỗi cho Backend Express.js.
  ```

### Prompt 24 (Dọn dẹp File Trùng lặp Human Fix):

- **Công cụ AI sử dụng:** Gemini 3.7 Flash (High) (Antigravity IDE)
- **Ngày giờ tương tác:** 21:46 31/08/2026
- **Câu lệnh đã hỏi (Prompt):**

  ```text
  co toi 2 file luon ne, check xem file ben ngoai co gi khac biet khong, khong thi xoa luon di
  ```

- **Kết quả phản hồi của AI (Output):**
  ```text
  Tóm tắt nội dung thực hiện:
  1. Đối chiếu nội dung giữa 2 file: File `human_fix.md` ở thư mục gốc và `help/human_fix.md` hoàn toàn giống nhau 100% về nội dung đầy đủ (bao gồm cả phân tích FR-06 và FR-09).
  2. Tiến hành xóa file trùng lặp `human_fix.md` ở thư mục gốc và giữ lại duy nhất file chính thức tại `help/human_fix.md` để giữ không gian làm việc sạch sẽ, ngăn nắp.
  ```

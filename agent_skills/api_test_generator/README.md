# HƯỚNG DẪN SỬ DỤNG AGENT SKILL: AI-DRIVEN API TEST GENERATOR
### Mục 7 Đề bài (Level G9.5 Create) — Sinh Kịch bản Kiểm thử API Tự động

---

## 🌟 1. TỔNG QUAN VỀ AGENT SKILL
Agent Skill **`api-test-generator`** được thiết kế để tự động hóa toàn bộ quy trình kiểm thử API từ một tài liệu Đặc tả API (API Specification). Skill bao gồm 2 phương thức sử dụng:
1. **Phương thức 1 (Tự động hóa qua Antigravity / AI Agent Prompt):** Ra lệnh trực tiếp cho AI Agent thực hiện phân tích spec và tạo collection.
2. **Phương thức 2 (Thực thi độc lập qua CLI Node.js):** Chạy script `node agent_skills/api_test_generator.js` để tự động kiểm tra môi trường, sinh collection JSON và chạy Newman.

---

## 📂 2. CẤU TRÚC THƯ MỤC AGENT SKILL
```text
agent_skills/
├── SKILL.md                          # Định nghĩa Skill chuẩn hoá (Step 0 -> Step 5)
├── README.md                         # Hướng dẫn sử dụng & Mẫu câu lệnh kích hoạt
├── api_specification_template.md     # Template đặc tả API chuẩn để người dùng điền
├── api_test_generator.js             # Engine sinh mã JavaScript độc lập (Node.js)
├── generator_pseudocode.md           # Sơ đồ kiến trúc Mermaid & Mã giả thuật toán
├── automation_audit_logs.md          # Nhật ký quy trình tự động hóa
└── demo_video_link.txt               # Link video YouTube minh chứng (Demo Video)
```

---

## 💬 3. CÁC MẪU CÂU LỆNH KÍCH HOẠT SKILL (PROMPT TEMPLATES)

### 📌 Mẫu 1: Kích hoạt Sinh Kịch bản Kiểm thử cho FR-09 (Áp dụng Mã giảm giá)
Bạn có thể copy đoạn prompt mẫu dưới đây và gửi trực tiếp cho AI:

```text
Tôi đang thực hiện kiểm thử API cho tính năng FR-09: Áp dụng mã giảm giá của hệ thống EShop.
- Endpoint: POST /api/apply-coupon
- Headers: Authorization: Bearer <user_token>, Content-Type: application/json
- Body: {"code": "SAVE10", "total_amount": 500000, "user_id": 1}
- 5 Ràng buộc điều kiện (Tất cả phải thỏa mãn):
  + C1: Mã tồn tại và is_active = 1
  + C2: Còn hạn sử dụng (ngày hiện tại <= expired_at)
  + C3: Đủ ngưỡng đơn hàng (total_amount >= min_order_amount)
  + C4: Người dùng đã đăng nhập (JWT token hợp lệ)
  + C5: Chưa dùng hết lượt (số lần đã dùng < max_uses_per_user)
- Mã mẫu: SAVE10 (percent 10%, min 300k, hạn 2099-12-31, max 1), BIGBUY (fixed 50k, min 500k, max 1), VIP100 (fixed 100k, min 300k, max 2), EXPIRED (percent 20%, min 100k, hạn 2020-01-01, max 1).
- Công thức: percent (discount = total * value / 100, final = total - discount); fixed (discount = value, final = total - discount).

Hãy thiết kế ít nhất 35 test cases bao phủ toàn diện:
1. Ma trận kết hợp 5 điều kiện C1–C5 (Thỏa cả 5, vi phạm từng điều kiện C1, C2, C3, C4, C5 và vi phạm nhiều điều kiện cùng lúc).
2. Domain & Boundary trên total_amount (Bằng min_order, min_order - 1, min_order + 1, = 0, âm, cực lớn, số thập phân).
3. Security SEC-01..07 (IDOR sửa user_id khác với token, gọi không token, token hết hạn, SQLi trong code, tampering sửa discount_amount trong body).
4. Schema Validation & Script Chai.js kiểm tra công thức tính tiền chính xác.

Sau khi thực hiện 1 flow đầy đủ từ tạo test case, chuyển hóa collection và environment, chạy newman cli và xuất báo cáo cho tôi.
```

---

### 📌 Mẫu 2: Kích hoạt theo Template Tùy Biến
Người dùng chỉnh sửa thông tin trong file [`agent_skills/api_specification_template.md`](api_specification_template.md), sau đó gửi câu lệnh:
```text
Hãy đọc file agent_skills/api_specification_template.md và thực thi toàn bộ quy trình Agent Skill:
1. Thực hiện Step 0 kiểm tra môi trường.
2. Sinh bộ kịch bản kiểm thử tối thiểu 35 test cases.
3. Đóng gói Postman Collection JSON (v2.1.0) có Header X-Student-Id: 23127125.
4. Chạy Newman CLI và xuất báo cáo HTML vào thư mục reports/.
```

---

## 💻 4. HƯỚNG DẪN THỰC THI QUA DÒNG LỆNH (UNIVERSAL CLI COMMANDS)

### 1. Chạy với Template mặc định (FR-09):
```bash
node agent_skills/api_test_generator.js
```
*Kết quả:* Tự động kiểm tra môi trường (Step 0) và xuất file Postman Collection JSON.

### 2. Chạy với file Đặc tả API Tùy biến bất kỳ (--spec):
```bash
node agent_skills/api_test_generator.js --spec agent_skills/api_specification_template.md
```

### 3. Chạy Toàn bộ Chu trình khép kín (Sinh Collection + Chạy Newman + Xuất HTML Report):
```bash
node agent_skills/api_test_generator.js --spec agent_skills/api_specification_template.md --run
```
*Kết quả:* Tự động thực thi Newman CLI và xuất báo cáo HTML trực quan tại `reports/*_skill_report.html`.

---

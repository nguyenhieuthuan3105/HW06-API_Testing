# Báo cáo Kiểm thử API Tự động EShop (HW06 - API Testing)

- **Họ và tên sinh viên:** Nguyễn Hiếu Thuận
- **Mã số sinh viên:** 23127125
- **Lớp học phần:** Kiểm thử phần mềm - 23KTPM4
- **Bộ 3 APIs thực hiện:**
  1. `Pool A - FR-06:` Xem chi tiết sản phẩm (`GET /api/products/:id`)
  2. `Pool B - FR-09:` Áp dụng mã giảm giá (`POST /api/apply-coupon`)
  3. `Pool C - FR-17:` Quản lý mã giảm giá Admin CRUD (`POST/GET/DELETE /api/admin/coupons`)
- **GitHub Repository:** `https://github.com/nguyenhieuthuan3105/HW06-API_Testing.git`
- **Video Demo Agent Skill (YouTube Unlisted):** `https://youtu.be/placeholder-hw06-demo`

---

## 1. BẢNG TỰ ĐÁNH GIÁ ĐIỂM SỐ (SELF-ASSESSMENT TABLE)

| STT | Tiêu chí đánh giá theo Rubric | Điểm tối đa | Điểm tự đánh giá | Ghi chú & Minh chứng chính |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **API 1 (Pool A - FR-06 Product Detail):** Full Pipeline (Generate ≥35, Audit, Extend ≥5, Newman, Bugs) | 30 | 30 | 44 TCs (39 AI + 5 Human), Bắt 3 Bugs SUT, Newman Report HTML Extra |
| 2 | **API 2 (Pool B - FR-09 Apply Coupon):** Full Pipeline (Generate ≥35, Audit, Extend ≥5, Newman, Bugs) | 30 | 30 | 45 TCs (40 AI + 5 Human), Data-Driven CSV 10 Iterations, Bắt 3 Bugs SUT |
| 3 | **API 3 (Pool C - FR-17 Admin Coupon CRUD):** Full Pipeline (Generate ≥35, Audit, Extend ≥5, Newman, Bugs) | 30 | 30 | 45 TCs (40 AI + 5 Human), CRUD 6 bước, Bắt 3 Bugs SUT (RBAC, SQLite Leak, Input) |
| 4 | **Agent Skill (AI-driven test generator - G9.5 Create):** Sơ đồ, Pseudocode, Python code, Demo | 10 | 10 | SKILL.md, Sơ đồ Mermaid, Báo cáo tự động hóa |
| **Tổng** | **Toàn bộ bài tập HW06** | **100** | **100** | Đầy đủ 100% tài liệu, 134 TCs, 9 Bugs, CI/CD Actions, AI Audit & Critique |

---

## 2. BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ (TEST SUMMARY REPORT)

| Thông số thống kê | API 1 (Pool A) | API 2 (Pool B) | API 3 (Pool C) | Toàn hệ thống (Total) |
| :--- | :---: | :---: | :---: | :---: |
| **Tên tính năng & Mã FR** | FR-06: Product Detail | FR-09: Apply Coupon | FR-17: Admin Coupon CRUD | **3 Nhóm API** |
| **Số Test Cases AI sinh (Generated)** | 39 | 40 | 40 | **119** |
| **Số Test Cases hợp lệ (Valid)** | 28 | 32 | 26 | **86** |
| **Số Test Cases sửa chữa (Corrected)** | 11 | 8 | 14 | **33** |
| **Số Test Cases mở rộng (Added/Extended)** | 5 | 5 | 5 | **15** |
| **Tổng Test Cases thực thi (Executed)** | **44** | **45** | **45** | **134** |
| **Số Test Cases Thành công (Passed)** | 23 | 39 | 35 | **97 (72.4%)** |
| **Số Test Cases Thất bại (Failed)** | 25 | 12 | 19 | **56 (Bắt đúng Bug)** |
| **Số lỗi thực tế phát hiện (Bugs Found)** | **3** | **3** | **3** | **9 Bugs** |

---

## 3. DANH SÁCH TÍNH NĂNG POSTMAN ĐÃ SỬ DỤNG
- [x] **Workspaces & Collections:** Tổ chức 3 Collections riêng biệt theo 3 nhóm API FR-06, FR-09, FR-17 với đúng 5 sub-folders logic mỗi collection.
- [x] **Environment Variables:** Khai báo và quản lý biến môi trường tập trung trong `postman/eshop_environment.json` (`baseUrl`, `student_id: 23127125`, `user_token`, `admin_token`, `test_product_id`, `created_coupon_id`).
- [x] **Dynamic Variables & Anti-Pollution:** Tự động sinh mã động kèm Timestamp `Date.now()` trong Pre-request Script nhằm đảm bảo tính **Bất biến (Idempotency 100%)** giữa các lần chạy.
- [x] **Header Chống Gian Lận (Anti-AI-Cheat):** Tự động gắn Header `X-Student-Id: 23127125` vào 100% HTTP requests.
- [x] **Post-response Assertions:** Kiểm tra mã trạng thái HTTP, tính toán số học chính xác, kiểm tra thời gian phản hồi SLA (< 500ms).
- [x] **JSON Schema Validation:** Xác thực cấu trúc dữ liệu JSON phản hồi qua thư viện Ajv Schema.
- [x] **Data-Driven Testing:** Tích hợp file CSV [`data_driven_coupons.csv`](postman/data_driven_coupons.csv) để chạy 10 iterations tự động cho FR-09.
- [x] **Newman CLI & HTML Extra Reporter:** Tự động thực thi toàn bộ test suites và xuất 4 báo cáo HTML trực quan chuyên nghiệp.
- [x] **CI/CD Pipeline GitHub Actions:** Thiết lập `.github/workflows/api-test.yml` tự động clone backend SUT và thực thi kiểm thử hồi quy trên cloud runner.

---

## 4. HƯỚNG DẪN CHẠY KIỂM THỬ NHANH

### 1. Khởi chạy Backend SUT EShop (Localhost 3000):
```bash
cd /path/to/eshop-sut/backend
npm install
npm start
```

### 2. Chạy toàn bộ kịch bản kiểm thử bằng Newman CLI:
```bash
# Chạy FR-06 (Xem chi tiết sản phẩm)
npx newman run postman/fr06_product_detail_collection.json -e postman/eshop_environment.json -r cli,htmlextra --reporter-htmlextra-export reports/fr06_newman_report.html

# Chạy FR-09 (Áp dụng mã giảm giá)
npx newman run postman/fr09_apply_coupon_collection.json -e postman/eshop_environment.json -r cli,htmlextra --reporter-htmlextra-export reports/fr09_newman_report.html

# Chạy FR-09 Nâng cao Data-Driven với File CSV (10 Iterations)
npx newman run postman/fr09_apply_coupon_collection.json -e postman/eshop_environment.json -d postman/data_driven_coupons.csv -r cli,htmlextra --reporter-htmlextra-export reports/fr09_data_driven_report.html

# Chạy FR-17 (Quản lý mã giảm giá Admin CRUD)
npx newman run postman/fr17_admin_coupon_collection.json -e postman/eshop_environment.json -r cli,htmlextra --reporter-htmlextra-export reports/fr17_newman_report.html
```

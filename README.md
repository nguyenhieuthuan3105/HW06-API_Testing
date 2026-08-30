# Báo cáo Kiểm thử API Tự động EShop (HW06 - API Testing)

- **Họ và tên sinh viên:** Nguyễn Hiếu Thuận
- **Mã số sinh viên:** 23127125
- **Lớp học phần:** Kiểm thử phần mềm - 23KTPM4
- **Bộ 3 APIs thực hiện:**
  1. `Pool A - FR-06:` Xem chi tiết sản phẩm (`GET /api/products/:id`)
  2. `Pool B - FR-09:` Áp dụng mã giảm giá (`POST /api/apply-coupon`)
  3. `Pool C - FR-17:` Quản lý mã giảm giá Admin CRUD (`POST/GET/DELETE /api/admin/coupons`)
- **GitHub Repository:** `[https://github.com/nguyenhieuthuan3105/HW06-API_Testing.git]`
- **Video Demo Agent Skill (YouTube Unlisted):** `[...]`

---

## 1. BẢNG TỰ ĐÁNH GIÁ ĐIỂM SỐ (SELF-ASSESSMENT TABLE)

| STT | Tiêu chí đánh giá | Điểm tối đa | Điểm tự đánh giá | Ghi chú & Minh chứng chính |
| :---: | :--- | :---: | :---: | :--- |
| 1 | **API 1 (Pool A - FR-06 Product Detail):** Full Pipeline (Generate ≥35, Audit, Extend ≥5, Newman, Bugs) | | |
| 2 | **API 2 (Pool B - FR-09 Apply Coupon):** Full Pipeline (Generate ≥35, Audit, Extend ≥5, Newman, Bugs) | | |
| 3 | **API 3 (Pool C - FR-17 Admin Coupon CRUD):** Full Pipeline (Generate ≥35, Audit, Extend ≥5, Newman, Bugs) | | |
| 4 | **Agent Skill (AI Test Generator):** Sơ đồ kiến trúc, Pseudocode, Python code, Video demo | | |
| **Tổng** | **Toàn bộ bài tập HW06** | **100** | | |

---

## 2. BẢNG TỔNG HỢP KẾT QUẢ KIỂM THỬ (TEST SUMMARY REPORT)

| Thông số thống kê | API 1 (Pool A) | API 2 (Pool B) | API 3 (Pool C) | Toàn hệ thống (Total) |
| :--- | :---: | :---: | :---: | :---: |
| **Tên tính năng & Mã FR** | FR-06: Product Detail | FR-09: Apply Coupon | FR-17: Admin Coupon CRUD | 3 APIs |
| **Số Test Cases AI sinh (Generated)** | | |  |  |
| **Số Test Cases hợp lệ (Valid)** | |  |  |  |
| **Số Test Cases sửa chữa (Corrected)** | | |  |  |
| **Số Test Cases mở rộng (Added/Extended)** | | |  |  |
| **Tổng Test Cases thực thi (Executed)** | | |  |  |
| **Số Test Cases Thành công (Passed)** | | |  |  |
| **Số Test Cases Thất bại (Failed)** | | |  |  |
| **Số lỗi thực tế phát hiện (Bugs Found)** | | |  |  |

---

## 3. DANH SÁCH TÍNH NĂNG POSTMAN ĐÃ SỬ DỤNG
- [] Workspaces & Collections (Tổ chức theo FR-06, FR-09, FR-17)
- [] Environment Variables (`baseUrl`, `student_id`, `user_token`, `admin_token`)
- [] Dynamic Variables (`{{$timestamp}}`, `{{$guid}}`)
- [] Pre-request Script tự động gắn Header `X-Student-Id`
- [] Post-response Chai.js Assertions & Response Time Checking (< 1500ms)
- [] JSON Schema Validation qua `pm.response.to.have.jsonSchema`
- [] Data-Driven Testing với Collection Runner & file CSV cho FR-09 (5 điều kiện C1–C5)
- [] Newman CLI Runner tích hợp xuất báo cáo HTML Extra
- [] CI/CD Pipeline tự động hóa với GitHub Actions (2 commit Pass & Fail)

---

## 4. HƯỚNG DẪN CHẠY KIỂM THỬ NHANH
1. Khởi chạy SUT Backend EShop:
   ```bash
   npm install
   npm start
   ```
2. Chạy kiểm thử tự động với Newman:
   ```bash
   newman run postman/eshop_api_collection.json -e postman/eshop_environment.json -r cli,htmlextra --reporter-htmlextra-export reports/newman_report.html
   ```
3. Xem báo cáo tại file: `reports/newman_report.html`.

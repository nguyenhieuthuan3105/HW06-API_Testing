# Danh sách các Tính năng Postman đã Sử dụng trong HW06

Dưới đây là các tính năng kỹ thuật nâng cao của Postman được áp dụng trong quá trình kiểm thử hệ thống EShop (FR-06, FR-09, FR-17):

---

## 1. Cấu trúc Workspaces & Collections
- **Workspace:** `HW06_API_Testing_Workspace` phân chia rõ ràng các modules.
- **Collection Structure:**
  - `00_Setup_and_Authentication`: Đăng nhập tự động Admin & User test để lưu JWT Token.
  - `01_FR06_Product_Detail`: Chứa các ca kiểm thử cho `GET /api/products/:id`.
  - `02_FR09_Apply_Coupon`: Chứa các ca kiểm thử cho `POST /api/apply-coupon` (5 điều kiện C1–C5).
  - `03_FR17_Admin_Coupon_CRUD`: Chứa các ca kiểm thử cho `POST/GET/DELETE /api/admin/coupons`.

---

## 2. Variables & Environments
- **Environment Scope:** Quản lý tập trung các biến môi trường:
  - `baseUrl`: `http://localhost:3000`
  - `student_id`: Mã số sinh viên thực hiện bài test (Anti-AI-Cheat).
  - `admin_token`, `user_token`: JWT Bearer Token được gán động.
  - `test_product_id`, `created_coupon_id`: Lưu trữ ID tạm thời để kiểm thử CRUD.
- **Dynamic Variables:** Sử dụng các hàm sinh ngẫu nhiên của Postman như `{{$timestamp}}`, `{{$guid}}` để sinh mã coupon duy nhất khi test tạo mã mới ở FR-17.

---

## 3. Pre-request Scripts
- **Tự động gắn Header `X-Student-Id` (Anti-AI-Cheat):**
  ```javascript
  const studentId = pm.environment.get("student_id") || "23127125";
  pm.request.headers.upsert({
      key: "X-Student-Id",
      value: studentId
  });
  console.log(`[PRE-REQUEST] Injected X-Student-Id: ${studentId} to ${pm.request.url.toString()}`);
  ```
- **Tự động đăng nhập lấy token:** Kiểm tra nếu chưa có `admin_token` hoặc `user_token` thì tự động kích hoạt request login để lấy token trước khi chạy test.

---

## 4. Post-response Test Scripts & Chai.js Assertions
- **Kiểm tra Status Code:** `pm.response.to.have.status(200)`
- **Kiểm tra Response Time:** `pm.expect(pm.response.responseTime).to.be.below(1500)`
- **Kiểm tra JSON Schema (Ajv):** Xác thực cấu trúc dữ liệu trả về với `pm.response.to.have.jsonSchema(schema)`
- **Kiểm tra Logic nghiệp vụ:** Xác thực công thức tính toán `final_amount = total_amount - discount_amount`.

---

## 5. Data-Driven Testing (Collection Runner)
- Sử dụng file dữ liệu `postman/data_driven_coupons.csv` để chạy lặp kiểm thử ma trận 5 điều kiện C1–C5 của tính năng Áp dụng mã giảm giá (FR-09).
- Tự động đối chiếu kết quả trả về với các cột `expected_status` và `expected_discount`.

---

## 6. Newman CLI & HTML Extra Reporter
- Thực thi toàn bộ bộ kiểm thử tự động từ dòng lệnh trên terminal:
  ```bash
  newman run postman/eshop_api_collection.json -e postman/eshop_environment.json -r cli,htmlextra --reporter-htmlextra-export reports/newman_report.html
  ```

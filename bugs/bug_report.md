# Danh sách Lỗi Phát hiện trên SUT EShop (Bug Report)

Dưới đây là các lỗi thực tế (Bugs) được phát hiện trong quá trình kiểm thử tự động bộ 3 APIs (FR-06, FR-09, FR-17) so với đặc tả kỹ thuật `api_specification.md` và các tiêu chuẩn bảo mật `SEC-01` → `SEC-07`.

---

## 1. BUG #01: [FR-09][SEC-03] Lỗ hổng IDOR khi áp dụng mã giảm giá không khớp với Token người dùng
- **Mức độ nghiêm trọng (Severity):** High / Security
- **Mã chức năng:** FR-09: Áp dụng mã giảm giá (`POST /api/apply-coupon`)
- **Link GitHub Issue:** `https://github.com/[username]/hw06/issues/1`
- **Mô tả chi tiết:**
  Khi người dùng đăng nhập bằng tài khoản User A (`user_id = 1`) và gửi request áp coupon với body có `"user_id": 2`, hệ thống backend vẫn áp dụng mã và trừ số lượt dùng của User 2 thay vì chặn lại hoặc đối chiếu với JWT token của người gửi request.
- **Các bước tái hiện (Steps to Reproduce):**
  1. Đăng nhập lấy Bearer token của User test (`test@eshop.com`, id = 1).
  2. Gửi request `POST /api/apply-coupon` với Header `Authorization: Bearer <token_user_1>`.
  3. Body: `{"code": "SAVE10", "total_amount": 500000, "user_id": 2}`.
- **Kết quả thực tế (Actual):** Phản hồi `200 OK`, áp dụng mã thành công cho `user_id = 2`.
- **Kết quả mong đợi (Expected):** Phản hồi `403 Forbidden` hoặc `400 Bad Request` do `user_id` trong body không khớp với `user_id` trong JWT Token (Vi phạm SEC-03).
- **Ảnh chụp màn hình bằng chứng:**
  ![Bug 01 IDOR Screenshot](screenshots/bug_01_idor.png)

---

## 2. BUG #02: [FR-17] API Admin cho phép tạo mã giảm giá với `discount_value > 100%` khi `type = percent`
- **Mức độ nghiêm trọng (Severity):** Medium / Business Logic
- **Mã chức năng:** FR-17: Quản lý mã giảm giá Admin (`POST /api/admin/coupons`)
- **Link GitHub Issue:** `https://github.com/[username]/hw06/issues/2`
- **Mô tả chi tiết:**
  Khi Admin tạo coupon loại `percent`, backend không kiểm tra chặn giá trị `discount_value <= 100`. Nếu truyền `discount_value = 150`, mã vẫn được tạo thành công trong CSDL.
- **Các bước tái hiện (Steps to Reproduce):**
  1. Đăng nhập tài khoản Admin (`admin@eshop.com`).
  2. Gửi request `POST /api/admin/coupons` với Body:
     ```json
     {
       "code": "OVER100",
       "type": "percent",
       "discount_value": 150,
       "min_order_amount": 100000,
       "expired_at": "2026-12-31",
       "max_uses_per_user": 1
     }
     ```
- **Kết quả thực tế (Actual):** Phản hồi `200 OK` và lưu vào CSDL.
- **Kết quả mong đợi (Expected):** Phản hồi `400 Bad Request` kèm thông báo lỗi `discount_value must be between 1 and 100 for percent type`.
- **Ảnh chụp màn hình bằng chứng:**
  ![Bug 02 Invalid Discount Screenshot](screenshots/bug_02_discount.png)

---

## 3. BUG #03: [FR-06][SEC-01] Path parameter `:id` không kiểm tra kiểu dữ liệu gây lỗi 500 thay vì 400
- **Mức độ nghiêm trọng (Severity):** Low / Error Handling (SEC-07)
- **Mã chức năng:** FR-06: Xem chi tiết sản phẩm (`GET /api/products/:id`)
- **Link GitHub Issue:** `https://github.com/[username]/hw06/issues/3`
- **Mô tả chi tiết:**
  Khi gửi request `GET /api/products/abc` hoặc `GET /api/products/'`, hệ thống trả về mã lỗi `500 Internal Server Error` kèm stack trace SQLite thay vì trả về `400 Bad Request`.
- **Ảnh chụp màn hình bằng chứng:**
  ![Bug 03 SQL Injection / Error Handling](screenshots/bug_03_error.png)

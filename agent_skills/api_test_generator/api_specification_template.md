# BẢNG ĐẶC TẢ THÔNG TIN API ĐẦU VÀO (API SPECIFICATION INPUT TEMPLATE)
> **Hướng dẫn:** Người dùng điền các thông tin đặc tả của API cần kiểm thử vào bảng dưới đây. Agent Skill sẽ tự động đọc file này để sinh kịch bản kiểm thử toàn diện.

---

## 1. THÔNG TIN CƠ BẢN VỀ ENDPOINT
- **Mã tính năng & Tên:** `FR-09: Áp dụng mã giảm giá (Discount Coupons)`
- **Hệ thống SUT:** EShop Backend (`http://localhost:3000`)
- **HTTP Method:** `POST`
- **Đường dẫn Endpoint:** `/api/apply-coupon`
- **Mức độ xác thực (Authentication):** Bắt buộc Bearer JWT Token (`Authorization: Bearer <user_token>`)
- **Header bắt buộc:**
  - `Content-Type: application/json`
  - `Authorization: Bearer {{user_token}}`
  - `X-Student-Id: {{student_id}}` (Mặc định: `23127125`)

---

## 2. CẤU TRÚC DỮ LIỆU ĐẦU VÀO (REQUEST BODY / PARAMS)

```json
{
  "code": "SAVE10",
  "total_amount": 500000,
  "user_id": 1
}
```

### Bảng mô tả chi tiết các trường:
| Tên trường | Kiểu dữ liệu | Bắt buộc | Ràng buộc giá trị & Ý nghĩa |
| :--- | :---: | :---: | :--- |
| `code` | `String` | Có | Mã giảm giá chữ in hoa (ví dụ: `SAVE10`, `BIGBUY`, `VIP100`). |
| `total_amount` | `Number` | Có | Tổng giá trị đơn hàng trước giảm giá (phải là số dương $\ge 0$). |
| `user_id` | `Number / Integer` | Có | ID của người dùng đang thực hiện áp dụng mã. |

---

## 3. CÁC RÀNG BUỘC NGHIỆP VỤ & MA TRẬN ĐIỀU KIỆN (BUSINESS RULES)

API chỉ áp dụng mã giảm giá thành công khi **THỎA MÃN ĐỒNG THỜI CẢ 5 ĐIỀU KIỆN (C1–C5)**:
- **`C1 (Tồn tại & Kích hoạt):`** Mã giảm giá có trong CSDL và trường `is_active = 1`.
- **`C2 (Hạn sử dụng):`** Ngày hiện tại $\le$ `expired_at` (Mã chưa hết hạn).
- **`C3 (Ngưỡng đơn hàng tối thiểu):`** `total_amount` $\ge$ `min_order_amount`.
- **`C4 (Xác thực người dùng):`** Request gửi kèm Bearer JWT Token hợp lệ.
- **`C5 (Hạn mức sử dụng của người dùng):`** Số lần user đã dùng mã $<$ `max_uses_per_user`.

### Danh sách mã coupon mẫu trong hệ thống:
1. `SAVE10`: Giảm 10% theo tỷ lệ (`percent`), đơn tối thiểu `300,000 VND`, hạn dùng `2099-12-31`, tối đa `1 lần/user`.
2. `BIGBUY`: Giảm cố định `50,000 VND` (`fixed`), đơn tối thiểu `500,000 VND`, hạn dùng `2099-12-31`, tối đa `1 lần/user`.
3. `VIP100`: Giảm cố định `100,000 VND` (`fixed`), đơn tối thiểu `300,000 VND`, hạn dùng `2099-12-31`, tối đa `2 lần/user`.
4. `EXPIRED`: Giảm 20% (`percent`), đơn tối thiểu `100,000 VND`, hạn dùng `2020-01-01` (Đã hết hạn).

### Quy tắc tính toán số học (Mathematical Rules):
- **Loại `percent` (%):**  
  `discount_amount = total_amount * (discount_value / 100)`  
  `final_amount = total_amount - discount_amount`
- **Loại `fixed` (tiền cố định):**  
  `discount_amount = discount_value`  
  `final_amount = total_amount - discount_amount`

---

## 4. CẤU TRÚC PHẢN HỒI KỲ VỌNG (EXPECTED RESPONSE SCHEMAS)

### Phản hồi Thành công (`200 OK`):
```json
{
  "message": "Coupon applied successfully",
  "coupon": {
    "code": "SAVE10",
    "discount_type": "percent",
    "discount_value": 10,
    "discount_amount": 50000,
    "original_amount": 500000,
    "final_amount": 450000
  }
}
```

### Phản hồi Thất bại:
- `400 Bad Request`: Thiếu trường bắt buộc, giá trị không hợp lệ, không đủ điều kiện C1/C2/C3/C5.
- `401 Unauthorized`: Thiếu hoặc sai Bearer JWT Token (Vi phạm C4).
- `403 Forbidden`: IDOR (User ID không khớp với Token) hoặc không đủ quyền hạn.
- `404 Not Found`: Mã coupon không tồn tại.

---

## 5. YÊU CẦU ĐỘ BAO PHỦ KIỂM THỬ (TEST REQUIREMENTS)
- Sinh tối thiểu **35 ca kiểm thử** bao phủ:
  1. Ma trận 5 điều kiện C1–C5.
  2. Domain Partitioning & Boundary Value Analysis trên `total_amount`.
  3. Security SEC-01..07 (SQLi, Auth Bypass, IDOR, Tampering).
  4. Schema Validation & Assertions tính toán số học chính xác.
- Tự động chạy Newman và xuất báo cáo HTML.

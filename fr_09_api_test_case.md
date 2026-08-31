# BẢNG THIẾT KẾ KỊCH BẢN KIỂM THỬ API FR-09 (APPLY COUPON)
## Endpoint: `POST /api/apply-coupon` — Hệ thống EShop SUT
### Tổng số ca kiểm thử: 40 Test Cases (Bao phủ Ma trận 5 Điều kiện C1–C5, BVA, Bảo mật SEC-01..07 & Schema)

---

### 📌 THÔNG TIN ĐẶC TẢ KỸ THUẬT
- **Endpoint:** `POST /api/apply-coupon`
- **Method:** `POST`
- **Authentication:** Bearer JWT Token (`Authorization: Bearer <user_token>`)
- **Headers:** `Content-Type: application/json`, `X-Student-Id: 25127001`
- **Request Body:**
  ```json
  {
    "code": "SAVE10",
    "total_amount": 500000,
    "user_id": 1
  }
  ```
- **5 Ràng buộc Điều kiện (Bắt buộc thỏa mãn đồng thời):**
  - **C1 (Tồn tại & Active):** Mã có trong CSDL và `is_active = 1`.
  - **C2 (Hạn dùng):** Ngày hiện tại $\le$ `expired_at`.
  - **C3 (Ngưỡng đơn):** `total_amount` $\ge$ `min_order_amount`.
  - **C4 (Đăng nhập):** Người dùng có Bearer JWT token hợp lệ.
  - **C5 (Lượt dùng):** Số lần đã dùng của user $<$ `max_uses_per_user`.
- **Dữ liệu Coupon mẫu trong hệ thống:**
  - `SAVE10`: percent 10%, min 300,000 ₫, hạn 2099-12-31, max_uses 1
  - `BIGBUY`: fixed 50,000 ₫, min 500,000 ₫, hạn 2099-12-31, max_uses 1
  - `VIP100`: fixed 100,000 ₫, min 300,000 ₫, hạn 2099-12-31, max_uses 2
  - `EXPIRED`: percent 20%, min 100,000 ₫, hạn 2020-01-01, max_uses 1
- **Công thức tính tiền:**
  - Loại `percent`: $\text{discount\_amount} = \text{total} \times \text{value} / 100$; $\text{final\_amount} = \text{total} - \text{discount\_amount}$.
  - Loại `fixed`: $\text{discount\_amount} = \text{value}$; $\text{final\_amount} = \text{total} - \text{discount\_amount}$.

---

## TỔNG HỢP DANH SÁCH 40 TEST CASES CHO FR-09

### NHÓM 1: Ma Trận Phân Tích & Kết Hợp 5 Điều Kiện (Condition Matrix C1–C5) — 14 TCs

| TestID | Tên Test Case | Điều kiện kiểm tra | Payload Body (`code`, `total_amount`, `user_id`) & Auth | Expected Status | Expected Response & Assertions |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR09_COND_01** | Áp dụng thành công mã Percent `SAVE10` thỏa cả 5 điều kiện | C1..C5 = True | `{"code": "SAVE10", "total_amount": 500000, "user_id": 1}` + Valid Token | `200 OK` | `valid: true`, `discount_amount = 50000`, `final_amount = 450000` |
| **TC_FR09_COND_02** | Áp dụng thành công mã Fixed `BIGBUY` thỏa cả 5 điều kiện | C1..C5 = True | `{"code": "BIGBUY", "total_amount": 600000, "user_id": 1}` + Valid Token | `200 OK` | `valid: true`, `discount_amount = 50000`, `final_amount = 550000` |
| **TC_FR09_COND_03** | Áp dụng thành công mã Fixed `VIP100` thỏa cả 5 điều kiện | C1..C5 = True | `{"code": "VIP100", "total_amount": 400000, "user_id": 1}` + Valid Token | `200 OK` | `valid: true`, `discount_amount = 100000`, `final_amount = 300000` |
| **TC_FR09_COND_04** | Vi phạm C1 — Mã không tồn tại trong CSDL | C1 = False | `{"code": "INVALID_CODE_999", "total_amount": 500000, "user_id": 1}` + Valid Token | `400 Bad Request` / `404` | `error: "Coupon not found"` hoặc `valid: false` |
| **TC_FR09_COND_05** | Vi phạm C1 — Mã tồn tại nhưng bị vô hiệu hóa (`is_active = 0`) | C1 = False | `{"code": "INACTIVE_COUPON", "total_amount": 500000, "user_id": 1}` + Valid Token | `400 Bad Request` | Thông báo mã không hoạt động |
| **TC_FR09_COND_06** | Vi phạm C2 — Mã đã hết hạn sử dụng (`EXPIRED` 2020-01-01) | C2 = False | `{"code": "EXPIRED", "total_amount": 500000, "user_id": 1}` + Valid Token | `400 Bad Request` | `error: "Coupon has expired"` |
| **TC_FR09_COND_07** | Vi phạm C3 — Đơn hàng dưới ngưỡng tối thiểu (`SAVE10` min 300k, gửi 200k) | C3 = False | `{"code": "SAVE10", "total_amount": 200000, "user_id": 1}` + Valid Token | `400 Bad Request` | `error: "Order total does not meet minimum requirement"` |
| **TC_FR09_COND_08** | Vi phạm C4 — Không đăng nhập (Không gửi header `Authorization`) | C4 = False | `{"code": "SAVE10", "total_amount": 500000, "user_id": 1}` + No Token | `401 Unauthorized` | Từ chối truy cập do thiếu authentication |
| **TC_FR09_COND_09** | Vi phạm C5 — Người dùng đã dùng hết lượt cho phép (`max_uses_per_user`) | C5 = False | `{"code": "SAVE10", "total_amount": 500000, "user_id": 1}` (Lần 2) + Valid Token | `400 Bad Request` | `error: "Usage limit reached for this coupon"` |
| **TC_FR09_COND_10** | Vi phạm đồng thời C1 & C3 (Mã không tồn tại + Đơn hàng dưới 300k) | C1, C3 = False | `{"code": "FAKE10", "total_amount": 50000, "user_id": 1}` + Valid Token | `400 Bad Request` | Từ chối áp dụng, mã lỗi 400 |
| **TC_FR09_COND_11** | Vi phạm đồng thời C2 & C3 (Mã hết hạn + Đơn hàng không đủ 100k) | C2, C3 = False | `{"code": "EXPIRED", "total_amount": 50000, "user_id": 1}` + Valid Token | `400 Bad Request` | Từ chối áp dụng, mã lỗi 400 |
| **TC_FR09_COND_12** | Vi phạm đồng thời C3 & C4 (Chưa đăng nhập + Đơn hàng dưới ngưỡng) | C3, C4 = False | `{"code": "BIGBUY", "total_amount": 100000, "user_id": 1}` + No Token | `401 Unauthorized` | Ưu tiên chặn tại tầng Auth (401) |
| **TC_FR09_COND_13** | Kiểm tra mã cho phép dùng 2 lần `VIP100` — Lần sử dụng thứ nhất | C5 (1/2) = True | `{"code": "VIP100", "total_amount": 350000, "user_id": 1}` + Valid Token | `200 OK` | `valid: true`, `discount_amount = 100000` |
| **TC_FR09_COND_14** | Kiểm tra mã cho phép dùng 2 lần `VIP100` — Lần sử dụng thứ hai | C5 (2/2) = True | `{"code": "VIP100", "total_amount": 350000, "user_id": 1}` + Valid Token | `200 OK` | `valid: true`, chấp nhận lượt thứ 2 |

---

### NHÓM 2: Phân Vùng Tương Đương & Phân Tích Giá Trị Biên trên `total_amount` — 10 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Payload Body (`total_amount`) | Expected Status | Assertions Chi Tiết |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR09_BVA_01** | Đúng bằng ngưỡng tối thiểu (`total_amount = min_order = 300000`) | Boundary Value Analysis | `{"code": "SAVE10", "total_amount": 300000, "user_id": 1}` | `200 OK` | `discount_amount = 30000`, `final_amount = 270000` |
| **TC_FR09_BVA_02** | Dưới ngưỡng tối thiểu 1 đơn vị (`total_amount = 299999`) | Boundary Value Analysis | `{"code": "SAVE10", "total_amount": 299999, "user_id": 1}` | `400 Bad Request` | Bị từ chối do thiếu 1 đồng |
| **TC_FR09_BVA_03** | Trên ngưỡng tối thiểu 1 đơn vị (`total_amount = 300001`) | Boundary Value Analysis | `{"code": "SAVE10", "total_amount": 300001, "user_id": 1}` | `200 OK` | `discount_amount = 30000.1`, `final_amount = 270000.9` |
| **TC_FR09_BVA_04** | Tổng tiền đơn hàng bằng 0 (`total_amount = 0`) | Boundary (Zero) | `{"code": "SAVE10", "total_amount": 0, "user_id": 1}` | `400 Bad Request` | Lỗi tổng đơn hàng không hợp lệ |
| **TC_FR09_BVA_05** | Tổng tiền đơn hàng âm nhỏ nhất (`total_amount = -1`) | Boundary (Negative) | `{"code": "SAVE10", "total_amount": -1, "user_id": 1}` | `400 Bad Request` | Lỗi `total_amount must be greater than 0` |
| **TC_FR09_BVA_06** | Tổng tiền đơn hàng âm lớn (`total_amount = -500000`) | Invalid Partition | `{"code": "SAVE10", "total_amount": -500000, "user_id": 1}` | `400 Bad Request` | Bị chặn, không gây lỗi logic trừ tiền ngược |
| **TC_FR09_BVA_07** | Tổng tiền đơn hàng cực lớn (`total_amount = 999999999`) | Robustness Testing | `{"code": "SAVE10", "total_amount": 999999999, "user_id": 1}` | `200 OK` | `discount_amount = 99999999.9`, không tràn số |
| **TC_FR09_BVA_08** | Tổng tiền có phần lẻ thập phân (`total_amount = 500000.50`) | Floating Point Test | `{"code": "SAVE10", "total_amount": 500000.50, "user_id": 1}` | `200 OK` | Tính toán chính xác phần lẻ |
| **TC_FR09_BVA_09** | `total_amount` là chuỗi chữ không phải số | Invalid Type Partition | `{"code": "SAVE10", "total_amount": "nam_tram_nghin", "user_id": 1}` | `400 Bad Request` | Báo lỗi sai kiểu dữ liệu số học |
| **TC_FR09_BVA_10** | Thiếu trường bắt buộc `total_amount` trong Body | Missing Field Test | `{"code": "SAVE10", "user_id": 1}` | `400 Bad Request` | Lỗi thiếu trường `total_amount is required` |

---

### NHÓM 3: Kiểm Thử Bảo Mật Chuyên Sâu (Security Testing SEC-01 → SEC-07) — 10 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Payload / Headers | Expected Status | Assertions Bảo Mật |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR09_SEC_01** | **IDOR (SEC-03):** Sửa `user_id` trong body khác với ID trong JWT Token | SEC-03 (IDOR) | Token User 1 (`id=1`), Body: `{"code": "SAVE10", "total_amount": 500000, "user_id": 2}` | `403 Forbidden` / `400` | Backend phát hiện bất đồng nhất danh tính, chặn thao tác |
| **TC_FR09_SEC_02** | **Authentication Missing (SEC-02):** Gọi API không kèm token | SEC-02 (Auth) | Không có Header `Authorization` | `401 Unauthorized` | Chặn truy cập người dùng ẩn danh |
| **TC_FR09_SEC_03** | **Tampered JWT Token (SEC-02):** Gửi Bearer token giả mạo | SEC-02 (Auth) | `Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.fake` | `401 Unauthorized` | Xác thực chữ ký số JWT thất bại |
| **TC_FR09_SEC_04** | **Expired JWT Token (SEC-02):** Gửi JWT Token đã hết hạn | SEC-02 (Auth) | Header Bearer Token đã quá hạn `exp` | `401 Unauthorized` | Chặn token hết hạn |
| **TC_FR09_SEC_05** | **SQL Injection trong mã coupon (SEC-01):** Tautology Bypass | SEC-01 (SQLi) | `{"code": "SAVE10' OR '1'='1", "total_amount": 500000, "user_id": 1}` | `400 Bad Request` | Bị chặn, không truy vấn CSDL tìm ra coupon sai |
| **TC_FR09_SEC_06** | **SQLi Stacked Queries (SEC-01):** Tấn công xóa bảng | SEC-01 (SQLi) | `{"code": "SAVE10'; DROP TABLE coupons;--", "total_amount": 500000, "user_id": 1}` | `400 Bad Request` | Bị chặn, cấu trúc CSDL an toàn |
| **TC_FR09_SEC_07** | **Parameter Tampering (SEC-04):** Client tự ý gửi `discount_amount` khống | SEC-04 (Tampering) | `{"code": "SAVE10", "total_amount": 500000, "user_id": 1, "discount_amount": 490000}` | `200 OK` | Backend tự tính toán lại (50,000 ₫), bỏ qua giá trị client gửi |
| **TC_FR09_SEC_08** | **XSS Injection trong Code (SEC-01):** Payload mã độc script | SEC-01 (XSS) | `{"code": "<script>alert('XSS')</script>", "total_amount": 500000, "user_id": 1}` | `400 Bad Request` | Ký tự HTML được lọc sạch hoặc từ chối |
| **TC_FR09_SEC_09** | **Concurrency Double-Spending (SEC-06):** Race condition | SEC-06 (DoS/Race) | Gửi đồng thời 2 request áp cùng 1 mã giới hạn 1 lần | `400 Bad Request` | Request thứ 2 phải bị từ chối do đã dùng hết lượt |
| **TC_FR09_SEC_10** | **Information Disclosure (SEC-07):** Không lộ cấu trúc CSDL khi lỗi | SEC-07 (Info Leak) | `{"code": "INVALID'", "total_amount": 500000, "user_id": 1}` | `400 Bad Request` | Body KHÔNG chứa `sqlite3`, `SQL syntax`, `stack trace` |

---

### NHÓM 4: Xác Thực Schema, Giao Thức & Độ Chính Xác Toán Học (Schema & Business Logic Math) — 6 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Payload / Condition | Expected Status | Assertions Chi Tiết & Chai.js Logic |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR09_SCH_01** | Xác thực JSON Schema khi áp mã thành công (200 OK) | JSON Schema (Ajv) | `SAVE10` + 500,000 ₫ | `200 OK` | Đầy đủ trường: `valid` (boolean), `code` (string), `discount_amount` (number $\ge 0$), `final_amount` (number $\ge 0$), `original_total` (number) |
| **TC_FR09_SCH_02** | Kiểm tra độ chính xác toán học mã Percent ($\text{discount} = \text{total} \times \text{value} / 100$) | Math Logic Verification | `SAVE10` (10%) + 500,000 ₫ | `200 OK` | `pm.expect(data.discount_amount).to.equal(50000); pm.expect(data.final_amount).to.equal(450000);` |
| **TC_FR09_SCH_03** | Kiểm tra độ chính xác toán học mã Fixed ($\text{discount} = \text{value}$) | Math Logic Verification | `BIGBUY` (50k) + 600,000 ₫ | `200 OK` | `pm.expect(data.discount_amount).to.equal(50000); pm.expect(data.final_amount).to.equal(550000);` |
| **TC_FR09_SCH_04** | Xác thực cấu trúc JSON Error khi thất bại (400 Bad Request) | Error Schema Validation | Mã sai `FAKE10` | `400 Bad Request` | Object chứa trường `error` hoặc `message` dạng String |
| **TC_FR09_SCH_05** | Kiểm tra phương thức HTTP sai (`GET /api/apply-coupon`) | HTTP Protocol Compliance | Gửi `GET` thay vì `POST` | `404` / `405 Method Not Allowed` | Server không cho phép áp coupon qua phương thức GET |
| **TC_FR09_SCH_06** | Đảm bảo SLA thời gian phản hồi API tính coupon (< 500ms) | Performance Benchmark | `SAVE10` + 500,000 ₫ | `200 OK` | `pm.expect(pm.response.responseTime).to.be.below(500);` |

---

## 🛠️ ĐOẠN MÃ POSTMAN TEST SCRIPT CHUẨN XÁC THỰC CÔNG THỨC FR-09

```javascript
// 1. Kiểm tra Status Code thành công
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

// 2. Xác thực JSON Schema chi tiết
const applyCouponSchema = {
    "type": "object",
    "required": ["valid", "code", "discount_amount", "final_amount"],
    "properties": {
        "valid": { "type": "boolean" },
        "code": { "type": "string" },
        "discount_amount": { "type": "number", "minimum": 0 },
        "final_amount": { "type": "number", "minimum": 0 },
        "original_total": { "type": "number", "minimum": 0 }
    }
};
pm.test("Response body matches Apply Coupon Schema", function () {
    pm.response.to.have.jsonSchema(applyCouponSchema);
});

// 3. Kiểm tra Độ chính xác Số học (Business Math Logic)
const resData = pm.response.json();
const reqData = JSON.parse(pm.request.body.raw);

pm.test("Discount calculation math is 100% accurate", function () {
    pm.expect(resData.final_amount).to.equal(reqData.total_amount - resData.discount_amount);
});
```

# BẢNG THIẾT KẾ KỊCH BẢN KIỂM THỬ API FR-09 (APPLY COUPON)
## Endpoint: `POST /api/apply-coupon` — Hệ thống EShop SUT
### Tổng số ca kiểm thử: 45 Test Cases (40 AI-Generated & Audited + 5 Human Extension)

---

### 📌 THÔNG TIN ĐẶC TẢ KỸ THUẬT & SUT REALITY
- **Endpoint:** `POST /api/apply-coupon`
- **Method:** `POST`
- **Authentication (Spec C4):** Bearer JWT Token (`Authorization: Bearer <user_token>`)
- **Headers:** `Content-Type: application/json`, `X-Student-Id: 25127001`
- **Request Body:**
  ```json
  {
    "code": "SAVE10",
    "total_amount": 500000,
    "user_id": 1
  }
  ```
- **5 Ràng buộc Điều kiện Nghiệp vụ (C1–C5):**
  - **C1 (Tồn tại & Active):** Mã có trong CSDL và `is_active = 1`.
  - **C2 (Hạn dùng):** Ngày hiện tại $\le$ `expired_at`.
  - **C3 (Ngưỡng đơn):** `total_amount` $\ge$ `min_order_amount`.
  - **C4 (Đăng nhập):** Người dùng có Bearer JWT token hợp lệ.
  - **C5 (Lượt dùng):** Số lần đã dùng của user $<$ `max_uses_per_user`.
- **Dữ liệu Coupon mẫu trong CSDL SQLite:**
  - `SAVE10`: percent 10%, min 300,000 ₫, hạn 2099-12-31, max_uses 1
  - `BIGBUY`: fixed 50,000 ₫, min 500,000 ₫, hạn 2099-12-31, max_uses 1
  - `VIP100`: fixed 100,000 ₫, min 300,000 ₫, hạn 2099-12-31, max_uses 2
  - `EXPIRED`: percent 20%, min 100,000 ₫, hạn 2020-01-01, max_uses 1
- **Cấu trúc Response Chuẩn của SUT:**
  - **Thành công (200 OK):**
    ```json
    {
      "success": true,
      "coupon_id": 1,
      "discount_amount": 50000,
      "final_amount": 450000,
      "message": "Áp dụng thành công! Giảm 10%"
    }
    ```
  - **Thất bại (400 / 404):**
    ```json
    {
      "error": "Thông báo lỗi chi tiết"
    }
    ```

---

## PHẦN I: DANH SÁCH 40 TEST CASES ĐÃ QUA RÀ SOÁT (AUDITED)

### NHÓM 1: Ma Trận Phân Tích & Kết Hợp 5 Điều Kiện (C1–C5) — 14 TCs

| TestID | Tên Test Case | Điều kiện kiểm tra | Payload Body & Headers | Expected Status | Assertions Kỳ Vọng |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR09_COND_01** | Áp dụng thành công mã Percent `SAVE10` | C1..C5 = True | `{"code": "SAVE10", "total_amount": 500000, "user_id": 1}` + Valid Token | `200 OK` | `success: true`, `discount_amount = 50000`, `final_amount = 450000` |
| **TC_FR09_COND_02** | Áp dụng thành công mã Fixed `BIGBUY` | C1..C5 = True | `{"code": "BIGBUY", "total_amount": 600000, "user_id": 1}` + Valid Token | `200 OK` | `success: true`, `discount_amount = 50000`, `final_amount = 550000` |
| **TC_FR09_COND_03** | Áp dụng thành công mã Fixed `VIP100` | C1..C5 = True | `{"code": "VIP100", "total_amount": 400000, "user_id": 1}` + Valid Token | `200 OK` | `success: true`, `discount_amount = 100000`, `final_amount = 300000` |
| **TC_FR09_COND_04** | Vi phạm C1 — Mã không tồn tại trong CSDL | C1 = False | `{"code": "INVALID_CODE_999", "total_amount": 500000, "user_id": 1}` | `404 Not Found` / `400` | `pm.response.json().error` chứa thông báo không tồn tại |
| **TC_FR09_COND_05** | Vi phạm C1 — Mã tồn tại nhưng bị vô hiệu hóa (`is_active = 0`) | C1 = False | `{"code": "INACTIVE_COUPON", "total_amount": 500000, "user_id": 1}` | `404 Not Found` / `400` | `error` chứa thông báo bị vô hiệu hóa |
| **TC_FR09_COND_06** | Vi phạm C2 — Mã đã hết hạn (`EXPIRED` 2020-01-01) | C2 = False | `{"code": "EXPIRED", "total_amount": 500000, "user_id": 1}` | `400 Bad Request` | `error: "Mã giảm giá đã hết hạn"` |
| **TC_FR09_COND_07** | Vi phạm C3 — Đơn hàng dưới ngưỡng (Gửi 200k, Min 300k) | C3 = False | `{"code": "SAVE10", "total_amount": 200000, "user_id": 1}` | `400 Bad Request` | `error` chứa thông báo chưa đủ giá trị tối thiểu |
| **TC_FR09_COND_08** | Vi phạm C4 — Không gửi Token (`Authorization`) | C4 = False | `{"code": "SAVE10", "total_amount": 500000, "user_id": 1}` (No Token) | `401 Unauthorized` | Chặn truy cập người dùng chưa đăng nhập |
| **TC_FR09_COND_09** | Vi phạm C5 — Đã dùng hết lượt cho phép (`max_uses`) | C5 = False | `{"code": "SAVE10", "total_amount": 500000, "user_id": 1}` (Đã trigger usage) | `400 Bad Request` | `error` chứa thông báo đã đạt giới hạn |
| **TC_FR09_COND_10** | Vi phạm kết hợp C1 & C3 (Mã sai + Dưới ngưỡng 300k) | C1, C3 = False | `{"code": "FAKE10", "total_amount": 50000, "user_id": 1}` | `404 Not Found` / `400` | Bị từ chối áp dụng |
| **TC_FR09_COND_11** | Vi phạm kết hợp C2 & C3 (Mã hết hạn + Dưới ngưỡng 100k) | C2, C3 = False | `{"code": "EXPIRED", "total_amount": 50000, "user_id": 1}` | `400 Bad Request` | Bị từ chối áp dụng |
| **TC_FR09_COND_12** | Vi phạm kết hợp C3 & C4 (Không đăng nhập + Dưới ngưỡng) | C3, C4 = False | `{"code": "BIGBUY", "total_amount": 100000, "user_id": 1}` (No Token) | `401 Unauthorized` | Chặn tại tầng Auth |
| **TC_FR09_COND_13** | Mã dùng 2 lần `VIP100` — Lần sử dụng thứ nhất | C5 (1/2) = True | `{"code": "VIP100", "total_amount": 350000, "user_id": 1}` | `200 OK` | `success: true`, `discount_amount = 100000` |
| **TC_FR09_COND_14** | Mã dùng 2 lần `VIP100` — Lần sử dụng thứ hai | C5 (2/2) = True | `{"code": "VIP100", "total_amount": 350000, "user_id": 1}` | `200 OK` | `success: true`, chấp nhận lượt thứ 2 |

---

### NHÓM 2: Phân Tích Giá Trị Biên & Miền Dữ Liệu trên `total_amount` — 10 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | `total_amount` gửi lên | Expected Status | Assertions Chi Tiết |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR09_BVA_01** | Bằng đúng ngưỡng tối thiểu + 1 (`total = 300001` > min) | Boundary Analysis | `300001` | `200 OK` | `success: true`, `discount_amount = 30000.1` |
| **TC_FR09_BVA_02** | Dưới ngưỡng tối thiểu đúng 1 đơn vị (`total = 299999`) | Boundary Value Analysis | `299999` | `400 Bad Request` | Bị từ chối do thiếu 1 đồng |
| **TC_FR09_BVA_03** | Đơn hàng lớn thoải mái vượt ngưỡng (`total = 1000000`) | Valid Partition | `1000000` | `200 OK` | `discount_amount = 100000`, `final = 900000` |
| **TC_FR09_BVA_04** | Tổng tiền đơn hàng bằng 0 (`total_amount = 0`) | Boundary (Zero) | `0` | `400 Bad Request` | Lỗi tổng đơn hàng không hợp lệ |
| **TC_FR09_BVA_05** | Tổng tiền âm nhỏ nhất (`total_amount = -1`) | Boundary (Negative) | `-1` | `400 Bad Request` | Lỗi `total_amount must be greater than 0` |
| **TC_FR09_BVA_06** | Tổng tiền âm lớn (`total_amount = -500000`) | Invalid Partition | `-500000` | `400 Bad Request` | Chặn số âm, không gây trừ tiền ngược |
| **TC_FR09_BVA_07** | Tổng tiền cực lớn (`total_amount = 999999999`) | Robustness Testing | `999999999` | `200 OK` | `discount_amount = 99999999.9`, không tràn số |
| **TC_FR09_BVA_08** | Tổng tiền có số thập phân (`500000.50`) | Floating Point Test | `500000.50` | `200 OK` | Tính toán chính xác phần lẻ |
| **TC_FR09_BVA_09** | `total_amount` là chuỗi chữ cái | Invalid Type Partition | `"nam_tram_nghin"` | `400 Bad Request` | Lỗi sai kiểu dữ liệu số |
| **TC_FR09_BVA_10** | Thiếu trường bắt buộc `total_amount` trong Body | Missing Field Test | *(Không gửi field)* | `400 Bad Request` | Lỗi thiếu trường bắt buộc |

---

### NHÓM 3: Kiểm Thử Bảo Mật (Security Testing SEC-01 → SEC-07) — 10 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Mô tả Payload & Headers | Expected Status | Assertions Bảo Mật |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR09_SEC_01** | **IDOR (SEC-03):** Sửa `user_id` trong body khác với ID trong JWT Token | SEC-03 (IDOR) | Token User 1, Body: `{"code": "SAVE10", "total_amount": 500000, "user_id": 2}` | `403 Forbidden` / `400` | Chặn mạo danh tài khoản người khác |
| **TC_FR09_SEC_02** | **Authentication Missing (SEC-02):** Gọi API không token | SEC-02 (Auth) | Không có Header `Authorization` | `401 Unauthorized` | Chặn người dùng chưa đăng nhập |
| **TC_FR09_SEC_03** | **Tampered JWT Token (SEC-02):** Token giả mạo chữ ký | SEC-02 (Auth) | `Authorization: Bearer fake.jwt.token` | `401 Unauthorized` | Xác thực chữ ký số thất bại |
| **TC_FR09_SEC_04** | **Expired JWT Token (SEC-02):** Token đã hết hạn | SEC-02 (Auth) | Bearer Token đã quá hạn `exp` | `401 Unauthorized` | Chặn token hết hạn |
| **TC_FR09_SEC_05** | **SQL Injection (SEC-01):** Tautology trong ô mã code | SEC-01 (SQLi) | `{"code": "SAVE10' OR '1'='1", "total_amount": 500000, "user_id": 1}` | `404 Not Found` / `400` | Bị chặn, không bypass CSDL |
| **TC_FR09_SEC_06** | **SQLi Stacked Queries (SEC-01):** Tấn công xóa bảng | SEC-01 (SQLi) | `{"code": "SAVE10'; DROP TABLE coupons;--", "total_amount": 500000, "user_id": 1}` | `404 Not Found` / `400` | Bị chặn, CSDL an toàn |
| **TC_FR09_SEC_07** | **Parameter Tampering (SEC-04):** Gửi `discount_amount` khống | SEC-04 (Tampering) | Truyền thêm `"discount_amount": 490000` | `200 OK` | Server tự tính lại 50k, không tin client |
| **TC_FR09_SEC_08** | **XSS Injection (SEC-01):** Chèn thẻ script vào mã code | SEC-01 (XSS) | `{"code": "<script>alert('XSS')</script>", "total_amount": 500000, "user_id": 1}` | `404 Not Found` / `400` | Encode an toàn hoặc reject |
| **TC_FR09_SEC_09** | **Concurrency / Double-Spending (SEC-06):** Race condition | SEC-06 (Race) | Gửi đồng thời 2 request cùng 1 mã max_uses=1 | `400 Bad Request` | Request thứ 2 bị từ chối |
| **TC_FR09_SEC_10** | **Information Disclosure (SEC-07):** Giấu lỗi CSDL | SEC-07 (Info Leak) | `{"code": "INVALID'", "total_amount": 500000, "user_id": 1}` | `404 Not Found` / `400` | Body KHÔNG chứa `sqlite3`, stack trace |

---

### NHÓM 4: Schema Validation & Tính Toán Tiền Tệ (Business Math) — 6 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Payload / Condition | Expected Status | Assertions Chai.js |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR09_SCH_01** | Xác thực JSON Schema khi thành công (200 OK) | JSON Schema (Ajv) | `SAVE10` + 500,000 ₫ | `200 OK` | Đủ trường `success`, `coupon_id`, `discount_amount`, `final_amount`, `message` |
| **TC_FR09_SCH_02** | Xác minh phép tính giảm giá % ($\text{total} \times 10 / 100$) | Math Assertion | `SAVE10` (10%) + 500,000 ₫ | `200 OK` | `discount = 50000; final = 450000;` |
| **TC_FR09_SCH_03** | Xác minh phép tính giảm giá Fixed ($\text{total} - 50000$) | Math Assertion | `BIGBUY` (50k) + 600,000 ₫ | `200 OK` | `discount = 50000; final = 550000;` |
| **TC_FR09_SCH_04** | Xác thực cấu trúc JSON Error khi thất bại (400 / 404) | Error Schema | Mã sai `FAKE10` | `404 Not Found` / `400` | Object chứa trường `error` dạng String |
| **TC_FR09_SCH_05** | Kiểm tra sai phương thức HTTP (`GET /api/apply-coupon`) | Method Compliance | Gửi `GET` thay vì `POST` | `404` / `405 Method Not Allowed` | Không cho phép áp coupon qua GET |
| **TC_FR09_SCH_06** | SLA thời gian xử lý nghiệp vụ (< 500ms) | Performance SLA | `SAVE10` + 500,000 ₫ | `200 OK` | `pm.expect(pm.response.responseTime).to.be.below(500);` |

---

## PHẦN II: 5 TEST CASES MỞ RỘNG DO CON NGƯỜI THIẾT KẾ (HUMAN EXTENSION)

| TestID | Tên Test Case Mở Rộng | Kỹ thuật & Lý do AI bỏ sót | Payload Body & Headers | Expected Status | Assertions Chi Tiết |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC_FR09_EXT_01** | **Bắt lỗi Biên C3: Đơn hàng đúng bằng Ngưỡng tối thiểu (`total == min_order`)** | Kiểm tra lỗi logic toán tử so sánh `>` thay vì `>=` trong code backend SUT (`SAVE10` min 300k, gửi đúng 300k). *(AI chỉ test biên chung chung)* | `{"code": "SAVE10", "total_amount": 300000, "user_id": 1}` | `200 OK` | `pm.expect(pm.response.code).to.equal(200);`<br/>*(SUT bị lỗi 400 do viết nhầm `>`)* |
| **TC_FR09_EXT_02** | **Giá trị Giảm giá Fixed vượt quá Tổng tiền đơn hàng (`discount > total`)** | Khi áp dụng mã giảm giá cố định (Fixed) lớn hơn đơn hàng (ví dụ mã 50k cho đơn 30k), kiểm tra xem `final_amount` có bị âm tiền không. | `{"code": "BIGBUY", "total_amount": 30000, "user_id": 1}` | `200 OK` / `400` | `const data = pm.response.json();`<br/>`pm.expect(data.final_amount).to.be.at.least(0);` |
| **TC_FR09_EXT_03** | **Chuẩn hóa chữ Hoa / Thường (Case-Insensitive Normalization)** | Người dùng nhập mã chữ thường `"save10"` hoặc `"Save10"` thay vì `"SAVE10"`. Kiểm tra hệ thống có tự động `.toUpperCase()` hay không. | `{"code": "save10", "total_amount": 500000, "user_id": 1}` | `200 OK` | `pm.expect(pm.response.json().success).to.be.true;` |
| **TC_FR09_EXT_04** | **Khoảng trắng thừa ở đầu/cuối mã (Whitespace Trimming)** | Kiểm tra backend có tự động `.trim()` khoảng trắng thừa do người dùng copy-paste nhầm (`" SAVE10 "`). | `{"code": " SAVE10 ", "total_amount": 500000, "user_id": 1}` | `200 OK` / `404` | Xử lý an toàn, không crash server |
| **TC_FR09_EXT_05** | **Data-Driven Testing tự động quét 10 bộ dữ liệu từ file CSV** | Tận dụng file [`postman/data_driven_coupons.csv`](file:///d:/STD/Y3/Y3S3/KiemThuPM/hw/hw6/postman/data_driven_coupons.csv) để chạy 10 lần kiểm thử tự động với các tham số biến đổi (`{{code}}`, `{{total_amount}}`, `{{expected_status}}`). | `{"code": "{{code}}", "total_amount": {{total_amount}}, "user_id": 1}` | `pm.iterationData.get("expected_status")` | `pm.expect(pm.response.code).to.equal(Number(pm.iterationData.get("expected_status")));` |

---

## 🛠️ ĐOẠN MÃ POSTMAN TEST SCRIPT CHUẨN XÁC THỰC CÔNG THỨC FR-09

```javascript
// 1. Kiểm tra Status Code
pm.test("Status code is as expected (200, 400, 401, 404)", function () {
    pm.expect([200, 400, 401, 403, 404, 405]).to.include(pm.response.code);
});

// 2. Xác thực Response JSON Schema khi thành công 200 OK
if (pm.response.code === 200) {
    const applyCouponSchema = {
        "type": "object",
        "required": ["success", "coupon_id", "discount_amount", "final_amount"],
        "properties": {
            "success": { "type": "boolean" },
            "coupon_id": { "type": "integer" },
            "discount_amount": { "type": "number", "minimum": 0 },
            "final_amount": { "type": "number", "minimum": 0 },
            "message": { "type": "string" }
        }
    };
    pm.test("Response body matches Apply Coupon Schema", function () {
        pm.response.to.have.jsonSchema(applyCouponSchema);
    });

    // 3. Kiểm tra Tính toán Tiền tệ chính xác
    const resData = pm.response.json();
    const reqData = JSON.parse(pm.request.body.raw || "{}");
    if (reqData.total_amount && resData.discount_amount !== undefined) {
        pm.test("Final amount equals total minus discount", function () {
            pm.expect(resData.final_amount).to.equal(reqData.total_amount - resData.discount_amount);
        });
    }
}
```

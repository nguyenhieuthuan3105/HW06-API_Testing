# BẢNG THIẾT KẾ KỊCH BẢN KIỂM THỬ API FR-17 (ADMIN COUPON CRUD)
## Endpoints: `POST /api/admin/coupons`, `GET /api/coupons`, `DELETE /api/admin/coupons/:id` — Hệ thống EShop SUT
### Tổng số ca kiểm thử: 45 Test Cases (40 AI-Generated & Audited + 5 Human Extension)

---

### 📌 THÔNG TIN ĐẶC TẢ KỸ THUẬT & SUT REALITY
- **Endpoints:**
  1. `POST /api/admin/coupons`: Tạo mã giảm giá mới (Yêu cầu quyền Admin).
  2. `GET /api/coupons`: Lấy danh sách toàn bộ mã giảm giá trong hệ thống.
  3. `DELETE /api/admin/coupons/:id`: Xóa vĩnh viễn một mã giảm giá theo ID (Yêu cầu quyền Admin).
- **Base URL:** `http://localhost:3000`
- **Authentication & RBAC:**
  - Token Admin (`admin@eshop.com` / `Admin123!`, `role: "admin"`): Được phép thực hiện mọi thao tác.
  - Token User thường (`test@eshop.com` / `Test1234!`, `role: "user"`): **Bắt buộc phản hồi `403 Forbidden`** đối với các route quản trị `/api/admin/*`.
  - Không có Token: **Bắt buộc phản hồi `401 Unauthorized`**.
- **Header bắt buộc (Anti-AI-Cheat):** `X-Student-Id: 23127125`, `Content-Type: application/json`
- **Quy tắc Dữ liệu khi Tạo Mã (`POST /api/admin/coupons`):**
  - `code` (string, bắt buộc, duy nhất trong hệ thống).
  - `type` (string enum: `"percent"` hoặc `"fixed"`).
  - `discount_value` (số nguyên dương $\ge 1$; nếu `type = "percent"` thì $1 \le \text{value} \le 100$).
  - `min_order_amount` (số nguyên $\ge 0$, mặc định `0`).
  - `expired_at` (chuỗi ngày ISO 8601, ví dụ `"2099-12-31"`).
  - `max_uses_per_user` (số nguyên dương $\ge 1$, mặc định `1`).
- **Cấu trúc Response Chuẩn của SUT:**
  - **Tạo mã thành công (`POST /api/admin/coupons` - 200 OK):**
    ```json
    {
      "message": "Coupon created",
      "id": 5
    }
    ```
  - **Lấy danh sách mã (`GET /api/coupons` - 200 OK):**
    ```json
    [
      {
        "id": 1,
        "code": "SAVE10",
        "type": "percent",
        "discount_value": 10,
        "min_order_amount": 300000,
        "expired_at": "2099-12-31",
        "is_active": 1,
        "max_uses_per_user": 1
      }
    ]
    ```
  - **Xóa mã thành công (`DELETE /api/admin/coupons/:id` - 200 OK):**
    ```json
    {
      "message": "Coupon deleted"
    }
    ```
  - **Thất bại (400 / 401 / 403 / 404):**
    ```json
    {
      "error": "Thông báo lỗi chi tiết"
    }
    ```

---

## PHẦN I: DANH SÁCH 40 TEST CASES ĐÃ QUA RÀ SOÁT (AUDITED)

### NHÓM 1: Phân Vùng Tương Đương & Phân Tích Giá Trị Biên (Domain Partitioning & Boundary Value Analysis) — 16 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Payload Body JSON | Expected Status | Assertions Kỳ Vọng |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR17_DP_01** | Tạo mã hợp lệ loại `percent` | Valid Equivalence Partition | `{"code": "SUMMER20", "type": "percent", "discount_value": 20, "min_order_amount": 200000, "expired_at": "2099-12-31", "max_uses_per_user": 2}` | `200 OK` | `message: "Coupon created"`, `id` là số nguyên dương |
| **TC_FR17_DP_02** | Tạo mã hợp lệ loại `fixed` | Valid Equivalence Partition | `{"code": "DISC80K", "type": "fixed", "discount_value": 80000, "min_order_amount": 400000, "expired_at": "2099-12-31", "max_uses_per_user": 1}` | `200 OK` | `message: "Coupon created"`, `id` hợp lệ |
| **TC_FR17_DP_03** | Trường `code` bị rỗng (`""`) | Missing Required Field | `{"code": "", "type": "percent", "discount_value": 10, "min_order_amount": 100000, "expired_at": "2099-12-31"}` | `400 Bad Request` | Lỗi thiếu mã code bắt buộc |
| **TC_FR17_DP_04** | `code` bị trùng với mã đã có (`SAVE10`) | UNIQUE Constraint Test | `{"code": "SAVE10", "type": "percent", "discount_value": 10, "min_order_amount": 100000, "expired_at": "2099-12-31"}` | `400 Bad Request` / `409` | Báo lỗi mã giảm giá đã tồn tại |
| **TC_FR17_DP_05** | `type` không hợp lệ (`"cashback"`) | Enum Validation | `{"code": "CASH50", "type": "cashback", "discount_value": 50, "min_order_amount": 100000, "expired_at": "2099-12-31"}` | `400 Bad Request` | Lỗi type chỉ nhận percent hoặc fixed |
| **TC_FR17_DP_06** | `discount_value = 0` | Boundary Value Analysis | `{"code": "FREE0", "type": "percent", "discount_value": 0, "min_order_amount": 100000, "expired_at": "2099-12-31"}` | `400 Bad Request` | Lỗi giá trị giảm giá phải lớn hơn 0 |
| **TC_FR17_DP_07** | `discount_value < 0` (Số âm `-10`) | Invalid Partition | `{"code": "NEG10", "type": "percent", "discount_value": -10, "min_order_amount": 100000, "expired_at": "2099-12-31"}` | `400 Bad Request` | Lỗi không chấp nhận số âm |
| **TC_FR17_DP_08** | `discount_value > 100` khi `type = "percent"` (`150%`) | Logic Boundary Defect | `{"code": "OVER150", "type": "percent", "discount_value": 150, "min_order_amount": 100000, "expired_at": "2099-12-31"}` | `400 Bad Request` | **Bắt lỗi SUT:** Không được phép giảm quá 100% |
| **TC_FR17_DP_09** | `discount_value = 100` khi `type = "percent"` (Biên trên 100%) | Boundary Max | `{"code": "FREE100", "type": "percent", "discount_value": 100, "min_order_amount": 100000, "expired_at": "2099-12-31"}` | `200 OK` | Chấp nhận giảm tối đa 100% (miễn phí) |
| **TC_FR17_DP_10** | `discount_value = 1` khi `type = "percent"` (Biên dưới 1%) | Boundary Min | `{"code": "MIN1", "type": "percent", "discount_value": 1, "min_order_amount": 100000, "expired_at": "2099-12-31"}` | `200 OK` | Chấp nhận giảm 1% |
| **TC_FR17_DP_11** | `min_order_amount = 0` (Không yêu cầu tối thiểu) | Boundary Zero Min | `{"code": "NOMIN", "type": "fixed", "discount_value": 20000, "min_order_amount": 0, "expired_at": "2099-12-31"}` | `200 OK` | Cho phép áp dụng cho mọi đơn hàng $\ge 0$ |
| **TC_FR17_DP_12** | `min_order_amount < 0` (Số âm `-50000`) | Invalid Partition | `{"code": "NEGMIN", "type": "fixed", "discount_value": 20000, "min_order_amount": -50000, "expired_at": "2099-12-31"}` | `400 Bad Request` | Lỗi ngưỡng đơn hàng không được âm |
| **TC_FR17_DP_13** | `max_uses_per_user = 0` | Boundary Min Uses | `{"code": "ZEROUSES", "type": "fixed", "discount_value": 20000, "min_order_amount": 100000, "max_uses_per_user": 0}` | `400 Bad Request` | Lỗi số lần dùng phải $\ge 1$ |
| **TC_FR17_DP_14** | `max_uses_per_user < 0` (Số âm) | Invalid Partition | `{"code": "NEGUSES", "type": "fixed", "discount_value": 20000, "min_order_amount": 100000, "max_uses_per_user": -1}` | `400 Bad Request` | Lỗi số lần dùng phải là số dương |
| **TC_FR17_DP_15** | `expired_at` là ngày trong quá khứ (`2020-01-01`) | Date Logic Test | `{"code": "PASTEXP", "type": "fixed", "discount_value": 20000, "min_order_amount": 100000, "expired_at": "2020-01-01"}` | `200 OK` / `400` | Tạo mã hết hạn hoặc cảnh báo ngày quá khứ |
| **TC_FR17_DP_16** | `expired_at` sai định dạng ngày (`"invalid_date"`) | Date Format Validation | `{"code": "BADEXP", "type": "fixed", "discount_value": 20000, "min_order_amount": 100000, "expired_at": "invalid_date"}` | `400 Bad Request` | Lỗi định dạng ngày không hợp lệ |

---

### NHÓM 2: Vòng Đời CRUD & Chuyển Đổi Trạng Thái (Lifecycle State Transitions) — 8 TCs

| TestID | Tên Test Case | Bước trong Lifecycle | Hành động & Payload | Expected Status | Assertions Chi Tiết |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR17_CRUD_01** | **[1. Create]** Tạo mã mới `AUTOLIFE_99` | Tạo mới tài nguyên | `POST /api/admin/coupons` với `code = "AUTOLIFE_99"` | `200 OK` | `message: "Coupon created"`, lưu `id` vào biến môi trường |
| **TC_FR17_CRUD_02** | **[2. Read List]** Kiểm tra mã vừa tạo có trong danh sách | Đọc & đối chiếu | `GET /api/coupons` | `200 OK` | Mảng chứa phần tử có `code === "AUTOLIFE_99"` |
| **TC_FR17_CRUD_03** | **[3. Apply Valid]** Áp dụng mã vừa tạo cho đơn hàng | Kiểm tra chức năng | `POST /api/apply-coupon` (`code = "AUTOLIFE_99"`, total = 500k) | `200 OK` | `success: true`, mã hoạt động bình thường |
| **TC_FR17_CRUD_04** | **[4. Delete]** Admin xóa vĩnh viễn mã vừa tạo | Xóa tài nguyên | `DELETE /api/admin/coupons/{{created_coupon_id}}` | `200 OK` | `message: "Coupon deleted"` |
| **TC_FR17_CRUD_05** | **[5. Verify Deleted]** Kiểm tra mã không còn trong danh sách | Đối chiếu sau xóa | `GET /api/coupons` | `200 OK` | Mảng KHÔNG còn chứa mã `AUTOLIFE_99` |
| **TC_FR17_CRUD_06** | **[6. Apply After Delete]** Áp dụng lại mã đã bị xóa | Toàn vẹn dữ liệu | `POST /api/apply-coupon` (`code = "AUTOLIFE_99"`) | `404 Not Found` / `400` | Báo lỗi mã không tồn tại |
| **TC_FR17_CRUD_07** | Xóa mã với ID không tồn tại (`999999`) | Boundary Delete | `DELETE /api/admin/coupons/999999` | `404 Not Found` / `200` | Phản hồi an toàn |
| **TC_FR17_CRUD_08** | Xóa mã với ID là chuỗi chữ cái (`abc`) | Invalid Param Delete | `DELETE /api/admin/coupons/abc` | `400 Bad Request` | Lỗi ID không hợp lệ |

---

### NHÓM 3: Kiểm Thử Bảo Mật, Phân Quyền (RBAC) & Chống Injection — 10 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Token / Payload | Expected Status | Assertions Bảo Mật |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR17_SEC_01** | **RBAC POST:** User thường tạo coupon | SEC-02 / RBAC | Token User (`role: "user"`), `POST /api/admin/coupons` | **`403 Forbidden`** | **Bắt lỗi SUT:** Chặn người dùng thường can thiệp quyền Admin |
| **TC_FR17_SEC_02** | **RBAC DELETE:** User thường xóa coupon | SEC-02 / RBAC | Token User (`role: "user"`), `DELETE /api/admin/coupons/1` | **`403 Forbidden`** | **Bắt lỗi SUT:** Không cho User thường xóa mã |
| **TC_FR17_SEC_03** | **Auth Missing POST:** Tạo coupon không Token | SEC-02 (Missing Auth) | Không có Header `Authorization` | `401 Unauthorized` | Chặn truy cập người dùng ẩn danh |
| **TC_FR17_SEC_04** | **Auth Missing GET:** Xem danh sách không Token | SEC-02 (Missing Auth) | Không có Header `Authorization`, `GET /api/coupons` | `401 Unauthorized` | Yêu cầu đăng nhập |
| **TC_FR17_SEC_05** | **Auth Missing DELETE:** Xóa coupon không Token | SEC-02 (Missing Auth) | Không có Header `Authorization`, `DELETE /api/admin/coupons/1` | `401 Unauthorized` | Chặn xóa trái phép |
| **TC_FR17_SEC_06** | **Tampered Token:** Tạo coupon với JWT giả mạo | SEC-02 (Signature) | `Authorization: Bearer fake.tampered.jwt` | `401 Unauthorized` / `403` | Xác thực chữ ký số thất bại |
| **TC_FR17_SEC_07** | **Expired Token:** Tạo coupon với Token hết hạn | SEC-02 (Token Exp) | Token Admin có trường `exp` trong quá khứ | `401 Unauthorized` | Chặn Token hết hạn |
| **TC_FR17_SEC_08** | **SQLi trong `code` khi tạo mã:** Chèn DROP TABLE | SEC-01 (SQLi) | `code: "ATTACK'; DROP TABLE coupons;--"` | `400 Bad Request` | CSDL SQLite được bảo vệ qua Prepared Statement |
| **TC_FR17_SEC_09** | **SQLi trong Path `:id` khi DELETE:** Tautology | SEC-01 (SQLi) | `DELETE /api/admin/coupons/1%20OR%201=1` | `400 Bad Request` | Chặn SQLi, không xóa toàn bộ bảng coupons |
| **TC_FR17_SEC_10** | **Information Disclosure (SEC-07):** Giấu lỗi CSDL | SEC-07 (Info Leak) | Tạo mã trùng `SAVE10` | `400` / `409` | Body KHÔNG chứa chuỗi lộ CSDL: `SQLITE_CONSTRAINT` |

---

### NHÓM 4: Xác Thực Schema, Giao Thức & Hiệu Năng (Schema & Protocols) — 6 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Endpoint kiểm tra | Expected Status | Assertions Chai.js Chi Tiết |
| :---: | :--- | :---: | :--- | :---: | :--- |
| **TC_FR17_SCH_01** | Xác thực Schema khi Tạo Mã thành công | JSON Schema (Ajv) | `POST /api/admin/coupons` | `200 OK` | Schema chứa: `message` (string), `id` (integer) |
| **TC_FR17_SCH_02** | Xác thực Schema Danh sách Mã Giảm Giá | JSON Schema (Ajv) | `GET /api/coupons` | `200 OK` | Array các objects đủ 8 trường: `id, code, type, discount_value, min_order_amount, expired_at, is_active, max_uses_per_user` |
| **TC_FR17_SCH_03** | Xác thực Schema khi Xóa Mã thành công | JSON Schema (Ajv) | `DELETE /api/admin/coupons/:id` | `200 OK` | Schema chứa: `message` (string) |
| **TC_FR17_SCH_04** | Kiểm tra sai phương thức HTTP (`PUT /api/admin/coupons`) | Method Compliance | `PUT /api/admin/coupons` | `404` / `405 Method Not Allowed` | Server không cho phép dùng phương thức PUT |
| **TC_FR17_SCH_05** | Xác thực Header `Content-Type: application/json` | Header Verification | `GET /api/coupons` | `200 OK` | `pm.response.headers.get("Content-Type")` chứa `application/json` |
| **TC_FR17_SCH_06** | SLA Thời gian Phản hồi API Admin (< 500ms) | Performance Benchmark | `GET /api/coupons` | `200 OK` | `pm.expect(pm.response.responseTime).to.be.below(500)` |

---

## PHẦN II: 5 TEST CASES MỞ RỘNG TỰ THIẾT KẾ (HUMAN EXTENSION)

### NHÓM 5: Test Cases Mở Rộng Con Người Thiết Kế (Human Extension) — 5 TCs

| TestID | Tên Test Case | Kỹ thuật & Mục tiêu Kỹ thuật | Input Payload / Action | Expected Status | Assertions Chi Tiết |
| :---: | :--- | :--- | :--- | :---: | :--- |
| **TC_FR17_EXT_01** | **Tấn công Leo Quyền RBAC CRUD (Privilege Escalation)** | User thường cố tình tạo mã coupon 99% và xóa mã của hệ thống | Token User (`role: "user"`), `POST /api/admin/coupons` và `DELETE /api/admin/coupons/1` | **`403 Forbidden`** | **Bắt lỗi SUT:** Hệ thống phải chặn User thường can thiệp quyền Admin |
| **TC_FR17_EXT_02** | **Rò rỉ CSDL khi Vi phạm UNIQUE Constraint (SEC-07)** | Gửi mã trùng `SAVE10` để kiểm tra khả năng bắt lỗi CSDL | `POST /api/admin/coupons` với `code: "SAVE10"` | `400 Bad Request` / `409` | Phản hồi JSON lỗi thân thiện, KHÔNG lộ chuỗi `SQLITE_CONSTRAINT` |
| **TC_FR17_EXT_03** | **Thao túng Giá trị Giảm giá Vượt Ngưỡng (Extreme Values)** | Tạo mã giảm giá 200% hoặc số âm -50% | `{"code": "OVER200", "type": "percent", "discount_value": 200, "min_order_amount": 100000}` | `400 Bad Request` | Backend từ chối giá trị `discount_value` vô lý |
| **TC_FR17_EXT_04** | **Toàn vẹn Tham chiếu khi Xóa Mã Đang Sử Dụng (Foreign Key)** | Xóa mã `SAVE10` (id=1) đã có bản ghi trong bảng `coupon_usage` | `DELETE /api/admin/coupons/1` | `200 OK` / `400` | Xóa an toàn hoặc từ chối có kiểm soát, không làm crash CSDL |
| **TC_FR17_EXT_05** | **Tạo Hàng loạt Mã Coupon Đồng thời (Batch Creation)** | Tạo liên tiếp 5 mã ngẫu nhiên và kiểm tra danh sách tăng đúng 5 | `POST /api/admin/coupons` (x5 với random code) | `200 OK` | Danh sách `GET /api/coupons` tăng đúng 5 phần tử, khóa chính auto-increment |

---

## 🛠️ ĐOẠN MÃ POSTMAN TEST SCRIPT XÁC THỰC SCHEMA MẪU CHO FR-17

```javascript
// 1. Kiểm tra Status Code
pm.test("Status code is 200 OK", function () {
    pm.response.to.have.status(200);
});

// 2. Xác thực Schema Danh sách Coupons (GET /api/coupons)
const couponListSchema = {
    "type": "array",
    "items": {
        "type": "object",
        "required": ["id", "code", "type", "discount_value", "min_order_amount", "is_active", "max_uses_per_user"],
        "properties": {
            "id": { "type": "integer" },
            "code": { "type": "string" },
            "type": { "type": "string", "enum": ["percent", "fixed"] },
            "discount_value": { "type": "number" },
            "min_order_amount": { "type": "number" },
            "expired_at": { "type": ["string", "null"] },
            "is_active": { "type": "integer" },
            "max_uses_per_user": { "type": "integer" }
        }
    }
};

pm.test("Response matches Coupon List Schema", function () {
    pm.response.to.have.jsonSchema(couponListSchema);
});
```

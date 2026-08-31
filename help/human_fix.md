# BÁO CÁO RÀ SOÁT CON NGƯỜI (HUMAN AUDIT) & MỞ RỘNG KIỂM THỬ (EXTENSION)
## Dự án: Kiểm Thử Tự Động Bộ API EShop SUT (`http://localhost:3000`)
### Sinh viên thực hiện: MSSV 25127001

---

# MỤC 1: RÀ SOÁT VÀ MỞ RỘNG API 1 (FR-06: XEM CHI TIẾT SẢN PHẨM)

## I. TỔNG QUAN PHÂN TÍCH THỰC TẾ TRÊN SUT ESHOP
Cấu trúc phản hồi thực tế của `GET /api/products/1`:
```json
{
  "id": 1,
  "name": "iPhone 15 Pro Max",
  "price": 30000000,
  "description": "Điện thoại cao cấp của Apple",
  "imageUrl": "https://placehold.co/300x300/png?text=iPhone+15",
  "category_id": 1
}
```

### ⚠️ Các điểm AI bị "Ảo giác" (Hallucinations) và Sai lệch Nghiệp vụ:
1. **Ảo giác trường dữ liệu (Schema Hallucination):** AI tự động giả định hệ thống có trường `stock` (tồn kho). Trên thực tế, SUT EShop không có trường `stock` trong bảng `products`. Do đó các test case kiểm tra `stock = 0` hoặc sản phẩm hết hàng là **`INVALID`**.
2. **Ảo giác tính năng Quản trị (Admin Soft-Delete Hallucination):** SUT không có cơ chế `is_active` hay `soft-delete` cho sản phẩm ở FR-06. Do đó test case `TC_FR06_ST_04` là **`INVALID`**.
3. **Phụ thuộc vào Dữ liệu Seed thực tế (Seed Data Dependency):** AI mặc định `id = 10` sẽ trả về `200 OK`. Nhưng CSDL chỉ seed sẵn 5 sản phẩm (ID từ 1 đến 5), request `GET /api/products/10` sẽ trả về `404 Not Found` (đây vẫn là hành vi hợp lệ về mặt kỹ thuật, nhưng kỳ vọng của AI là **`INCOMPLETE`**).

---

## II. BẢNG RÀ SOÁT CON NGƯỜI (HUMAN AUDIT TABLE) — FR-06 (39 TEST CASES AI)

| TestID | Tên Test Case Gốc (AI) | Nhãn Audit | Phân tích Lỗi / Lý do Kỹ thuật | Bản Sửa Đổi / Chuẩn Hóa Thực Tế (Corrected) |
| :---: | :--- | :---: | :--- | :--- |
| **TC_FR06_DP_01** | Lấy sản phẩm với ID=1 | `VALID` | ID=1 luôn tồn tại trong seed data | Giữ nguyên (Expected: `200 OK`) |
| **TC_FR06_DP_02** | Lấy sản phẩm với ID=2 | `VALID` | ID=2 hợp lệ và có trong CSDL | Giữ nguyên (Expected: `200 OK`) |
| **TC_FR06_DP_03** | Lấy sản phẩm với ID=10 | `INCOMPLETE` | CSDL chỉ có 5 SP nên ID=10 sẽ ra 404 | Sửa Expected: `200 OK` (nếu tồn tại) hoặc `404 Not Found` (nếu vượt seed) |
| **TC_FR06_DP_04** | Kiểm tra ID = 0 | `VALID` | 0 không phải ID hợp lệ | Giữ nguyên (Expected: `400 Bad Request` / `404 Not Found`) |
| **TC_FR06_DP_05** | Kiểm tra ID = -1 | `VALID` | ID âm không hợp lệ | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_06** | Kiểm tra ID = -99999 | `VALID` | ID âm lớn | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_07** | ID cực đại 32-bit (2147483647) | `VALID` | Không tồn tại trong CSDL | Giữ nguyên (Expected: `404 Not Found`) |
| **TC_FR06_DP_08** | Tràn số 32-bit (2147483648) | `VALID` | Kiểm tra giới hạn số học | Giữ nguyên (Expected: `400 Bad Request` / `404`) |
| **TC_FR06_DP_09** | Số nguyên cực lớn vượt 64-bit | `VALID` | Robustness test | Giữ nguyên (Expected: `400 Bad Request` / `404`) |
| **TC_FR06_DP_10** | Số thực thập phân ID = 1.5 | `VALID` | SQLite/Express parse chuỗi | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_11** | Số thực ID = 1.0 | `INCOMPLETE` | JS có thể parse `1.0` thành số `1` | Sửa Expected: Nếu router parse ra 1 thì 200, ngược lại 400 |
| **TC_FR06_DP_12** | ID là chuỗi chữ `abc` | `VALID` | Đúng spec kiểm tra type | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_13** | ID là `prod123` | `VALID` | Chuỗi alphanumeric | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_14** | ID là UUID | `VALID` | UUID không khớp Integer | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_15** | ID chứa ký tự `!@#$%^&*()` | `VALID` | URL encoding validation | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_ST_01** | Xem sản phẩm Active | `VALID` | Đúng luồng chính | Giữ nguyên (Expected: `200 OK`) |
| **TC_FR06_ST_02** | Xem sản phẩm Out of stock | **`INVALID`** | **AI Ảo giác: SUT EShop không có trường `stock`** | **Đổi thành: Xem sản phẩm thuộc category khác (`category_id = 2, 3`)** |
| **TC_FR06_ST_03** | Xem sản phẩm ID=999999 | `VALID` | Không tồn tại | Giữ nguyên (Expected: `404 Not Found`) |
| **TC_FR06_ST_04** | Xem sản phẩm bị Admin ẩn/khóa | **`INVALID`** | **AI Ảo giác: SUT không có tính năng ẩn sản phẩm** | **Đổi thành: Xem sản phẩm có description ngắn hoặc rỗng** |
| **TC_FR06_ST_05** | Xem sản phẩm có Category bị xóa | `INCOMPLETE` | Phụ thuộc Foreign Key SQLite | Sửa Expected: `200 OK` (vẫn lưu ID cũ) |
| **TC_FR06_ST_06** | Kiểm tra tính Idempotent | `VALID` | Gọi lặp lại nhiều lần | Giữ nguyên (Expected: `200 OK` đồng nhất) |
| **TC_FR06_ST_07** | Xem sau khi Admin vừa tạo mới | `VALID` | Setup qua Pre-request Script | Giữ nguyên (Expected: `200 OK`) |
| **TC_FR06_ST_08** | Xem sau khi Admin vừa xóa | `VALID` | Teardown qua Post-response Script | Giữ nguyên (Expected: `404 Not Found`) |
| **TC_FR06_SEC_01** | SQLi Tautology `1 OR 1=1` | `VALID` | SEC-01 Injection | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_02** | SQLi Comment `1'--` | `VALID` | SEC-01 Injection | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_03** | SQLi UNION SELECT users | `VALID` | SEC-01 Data Leakage | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_04** | SQLi Stacked `1; DROP TABLE` | `VALID` | SEC-01 Destructive SQLi | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_05** | SQLi Time-based DoS | `VALID` | SEC-01/SEC-06 DoS | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_06** | XSS `<script>alert(1)</script>` | `VALID` | XSS qua URL Path | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_07** | Path Traversal `../../etc/passwd` | `VALID` | File Traversal | Giữ nguyên (Expected: `400 Bad Request` / `404`) |
| **TC_FR06_SEC_08** | Null Byte Injection `1%00.jpg` | `VALID` | Input Sanitization | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_09** | DoS String 10,000 ký tự | `VALID` | SEC-06 Buffer Overflow | Giữ nguyên (Expected: `400 Bad Request` / `414`) |
| **TC_FR06_SEC_10** | Error Disclosure `invalid_syntax'` | `VALID` | SEC-07 Info Disclosure | Giữ nguyên (Expected: Không lộ SQLite stack trace) |
| **TC_FR06_SCH_01** | JSON Schema Success 200 OK | `VALID` | Khớp 6 trường đặc tả | Giữ nguyên (id, name, price, description, imageUrl, category_id) |
| **TC_FR06_SCH_02** | JSON Schema 404 Error | `VALID` | Cấu trúc message lỗi | Giữ nguyên |
| **TC_FR06_SCH_03** | JSON Schema 400 Error | `VALID` | Cấu trúc error | Giữ nguyên |
| **TC_FR06_SCH_04** | Sai Method `POST /api/products/1` | `VALID` | HTTP Method Compliance | Giữ nguyên (Expected: `405` / `404`) |
| **TC_FR06_SCH_05** | Header Content-Type là JSON | `VALID` | Header verification | Giữ nguyên |
| **TC_FR06_SCH_06** | Response time < 500ms | `VALID` | SLA Performance | Giữ nguyên |

---

## III. 5 TEST CASES MỞ RỘNG (HUMAN EXTENSION) — FR-06

1. **`TC_FR06_EXT_01` (Leading Zeros `00001`):** Kiểm tra chuyển đổi số có số 0 ở đầu về số nguyên `id = 1` (`200 OK`).
2. **`TC_FR06_EXT_02` (SQLi Boolean Blind `1 AND 1=1`):** Kiểm tra router chặn chuỗi chứa biểu thức logic (`400 Bad Request`).
3. **`TC_FR06_EXT_03` (URL-Encoded Whitespace `%201%20`):** Kiểm tra trim khoảng trắng trong URL path (`200 OK` / `400`).
4. **`TC_FR06_EXT_04` (Unicode Full-Width `１` U+FF11):** Kiểm tra tính an toàn với ký tự toàn độ rộng (`400 Bad Request`).
5. **`TC_FR06_EXT_05` (Conditional Caching ETag & If-None-Match):** Kiểm tra phản hồi `304 Not Modified` khi dữ liệu không đổi.

---

# MỤC 2: RÀ SOÁT VÀ MỞ RỘNG API 2 (FR-09: ÁP DỤNG MÃ GIẢM GIÁ)

## I. TỔNG QUAN PHÂN TÍCH THỰC TẾ & BÀI HỌC VỀ ASSERTIONS TRÊN SUT

### 1. Ảo giác Cấu trúc Response Body (Schema Hallucination)
- **AI ảo giác:** Sinh các trường `valid: true`, `original_total`.
- **Thực tế SUT Backend (`server.js`):** Trả về:
  ```json
  {
    "success": true,
    "coupon_id": 1,
    "discount_amount": 50000,
    "final_amount": 450000,
    "message": "Áp dụng thành công! Giảm 10%"
  }
  ```
  👉 **Human Fix:** Chuẩn hóa toàn bộ schema sang các key `success`, `coupon_id`, `discount_amount`, `final_amount`, `message`.

---

### 2. ⚠️ PHÁT HIỆN CHUYÊN MÔN QUAN TRỌNG: CHỐNG LỖI "ASSERTION LỎNG LẺO" (TOLERANT ASSERTION ANTI-PATTERN)

> **Vấn đề phát hiện khi rà soát:**  
> Trong phiên bản sơ khởi, một số đoạn test script sử dụng kiểm tra mảng lỏng lẻo như:  
> `pm.expect([200, 401]).to.include(pm.response.code);` hoặc `pm.expect([200, 400]).to.include(pm.response.code);`  
> ❌ **Hậu quả:** Khi SUT có lỗi nghiêm trọng (ví dụ thiếu Middleware Auth C4 nhưng vẫn trả về `200 OK` thay vì `401 Unauthorized`, hoặc lỗi so sánh biên C3 trả về `400` thay vì `200`), assertion trên vẫn đánh giá là **PASSED (False Positive)** khiến các lỗi này bị che giấu!

### 🛠️ Giải pháp Rà soát Con người (Human Correction):
Đã chuyển toàn bộ assertions sang **Nguyên tắc Nghiêm ngặt theo Đặc tả (Strict Specification Assertions)**:
- **Kiểm tra Điều kiện C4 (Đăng nhập):** Phải assert chính xác `pm.response.to.have.status(401)`. Khi SUT trả về 200, test case **BẮT BUỘC PHẢI FAILED** để làm bằng chứng báo cáo `BUG_FR09_01 (Authentication Bypass)`.
- **Kiểm tra Phép tính Giảm giá %:** Phải assert đúng giá trị mong đợi `pm.expect(data.discount_amount).to.equal(50000)`. Khi SUT tính ra `-4,500,000`, test case **FAILED** làm bằng chứng báo cáo `BUG_FR09_02 (Critical Math Bug)`.
- **Kiểm tra Giá trị Biên C3 (300,000 ₫ == min):** Phải assert đúng `pm.response.to.have.status(200)`. Khi SUT trả về 400, test case **FAILED** làm bằng chứng báo cáo `BUG_FR09_03 (Off-by-one Boundary Bug)`.

---

## II. BẢNG RÀ SOÁT CON NGƯỜI (HUMAN AUDIT TABLE) — FR-09 (40 TEST CASES AI)

| TestID | Tên Test Case Gốc (AI) | Nhãn Audit | Phân tích Kỹ thuật & Thực tế SUT | Bản Sửa Đổi / Chuẩn Hóa Thực Tế (Corrected) |
| :---: | :--- | :---: | :--- | :--- |
| **TC_FR09_COND_01** | Áp dụng mã % SAVE10 | `VALID` | Luồng hợp lệ chuẩn | Giữ nguyên (Expected: `200 OK`) |
| **TC_FR09_COND_02** | Áp dụng mã Fixed BIGBUY | `VALID` | Luồng hợp lệ chuẩn | Giữ nguyên (Expected: `200 OK`, discount = 50k) |
| **TC_FR09_COND_03** | Áp dụng mã Fixed VIP100 | `VALID` | Luồng hợp lệ chuẩn | Giữ nguyên (Expected: `200 OK`, discount = 100k) |
| **TC_FR09_COND_04** | C1: Mã không tồn tại | `VALID` | SUT trả 404 | Expected: `404 Not Found` / `400` |
| **TC_FR09_COND_05** | C1: Mã inactive (0) | `VALID` | SUT trả 404 | Expected: `404 Not Found` / `400` |
| **TC_FR09_COND_06** | C2: Mã EXPIRED | `VALID` | SUT kiểm tra ngày | Expected: `400 Bad Request` |
| **TC_FR09_COND_07** | C3: Đơn < min (200k < 300k) | `VALID` | SUT kiểm tra min | Expected: `400 Bad Request` |
| **TC_FR09_COND_08** | C4: Không gửi Token | `INCOMPLETE` | SUT thiếu middleware Auth (trả 200) | **Thắt chặt assertion:** Bắt buộc `401 Unauthorized` (SUT fail -> Bắt Bug 04) |
| **TC_FR09_COND_09** | C5: Dùng quá số lượt | `INCOMPLETE` | SUT không tự INSERT coupon_usage | **Bổ sung Pre-request Script:** Gửi POST /api/coupon-usage trước khi test |
| **TC_FR09_COND_10** | C1 + C3: Mã sai + Dưới min | `VALID` | Vi phạm kết hợp | Expected: `404 Not Found` / `400` |
| **TC_FR09_COND_11** | C2 + C3: Hết hạn + Dưới min | `VALID` | Vi phạm kết hợp | Expected: `400 Bad Request` |
| **TC_FR09_COND_12** | C3 + C4: Không Auth + Dưới min | `INCOMPLETE` | Cần ưu tiên từ chối tại tầng Auth | **Thắt chặt assertion:** Bắt buộc `401 Unauthorized` |
| **TC_FR09_COND_13** | Multi-use VIP100 Lần 1 | `VALID` | Lượt dùng 1/2 hợp lệ | Expected: `200 OK` |
| **TC_FR09_COND_14** | Multi-use VIP100 Lần 2 | `VALID` | Lượt dùng 2/2 hợp lệ | Expected: `200 OK` |
| **TC_FR09_BVA_01** | Biên trên min 1 đ (300,001) | `VALID` | Vượt ngưỡng tối thiểu | Expected: `200 OK` |
| **TC_FR09_BVA_02** | Biên dưới min 1 đ (299,999) | `VALID` | Dưới ngưỡng tối thiểu | Expected: `400 Bad Request` |
| **TC_FR09_BVA_03** | Đơn hàng lớn (1,000,000) | `VALID` | Luồng hợp lệ | Expected: `200 OK` |
| **TC_FR09_BVA_04** | Tổng tiền = 0 | `VALID` | Biên 0 | Expected: `400 Bad Request` |
| **TC_FR09_BVA_05** | Tổng tiền âm (-1) | `VALID` | Biên âm | Expected: `400 Bad Request` |
| **TC_FR09_BVA_06** | Tổng tiền âm lớn (-500k) | `VALID` | Miền không hợp lệ | Expected: `400 Bad Request` |
| **TC_FR09_BVA_07** | Đơn hàng cực lớn ($10^9 - 1$) | `VALID` | Tràn số / Robustness | Expected: `200 OK` |
| **TC_FR09_BVA_08** | Số thập phân (550,000.5) | `VALID` | Phép tính float | Expected: `200 OK` |
| **TC_FR09_BVA_09** | total_amount dạng String | `VALID` | Sai kiểu dữ liệu | Expected: `400 Bad Request` |
| **TC_FR09_BVA_10** | Thiếu field total_amount | `VALID` | Thiếu trường bắt buộc | Expected: `400 Bad Request` |
| **TC_FR09_SEC_01** | IDOR: Token user 1 gửi user_id=2 | `VALID` | SEC-03 IDOR | Expected: `403 Forbidden` / `400 Bad Request` |
| **TC_FR09_SEC_02** | Missing Auth Header | `INCOMPLETE` | SUT thiếu Auth | **Thắt chặt:** Bắt buộc `401 Unauthorized` |
| **TC_FR09_SEC_03** | Tampered Fake JWT | `INCOMPLETE` | SUT thiếu Auth | **Thắt chặt:** Bắt buộc `401 Unauthorized` |
| **TC_FR09_SEC_04** | Expired JWT Token | `INCOMPLETE` | SUT thiếu Auth | **Thắt chặt:** Bắt buộc `401 Unauthorized` |
| **TC_FR09_SEC_05** | SQLi Tautology `OR '1'='1` | `VALID` | SEC-01 Injection | Expected: `404 Not Found` / `400` |
| **TC_FR09_SEC_06** | SQLi Stacked DROP TABLE | `VALID` | SEC-01 Destructive | Expected: `404 Not Found` / `400` |
| **TC_FR09_SEC_07** | Parameter Tampering discount | `VALID` | SEC-04 Client Manipulation | Server tự tính lại discount chuẩn 50k (`200 OK`) |
| **TC_FR09_SEC_08** | XSS Payload trong code | `VALID` | SEC-01 XSS | Expected: `404 Not Found` / `400` |
| **TC_FR09_SEC_09** | Concurrency Double Spending | `VALID` | SEC-06 Race Condition | Phản hồi an toàn (`200` / `400`) |
| **TC_FR09_SEC_10** | Error Disclosure (No SQLite) | `VALID` | SEC-07 Leakage | Body không chứa chuỗi lỗi sqlite3 |
| **TC_FR09_SCH_01** | Response Schema Success | `INCOMPLETE` | AI sinh sai tên key | Chuẩn hóa schema: success, coupon_id, discount, final, message |
| **TC_FR09_SCH_02** | Phép tính % (500k * 10%) | `INCOMPLETE` | SUT có bug viết sai công thức | **Thắt chặt:** Assert discount = 50k, final = 450k (Bắt Bug 05) |
| **TC_FR09_SCH_03** | Phép tính Fixed (600k - 50k) | `VALID` | SUT tính đúng | Assert discount = 50k, final = 550k (`200 OK`) |
| **TC_FR09_SCH_04** | Error JSON Schema | `VALID` | Object chứa trường `error` | Expected: `400` / `404` |
| **TC_FR09_SCH_05** | Sai Method GET /apply-coupon | `VALID` | Protocol compliance | Expected: `404` / `405 Method Not Allowed` |
| **TC_FR09_SCH_06** | SLA Response Time < 500ms | `VALID` | Performance Benchmark | Expected: `responseTime < 500ms` |

---

## III. 5 TEST CASES MỞ RỘNG (HUMAN EXTENSION) — FR-09

1. **`TC_FR09_EXT_01` (Bắt lỗi Biên C3 `total_amount == min_order_amount` 300,000 ₫):**
   - **Mục đích:** Đặc tả quy định $\ge 300,000$, nhưng code SUT viết nhầm `>`. Thắt chặt assertion `pm.response.to.have.status(200)` để bắt trúng Bug #06.
2. **`TC_FR09_EXT_02` (Mã Fixed lớn hơn đơn hàng `discount > total`):**
   - **Mục đích:** Kiểm tra an toàn số học, đảm bảo `final_amount` không bao giờ bị âm tiền (`>= 0`).
3. **`TC_FR09_EXT_03` (Chuẩn hóa chữ thường/hoa `save10` vs `SAVE10`):**
   - **Mục đích:** Kiểm tra tính năng trải nghiệm người dùng xem router có tự động `.toUpperCase()` hay không.
4. **`TC_FR09_EXT_04` (Khoảng trắng thừa `" SAVE10 "`):**
   - **Mục đích:** Kiểm tra cơ chế tự động `.trim()` khoảng trắng trước khi query CSDL SQLite.
5. **`TC_FR09_EXT_05` (Data-Driven Testing tự động quét 10 bộ dữ liệu CSV):**
   - **Mục đích:** Tích hợp file CSV [`data_driven_coupons.csv`](postman/data_driven_coupons.csv) để chạy 10 iterations tự động kiểm thử toàn diện các miền giá trị biên và trạng thái coupon.

# BẢNG THIẾT KẾ KỊCH BẢN KIỂM THỬ API FR-06 (PRODUCT DETAIL VIEW)
## Endpoint: `GET /api/products/:id` — Hệ thống EShop SUT
### Tổng số ca kiểm thử: 44 Test Cases (39 AI-Generated & Audited + 5 Human Extension)

---

### THÔNG TIN ĐẶC TẢ KỸ THUẬT
- **Endpoint:** `GET /api/products/:id`
- **Method:** `GET`
- **Authentication:** Public (Không yêu cầu Bearer Token)
- **Base URL:** `http://localhost:3000`
- **Header bắt buộc (Anti-AI-Cheat):** `X-Student-Id: 23127125`
- **Mô tả nghiệp vụ:** Trả về thông tin chi tiết của một sản phẩm bao gồm:
  - `id`: Mã định danh số nguyên dương của sản phẩm.
  - `name`: Tên sản phẩm (chuỗi ký tự).
  - `price`: Đơn giá (số dương).
  - `description`: Mô tả chi tiết sản phẩm.
  - `imageUrl`: Đường dẫn ảnh lớn của sản phẩm.
  - `category_id`: Mã danh mục liên kết.

---

## PHẦN I: DANH SÁCH 39 TEST CASES AI (ĐÃ QUA RÀ SOÁT AUDIT)

### NHÓM 1: Phân Vùng Tương Đương & Phân Tích Giá Trị Biên (Domain Partitioning & Boundary Value Analysis) — 15 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Path Param (`:id`) | Expected Status | Expected Response / Schema Assertion |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **TC_FR06_DP_01** | Lấy sản phẩm với ID số nguyên dương nhỏ nhất | Valid Equivalence Partition | `1` | `200 OK` | `id: 1`, đầy đủ `name`, `price > 0`, `description`, `imageUrl`, `category_id` |
| **TC_FR06_DP_02** | Lấy sản phẩm với ID số nguyên hợp lệ ở giữa | Valid Equivalence Partition | `2` | `200 OK` | `id: 2`, kiểu dữ liệu các trường khớp đặc tả |
| **TC_FR06_DP_03** | Lấy sản phẩm với ID=10 (Kiểm tra theo số lượng Seed Data) | Boundary / Seed Dependency | `10` | `200 OK` / `404` | `200` nếu DB có $\ge 10$ sp, `404` nếu DB chỉ có 5 sp (Hợp lệ) |
| **TC_FR06_DP_04** | Kiểm tra giá trị biên bằng 0 (Zero ID) | Boundary Value Analysis | `0` | `400 Bad Request` / `404` | Thông báo lỗi ID không hợp lệ (`Invalid product ID`) |
| **TC_FR06_DP_05** | Kiểm tra giá trị biên âm nhỏ nhất (-1) | Boundary Value Analysis | `-1` | `400 Bad Request` | Lỗi tham số: ID phải là số nguyên dương $\ge 1$ |
| **TC_FR06_DP_06** | Kiểm tra giá trị số âm lớn (-99999) | Invalid Partition | `-99999` | `400 Bad Request` | Lỗi tham số âm |
| **TC_FR06_DP_07** | Kiểm tra giá trị biên cực đại 32-bit Integer ($2^{31}-1$) | Boundary Value Analysis | `2147483647` | `404 Not Found` | Không tìm thấy sản phẩm trong CSDL |
| **TC_FR06_DP_08** | Kiểm tra tràn số 32-bit Integer ($2^{31}$) | Boundary Value Analysis | `2147483648` | `400 Bad Request` / `404` | Xử lý an toàn, không làm sập server |
| **TC_FR06_DP_09** | Kiểm tra số nguyên cực lớn vượt ngưỡng 64-bit | Robustness Testing | `999999999999999999999999` | `400 Bad Request` / `404` | Báo lỗi ID vượt giới hạn số học |
| **TC_FR06_DP_10** | Kiểm tra số thực thập phân có phần lẻ | Invalid Type Partition | `1.5` | `400 Bad Request` | Lỗi ID không phải số nguyên |
| **TC_FR06_DP_11** | Kiểm tra số thực có đuôi .0 (ID = 1.0) | Boundary Type Partition | `1.0` | `200 OK` / `400` | Ép kiểu an toàn về số 1 hoặc báo lỗi format |
| **TC_FR06_DP_12** | Kiểm tra ID là chuỗi chữ cái không phải số | Invalid Type Partition | `abc` | `400 Bad Request` | Lỗi `Product ID must be an integer` |
| **TC_FR06_DP_13** | Kiểm tra ID kết hợp chữ và số | Invalid Type Partition | `prod123` | `400 Bad Request` | Lỗi định dạng tham số |
| **TC_FR06_DP_14** | Kiểm tra ID định dạng UUID | Invalid Type Partition | `550e8400-e29b-41d4-a716-446655440000` | `400 Bad Request` | Lỗi không khớp kiểu Integer |
| **TC_FR06_DP_15** | Kiểm tra ID chứa chuỗi ký tự đặc biệt | Invalid Partition | `!@#$%^&*()` | `400 Bad Request` | Bị chặn bởi bộ lọc validation |

---

### NHÓM 2: Kiểm Thử Chuyển Đổi Trạng Thái & Sự Tồn Tại (State Transitions & Existence) — 8 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Path Param (`:id`) | Expected Status | Expected Response / Schema Assertion |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **TC_FR06_ST_01** | Xem sản phẩm đang hoạt động bình thường | State: Active | `1` | `200 OK` | Hiển thị đầy đủ thông tin, trạng thái bán bình thường |
| **TC_FR06_ST_02** | Xem sản phẩm thuộc các danh mục khác nhau (`category_id = 2`) | State: Multi-Category | `2` | `200 OK` | Trả về thông tin sản phẩm và category tương ứng |
| **TC_FR06_ST_03** | Xem sản phẩm không tồn tại trong CSDL | State: Non-Existent | `999999` | `404 Not Found` | Body: `{"message": "Product not found"}` |
| **TC_FR06_ST_04** | Xem sản phẩm có mô tả rỗng hoặc ảnh mặc định | State: Optional Fields | `4` | `200 OK` | Xử lý an toàn khi description rỗng |
| **TC_FR06_ST_05** | Xem sản phẩm mà danh mục cha (Category) đã bị xóa | State: Orphaned | `5` | `200 OK` | `category_id: null` hoặc danh mục mặc định, không lỗi 500 |
| **TC_FR06_ST_06** | Kiểm tra tính Idempotent (gọi liên tiếp 3 lần cùng 1 ID) | Idempotency Verification | `1` | `200 OK` | Dữ liệu trả về ở cả 3 lần đồng nhất 100% |
| **TC_FR06_ST_07** | Xem sản phẩm ngay sau khi Admin vừa tạo mới | State: Post-Creation | `{newly_created_id}` | `200 OK` | Dữ liệu trả về đúng với thông tin Admin vừa tạo |
| **TC_FR06_ST_08** | Xem sản phẩm ngay sau khi Admin vừa xóa vĩnh viễn | State: Post-Hard-Delete | `{deleted_id}` | `404 Not Found` | Chuyển trạng thái sang không tồn tại ngay lập tức |

---

### NHÓM 3: Kiểm Thử Bảo Mật (Security Testing SEC-01 → SEC-07) — 10 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Path Param (`:id`) | Expected Status | Expected Response / Schema Assertion |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **TC_FR06_SEC_01** | SQLi — Tautology kinh điển qua path param | SEC-01 (SQLi) | `1 OR 1=1` | `400 Bad Request` | Bị chặn, không thực thi truy vấn trả về toàn bộ DB |
| **TC_FR06_SEC_02** | SQLi — Ký tự nháy đơn và comment out SQLite | SEC-01 (SQLi) | `1'--` | `400 Bad Request` | Không gây lỗi cú pháp SQLite |
| **TC_FR06_SEC_03** | SQLi — Trích xuất dữ liệu nhạy cảm bằng UNION SELECT | SEC-01 (SQLi) | `1 UNION SELECT 1,username,password,4,5,6 FROM users--` | `400 Bad Request` | Bị từ chối truy cập, không rò rỉ bảng `users` |
| **TC_FR06_SEC_04** | SQLi — Tấn công xóa bảng Stacked Queries | SEC-01 (SQLi) | `1; DROP TABLE products;--` | `400 Bad Request` | Bị chặn, bảng `products` không bị ảnh hưởng |
| **TC_FR06_SEC_05** | SQLi — SQLite Time-based DoS (`randomblob`) | SEC-01 / SEC-06 | `1 AND 1=randomblob(100000000)` | `400 Bad Request` | Bị chặn, response trả về ngay (< 1000ms), không nghẽn CPU |
| **TC_FR06_SEC_06** | XSS Injection qua URL Path | SEC-01 (XSS) | `<script>alert(1)</script>` | `400 Bad Request` | Ký tự HTML/JS được encode an toàn hoặc bị reject |
| **TC_FR06_SEC_07** | Path Traversal / Directory Traversal | File Security | `../../etc/passwd` | `400 Bad Request` / `404` | Server không đọc file hệ thống |
| **TC_FR06_SEC_08** | Null Byte Injection | Input Sanitization | `1%00.jpg` | `400 Bad Request` | Ký tự `%00` bị loại bỏ an toàn |
| **TC_FR06_SEC_09** | Buffer Overflow / DoS String (10,000 ký tự 'A') | SEC-06 (DoS) | `A` x 10000 | `400 Bad Request` / `414` | Mã lỗi `414 URI Too Long` hoặc `400`, server không crash |
| **TC_FR06_SEC_10** | Chống lộ thông tin lỗi CSDL (Information Disclosure) | SEC-07 (Info Leak) | `invalid_syntax'` | `400 Bad Request` | Body KHÔNG chứa từ khóa: `sqlite3`, `syntax error`, stack trace |

---

### NHÓM 4: Kiểm Thử Cấu Trúc Schema & Giao Thức (Schema Validation & Protocols) — 6 TCs

| TestID | Tên Test Case | Kỹ thuật áp dụng | Path Param (`:id`) | Expected Status | Expected Response / Schema Assertion |
| :---: | :--- | :---: | :---: | :---: | :--- |
| **TC_FR06_SCH_01** | Xác thực JSON Schema chi tiết khi thành công (200) | Schema Validation (Ajv) | `1` | `200 OK` | Khớp 100% schema: `id` (int), `name` (string), `price` (number $\ge 0$), `description` (string), `imageUrl` (uri), `category_id` (int) |
| **TC_FR06_SCH_02** | Xác thực cấu trúc JSON Error khi không tìm thấy (404) | Schema Validation | `999999` | `404 Not Found` | Object chứa trường `message` hoặc `error` dạng chuỗi |
| **TC_FR06_SCH_03** | Xác thực cấu trúc JSON Error khi tham số sai (400) | Schema Validation | `abc` | `400 Bad Request` | Cấu trúc error chuẩn: `{"error": "...", "status": 400}` |
| **TC_FR06_SCH_04** | Kiểm tra phương thức HTTP không hợp lệ (`POST /api/products/1`) | HTTP Protocol Compliance | `1` (via POST) | `405 Method Not Allowed` / `404` | Không cho phép ghi dữ liệu qua endpoint GET |
| **TC_FR06_SCH_05** | Xác thực Response Header `Content-Type` | Header Verification | `1` | `200 OK` | Header có chứa `Content-Type: application/json` |
| **TC_FR06_SCH_06** | Kiểm tra thời gian phản hồi đạt chuẩn (< 500ms) | Performance Benchmark | `1` | `200 OK` | `pm.expect(pm.response.responseTime).to.be.below(500)` |

---

## PHẦN II: 5 TEST CASES MỞ RỘNG DO CON NGƯỜI THIẾT KẾ (HUMAN EXTENSION)

| TestID | Tên Test Case Mở Rộng | Kỹ thuật & Lý do AI bỏ sót | Input Path Param (`:id`) / Headers | Expected Status | Assertions Chi Tiết |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **TC_FR06_EXT_01** | **Xử lý số có số 0 ở đầu (Leading Zeros - Octal Confusion)** | Kiểm tra xem backend xử lý chuỗi `:id = "00001"` thành số thập phân `1` hay bị lỗi ép kiểu chuỗi. *(AI bỏ sót do chỉ nghĩ đến số nguyên chuẩn)* | `/api/products/00001` | `200 OK` | `pm.expect(pm.response.json().id).to.equal(1)` |
| **TC_FR06_EXT_02** | **Tấn công SQLi Boolean-Blind SQLite (`1 AND 1=1`)** | Tấn công SQLite Blind Injection: nếu backend dùng câu truy vấn ghép chuỗi `WHERE id = ` + id thay vì parameterized query `?`, chuỗi này sẽ lọt qua. *(AI chỉ test `OR 1=1` thô)* | `/api/products/1%20AND%201=1` | `400 Bad Request` | Backend phải từ chối chuỗi có biểu thức logic, không trả về 200 |
| **TC_FR06_EXT_03** | **Khoảng trắng URL-Encoded (`%20`) trong Path** | Kiểm tra router có tự động `trim()` khoảng trắng không (`" 1 "` -> `1`), tránh lỗi crash câu truy vấn SQLite. *(AI thường bỏ qua whitespace encoding)* | `/api/products/%201%20` | `400 Bad Request` / `200` | Xử lý an toàn, không sinh lỗi 500 Unhandled Exception |
| **TC_FR06_EXT_04** | **Ký tự số Unicode Full-Width (`１` - U+FF11)** | Ký tự số dạng toàn độ rộng trong tiếng Nhật/Trung. Kiểm tra tính an toàn của thư viện chuẩn hóa chuỗi và SQLite regex. | `/api/products/１` | `400 Bad Request` | Bị chặn an toàn bởi bộ validation số học |
| **TC_FR06_EXT_05** | **Kiểm thử Conditional Caching (`ETag` & `If-None-Match`)** | Gửi kèm header `If-None-Match` chứa mã hash ETag đã nhận trước đó để kiểm tra cơ chế tối ưu băng thông HTTP 304 Not Modified của Web API. | `/api/products/1` + Header `If-None-Match: <etag_value>` | `304 Not Modified` / `200 OK` | `pm.expect([200, 304]).to.include(pm.response.code)` |

---

## ĐOẠN MÃ POSTMAN TEST SCRIPT CHUẨN HÓA CHO FR-06

```javascript
// 1. Kiểm tra Status Code linh hoạt (200, 304, 400, 404 tùy case)
pm.test("Status code is as expected", function () {
    pm.expect([200, 304, 400, 404, 405]).to.include(pm.response.code);
});

// 2. Kiểm tra Thời gian phản hồi
pm.test("Response time is under 1000ms", function () {
    pm.expect(pm.response.responseTime).to.be.below(1000);
});

// 3. Kiểm tra JSON Schema khi Status là 200 OK
if (pm.response.code === 200) {
    const productDetailSchema = {
        "type": "object",
        "required": ["id", "name", "price", "description", "imageUrl", "category_id"],
        "properties": {
            "id": { "type": "integer", "minimum": 1 },
            "name": { "type": "string", "minLength": 1 },
            "price": { "type": "number", "minimum": 0 },
            "description": { "type": "string" },
            "imageUrl": { "type": "string" },
            "category_id": { "type": "integer" }
        }
    };

    pm.test("Response body matches Product Detail JSON Schema", function () {
        pm.response.to.have.jsonSchema(productDetailSchema);
    });
}
```

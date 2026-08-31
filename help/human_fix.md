# BÁO CÁO RÀ SOÁT CON NGƯỜI (HUMAN AUDIT) & MỞ RỘNG KIỂM THỬ (EXTENSION)
## API 1 (Pool A - FR-06): Xem chi tiết sản phẩm (`GET /api/products/:id`)
### Hệ thống: EShop SUT (`http://localhost:3000`)

---

## I. TỔNG QUAN PHÂN TÍCH THỰC TẾ TRÊN SUT ESHOP

Qua kiểm tra thực tế trên Backend EShop (`Node.js + Express + SQLite`), cấu trúc phản hồi của API `GET /api/products/1` chính xác như sau:
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
2. **Ảo giác tính năng Quản trị (Admin Soft-Delete Hallucination):** SUT không có cơ chế `is_active` hay `soft-delete` cho sản phẩm ở FR-06 (sản phẩm chỉ có tồn tại hoặc bị xóa hoàn toàn khỏi SQLite). Do đó test case `TC_FR06_ST_04` là **`INVALID`**.
3. **Phụ thuộc vào Dữ liệu Seed thực tế (Seed Data Dependency):** AI mặc định `id = 10` sẽ trả về `200 OK`. Nhưng nếu CSDL chỉ seed sẵn 5 sản phẩm (ID từ 1 đến 5), request `GET /api/products/10` sẽ trả về `404 Not Found` (đây vẫn là hành vi hợp lệ về mặt kỹ thuật, nhưng kỳ vọng của AI là **`INCOMPLETE`** vì chưa tính đến số lượng bản ghi thực tế).

---

## II. BẢNG RÀ SOÁT CON NGƯỜI (HUMAN AUDIT TABLE) — 39 TEST CASES AI

| TestID | Tên Test Case Gốc (AI) | Nhãn Audit | Phân tích Lỗi / Lý do Kỹ thuật | Bản Sửa Đổi / Chuẩn Hóa Thực Tế (Corrected) |
| :---: | :--- | :---: | :--- | :--- |
| **TC_FR06_DP_01** | Lấy sản phẩm với ID=1 | `VALID` | ID=1 luôn tồn tại trong seed data | Giữ nguyên (Expected: `200 OK`) |
| **TC_FR06_DP_02** | Lấy sản phẩm với ID=2 | `VALID` | ID=2 hợp lệ và có trong CSDL | Giữ nguyên (Expected: `200 OK`) |
| **TC_FR06_DP_03** | Lấy sản phẩm với ID=10 | `INCOMPLETE` | Nếu CSDL chỉ có $\le 5$ sản phẩm thì ID=10 sẽ trả về 404 thay vì 200 | Sửa Expected: `200 OK` (nếu tồn tại) hoặc `404 Not Found` (nếu vượt số lượng seed) |
| **TC_FR06_DP_04** | Kiểm tra ID = 0 | `VALID` | 0 không phải ID hợp lệ trong CSDL | Giữ nguyên (Expected: `400 Bad Request` hoặc `404 Not Found`) |
| **TC_FR06_DP_05** | Kiểm tra ID = -1 | `VALID` | ID âm không hợp lệ | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_06** | Kiểm tra ID = -99999 | `VALID` | ID âm lớn | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_07** | ID cực đại 32-bit (2147483647) | `VALID` | Không tồn tại trong CSDL | Giữ nguyên (Expected: `404 Not Found`) |
| **TC_FR06_DP_08** | Tràn số 32-bit (2147483648) | `VALID` | Kiểm tra giới hạn số học | Giữ nguyên (Expected: `400 Bad Request` / `404`) |
| **TC_FR06_DP_09** | Số nguyên cực lớn vượt 64-bit | `VALID` | Robustness test | Giữ nguyên (Expected: `400 Bad Request` / `404`) |
| **TC_FR06_DP_10** | Số thực thập phân ID = 1.5 | `VALID` | SQLite/Express parse chuỗi | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_11** | Số thực ID = 1.0 | `INCOMPLETE` | JS có thể parse `1.0` thành số `1` | Sửa Expected: Kiểm tra nếu router parse ra 1 thì trả 200, ngược lại 400 |
| **TC_FR06_DP_12** | ID là chuỗi chữ `abc` | `VALID` | Đúng spec kiểm tra type | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_13** | ID là `prod123` | `VALID` | Chuỗi alphanumeric | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_14** | ID là UUID | `VALID` | UUID không khớp Integer | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_DP_15** | ID chứa ký tự `!@#$%^&*()` | `VALID` | URL encoding validation | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_ST_01** | Xem sản phẩm Active | `VALID` | Đúng luồng chính | Giữ nguyên (Expected: `200 OK`) |
| **TC_FR06_ST_02** | Xem sản phẩm Out of stock | **`INVALID`** | **AI Ảo giác: SUT EShop không có trường `stock`** | **Đổi thành: Xem sản phẩm thuộc các danh mục khác nhau (`category_id = 1, 2, ...`)** |
| **TC_FR06_ST_03** | Xem sản phẩm ID=999999 | `VALID` | Không tồn tại | Giữ nguyên (Expected: `404 Not Found`) |
| **TC_FR06_ST_04** | Xem sản phẩm bị Admin ẩn/khóa | **`INVALID`** | **AI Ảo giác: SUT không có tính năng ẩn sản phẩm** | **Đổi thành: Xem sản phẩm có `description` rỗng hoặc `imageUrl` mặc định** |
| **TC_FR06_ST_05** | Xem sản phẩm có Category bị xóa | `INCOMPLETE` | Phụ thuộc ràng buộc Foreign Key SQLite | Sửa Expected: `200 OK` (category_id vẫn lưu số cũ hoặc null) |
| **TC_FR06_ST_06** | Kiểm tra tính Idempotent | `VALID` | Gọi lặp lại nhiều lần | Giữ nguyên (Expected: `200 OK` đồng nhất) |
| **TC_FR06_ST_07** | Xem sau khi Admin vừa tạo mới | `VALID` | Luồng CRUD tích hợp | Giữ nguyên (Expected: `200 OK`) |
| **TC_FR06_ST_08** | Xem sau khi Admin vừa xóa | `VALID` | Luồng Delete tích hợp | Giữ nguyên (Expected: `404 Not Found`) |
| **TC_FR06_SEC_01** | SQLi Tautology `1 OR 1=1` | `VALID` | SEC-01 Injection | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_02** | SQLi Comment `1'--` | `VALID` | SEC-01 Injection | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_03** | SQLi UNION SELECT trích xuất users | `VALID` | SEC-01 Data Leakage | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_04** | SQLi Stacked `1; DROP TABLE` | `VALID` | SEC-01 Destructive SQLi | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_05** | SQLi Time-based DoS `randomblob` | `VALID` | SEC-01/SEC-06 DoS | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_06** | XSS `<script>alert(1)</script>` | `VALID` | XSS qua URL Path | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_07** | Path Traversal `../../etc/passwd` | `VALID` | File Traversal | Giữ nguyên (Expected: `400 Bad Request` / `404`) |
| **TC_FR06_SEC_08** | Null Byte Injection `1%00.jpg` | `VALID` | Input Sanitization | Giữ nguyên (Expected: `400 Bad Request`) |
| **TC_FR06_SEC_09** | DoS String 10,000 ký tự | `VALID` | SEC-06 Buffer Overflow | Giữ nguyên (Expected: `400 Bad Request` / `414`) |
| **TC_FR06_SEC_10** | Error Disclosure `invalid_syntax'` | `VALID` | SEC-07 Info Disclosure | Giữ nguyên (Expected: Không lộ SQLite stack trace) |
| **TC_FR06_SCH_01** | JSON Schema Success 200 OK | `VALID` | Khớp 6 trường đặc tả | Giữ nguyên (6 trường: id, name, price, description, imageUrl, category_id) |
| **TC_FR06_SCH_02** | JSON Schema 404 Error | `VALID` | Cấu trúc message lỗi | Giữ nguyên |
| **TC_FR06_SCH_03** | JSON Schema 400 Error | `VALID` | Cấu trúc error | Giữ nguyên |
| **TC_FR06_SCH_04** | Sai Method `POST /api/products/1` | `VALID` | HTTP Method Compliance | Giữ nguyên (Expected: `405` / `404`) |
| **TC_FR06_SCH_05** | Header Content-Type là JSON | `VALID` | Header verification | Giữ nguyên |
| **TC_FR06_SCH_06** | Response time < 500ms | `VALID` | SLA Performance | Giữ nguyên |

---

## III. BẢNG 5 TEST CASES MỞ RỘNG TỰ THIẾT KẾ (HUMAN EXTENSION — CHUẨN ĐỦ ĐIỀU KIỆN)

Dưới đây là **5 ca kiểm thử nâng cao** do người trực tiếp thiết kế, nhắm vào các góc khuất kỹ thuật của Express Router, SQLite và chuẩn giao thức HTTP/1.1 mà AI bỏ sót:

| TestID | Tên Test Case Mở Rộng | Mục tiêu Kỹ thuật & Lý do AI bỏ sót | Input Path Param (`:id`) / Headers | Expected Status | Assertions Chi Tiết |
| :---: | :--- | :--- | :---: | :---: | :--- |
| **TC_FR06_EXT_01** | **Xử lý số có số 0 ở đầu (Leading Zeros - Octal Confusion)** | Kiểm tra xem backend xử lý chuỗi `:id = "00001"` thành số thập phân `1` hay bị lỗi ép kiểu chuỗi. *(AI bỏ sót do chỉ nghĩ đến số nguyên chuẩn)* | `/api/products/00001` | `200 OK` | `pm.expect(pm.response.json().id).to.equal(1)` |
| **TC_FR06_EXT_02** | **Tấn công SQLi Boolean-Blind SQLite (`1 AND 1=1`)** | Tấn công SQLite Blind Injection: nếu backend dùng câu truy vấn ghép chuỗi `WHERE id = ` + id thay vì parameterized query `?`, chuỗi này sẽ lọt qua. *(AI chỉ test `OR 1=1` thô)* | `/api/products/1%20AND%201=1` | `400 Bad Request` | Backend phải từ chối chuỗi có biểu thức logic, không trả về 200 |
| **TC_FR06_EXT_03** | **Khoảng trắng URL-Encoded (`%20`) trong Path** | Kiểm tra router có tự động `trim()` khoảng trắng không (`" 1 "` -> `1`), tránh lỗi crash câu truy vấn SQLite. *(AI thường bỏ qua whitespace encoding)* | `/api/products/%201%20` | `400 Bad Request` / `200` | Xử lý an toàn, không sinh lỗi 500 Unhandled Exception |
| **TC_FR06_EXT_04** | **Ký tự số Unicode Full-Width (`１` - U+FF11)** | Ký tự số dạng toàn độ rộng trong tiếng Nhật/Trung. Kiểm tra tính an toàn của thư viện chuẩn hóa chuỗi và SQLite regex. | `/api/products/１` | `400 Bad Request` | Bị chặn an toàn bởi bộ validation số học |
| **TC_FR06_EXT_05** | **Kiểm thử Conditional Caching (`ETag` & `If-None-Match`)** | Gửi kèm header `If-None-Match` chứa mã hash ETag đã nhận trước đó để kiểm tra cơ chế tối ưu băng thông HTTP 304 Not Modified của Web API. | `/api/products/1` + Header `If-None-Match: <etag_value>` | `304 Not Modified` / `200 OK` | `pm.expect([200, 304]).to.include(pm.response.code)` |

---

## IV. GIẢI TRÌNH CHI TIẾT TEST CASE EXT_05 (HTTP CONDITIONAL CACHING - ETAG)

### 1. Ý nghĩa Kỹ thuật:
- **Cơ chế:** Khi Frontend/Mobile App gọi `GET /api/products/1`, Express.js mặc định sẽ tạo ra một mã hash nội dung trong header phản hồi là `ETag: W/"3a-xyz123"`.
- **Mục đích:** Ở các lần gọi tiếp theo, Client không cần tải lại toàn bộ nội dung JSON nếu sản phẩm không có gì thay đổi. Client chỉ cần gửi request kèm header:
  `If-None-Match: W/"3a-xyz123"`
- **Phản hồi mong đợi:**
  - Nếu dữ liệu chưa đổi $\rightarrow$ Server trả về mã **`304 Not Modified`** với Body rỗng (giúp tiết kiệm băng thông và tăng tốc độ tải trang).
  - Nếu dữ liệu đã đổi (ví dụ giá đã cập nhật) $\rightarrow$ Server trả về **`200 OK`** kèm nội dung mới và mã ETag mới.

### 2. Cách thực hiện kiểm tra trong Postman:
- **Request 1 (Lấy ETag ban đầu):** Gửi `GET /api/products/1`. Trong tab **Tests**, lưu ETag vào biến môi trường:
  ```javascript
  const etag = pm.response.headers.get("ETag");
  if (etag) {
      pm.environment.set("product_1_etag", etag);
  }
  ```
- **Request 2 (Gửi Conditional Request):** Gửi `GET /api/products/1`, tại tab **Headers** thêm:
  - `If-None-Match`: `{{product_1_etag}}`
- **Đoạn mã Test Script cho Request 2:**
  ```javascript
  pm.test("Status code is 304 Not Modified (hoặc 200 OK nếu cache tắt)", function () {
      pm.expect([200, 304]).to.include(pm.response.code);
  });
  ```

---

## V. GIẢI TRÌNH LÝ DO VÌ SAO AI BỎ SÓT CÁC CA MỞ RỘNG (AI ROOT CAUSE ANALYSIS)

1. **Giới hạn về Tư duy Ngữ cảnh Thực tế (Contextual Blindness):** AI chỉ đọc đặc tả dưới dạng văn bản tĩnh nên suy luận theo các khuôn mẫu chung chung (như tự thêm `stock`), không hiểu được hiện trạng thực tế của mã nguồn Express + SQLite.
2. **Thiếu khả năng suy luận tấn công đa tầng (Deep Security Nuances):** AI chỉ sinh các mẫu SQLi cơ bản (`1 OR 1=1`) mà không nghĩ đến các kỹ thuật khai thác Boolean-Blind (`1 AND 1=1`), Octal conversion (`00001`) hay Unicode Normalization (`U+FF11`).
3. **Thiếu hiểu biết về Giao thức Mạng & Caching (HTTP Semantics):** AI thường chỉ tập trung vào mã `200/400/404` mà bỏ qua các cơ chế tối ưu hóa hạ tầng web như `ETag`, `If-None-Match` và `304 Not Modified`.


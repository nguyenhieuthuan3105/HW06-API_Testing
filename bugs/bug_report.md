# Danh sách Lỗi Phát hiện trên SUT EShop (Bug Report)

Dưới đây là các lỗi thực tế (Bugs) được phát hiện trong quá trình chạy kiểm thử tự động với Newman/Postman trên hệ thống Backend SUT EShop (`http://localhost:3000`), đối chiếu với đặc tả kỹ thuật `api_specification.md` và các tiêu chuẩn kiểm thử API chuyên nghiệp.

---

## 1. BUG #01: [FR-06] Endpoint trả về HTTP `200 OK` kèm body rỗng `{}` khi ID sản phẩm không tồn tại hoặc đã bị xóa (Vi phạm chuẩn RESTful API)

- **Mã Bug:** `BUG_FR06_01`
- **Mã chức năng:** FR-06: Xem chi tiết sản phẩm (`GET /api/products/:id`)
- **Mức độ nghiêm trọng (Severity):** **Medium / Functional Defect (REST Compliance)**
- **Các Test Cases phát hiện lỗi:** `TC_FR06_ST_03`, `TC_FR06_ST_08`, `TC_FR06_DP_07`, `TC_FR06_SCH_02`
- **Báo cáo Newman minh chứng:** File [`reports/fr06_newman_report.html`](../reports/fr06_newman_report.html) (Mục Failed Assertions)
- **Link GitHub Issue:** `https://github.com/nguyenhieuthuan3105/HW06-API_Testing/issues/1`

### Mô tả chi tiết:
Theo chuẩn thiết kế RESTful API, khi client yêu cầu tài nguyên không tồn tại trong CSDL hoặc tài nguyên đã bị xóa vĩnh viễn, Server bắt buộc phải phản hồi mã trạng thái **`404 Not Found`** kèm thông báo lỗi rõ ràng dạng JSON (ví dụ `{"message": "Product not found"}`).
Tuy nhiên, khi gửi request `GET /api/products/999999` hoặc truy vấn lại sản phẩm vừa bị xóa, SUT Backend lại phản hồi mã **`200 OK`** với Response Body rỗng `{}`.

### Các bước tái hiện (Steps to Reproduce):
1. Đảm bảo backend SUT đang chạy tại `http://localhost:3000`.
2. Gửi request HTTP GET với cURL hoặc Postman:
   ```bash
   curl -X GET "http://localhost:3000/api/products/999999" \
        -H "X-Student-Id: 25127001"
   ```
3. Quan sát HTTP Status Code và Response Body trả về.

### Kết quả Thực tế (Actual Result):
- **HTTP Status Code:** `200 OK`
- **Response Headers:** `Content-Length: 2`, `Content-Type: application/json`
- **Response Body:** `{}`

### Kết quả Mong đợi (Expected Result):
- **HTTP Status Code:** `404 Not Found`
- **Response Body:** Object chứa thông báo lỗi, ví dụ:
  ```json
  {
    "status": 404,
    "message": "Product with ID 999999 not found"
  }
  ```

### Phân tích nguyên nhân gốc rễ (Root Cause) & Đề xuất khắc phục (Fix):
- **Nguyên nhân:** Trong Express route `app.get('/api/products/:id')`, câu lệnh `db.prepare('SELECT * FROM products WHERE id = ?').get(id)` trả về `undefined`. Controller không kiểm tra `if (!product)` mà chuyển thẳng vào `res.json(product || {})`, dẫn đến Express trả về status mặc định là 200.
- **Cách khắc phục:**
  ```javascript
  const product = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!product) {
      return res.status(404).json({ error: "Product not found", status: 404 });
  }
  return res.status(200).json(product);
  ```

---

## 2. BUG #02: [FR-06][SEC-01] Thiếu Input Validation trên Path Parameter `:id`, chấp nhận SQL Injection và chuỗi bất hợp lệ trả về `200 OK`

- **Mã Bug:** `BUG_FR06_02`
- **Mã chức năng:** FR-06: Xem chi tiết sản phẩm (`GET /api/products/:id`)
- **Mức độ nghiêm trọng (Severity):** **High / Security & Robustness (SEC-01, SEC-07)**
- **Các Test Cases phát hiện lỗi:** `TC_FR06_DP_04` (ID=0), `TC_FR06_DP_05` (ID=-1), `TC_FR06_DP_12` ('abc'), `TC_FR06_DP_14` (UUID), `TC_FR06_SEC_01` (`1 OR 1=1`), `TC_FR06_SEC_02` (`1'--`), `TC_FR06_SEC_03`, `TC_FR06_SEC_04`, `TC_FR06_EXT_02`, `TC_FR06_EXT_04`.
- **Báo cáo Newman minh chứng:** File [`reports/fr06_newman_report.html`](../reports/fr06_newman_report.html)
- **Link GitHub Issue:** `https://github.com/nguyenhieuthuan3105/HW06-API_Testing/issues/2`

### Mô tả chi tiết:
Đặc tả quy định tham số Path `:id` phải là một **số nguyên dương $\ge 1$**. Hệ thống cần có tầng kiểm tra dữ liệu đầu vào (Input Validation Middleware) để từ chối ngay lập tức các tham số sai kiểu dữ liệu (chuỗi chữ, số âm, số 0, ký tự đặc biệt) và các payload tấn công SQL Injection bằng mã trạng thái **`400 Bad Request`**.
Thực tế, backend SUT không hề validate tham số này, chấp nhận mọi chuỗi đầu vào độc hại và âm thầm phản hồi HTTP `200 OK` với body `{}`.

### Các bước tái hiện (Steps to Reproduce):
1. Gửi request với tham số chữ cái hoặc payload SQL Injection:
   ```bash
   curl -X GET "http://localhost:3000/api/products/1%20OR%201=1" \
        -H "X-Student-Id: 25127001"
   ```
2. Gửi request với ID âm hoặc số 0:
   ```bash
   curl -X GET "http://localhost:3000/api/products/-1" \
        -H "X-Student-Id: 25127001"
   ```

### Kết quả Thực tế (Actual Result):
- **HTTP Status Code:** `200 OK`
- **Response Body:** `{}` (hoặc lấy ra bản ghi đầu tiên nếu câu SQL bị bypass)

### Kết quả Mong đợi (Expected Result):
- **HTTP Status Code:** `400 Bad Request`
- **Response Body:**
  ```json
  {
    "status": 400,
    "error": "Invalid product ID. ID must be a positive integer >= 1."
  }
  ```

### Phân tích nguyên nhân gốc rễ (Root Cause) & Đề xuất khắc phục (Fix):
- **Nguyên nhân:** Thiếu middleware kiểm tra `const id = Number(req.params.id); if (!Number.isInteger(id) || id <= 0) ...`.
- **Cách khắc phục:**
  ```javascript
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid product ID. Must be positive integer >= 1", status: 400 });
  }
  ```

---

## 3. BUG #03: [FR-06] Sai lệch Kiểu Dữ liệu CSDL SQLite — Trường `price` của sản phẩm ID=2 trả về dạng Chuỗi thay vì Số (JSON Schema Mismatch)

- **Mã Bug:** `BUG_FR06_03`
- **Mã chức năng:** FR-06: Xem chi tiết sản phẩm (`GET /api/products/2`)
- **Mức độ nghiêm trọng (Severity):** **Medium / Schema Integrity**
- **Test Case phát hiện lỗi:** `TC_FR06_DP_02_Valid_Intermediate_Integer_ID_2`
- **Báo cáo Newman minh chứng:** File [`reports/fr06_newman_report.html`](../reports/fr06_newman_report.html)
- **Link GitHub Issue:** `https://github.com/nguyenhieuthuan3105/HW06-API_Testing/issues/3`

### Mô tả chi tiết:
Theo đặc tả JSON Schema của API `GET /api/products/:id`, trường `price` bắt buộc phải là **kiểu số (number/integer $\ge 0$)** để Frontend có thể thực hiện tính toán số học (tính tổng tiền giỏ hàng, áp mã giảm giá).
Khi kiểm thử sản phẩm `id = 2`, assertion kiểm tra kiểu số bị FAIL với thông báo:
`AssertionError: expected '28000000' to be a number or a date`.

### Các bước tái hiện (Steps to Reproduce):
1. Gửi request lấy thông tin sản phẩm 2:
   ```bash
   curl -X GET "http://localhost:3000/api/products/2" \
        -H "X-Student-Id: 25127001"
   ```
2. Kiểm tra `typeof response.price` trong JSON phản hồi.

### Kết quả Thực tế (Actual Result):
```json
{
  "id": 2,
  "name": "Samsung Galaxy S24 Ultra",
  "price": "28000000",
  "description": "Điện thoại flagship của Samsung",
  "imageUrl": "https://placehold.co/300x300/png?text=Galaxy+S24",
  "category_id": 1
}
```
*(Trường `price` có giá trị là chuỗi `"28000000"`)*.

### Kết quả Mong đợi (Expected Result):
```json
{
  "id": 2,
  "name": "Samsung Galaxy S24 Ultra",
  "price": 28000000,
  "description": "Điện thoại flagship của Samsung",
  "imageUrl": "https://placehold.co/300x300/png?text=Galaxy+S24",
  "category_id": 1
}
```
*(Trường `price` phải là kiểu số nguyên/thực `28000000`)*.

### Phân tích nguyên nhân gốc rễ (Root Cause) & Đề xuất khắc phục (Fix):
- **Nguyên nhân:** Khi khởi tạo seed data CSDL SQLite (`database.sqlite`), câu lệnh `INSERT INTO products (id, name, price, ...)` đã truyền `'28000000'` dưới dạng text, hoặc cột `price` được định nghĩa là `TEXT` thay vì `REAL`/`INTEGER`.
- **Cách khắc phục:** Sửa schema bảng SQLite thành `price REAL NOT NULL` hoặc ép kiểu `Number(product.price)` trước khi trả về client.

---

## 4. BUG #04: [FR-09][SEC-02] Lỗ hổng Authentication Bypass — Endpoint `/api/apply-coupon` không xác thực Bearer JWT Token (Vi phạm Điều kiện C4)

- **Mã Bug:** `BUG_FR09_01`
- **Mã chức năng:** FR-09: Áp dụng mã giảm giá (`POST /api/apply-coupon`)
- **Mức độ nghiêm trọng (Severity):** **High / Security (SEC-02 - Missing Authentication)**
- **Các Test Cases phát hiện lỗi:** `TC_FR09_COND_08`, `TC_FR09_COND_12`, `TC_FR09_SEC_02`, `TC_FR09_SEC_03`, `TC_FR09_SEC_04`
- **Báo cáo Newman minh chứng:** File [`reports/fr09_newman_report.html`](../reports/fr09_newman_report.html)
- **Link GitHub Issue:** `https://github.com/nguyenhieuthuan3105/HW06-API_Testing/issues/4`

### Mô tả chi tiết:
Đặc tả nghiệp vụ Điều kiện C4 nêu rõ: *"Người dùng phải đăng nhập và có JWT Token hợp lệ"*. Nếu không có token, token giả hoặc token hết hạn, API phải phản hồi **`401 Unauthorized`**.
Thực tế trong mã nguồn backend (`server.js`), route `POST /api/apply-coupon` là một Public API không gắn middleware `authenticateToken`. Người dùng ẩn danh gửi request không có token hoặc token rác vẫn được hệ thống áp mã thành công với mã **`200 OK`**.

### Các bước tái hiện (Steps to Reproduce):
1. Gửi request áp mã giảm giá mà không kèm header `Authorization`:
   ```bash
   curl -X POST "http://localhost:3000/api/apply-coupon" \
        -H "Content-Type: application/json" \
        -H "X-Student-Id: 25127001" \
        -d '{"code": "SAVE10", "total_amount": 500000, "user_id": 1}'
   ```
2. Quan sát phản hồi của server.

### Kết quả Thực tế (Actual Result):
- **HTTP Status Code:** `200 OK`
- **Response Body:** Áp dụng mã thành công, không đòi hỏi xác thực.

### Kết quả Mong đợi (Expected Result):
- **HTTP Status Code:** `401 Unauthorized`
- **Response Body:** `{"error": "Unauthorized"}`

### Phân tích nguyên nhân gốc rễ (Root Cause) & Đề xuất khắc phục (Fix):
- **Nguyên nhân:** Lập trình viên quên gắn middleware `authenticateToken` vào khai báo route Express:
  ```javascript
  // Hiện tại trong server.js:
  app.post("/api/apply-coupon", (req, res) => { ... });
  ```
- **Cách khắc phục:**
  ```javascript
  // Cần sửa thành:
  app.post("/api/apply-coupon", authenticateToken, (req, res) => {
      const userId = req.user.id; // Lấy trực tiếp từ Token đã xác thực
      // ...
  });
  ```

---

## 5. BUG #05: [FR-09] Lỗi Tính Toán Số Học — Công thức tính giảm giá theo phần trăm (percent) cho kết quả âm và đội giá đơn hàng (Critical Math Defect)

- **Mã Bug:** `BUG_FR09_02`
- **Mã chức năng:** FR-09: Áp dụng mã giảm giá (`POST /api/apply-coupon`)
- **Mức độ nghiêm trọng (Severity):** **Critical / Business Logic Math Error**
- **Test Case phát hiện lỗi:** `TC_FR09_SCH_02_Math_Percent_Calculation_Accuracy`
- **Báo cáo Newman minh chứng:** File [`reports/fr09_newman_report.html`](../reports/fr09_newman_report.html)
- **Link GitHub Issue:** `https://github.com/nguyenhieuthuan3105/HW06-API_Testing/issues/5`

### Mô tả chi tiết:
Công thức nghiệp vụ quy định: Với mã loại `percent` (như `SAVE10` giảm 10%), tiền giảm giá $\text{discount\_amount} = \text{total} \times \text{value} / 100$, tổng tiền thanh toán $\text{final\_amount} = \text{total} - \text{discount\_amount}$.
Đơn hàng 500,000 ₫ áp mã 10% phải giảm 50,000 ₫ (thanh toán 450,000 ₫).
Tuy nhiên, backend tính ra `discount_amount = -4,500,000 ₫` và `final_amount = 5,000,000 ₫` (tiền thanh toán bị tăng gấp 10 lần!).

### Các bước tái hiện (Steps to Reproduce):
1. Gửi request áp mã `SAVE10` (giảm 10%) cho đơn hàng 500,000 ₫:
   ```bash
   curl -X POST "http://localhost:3000/api/apply-coupon" \
        -H "Content-Type: application/json" \
        -H "X-Student-Id: 25127001" \
        -d '{"code": "SAVE10", "total_amount": 500000, "user_id": 1}'
   ```
2. Kiểm tra giá trị `discount_amount` và `final_amount` trong phản hồi.

### Kết quả Thực tế (Actual Result):
```json
{
  "success": true,
  "coupon_id": 1,
  "discount_amount": -4500000,
  "final_amount": 5000000,
  "message": "Áp dụng thành công! Giảm 10%"
}
```

### Kết quả Mong đợi (Expected Result):
```json
{
  "success": true,
  "coupon_id": 1,
  "discount_amount": 50000,
  "final_amount": 450000,
  "message": "Áp dụng thành công! Giảm 10%"
}
```

### Phân tích nguyên nhân gốc rễ (Root Cause) & Đề xuất khắc phục (Fix):
- **Nguyên nhân:** Trong `server.js` (dòng 399-401 & 419-421), lập trình viên viết sai công thức số học:
  ```javascript
  if (coupon.type === "percent") {
      discount_amount = Math.floor(total_amount * (1 - coupon.discount_value));
  }
  ```
  Vì `coupon.discount_value = 10`, nên `(1 - 10) = -9`.
- **Cách khắc phục:**
  ```javascript
  if (coupon.type === "percent") {
      discount_amount = Math.floor(total_amount * (coupon.discount_value / 100));
  }
  ```

---

## 6. BUG #06: [FR-09] Lỗi So Sánh Giá Trị Biên Ngưỡng Tối Thiểu C3 — Đơn hàng đúng bằng `min_order_amount` bị từ chối `400 Bad Request` (Off-by-One Defect)

- **Mã Bug:** `BUG_FR09_03`
- **Mã chức năng:** FR-09: Áp dụng mã giảm giá (`POST /api/apply-coupon`)
- **Mức độ nghiêm trọng (Severity):** **Medium / Boundary Logic Defect**
- **Các Test Cases phát hiện lỗi:** `TC_FR09_EXT_01`, `TC_FR09_EXT_05 (Iteration 8)`
- **Báo cáo Newman minh chứng:** File [`reports/fr09_newman_report.html`](../reports/fr09_newman_report.html), [`reports/fr09_data_driven_report.html`](../reports/fr09_data_driven_report.html)
- **Link GitHub Issue:** `https://github.com/nguyenhieuthuan3105/HW06-API_Testing/issues/6`

### Mô tả chi tiết:
Điều kiện C3 trong tài liệu đặc tả quy định: *"Đủ ngưỡng đơn hàng: Tổng đơn hàng $\ge$ (lớn hơn hoặc bằng) `min_order_amount`"*.
Khi khách hàng mua đơn hàng có giá trị chính xác bằng ngưỡng tối thiểu (ví dụ `total_amount = 300,000 ₫` đối với mã `SAVE10`), hệ thống bắt buộc phải chấp nhận và phản hồi mã trạng thái **`200 OK`**.
Tuy nhiên, backend SUT lại từ chối với mã **`400 Bad Request`** và báo lỗi *"Đơn hàng chưa đủ giá trị tối thiểu"*.

### Các bước tái hiện (Steps to Reproduce):
1. Gửi request với `total_amount` bằng đúng `min_order_amount` (300,000 ₫):
   ```bash
   curl -X POST "http://localhost:3000/api/apply-coupon" \
        -H "Content-Type: application/json" \
        -H "X-Student-Id: 25127001" \
        -d '{"code": "SAVE10", "total_amount": 300000, "user_id": 1}'
   ```
2. Quan sát HTTP status và thông báo trả về.

### Kết quả Thực tế (Actual Result):
- **HTTP Status Code:** `400 Bad Request`
- **Response Body:** `{"error": "Đơn hàng chưa đủ giá trị tối thiểu 300.000 ₫ để áp dụng mã này"}`

### Kết quả Mong đợi (Expected Result):
- **HTTP Status Code:** `200 OK`
- **Response Body:** Áp dụng mã thành công, giảm 30,000 ₫, thanh toán 270,000 ₫.

### Phân tích nguyên nhân gốc rễ (Root Cause) & Đề xuất khắc phục (Fix):
- **Nguyên nhân:** Trong `server.js` (dòng 379), câu lệnh điều kiện dùng toán tử `>` (lớn hơn hẳn) thay vì `>=` (lớn hơn hoặc bằng):
  ```javascript
  if (total_amount > coupon.min_order_amount) { ... }
  ```
- **Cách khắc phục:**
  ```javascript
  if (total_amount >= coupon.min_order_amount) { ... }
  ```

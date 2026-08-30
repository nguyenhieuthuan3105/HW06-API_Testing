# Báo cáo Toàn diện Bài tập HW06 - Automated API Testing
## Hệ thống: EShop Backend API (FR-06, FR-09, FR-17)

- **Sinh viên thực hiện:** Nguyễn Hiếu Thuận
- **Mã số sinh viên:** 25127125
- **GitHub Repository:** https://github.com/nguyenhieuthuan3105/HW06-API_Testing.git

---

## I. TỔNG QUAN & LỰA CHỌN API

Hệ thống được kiểm thử là **EShop Backend** (`Node.js + Express + SQLite`), vận hành tại `http://localhost:3000`. Ba API được lựa chọn kiểm thử bao gồm:
1. **API 1 (Pool A - FR-06):** `GET /api/products/:id` — Xem thông tin chi tiết một sản phẩm.
2. **API 2 (Pool B - FR-09):** `POST /api/apply-coupon` — Áp dụng mã giảm giá với 5 điều kiện nghiệp vụ C1–C5.
3. **API 3 (Pool C - FR-17):** `POST/GET/DELETE /api/admin/coupons` — Quản trị CRUD mã giảm giá dành cho Admin.

---

## II. PIPELINE KIỂM THỬ API 1 (FR-06: XEM CHI TIẾT SẢN PHẨM)

### 1. Kịch bản AI sinh (Target $\ge 35$ Test Cases)
- Bao phủ 4 nhóm kỹ thuật: Domain Partitioning & Boundary Values trên Path `:id`, State Transitions & Existence, Security SEC-01..07 (SQL Injection, XSS), Schema Validation.

### 2. Bảng Rà soát Con người (Human Audit Table)
| Test ID | Tên Test Case | Nhãn Audit | Lý do kỹ thuật | Bản sửa đổi (Corrected) |
| :---: | :--- | :---: | :--- | :--- |
| `TC_FR06_01` | Get product with valid id=1 | `VALID` | Đúng spec | Giữ nguyên |
| `TC_FR06_02` | Get product with string id='abc' | `INVALID` | AI mong đợi 500, nhưng đúng spec phải là 400 | Đổi expected status = 400 |
| `TC_FR06_03` | Get product with id=999999 | `VALID` | Đúng spec (404 Not Found) | Giữ nguyên |

### 3. Bộ Test Cases Mở rộng (Human Extension $\ge 5$ Test Cases)
- Bổ sung các kịch bản nâng cao: ID cực lớn vượt ngưỡng Integer 64-bit, boolean-based SQLi, Race condition khi sản phẩm bị xóa giữa chừng.

---

## III. PIPELINE KIỂM THỬ API 2 (FR-09: ÁP DỤNG MÃ GIẢM GIÁ)

### 1. Kịch bản AI sinh (Target $\ge 35$ Test Cases)
- Bao phủ toàn diện 5 điều kiện C1–C5, các mã mẫu `SAVE10`, `BIGBUY`, `VIP100`, `EXPIRED`, và các công thức tính toán `percent` / `fixed`.

### 2. Bảng Rà soát Con người (Human Audit Table)
- Rà soát các lỗi AI thường gặp: Quên Bearer Token, nhầm lẫn công thức chiết khấu.

### 3. Bộ Test Cases Mở rộng (Human Extension $\ge 5$ Test Cases)
- Bổ sung kịch bản: Giả mạo `user_id` trong body khác với JWT Token (IDOR SEC-03), Concurrency Race condition 2 request trừ lượt dùng đồng thời, số tiền thập phân.

---

## IV. PIPELINE KIỂM THỬ API 3 (FR-17: QUẢN LÝ MÃ GIẢM GIÁ ADMIN CRUD)

### 1. Kịch bản AI sinh (Target $\ge 35$ Test Cases)
- Bao phủ phân quyền Admin, tính toàn vẹn CRUD và ràng buộc kiểu dữ liệu trường.

### 2. Bảng Rà soát Con người (Human Audit Table)
- Rà soát tính chính xác của HTTP Status Codes (401 vs 403).

### 3. Bộ Test Cases Mở rộng (Human Extension $\ge 5$ Test Cases)
- Bổ sung kịch bản: `discount_value > 100%`, ngày hết hạn ngày nhuận 29/02, xóa mã đang có người dùng.

---

## V. THỰC THI KIỂM THỬ POSTMAN, NEWMAN & BẰNG CHỨNG LOCALHOST
- Minh chứng thực thi trên `localhost:3000`.
- Minh chứng Header `X-Student-Id: 25127001` xuất hiện trong mọi request qua ảnh chụp console.

---

## VI. THIẾT KẾ AGENT SKILL: AI TEST GENERATOR (G9.5 CREATE)
- Sơ đồ kiến trúc tự thiết kế.
- Mã giả và source code Python `agent_skills/api_test_generator.py`.
- Link video demo YouTube.

---

## VII. TỔNG KẾT & PHỤ LỤC
- AI Critique (200–300 từ).
- Danh sách Bugs phát hiện trên GitHub Issues.

# Báo cáo Tích hợp Liên tục CI/CD với GitHub Actions

---

## 1. Cấu hình Pipeline CI/CD
- **File cấu hình:** `.github/workflows/api-test.yml`
- **Môi trường thực thi (Runner):** `ubuntu-latest`
- **Các bước thực thi (Pipeline Stages):**
  1. `Checkout Source Code`: Tải mã nguồn dự án.
  2. `Setup Node.js`: Cài đặt môi trường Node.js 18.x.
  3. `Install Newman & Reporter`: Cài đặt `newman` và `newman-reporter-htmlextra`.
  4. `Start Backend SUT`: Khởi chạy dịch vụ backend Express (`npm start &`) và đợi dịch vụ sẵn sàng tại `http://127.0.0.1:3000`.
  5. `Run Newman Test Suite`: Thực thi kiểm thử bộ Postman Collection với Environment.
  6. `Upload Artifact`: Lưu trữ file báo cáo HTML `newman_report.html` vào GitHub Artifacts.

---

## 2. Minh chứng Hai Lần Chạy Mẫu (Two Sample Runs)

### 2.1. Lần chạy 1 — Toàn bộ Test Cases Đạt (All Passed Pipeline Run)
- **Mô tả:** Chạy toàn bộ các test cases cho FR-06, FR-09, FR-17. Mọi assertions đều thỏa mãn, pipeline màu xanh.
- **Commit SHA:** `[Dán Commit Hash Pass vào đây]`
- **Link Workflow Run:** `[Dán Link Run Pass trên GitHub Actions vào đây]`
- **Ảnh chụp màn hình (Screenshot):**
  ![CI/CD All Passed Run](../evidences/cicd_all_passed.png)

---

### 2.2. Lần chạy 2 — Có Test Case Thất bại (One Failing Test Case Pipeline Run)
- **Mô tả:** Cố ý điều chỉnh 1 assertion (hoặc gửi payload không hợp lệ nhưng mong đợi status 200) để pipeline phát hiện lỗi đỏ, chứng minh CI/CD có khả năng chặn lỗi trước khi merge.
- **Commit SHA:** `[Dán Commit Hash Fail vào đây]`
- **Link Workflow Run:** `[Dán Link Run Fail trên GitHub Actions vào đây]`
- **Ảnh chụp màn hình (Screenshot):**
  ![CI/CD Failed Run](../evidences/cicd_one_failed.png)

---

## 3. Nhận xét & Đánh giá
Quy trình CI/CD giúp tự động hóa 100% việc kiểm thử hồi quy (Regression Testing) mỗi khi có commit mới, đảm bảo các API luôn tuân thủ đúng đặc tả kỹ thuật và phát hiện kịp thời các lỗi bảo mật/logic.

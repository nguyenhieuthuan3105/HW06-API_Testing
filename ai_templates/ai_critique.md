# AI Critique (Phê bình & Đánh giá Năng lực AI trong Kiểm thử API)

---

## Nội dung Phê bình AI (200 – 300 từ)

Trong quá trình thực hiện bài tập HW06 kiểm thử tự động hệ thống EShop (FR-06, FR-09, FR-17), mô hình AI đã thể hiện năng lực xuất sắc trong việc sinh nhanh khối lượng lớn các ca kiểm thử phân vùng tương đương và định dạng JSON Schema. Tuy nhiên, AI bộc lộ những hạn chế đáng kể ở 3 khía cạnh:

1. **Hiểu sai logic nghiệp vụ đa điều kiện:** Đối với API áp dụng coupon (FR-09), AI có xu hướng đơn giản hóa bài toán thành kiểm thử trường chuỗi `code` đơn lẻ, thường xuyên bỏ sót sự phụ thuộc chéo giữa 5 điều kiện (C1–C5), đặc biệt là logic kiểm tra hạn mức sử dụng theo từng người dùng (`max_uses_per_user`) và điều kiện ngưỡng giá trị đơn hàng tối thiểu.
2. **Thiếu nhạy bén về bảo mật phân quyền sâu (IDOR & RBAC):** AI dễ dàng nhận biết tấn công SQL Injection cơ bản nhưng hoàn toàn không tự động đề xuất ca kiểm thử IDOR (khi kẻ tấn công thay đổi `user_id` trong body để trừ lượt mã của người khác) hoặc kiểm thử token giả mạo thuật toán (`alg: none`). Lý do là LLM dựa trên mẫu dữ liệu phổ quát và thiếu khả năng suy luận ngữ cảnh trạng thái cơ sở dữ liệu động.
3. **Bài học rút ra:** Khi cộng tác với AI trong kiểm thử phần mềm, kỹ sư QA không được coi AI là một "hộp đen" tạo kết quả tự động. Thay vào đó, chúng ta phải giữ vai trò người định hướng chiến lược (Human-in-the-loop), chia nhỏ bài toán bằng kỹ thuật Multi-turn Prompting và trực tiếp kiểm chứng, mở rộng các kịch bản biên phức tạp mà AI không thể tự nhận thức.

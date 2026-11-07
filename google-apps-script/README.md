# Hướng Dẫn Thiết Lập Google Apps Script Cho Lớp HSK4 (Techcombank)

Hệ thống cho phép Web App **tự động tạo thư mục trên Google Drive** của bạn và nhận bài nộp của 4 học viên (**Hà Bin, Tien Pham, Xuan Mai, Trang**) vào đúng thư mục con của từng người.

Thư mục mẹ trên Google Drive đã được gắn cố định theo liên kết của bạn:
👉 **[Thư mục Drive HSK 4 của lớp](https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP)** (Folder ID: `18y3IbrKVibG9z9RzgQvVjz-jww54SelP`)

---

## ⚡ Các bước thiết lập trong 60 giây:

### Bước 1: Mở Google Apps Script
1. Đăng nhập Google bằng tài khoản Gmail của cô giáo hoặc người quản lý lớp.
2. Truy cập vào đường dẫn: **[https://script.google.com](https://script.google.com)**
3. Bấm vào nút **"Dự án mới" (New project)** ở góc trên bên trái.

### Bước 2: Dán mã nguồn Code.js
1. Xóa toàn bộ đoạn mã mặc định `function myFunction() { ... }` trong khung soạn thảo.
2. Mở file [Code.js](file:///c:/Users/TG8999SSS/Documents/HSK4/google-apps-script/Code.js), sao chép (Ctrl+A -> Ctrl+C) và dán (Ctrl+V) vào Google Apps Script.
3. Đặt tên dự án (ở góc trên bên trái, cạnh chữ "Dự án chưa có tiêu đề"): `HSK4 Drive Manager`.
4. Nhấn **Ctrl + S** (hoặc biểu tượng đĩa mềm 💾) để lưu lại.

### Bước 3: Triển khai ứng dụng Web (Deploy as Web App)
1. Ở góc trên bên phải, bấm vào nút màu xanh **"Triển khai" (Deploy)** -> Chọn **"Tùy chọn triển khai mới" (New deployment)**.
2. Nhấp vào biểu tượng bánh răng ⚙️ bên cạnh dòng "Chọn loại" (Select type) -> Chọn **"Ứng dụng web" (Web app)**.
3. Cấu hình chính xác như sau:
   - **Mô tả (Description):** `HSK4 Drive Sync v1`
   - **Thực thi dưới dạng (Execute as):** `Tôi (email Gmail của bạn)`
   - **Ai có quyền truy cập (Who has access):** Chọn **`Bất kỳ ai (Anyone)`** *(Bắt buộc chọn Anyone để trình duyệt của học viên có thể gửi file bài tập lên Drive mà không bị lỗi cấp quyền)*.
4. Bấm nút **"Triển khai" (Deploy)**.
5. Khi Google hiển thị hộp thoại yêu cầu cấp quyền:
   - Bấm **"Ủy quyền truy cập" (Authorize access)**.
   - Chọn tài khoản Google của bạn.
   - Nếu thấy thông báo *"Google chưa xác minh ứng dụng này"*, bấm vào chữ **"Nâng cao" (Advanced)** ở dưới cùng bên trái -> Bấm tiếp **"Đi tới HSK4 Drive Manager (không an toàn)"**.
   - Bấm **"Cho phép" (Allow)**.

### Bước 4: Kết nối với Web App HSK4
1. Sao chép dòng **"URL ứng dụng web"** vừa được tạo (Có dạng: `https://script.google.com/macros/s/AKfycb.../exec`).
2. Mở Web App HSK4 (nhấp đúp file [open-app.bat](file:///c:/Users/TG8999SSS/Documents/HSK4/open-app.bat)).
3. Vào tab **"☁️ Cấu hình Drive"** trên thanh menu:
   - Dán URL vào ô **URL Ứng Dụng Web Google Apps Script**.
   - Bấm nút **"Lưu cấu hình"**.
   - Bấm nút **"Kiểm tra kết nối ngay"** -> Hệ thống sẽ báo xanh: *"Kết nối Google Drive Apps Script thành công 100%!"*.

---

## 📁 Kết quả tự động hóa trên Google Drive của bạn:
Sau khi thiết lập, bên trong thư mục [HSK 4 của bạn](https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP), mỗi buổi học hệ thống sẽ tự động tạo cấu trúc:

```
Thư mục gốc HSK4 (18y3IbrKVibG9z9RzgQvVjz-jww54SelP)
 └── [HSK4] Buổi 01 - Bài 1: Tình yêu và Hôn nhân
      ├── 00_Tai_Lieu_Buoi_Hoc/ (Chứa slide, audio, tài liệu buổi 1)
      ├── 01_Ha_Bin/            (Thư mục bài tập nộp của Hà Bin)
      ├── 02_Tien_Pham/         (Thư mục bài tập nộp của Tien Pham)
      ├── 03_Xuan_Mai/          (Thư mục bài tập nộp của Xuan Mai)
      └── 04_Trang/             (Thư mục bài tập nộp của Trang)
```

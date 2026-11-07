# Ứng Dụng Quản Lý Nhóm Học Tiếng Trung HSK 4 (1 Giáo Viên + 4 Học Sinh)
> **Lớp Tiếng Trung HSK 4 - Techcombank (HSK 4 汉语冲刺班)**  
> **Lịch học cố định:** Thứ Hai & Thứ Tư hàng tuần (17:00 - 18:30)  
> **Google Drive lưu trữ:** [Thư mục Drive HSK 4 của lớp](https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP)

Ứng dụng web chuyên biệt dành cho nhóm học tập quy mô nhỏ (1 Giáo viên hướng dẫn: **Sha Sha** + 4 Học viên: **Hà Bin, Tien Pham, Xuan Mai, Trang**), đáp ứng trọn vẹn 3 nhu cầu quản lý cốt lõi:

---

## 🌟 3 Tính Năng Cốt Lõi (Key Features)

### 1. Xem & Quản lý Danh Sách Học Viên (Pre-loaded Roster)
- **Pre-load đầy đủ dữ liệu thực tế** cho Giáo viên (Sha Sha) và 4 Học viên (Hà Bin, Tien Pham, Xuan Mai, Trang):
  - Họ tên, Tên chữ Hán, Phiên âm Pinyin.
  - Thông tin liên lạc tiện lợi: Số điện thoại, Zalo, WeChat ID, Email Techcombank.
  - Mục tiêu khóa học (Target HSK4: 250 - 270 điểm).
  - Tên folder Google Drive cá nhân của từng bạn (`01_Ha_Bin`, `02_Tien_Pham`, `03_Xuan_Mai`, `04_Trang`).
- **Dễ dàng cập nhật**: Có nút *"Cập nhật nhanh danh sách"* và nút *"Sửa thông tin"* để thay đổi thông tin bất cứ lúc nào.

### 2. Quản Lý Lịch Học & Cơ Chế Báo Bận / Đề Xuất Đổi Ngày Linh Hoạt
- **Lịch học cố định hàng tuần**: Thứ Hai & Thứ Tư (17:00 - 18:30) kèm link Google Meet phòng học.
- **Ai xem cũng có thể chỉnh sửa**: Bất kỳ thành viên nào (Cô giáo hay 4 học sinh) cũng có thể click *"Sửa buổi học"* để cập nhật nội dung bài, link phòng học hoặc ghi chú.
- **Tính năng Báo Bận & Đề Xuất Dời Lịch Thông Minh (Smart Reschedule)**:
  - Khi có bạn bận (tăng ca, công tác, ốm): Bấm *"Báo bận / Đổi ngày"*, nhập lý do và đề xuất ngày/giờ học bù mới.
  - **Biểu quyết tập thể trực tiếp**: Hệ thống tự động tạo cuộc bình chọn giữa 5 thành viên (Cô giáo + 4 học sinh). Mỗi người có thể bấm *"Tôi đồng ý đổi ngày này"* hoặc *"Giờ này tôi bận"*.
  - Khi đã thống nhất: Bấm *"Chốt đổi ngày chính thức"* -> Hệ thống tự động cập nhật ngày mới vào lịch học và lưu lại lý do dời lịch.

### 3. Bài Tập Về Nhà, Tự Động Tạo Folder Google Drive & Chấm Bài
- **Giao diện Accordion thu gọn thông minh**: Hiển thị danh sách bài tập dạng tóm tắt gọn gàng, xem chi tiết mới mở rộng ra đầy đủ.
- **Cơ chế Tự động hóa Google Drive**:
  - Tự động tạo thư mục buổi học trong thư mục cha Drive của lớp (`18y3IbrKVibG9z9RzgQvVjz-jww54SelP`).
  - Trong thư mục đó, tự động tạo **4 thư mục con cho 4 học sinh** (`01_Ha_Bin`, `02_Tien_Pham`, `03_Xuan_Mai`, `04_Trang`) và cấp quyền chỉnh sửa cho link.
- **Học sinh nộp bài**: Tải file trực tiếp lên Drive hoặc mở thư mục cá nhân.
- **Cô giáo Chữa bài & Cho điểm**: Chấm điểm thang 10, nhận xét phát âm, ngữ pháp và đính kèm bài sửa.

---

## 🚀 Hướng Dẫn Khởi Động Web App
- Trong thư mục dự án `c:\Users\TG8999SSS\Documents\HSK4`:
- **Nhấp đúp chuột vào file `open-app.bat`** (hoặc nhấp đúp file `index.html`).
- Ứng dụng sẽ tự động mở trên trình duyệt web mặc định.

### Cách 2: Trải nghiệm chuyển đổi vai trò (Role Switcher)
- Ở góc trên bên phải màn hình có menu **"Đang thao tác với vai trò"**.
- Bạn có thể chuyển đổi linh hoạt giữa **Cô Vương Lệ Hoa (Cô giáo)** và **4 Học viên (Minh Anh, Tuấn Kiệt, Phương Thảo, Hoàng Nam)** để trải nghiệm giao diện nộp bài của học sinh và giao diện chấm bài của giáo viên!

---

## ☁️ Hướng Dẫn Kết Nối Google Drive Thật (Google Apps Script)
*(Dự án đã tích hợp sẵn chế độ **Demo Simulation** để bạn trải nghiệm ngay. Để kết nối với Google Drive thật của bạn, hãy làm theo các bước sau):*

1. Đăng nhập tài khoản Google và mở: **[script.google.com](https://script.google.com)**
2. Bấm **"Dự án mới" (New project)**.
3. Sao chép toàn bộ mã nguồn trong file `google-apps-script/Code.js` và dán vào.
4. Bấm **Triển khai (Deploy)** -> **Tùy chọn triển khai mới (New deployment)**.
5. Chọn loại **Ứng dụng web (Web app)**:
   - Thực thi dưới dạng: **Tôi**
   - Ai có quyền truy cập: **Bất kỳ ai (Anyone)**
6. Bấm **Triển khai** và cấp quyền Google Drive.
7. Sao chép link **URL ứng dụng web** (dạng `https://script.google.com/macros/s/.../exec`).
8. Mở Web App HSK4, vào tab **"☁️ Cấu hình Drive"**, dán link vào và bấm **"Lưu cấu hình"**.
*(Chi tiết xem thêm tại `google-apps-script/README.md`)*.

---

## 📁 Cấu Trúc Thư Mục Dự Án

```
HSK4/
├── index.html                   # Giao diện chính Web App
├── open-app.bat                 # File kích hoạt mở nhanh trên Windows
├── README.md                    # Hướng dẫn sử dụng toàn diện
├── css/
│   └── styles.css               # Phong cách giao diện Noto Serif SC, thẻ HSK, hoạt ảnh
├── data/
│   └── initialData.js           # Dữ liệu pre-load sẵn cho 1 GV, 4 HV, 7 buổi học & BTVN
├── js/
│   ├── app.js                   # Logic chuyển đổi vai trò, đổi lịch, chấm bài, modals
│   └── drive-service.js         # Dịch vụ kết nối & đồng bộ Google Drive
└── google-apps-script/
    ├── Code.js                  # Mã nguồn Google Apps Script tự tạo folder & nhận file
    └── README.md                # Hướng dẫn chi tiết thiết lập Google Drive
```


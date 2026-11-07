// Dữ liệu ban đầu cho hệ thống quản lý nhóm học tiếng Trung HSK4 (1 GV + 4 HV)
const DATA_VERSION = "2026.11.07_v3_kahoot";

const INITIAL_DATA = {
  version: DATA_VERSION,

  // Thông tin lớp học
  classInfo: {
    name: "Lớp Tiếng Trung HSK 4 - Techcombank",
    chineseName: "HSK 4 汉语冲刺班",
    teacherName: "Sha Sha",
    totalLessons: 20,
    currentLesson: 4,
    schedulePattern: "Thứ Hai & Thứ Tư hàng tuần (17:00 - 18:30)",
    defaultMeetLink: "https://meet.google.com/hsk-chrd-abc",
    googleDriveParentFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP?usp=drive_link",
    driveScriptUrl: "", // Dán Web App URL của Google Apps Script vào đây (ví dụ: https://script.google.com/macros/s/.../exec)
    generalMaterials: [
      { id: "mat_gen_1", name: "Giao_Trinh_Chuan_HSK_4_Tap_1.pdf", type: "pdf", size: "42.5 MB", category: "textbook", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", date: "2026-11-01" },
      { id: "mat_gen_2", name: "Giao_Trinh_Chuan_HSK_4_Tap_2.pdf", type: "pdf", size: "46.1 MB", category: "textbook", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", date: "2026-11-01" },
      { id: "mat_gen_3", name: "Bang_1200_Tu_Vung_HSK_4_Pinyin_Nghia.xlsx", type: "doc", size: "2.8 MB", category: "vocabulary", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", date: "2026-11-01" },
      { id: "mat_gen_4", name: "Bo_5_De_Thi_Thu_HSK4_Kem_File_Nghe.zip", type: "zip", size: "64.0 MB", category: "exam", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", date: "2026-11-02" },
      { id: "mat_gen_5", name: "De_Cuong_Lo_Trinh_HSK4_20_Buoi_Techcombank.pdf", type: "pdf", size: "1.8 MB", category: "textbook", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", date: "2026-11-02" }
    ]
  },

  // Danh sách Giáo viên & 4 Học sinh (Dùng để định danh)
  // Avatar Kahoot-style: Cô giáo & các bạn nữ (Rose, Blue, Yellow, Purple) + Tien Pham nam (Green)
  users: [
    {
      id: "teacher",
      role: "teacher",
      gender: "female",
      name: "Sha Sha",
      chineseName: "莎莎老师",
      pinyin: "Shāshā Lǎoshī",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&backgroundColor=ffcad4",
      phone: "0988 123 456",
      zalo: "0988 123 456",
      wechat: "shasha_chinese",
      email: "shasha.teacher@gmail.com",
      title: "Giáo viên chủ nhiệm & Giảng dạy chính",
      bio: "Thạc sĩ Ngôn ngữ Trung Quốc, giảng viên chuyên luyện thi HSK 4-5-6 với phương pháp phản xạ thực chiến và chấm chữa bài 1-1.",
      stats: {
        totalGraded: 16,
        avgResponseTime: "3.5 giờ"
      }
    },
    {
      id: "student_1",
      role: "student",
      gender: "female",
      orderNumber: 1,
      name: "Hà Bin",
      chineseName: "小宾",
      pinyin: "Xiǎo Bīn",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=b6e3f4",
      phone: "0912 345 601",
      zalo: "0912 345 601",
      wechat: "habin_hsk",
      email: "habin@techcombank.com.vn",
      target: "Mục tiêu HSK 4 (260+ điểm)",
      hskTargetScore: 260,
      attendanceRate: 100, // %
      homeworkRate: 100, // %
      averageGrade: 9.3,
      notes: "Nắm chắc từ vựng, ngữ pháp vững vàng, tích cực phát biểu trong buổi học.",
      driveFolder: "01_Ha_Bin"
    },
    {
      id: "student_2",
      role: "student",
      gender: "male",
      orderNumber: 2,
      name: "Tien Pham",
      chineseName: "进范",
      pinyin: "Jìn Fàn",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c5e8b7",
      phone: "0912 345 602",
      zalo: "0912 345 602",
      wechat: "tienpham_hsk",
      email: "tienpham@techcombank.com.vn",
      target: "Mục tiêu HSK 4 (250+ điểm)",
      hskTargetScore: 250,
      attendanceRate: 100, // %
      homeworkRate: 100, // %
      averageGrade: 8.8,
      notes: "Kỹ năng nghe hiểu tốt, nam tính năng động, cần trau chuốt thêm thứ tự các liên từ trong câu phức.",
      driveFolder: "02_Tien_Pham"
    },
    {
      id: "student_3",
      role: "student",
      gender: "female",
      orderNumber: 3,
      name: "Xuan Mai",
      chineseName: "春梅",
      pinyin: "Chūn Méi",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&backgroundColor=ffdfbf",
      phone: "0912 345 603",
      zalo: "0912 345 603",
      wechat: "xuanmai_hsk",
      email: "xuanmai@techcombank.com.vn",
      target: "Mục tiêu HSK 4 (270+ điểm)",
      hskTargetScore: 270,
      attendanceRate: 100, // %
      homeworkRate: 100, // %
      averageGrade: 9.2,
      notes: "Chữ viết tay rất đẹp, phát âm chuẩn thanh điệu, nộp bài tập rất đều đặn.",
      driveFolder: "03_Xuan_Mai"
    },
    {
      id: "student_4",
      role: "student",
      gender: "female",
      orderNumber: 4,
      name: "Trang",
      chineseName: "小庄",
      pinyin: "Xiǎo Zhuāng",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=d1d4f9",
      phone: "0912 345 604",
      zalo: "0912 345 604",
      wechat: "trang_hsk",
      email: "trang@techcombank.com.vn",
      target: "Mục tiêu HSK 4 (260+ điểm)",
      hskTargetScore: 260,
      attendanceRate: 100, // %
      homeworkRate: 100, // %
      averageGrade: 8.6,
      notes: "Tiếp thu nhanh bài giảng, cá tính thời trang, cần rèn luyện thêm viết chữ Hán.",
      driveFolder: "04_Trang"
    }
  ],

  // Lịch học các buổi: CỐ ĐỊNH THỨ 2 & THỨ 4 (17:00 - 18:30)
  lessons: [
    {
      id: "lesson_1",
      number: 1,
      title: "Bài 1: Tình yêu và Hôn nhân (爱情与婚姻)",
      date: "2026-11-02",
      dayOfWeek: "Thứ Hai",
      time: "17:00 - 18:30",
      status: "completed",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Ngữ pháp trọng điểm: 怎么说呢, 甚至, 连...也/都. Luyện phản xạ chủ đề tình cảm gia đình.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: null,
      materials: [
        { id: "mat_1_1", name: "Slide_Bai_1_Tinh_Yeu_Hon_Nhan.pdf", type: "pdf", size: "3.4 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Slide bài giảng chính khóa Buổi 1" },
        { id: "mat_1_2", name: "Audio_Bai_Khoa_1_BLCU_Chuan.mp3", type: "audio", size: "4.8 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "File nghe bài đọc mẫu chuẩn Bắc Kinh" },
        { id: "mat_1_3", name: "So_Tay_Tu_Vung_Ngu_Phap_Bai_1.docx", type: "doc", size: "1.2 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Tóm tắt từ mới & ví dụ đặt câu" },
        { id: "mat_1_4", name: "Video_Record_Buoi_1_Google_Meet.mp4", type: "video", size: "260 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Bản ghi hình trực tiếp buổi học" }
      ]
    },
    {
      id: "lesson_2",
      number: 2,
      title: "Bài 2: Tình bạn chân chính (真正的友谊)",
      date: "2026-11-04",
      dayOfWeek: "Thứ Tư",
      time: "17:00 - 18:30",
      status: "completed",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Phân biệt 陪 (péi) và 并且 (bìngqiě). Kỹ năng tóm tắt đoạn văn kể chuyện ngắn trong đề thi HSK4.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: null,
      materials: [
        { id: "mat_2_1", name: "Slide_Bai_2_Tinh_Ban_Chan_Chinh.pdf", type: "pdf", size: "3.8 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Slide bài giảng Buổi 2" },
        { id: "mat_2_2", name: "Audio_Hoi_Thoai_Bai_2.mp3", type: "audio", size: "5.1 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Audio nghe hội thoại 1 & 2" },
        { id: "mat_2_3", name: "Bang_Phan_Biet_Pei_Va_Bingqie.pdf", type: "pdf", size: "0.9 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Tài liệu chuyên đề ngữ pháp 陪 vs 并且" }
      ]
    },
    {
      id: "lesson_3",
      number: 3,
      title: "Bài 3: Tiêu dùng thông minh & Mua sắm (理智消费)",
      date: "2026-11-09",
      dayOfWeek: "Thứ Hai",
      time: "17:00 - 18:30",
      status: "completed",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Cấu trúc 只要...就..., 看来, 顺便. Luyện hội thoại đàm phán giá cả và hoàn tiền trên Taobao/Shopee.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: null,
      materials: [
        { id: "mat_3_1", name: "Slide_Bai_3_Tieu_Dung_Thong_Minh.pdf", type: "pdf", size: "4.1 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Slide bài học Buổi 3" },
        { id: "mat_3_2", name: "Tu_Vung_Thuong_Mai_Taobao_Shopee.pdf", type: "pdf", size: "1.5 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Thuật ngữ thương mại mua sắm thực chiến" }
      ]
    },
    {
      id: "lesson_4",
      number: 4,
      title: "Bài 4: Bí quyết mua sắm và Chọn lựa (购物的学问)",
      date: "2026-11-11",
      dayOfWeek: "Thứ Tư",
      time: "17:00 - 18:30",
      status: "reschedule_proposed", // Đang có đề xuất dời ngày để biểu quyết
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Cấu trúc 考虑, 难道, 顺便. Bài tập nghe chọn tranh phân đoạn 1 kỳ thi HSK 4.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: {
        proposedByUserId: "student_4",
        proposedByName: "Trang",
        proposedByAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=d1d4f9",
        proposedByRole: "Học viên #4",
        reason: "Em phải tham gia cuộc họp quý đột xuất của chi nhánh Techcombank từ 16h30 đến 19h Thứ Tư, em xin phép đề xuất dời sang chiều Thứ Năm cùng giờ (17:00 - 18:30).",
        proposedDate: "2026-11-12", // Dời sang Thứ Năm
        proposedDayOfWeek: "Thứ Năm",
        proposedTime: "17:00 - 18:30",
        proposedAt: "2026-11-06 09:15",
        status: "voting", // voting | approved | rejected
        votes: [
          { userId: "student_4", userName: "Trang", decision: "agree", note: "Người đề xuất" },
          { userId: "teacher", userName: "Sha Sha", decision: "agree", note: "Cô rảnh chiều T5, đồng ý dời nhé!" },
          { userId: "student_1", userName: "Hà Bin", decision: "agree", note: "Ok Trang nhé, chiều T5 mình học được." },
          { userId: "student_3", userName: "Xuan Mai", decision: "agree", note: "Mình đồng ý nhé!" },
          { userId: "student_2", userName: "Tien Pham", decision: "pending", note: "Đang chờ Tien Pham phản hồi biểu quyết" }
        ]
      },
      materials: [
        { id: "mat_4_1", name: "Slide_Bai_4_Bi_Quyet_Mua_Sam.pdf", type: "pdf", size: "3.5 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Slide bài giảng Buổi 4" },
        { id: "mat_4_2", name: "Phan_Tich_Cau_Hoi_Tu_Tu_Nandao.pdf", type: "pdf", size: "1.1 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Chuyên đề câu phản vấn 难道" }
      ]
    },
    {
      id: "lesson_5",
      number: 5,
      title: "Bài 5: Tiêu chuẩn của sự hoàn mỹ (完美的标准)",
      date: "2026-11-16",
      dayOfWeek: "Thứ Hai",
      time: "17:00 - 18:30",
      status: "upcoming",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Ngữ pháp câu chữ 把 (Bǎ) chuyên sâu: Động từ + 在/到/给/成. Tránh các lỗi sai phổ biến.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: null,
      materials: [
        { id: "mat_5_1", name: "Slide_Chuyen_De_Cau_Chu_Ba.pdf", type: "pdf", size: "5.2 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Slide ngữ pháp câu chữ 把 toàn diện" }
      ]
    },
    {
      id: "lesson_6",
      number: 6,
      title: "Bài 6: Thất bại là mẹ thành công (失败是成功之母)",
      date: "2026-11-18",
      dayOfWeek: "Thứ Tư",
      time: "17:00 - 18:30",
      status: "upcoming",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Cấu trúc câu chữ 被 (Bèi), 反而, 甚至. Đọc hiểu phần 3 nối câu và chọn đáp án đúng.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: null,
      materials: [
        { id: "mat_6_1", name: "Slide_Bai_6_Cau_Chu_Bei.pdf", type: "pdf", size: "3.9 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Slide câu bị động chữ 被" }
      ]
    },
    {
      id: "lesson_7",
      number: 7,
      title: "Bài 7: Luyện giải đề thi HSK 4 Định kỳ lần 1 (综合模拟考)",
      date: "2026-11-23",
      dayOfWeek: "Thứ Hai",
      time: "17:00 - 18:30",
      status: "upcoming",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Thi thử trọn gói 100 phút (Nghe 45 câu + Đọc 40 câu + Viết 15 câu). Chấm điểm và sửa trực tiếp.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: null,
      materials: [
        { id: "mat_7_1", name: "De_Thi_Thu_HSK4_Lan_1.pdf", type: "pdf", size: "6.2 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Đề thi thử 100 câu" },
        { id: "mat_7_2", name: "Audio_Thi_Thu_HSK4_Lan_1.mp3", type: "audio", size: "38.5 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Audio nghe phòng thi mô phỏng" }
      ]
    },
    {
      id: "lesson_8",
      number: 8,
      title: "Bài 8: Cuộc sống và Thái độ (生活与态度)",
      date: "2026-11-25",
      dayOfWeek: "Thứ Tư",
      time: "17:00 - 18:30",
      status: "upcoming",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Phân biệt 态度 (tàidu) và 看法 (kànfǎ). Ngữ pháp 来不及 vs 来得及.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: null,
      materials: [
        { id: "mat_8_1", name: "Slide_Bai_8_Cuoc_Song_Va_Thai_Do.pdf", type: "pdf", size: "3.7 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Slide bài giảng Buổi 8" }
      ]
    },
    {
      id: "lesson_9",
      number: 9,
      title: "Bài 9: Ánh sáng của sự chăm chỉ (阳光总在风雨后)",
      date: "2026-11-30",
      dayOfWeek: "Thứ Hai",
      time: "17:00 - 18:30",
      status: "upcoming",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Cấu trúc 尽管...却..., 只要...就... Bài tập đọc hiểu đoạn văn dài phần 2.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: null,
      materials: [
        { id: "mat_9_1", name: "Slide_Bai_9_Su_Cham_Chi.pdf", type: "pdf", size: "4.0 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Slide bài giảng Buổi 9" }
      ]
    },
    {
      id: "lesson_10",
      number: 10,
      title: "Bài 10: Tổng kết nửa khóa & Chữa đề giữa kỳ (阶段复习)",
      date: "2026-12-02",
      dayOfWeek: "Thứ Tư",
      time: "17:00 - 18:30",
      status: "upcoming",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Tổng kết 600 từ vựng đầu tiên của HSK4. Hệ thống hóa 15 cấu trúc ngữ pháp then chốt.",
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      reschedule: null,
      materials: [
        { id: "mat_10_1", name: "Tong_On_600_Tu_Vung_HSK4_Tap1.pdf", type: "pdf", size: "5.8 MB", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", description: "Tài liệu tổng hợp 600 từ trọng điểm" }
      ]
    }
  ],

  // Danh sách bài tập về nhà & Bài nộp
  assignments: [
    {
      id: "assign_1",
      lessonId: "lesson_1",
      lessonNumber: 1,
      title: "BTVN Buổi 1: Thu âm bài khóa 1 & Viết đoạn văn 80 chữ về Tình yêu",
      chineseTitle: "第一课作业：录音与短文写作",
      assignedDate: "2026-11-02",
      deadline: "2026-11-04 17:00",
      instructions: "1. Đọc và thu âm file MP3 bài khóa số 1 (chú ý thanh 4 và biến điệu yī/bù).\n2. Viết đoạn văn 80-100 chữ Hán chủ đề: 我的爱情观 (Quan điểm tình yêu của tôi). Dùng ít nhất 2 từ mới: 甚至, 互相.\n3. Chụp ảnh bài viết tay nộp lên Google Drive vào đúng folder của mình.",
      referenceFiles: [
        { name: "De_Bai_Tap_Buoi_1.pdf", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "1.2 MB" },
        { name: "Audio_Bai_Doc_Mau_Sha_Sha.mp3", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "3.5 MB" }
      ],
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      submissions: [
        {
          studentId: "student_1",
          status: "graded",
          submittedAt: "2026-11-03 16:30",
          files: [
            { name: "HaBin_BTVN_Buoi1_DoanVan.jpg", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "2.1 MB", type: "image" },
            { name: "HaBin_Audio_BaiKhoa1.mp3", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "4.0 MB", type: "audio" }
          ],
          studentNotes: "Em đã hoàn thành bài viết tay và ghi âm, nhờ cô Sha Sha sửa giúp phát âm từ 甚至 ạ!",
          grade: "9.5/10",
          teacherFeedback: "Bài viết rất chỉn chu, chữ Hán đẹp và cân đối. Phát âm chuẩn 95%, chú ý thanh 4 của từ '甚至' (shènzhì) dứt khoát hơn nữa nhé Bin. Rất khen ngợi!",
          teacherCorrectionFile: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
          gradedAt: "2026-11-04 10:20"
        },
        {
          studentId: "student_2",
          status: "graded",
          submittedAt: "2026-11-04 14:15",
          files: [
            { name: "TienPham_BTVN1_BaiViet.pdf", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "1.8 MB", type: "pdf" },
            { name: "TienPham_Audio1.mp3", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "3.2 MB", type: "audio" }
          ],
          studentNotes: "Em nộp bài trước giờ vào học buổi 2 ạ.",
          grade: "8.5/10",
          teacherFeedback: "Ý tứ rõ ràng, diễn đạt tự nhiên. Tuy nhiên câu thứ 3 bị nhầm vị trí phó từ '互相' (互相 + động từ, không dùng 互相 + danh từ nhé Tiến). Audio phát âm to rõ.",
          teacherCorrectionFile: null,
          gradedAt: "2026-11-04 16:00"
        },
        {
          studentId: "student_3",
          status: "graded",
          submittedAt: "2026-11-03 20:00",
          files: [
            { name: "XuanMai_BaiTap1.jpg", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "2.4 MB", type: "image" },
            { name: "XuanMai_Audio_ThuAm.mp3", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "3.8 MB", type: "audio" }
          ],
          studentNotes: "Em đã hoàn thành đủ 80 chữ viết tay trên giấy kẻ ô ạ.",
          grade: "9.0/10",
          teacherFeedback: "Chữ viết nắn nót, dùng cấu trúc 连...也 rất chính xác. Đoạn kết bài ấn tượng!",
          teacherCorrectionFile: null,
          gradedAt: "2026-11-04 11:00"
        },
        {
          studentId: "student_4",
          status: "graded",
          submittedAt: "2026-11-04 15:30",
          files: [
            { name: "Trang_BTVN_Buoi1.docx", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "0.9 MB", type: "doc" },
            { name: "Trang_GhiAm1.m4a", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "2.7 MB", type: "audio" }
          ],
          studentNotes: "Em gõ máy bài viết do chữ viết tay chưa tự tin lắm ạ.",
          grade: "8.0/10",
          teacherFeedback: "Nội dung bài viết đạt yêu cầu. Lần sau Trang cố gắng viết tay chụp ảnh nhé vì HSK 4 thi viết giấy cần rèn mặt chữ. Audio cần lưu ý thanh 1 đừng hạ giọng.",
          teacherCorrectionFile: null,
          gradedAt: "2026-11-04 16:30"
        }
      ]
    },
    {
      id: "assign_2",
      lessonId: "lesson_2",
      lessonNumber: 2,
      title: "BTVN Buổi 2: Đặt 5 câu với 陪 / 并且 & Thu âm đoạn hội thoại",
      chineseTitle: "第二课作业：造句与对话录音",
      assignedDate: "2026-11-04",
      deadline: "2026-11-09 17:00",
      instructions: "1. Đặt 3 câu với '陪' (Ai cùng ai làm gì) và 2 câu dùng liên từ '并且'.\n2. Đọc lại bài khóa 2 trang 18, thu âm gửi file mp3.\n3. Hạn chót trước 17h00 Thứ Hai tới (trước giờ học Buổi 3).",
      referenceFiles: [
        { name: "Phieu_Bai_Tap_Buoi_2.pdf", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "0.8 MB" }
      ],
      driveFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP",
      submissions: [
        {
          studentId: "student_1",
          status: "submitted",
          submittedAt: "2026-11-06 10:15",
          files: [
            { name: "HaBin_BTVN2_CauDat.pdf", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "1.5 MB", type: "pdf" },
            { name: "HaBin_Audio2.mp3", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "3.1 MB", type: "audio" }
          ],
          studentNotes: "Em nộp sớm bài tập Buổi 2 ạ!",
          grade: null,
          teacherFeedback: null,
          teacherCorrectionFile: null,
          gradedAt: null
        },
        {
          studentId: "student_2",
          status: "not_submitted",
          submittedAt: null,
          files: [],
          studentNotes: null,
          grade: null,
          teacherFeedback: null,
          teacherCorrectionFile: null,
          gradedAt: null
        },
        {
          studentId: "student_3",
          status: "submitted",
          submittedAt: "2026-11-06 11:30",
          files: [
            { name: "XuanMai_BTVN2.jpg", url: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP", size: "2.0 MB", type: "image" }
          ],
          studentNotes: "Em nộp phần bài tập viết trước, audio tối em nộp thêm ạ.",
          grade: null,
          teacherFeedback: null,
          teacherCorrectionFile: null,
          gradedAt: null
        },
        {
          studentId: "student_4",
          status: "not_submitted",
          submittedAt: null,
          files: [],
          studentNotes: null,
          grade: null,
          teacherFeedback: null,
          teacherCorrectionFile: null,
          gradedAt: null
        }
      ]
    }
  ],

  // Diễn đàn hỏi đáp
  discussions: [
    {
      id: "disc_1",
      lessonId: "lesson_2",
      lessonNumber: 2,
      userId: "student_2",
      userName: "Tien Pham",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c5e8b7",
      userRole: "student",
      userBadge: "Học viên #2",
      content: "Thưa cô Sha Sha, trong bài 2 từ '并且' và '而且' khi nào có thể thay thế cho nhau được ạ? Em thấy trong câu ghép hay dùng cả hai.",
      timestamp: "2026-11-05 11:20",
      replies: [
        {
          id: "rep_1",
          userId: "teacher",
          userName: "Sha Sha",
          userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&backgroundColor=ffcad4",
          userRole: "teacher",
          userBadge: "Giáo viên",
          content: "Chào Tiến! Cả hai đều biểu thị mối quan hệ tăng tiến. Nhưng '并且' thường nối động từ hoặc cụm động từ và hay dùng trong văn viết trang trọng, còn '而且' dùng rất phổ biến cả khẩu ngữ và có thể đi cặp với cấu trúc '不但/不仅...而且...' nhé em!",
          timestamp: "2026-11-05 11:45"
        }
      ]
    },
    {
      id: "disc_2",
      lessonId: "lesson_1",
      lessonNumber: 1,
      userId: "student_3",
      userName: "Xuan Mai",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Lily&backgroundColor=ffdfbf",
      userRole: "student",
      userBadge: "Học viên #3",
      content: "Cô ơi bài tập viết đoạn văn 80 chữ về Tình yêu em chụp ảnh bài viết bút mực nộp lên Drive cô xem nét chữ có bị mờ không ạ?",
      timestamp: "2026-11-03 20:05",
      replies: [
        {
          id: "rep_2",
          userId: "teacher",
          userName: "Sha Sha",
          userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&backgroundColor=ffcad4",
          userRole: "teacher",
          userBadge: "Giáo viên",
          content: "Ảnh chụp nét lắm Mai nhé, cô đã xem và sửa chi tiết rồi đó, nét chữ rất đều tay và đẹp!",
          timestamp: "2026-11-04 11:02"
        }
      ]
    }
  ],

  // Nhật ký lớp học
  activityLogs: [
    {
      id: "act_1",
      type: "reschedule",
      userId: "student_4",
      userName: "Trang",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Zoe&backgroundColor=d1d4f9",
      userBadge: "Học viên #4",
      action: "Báo bận & Đề xuất dời Buổi 4",
      details: "Báo bận Thứ Tư (11/11) do họp quý Techcombank, đề xuất dời sang Thứ Năm (12/11 lúc 17:00 - 18:30).",
      timestamp: "2026-11-06 09:15"
    },
    {
      id: "act_2",
      type: "submission",
      userId: "student_1",
      userName: "Hà Bin",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mia&backgroundColor=b6e3f4",
      userBadge: "Học viên #1",
      action: "Đã nộp bài tập Buổi 2",
      details: "Tải lên 2 file (Câu đặt với 陪/并且 và Audio đọc bài khóa 2) lên Google Drive.",
      timestamp: "2026-11-06 10:15"
    },
    {
      id: "act_3",
      type: "question",
      userId: "student_2",
      userName: "Tien Pham",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Felix&backgroundColor=c5e8b7",
      userBadge: "Học viên #2",
      action: "Đặt câu hỏi cho cô giáo",
      details: "Hỏi về cách phân biệt '并且' và '而且' trong bài 2.",
      timestamp: "2026-11-05 11:20"
    },
    {
      id: "act_4",
      type: "grading",
      userId: "teacher",
      userName: "Sha Sha",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aria&backgroundColor=ffcad4",
      userBadge: "Giáo viên",
      action: "Đã chấm bài & Nhận xét Buổi 1",
      details: "Chấm bài cho Hà Bin (9.5 điểm), Tien Pham (8.5 điểm), Xuan Mai (9.0 điểm), Trang (8.0 điểm).",
      timestamp: "2026-11-04 16:30"
    }
  ]
};

// Khởi tạo LocalStorage kèm cơ chế auto-update khi có phiên bản dữ liệu mới
function getAppData() {
  const saved = localStorage.getItem("HSK4_CLASS_APP_DATA");
  const savedVersion = localStorage.getItem("HSK4_DATA_VERSION");

  if (saved && savedVersion === DATA_VERSION) {
    try {
      const data = JSON.parse(saved);
      if (!data.discussions) data.discussions = INITIAL_DATA.discussions;
      if (!data.activityLogs) data.activityLogs = INITIAL_DATA.activityLogs;
      if (!data.classInfo.generalMaterials) data.classInfo.generalMaterials = INITIAL_DATA.classInfo.generalMaterials;
      return data;
    } catch (e) {
      console.error("Lỗi parse data:", e);
    }
  }

  // Tự động load INITIAL_DATA mới nhất (khi đổi lịch, đổi thông tin lớp, đổi avatar)
  saveAppData(INITIAL_DATA);
  localStorage.setItem("HSK4_DATA_VERSION", DATA_VERSION);
  return INITIAL_DATA;
}

function saveAppData(data) {
  localStorage.setItem("HSK4_CLASS_APP_DATA", JSON.stringify(data));
  localStorage.setItem("HSK4_DATA_VERSION", DATA_VERSION);
}

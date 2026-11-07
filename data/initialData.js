// Dữ liệu ban đầu cho hệ thống quản lý nhóm học tiếng Trung HSK4 (1 GV + 4 HV)
// Phiên bản dữ liệu sạch (Clean Production) - Tự động tạo Folder Buổi học & Nộp bài tối ưu
const DATA_VERSION = "2026.11.07_v5_real_drive_folders";

const INITIAL_DATA = {
  version: DATA_VERSION,

  // Thông tin lớp học thật
  classInfo: {
    name: "Lớp Tiếng Trung HSK 4 - Techcombank",
    chineseName: "HSK 4 汉语冲刺班",
    teacherName: "Sha Sha",
    totalLessons: 20,
    currentLesson: 1,
    schedulePattern: "Thứ Hai & Thứ Tư hàng tuần (17:00 - 18:30)",
    defaultMeetLink: "https://meet.google.com/hsk-chrd-abc",
    googleDriveParentFolderUrl: "https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP?usp=drive_link",
    driveScriptUrl: "https://script.google.com/macros/s/AKfycbzkhHDAaYHNjJYWZsUltth1E4iqJHPxYE5i4tZq7MZJlK5bjz0DW-JF7TDNRba1eU0q/exec",
    generalMaterials: [] // Đã xóa sạch mockup file giả, sẵn sàng để cô giáo upload tài liệu thật
  },

  // Danh sách Giáo viên & 4 Học sinh (Dùng để định danh)
  // Đã reset toàn bộ điểm số, nhận xét và số bài chấm về trạng thái bắt đầu
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
        totalGraded: 0,
        avgResponseTime: "--"
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
      homeworkRate: 0, // %
      averageGrade: null,
      notes: "",
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
      homeworkRate: 0, // %
      averageGrade: null,
      notes: "",
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
      homeworkRate: 0, // %
      averageGrade: null,
      notes: "",
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
      homeworkRate: 0, // %
      averageGrade: null,
      notes: "",
      driveFolder: "04_Trang"
    }
  ],

  // Lịch học các buổi: Khung giờ cố định Thứ Hai & Thứ Tư (17:00 - 18:30)
  // Đã xóa sạch các ghi chú giả, file giả, báo bận giả; toàn bộ ở trạng thái sắp diễn ra
  lessons: [
    {
      id: "lesson_1",
      number: 1,
      title: "Bài 1: Khai giảng & Bắt đầu khóa học HSK 4",
      date: "2026-11-09",
      dayOfWeek: "Thứ Hai",
      time: "17:00 - 18:30",
      status: "upcoming",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "",
      driveFolderUrl: null,
      materialsFolderUrl: null,
      homeworkFolderUrl: null,
      studentFolders: [],
      reschedule: null,
      materials: []
    },
    {
      id: "lesson_2",
      number: 2,
      title: "Bài 2: Buổi học số 2",
      date: "2026-11-11",
      dayOfWeek: "Thứ Tư",
      time: "17:00 - 18:30",
      status: "upcoming",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "",
      driveFolderUrl: null,
      materialsFolderUrl: null,
      homeworkFolderUrl: null,
      studentFolders: [],
      reschedule: null,
      materials: []
    }
  ],

  // Danh sách bài tập về nhà: Làm sạch hoàn toàn, sẵn sàng để cô giáo bấm "+ Giao bài tập mới"
  assignments: [],

  // Diễn đàn hỏi đáp: Làm sạch hoàn toàn, sẵn sàng để học viên và cô giáo đặt câu hỏi thật
  discussions: [],

  // Dòng thời gian nhật ký lớp học: Làm sạch hoàn toàn
  activityLogs: []
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

  // Tự động load INITIAL_DATA mới nhất (khi reset/clean dữ liệu)
  saveAppData(INITIAL_DATA);
  localStorage.setItem("HSK4_DATA_VERSION", DATA_VERSION);
  return INITIAL_DATA;
}

function saveAppData(data) {
  localStorage.setItem("HSK4_CLASS_APP_DATA", JSON.stringify(data));
  localStorage.setItem("HSK4_DATA_VERSION", DATA_VERSION);
}

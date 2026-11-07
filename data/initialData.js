// Dữ liệu ban đầu cho hệ thống quản lý nhóm học tiếng Trung HSK4 (1 GV + 4 HV)
// Phiên bản dữ liệu sạch (Clean Production) - Tự động tạo Folder Buổi học & Nộp bài tối ưu
const DATA_VERSION = "2026.11.07_v7_buoi1_homework_live";

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
    driveScriptUrl: "https://script.google.com/macros/s/AKfycbwlIswjWhLy3R4qlwEXxEbAJND7x5CnN7s07-Sy7HfKPnhwMm6PrVuD_dxban2QqlSJ/exec",
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
      topicNotes: "Luyện ngữ âm, giới thiệu cấu trúc đề thi HSK 4 & phương pháp phản xạ thực chiến.",
      driveFolderUrl: "https://drive.google.com/drive/folders/1blS8_-v8TX8lY7LTF_mOiXDZm9lkdrRQ",
      materialsFolderUrl: "https://drive.google.com/drive/folders/12-w_W4A8qh0ALt83UFyTQaEAdGOBh06i",
      homeworkFolderUrl: "https://drive.google.com/drive/folders/1bRwEUA1hSinE1T5yKc7OVFHly-Nj13P1",
      studentFolders: [
        { studentId: "student_1", studentName: "Hà Bin", folderName: "01_Ha_Bin", folderUrl: "https://drive.google.com/drive/folders/1EO3Yjx1InqB3YHDOcEZlbrCIkxQ4VUmH", folderId: "1EO3Yjx1InqB3YHDOcEZlbrCIkxQ4VUmH" },
        { studentId: "student_2", studentName: "Tien Pham", folderName: "02_Tien_Pham", folderUrl: "https://drive.google.com/drive/folders/17prkypM3CwN12kMuXnE5EPmksjvKsdlA", folderId: "17prkypM3CwN12kMuXnE5EPmksjvKsdlA" },
        { studentId: "student_3", studentName: "Xuan Mai", folderName: "03_Xuan_Mai", folderUrl: "https://drive.google.com/drive/folders/1WTHIrcXGC2s8l5IK7A8BVMF5v3GejVGE", folderId: "1WTHIrcXGC2s8l5IK7A8BVMF5v3GejVGE" },
        { studentId: "student_4", studentName: "Trang", folderName: "04_Trang", folderUrl: "https://drive.google.com/drive/folders/15pVTVQJIwRrEwoxOvBSgD92KxpjW98Wr", folderId: "15pVTVQJIwRrEwoxOvBSgD92KxpjW98Wr" }
      ],
      reschedule: null,
      materials: []
    },
    {
      id: "lesson_2",
      number: 2,
      title: "Bài 2: Tình bạn & Mối quan hệ xã hội",
      date: "2026-11-11",
      dayOfWeek: "Thứ Tư",
      time: "17:00 - 18:30",
      status: "upcoming",
      meetLink: "https://meet.google.com/hsk-chrd-abc",
      topicNotes: "Phân biệt 陪 (péi) và 并且 (bìngqiě). Kỹ năng tóm tắt đoạn văn kể chuyện.",
      driveFolderUrl: null,
      materialsFolderUrl: null,
      homeworkFolderUrl: null,
      studentFolders: [],
      reschedule: null,
      materials: []
    }
  ],

  // Danh sách bài tập về nhà: Tạo sẵn bài tập Buổi 1 kết nối với Folder Drive thật
  assignments: [
    {
      id: "assign_buoi_1",
      lessonId: "lesson_1",
      lessonNumber: 1,
      title: "BTVN Buổi 1: Luyện phát âm, ngữ pháp & Ghi âm bài khóa",
      chineseTitle: "第一课课后作业",
      assignedDate: "2026-11-09",
      deadline: "2026-11-11 17:00",
      instructions: "1. Đọc và thu âm file audio đọc bài khóa Bài 1 (chuẩn ngữ điệu & thanh điệu).\n2. Hoàn thành bài tập ngữ pháp trong sách bài tập HSK 4.\n3. Nộp file ghi âm và ảnh chụp vở bài tập vào đúng thư mục Google Drive cá nhân của bạn.",
      referenceFiles: [],
      driveFolderUrl: "https://drive.google.com/drive/folders/1bRwEUA1hSinE1T5yKc7OVFHly-Nj13P1",
      submissions: [
        {
          studentId: "student_1",
          driveFolderUrl: "https://drive.google.com/drive/folders/1EO3Yjx1InqB3YHDOcEZlbrCIkxQ4VUmH",
          driveFolderId: "1EO3Yjx1InqB3YHDOcEZlbrCIkxQ4VUmH",
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
          studentId: "student_2", // Tien Pham
          driveFolderUrl: "https://drive.google.com/drive/folders/17prkypM3CwN12kMuXnE5EPmksjvKsdlA",
          driveFolderId: "17prkypM3CwN12kMuXnE5EPmksjvKsdlA",
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
          driveFolderUrl: "https://drive.google.com/drive/folders/1WTHIrcXGC2s8l5IK7A8BVMF5v3GejVGE",
          driveFolderId: "1WTHIrcXGC2s8l5IK7A8BVMF5v3GejVGE",
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
          studentId: "student_4",
          driveFolderUrl: "https://drive.google.com/drive/folders/15pVTVQJIwRrEwoxOvBSgD92KxpjW98Wr",
          driveFolderId: "15pVTVQJIwRrEwoxOvBSgD92KxpjW98Wr",
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

  // Diễn đàn hỏi đáp: Làm sạch hoàn toàn, sẵn sàng để học viên và cô giáo đặt câu hỏi thật
  discussions: [],

  // Dòng thời gian nhật ký lớp học: Làm sạch hoàn toàn
  activityLogs: []
};

// Khởi tạo LocalStorage kèm cơ chế auto-update khi có phiên bản dữ liệu mới
function getAppData() {
  const saved = localStorage.getItem("HSK4_CLASS_APP_DATA");
  const savedVersion = localStorage.getItem("HSK4_DATA_VERSION");

  if (saved) {
    try {
      const data = JSON.parse(saved);
      if (!data.discussions) data.discussions = INITIAL_DATA.discussions;
      if (!data.activityLogs) data.activityLogs = INITIAL_DATA.activityLogs;
      if (!data.classInfo.generalMaterials) data.classInfo.generalMaterials = INITIAL_DATA.classInfo.generalMaterials;

      // Tự động nâng cấp sang URL Google Apps Script mới hoạt động 100%
      if (!data.classInfo.driveScriptUrl || data.classInfo.driveScriptUrl.includes("AKfycbzkhHDAaYHNjJYWZsUltth1E4iqJHPxYE5i4tZq7MZJlK5bjz0DW-JF7TDNRba1eU0q")) {
        data.classInfo.driveScriptUrl = INITIAL_DATA.classInfo.driveScriptUrl;
        saveAppData(data);
      }

      if (savedVersion !== DATA_VERSION) {
        data.version = DATA_VERSION;
        // Nếu trước đó assignments đang rỗng, tự nạp bài tập Buổi 1 thật từ INITIAL_DATA
        if (!data.assignments || data.assignments.length === 0) {
          data.assignments = INITIAL_DATA.assignments;
        }
        // Nếu Buổi 1 trong lessons chưa có link folder Drive thật, cập nhật từ INITIAL_DATA
        if (data.lessons && data.lessons.length > 0 && !data.lessons[0].driveFolderUrl) {
          data.lessons[0].driveFolderUrl = INITIAL_DATA.lessons[0].driveFolderUrl;
          data.lessons[0].materialsFolderUrl = INITIAL_DATA.lessons[0].materialsFolderUrl;
          data.lessons[0].homeworkFolderUrl = INITIAL_DATA.lessons[0].homeworkFolderUrl;
          data.lessons[0].studentFolders = INITIAL_DATA.lessons[0].studentFolders;
        }
        saveAppData(data);
      }

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

  // Tự động đồng bộ lên Google Drive (DB: HSK4_Class_Data.json)
  if (typeof DriveService !== "undefined" && DriveService.saveCloudDataDebounced) {
    DriveService.saveCloudDataDebounced(data);
  }
}

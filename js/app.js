/**
 * HSK4 CLASS MANAGER - Ứng Dụng Quản Lý Nhóm Học Tiếng Trung (1 GV + 4 HV)
 * Tích hợp cơ chế định danh đơn giản, gắn danh tính mọi tương tác (Báo bận, nộp bài, hỏi đáp, chấm bài).
 */

// Trạng thái ứng dụng hiện tại
let AppState = {
  data: null,
  activeUserId: "teacher", // 'teacher' hoặc 'student_1', 'student_2', 'student_3', 'student_4'
  currentTab: "students", // 'students' | 'schedule' | 'materials' | 'homework' | 'qa' | 'activity' | 'drive'
  scheduleFilter: "all", // 'all' | 'upcoming' | 'reschedule' | 'completed'
  materialsSearchQuery: "", // Từ khóa tìm kiếm tài liệu
  materialsFilter: "all", // 'all' | 'textbook' | 'pdf' | 'audio' | 'exam'
  expandedAssignments: {}, // Lưu trạng thái thu gọn / mở rộng của từng bài tập
  currentEditingLessonId: null,
  currentVotingLessonId: null,
  currentGrading: { assignmentId: null, studentId: null },
  currentSubmittingAssignmentId: null
};

// Khởi chạy ứng dụng khi DOM tải xong
document.addEventListener("DOMContentLoaded", () => {
  initApp();
});

function initApp() {
  // 1. Tải dữ liệu từ LocalStorage
  AppState.data = getAppData();

  // 2. Tải danh tính người dùng đã chọn
  const savedIdentity = localStorage.getItem("HSK4_CONFIRMED_USER");
  if (savedIdentity && AppState.data.users.some(u => u.id === savedIdentity)) {
    AppState.activeUserId = savedIdentity;
  } else {
    // Nếu là lần đầu mở web app, tự động bật popup để người dùng chọn danh tính
    setTimeout(() => {
      openIdentitySelectModal(true);
    }, 400);
  }

  // 3. Render giao diện
  renderHeaderUserSelector();
  renderNavigation();
  renderCurrentTab();

  // 4. Khởi tạo biểu tượng Lucide icons
  refreshIcons();

  // 5. Tự động đồng bộ dữ liệu đám mây từ Google Drive khi khởi động
  syncCloudDataOnStartup();

  console.log("HSK4 Class Manager với định danh thông minh & Cloud Sync đã khởi chạy!");
}

function refreshIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Thông báo Toast nhỏ góc màn hình
function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  const bgClass = type === "success" ? "bg-emerald-600 text-white" :
    type === "error" ? "bg-red-600 text-white" :
      "bg-amber-600 text-white";
  const iconName = type === "success" ? "check-circle" : type === "error" ? "alert-circle" : "info";

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl shadow-xl text-xs font-semibold ${bgClass} transform transition-all duration-300 translate-y-4 opacity-0 z-50`;
  toast.innerHTML = `
    <i data-lucide="${iconName}" class="w-4 h-4 flex-shrink-0"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  refreshIcons();

  requestAnimationFrame(() => {
    toast.classList.remove("translate-y-4", "opacity-0");
  });

  setTimeout(() => {
    toast.classList.add("translate-y-4", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// Hàm ghi lại hoạt động vào Nhật ký lớp học
function logActivity(type, action, details) {
  const activeUser = getActiveUser();
  const newLog = {
    id: "act_" + Date.now(),
    type: type, // 'reschedule' | 'submission' | 'grading' | 'question' | 'vote'
    userId: activeUser.id,
    userName: activeUser.name,
    userAvatar: activeUser.avatar,
    userBadge: activeUser.role === "teacher" ? "Giáo viên" : `Học viên #${activeUser.orderNumber}`,
    action: action,
    details: details,
    timestamp: new Date().toLocaleString("vi-VN")
  };

  if (!AppState.data.activityLogs) AppState.data.activityLogs = [];
  AppState.data.activityLogs.unshift(newLog);
  saveAppData(AppState.data);
}

// Lấy thông tin user hiện tại
function getActiveUser() {
  return AppState.data.users.find(u => u.id === AppState.activeUserId) || AppState.data.users[0];
}

// ==========================================
// 1. CƠ CHẾ ĐỊNH DANH ĐƠN GIẢN (IDENTITY SYSTEM)
// ==========================================

// Mở modal chọn danh tính "Bạn là ai trong nhóm?"
function openIdentitySelectModal(isFirstTime = false) {
  const modalContainer = document.getElementById("modal-container");
  const users = AppState.data.users;
  const teacher = users.find(u => u.role === "teacher");
  const students = users.filter(u => u.role === "student").sort((a, b) => a.orderNumber - b.orderNumber);

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl modal-enter space-y-5">
        
        <div class="text-center space-y-2 pb-2 border-b border-slate-100">
          <div class="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-600 to-amber-600 text-white font-hanzi font-bold text-xl flex items-center justify-center mx-auto shadow-md">
            学
          </div>
          <h3 class="text-xl font-black text-slate-900">
            ${isFirstTime ? 'Chào Mừng Đến Lớp Tiếng Trung HSK 4!' : 'Chuyển Đổi Danh Tính Người Dùng'}
          </h3>
          <p class="text-xs text-slate-500 max-w-md mx-auto">
            Vui lòng chọn <strong>danh tính của bạn</strong> để khi bạn <strong>báo bận, nộp bài, hỏi cô giáo</strong> hoặc <strong>chữa bài</strong>, hệ thống sẽ tự động gắn rõ tên bạn!
          </p>
        </div>

        <!-- Khối chọn Cô giáo -->
        <div>
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dành cho Giáo viên:</div>
          <button onclick="confirmUserIdentity('${teacher.id}')" 
            class="w-full text-left p-3.5 rounded-2xl border-2 transition-all flex items-center justify-between ${AppState.activeUserId === teacher.id ?
      'border-rose-500 bg-rose-50/70 ring-2 ring-rose-200' :
      'border-slate-200 hover:border-rose-300 hover:bg-slate-50'
    }">
            <div class="flex items-center gap-3.5">
              <img src="${teacher.avatar}" alt="${teacher.name}" class="w-12 h-12 rounded-xl object-cover ring-2 ring-rose-500">
              <div>
                <div class="flex items-center gap-2">
                  <span class="font-extrabold text-slate-900 text-sm">${teacher.name}</span>
                  <span class="seal-badge px-2 py-0.5 text-[10px]">Giáo viên</span>
                </div>
                <div class="text-xs text-slate-500 font-hanzi mt-0.5">${teacher.chineseName} (${teacher.pinyin})</div>
              </div>
            </div>
            <span class="px-3 py-1.5 bg-rose-600 text-white font-bold text-xs rounded-xl shadow-sm">
              Tôi là Cô Giáo
            </span>
          </button>
        </div>

        <!-- Khối chọn 4 Học viên -->
        <div>
          <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">Dành cho 4 Học viên:</div>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            ${students.map(s => `
              <button onclick="confirmUserIdentity('${s.id}')" 
                class="text-left p-3 rounded-2xl border-2 transition-all flex items-center justify-between ${AppState.activeUserId === s.id ?
        'border-emerald-500 bg-emerald-50/70 ring-2 ring-emerald-200' :
        'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
      }">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="relative flex-shrink-0">
                    <img src="${s.avatar}" alt="${s.name}" class="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200">
                    <span class="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 text-white font-bold text-[9px] flex items-center justify-center">
                      ${s.orderNumber}
                    </span>
                  </div>
                  <div class="min-w-0">
                    <div class="font-bold text-slate-900 text-xs truncate">${s.name}</div>
                    <div class="text-[11px] text-slate-400 font-hanzi truncate">${s.chineseName}</div>
                  </div>
                </div>
                <span class="flex-shrink-0 px-2 py-1 bg-slate-900 text-white text-[10px] font-bold rounded-lg ml-2">
                  Tôi là #${s.orderNumber}
                </span>
              </button>
            `).join("")}
          </div>
        </div>

        ${!isFirstTime ? `
          <div class="pt-2 text-center">
            <button onclick="closeModal()" class="text-xs text-slate-400 hover:text-slate-600 font-bold">
              Đóng lại (Giữ nguyên ${getActiveUser().name})
            </button>
          </div>
        ` : ''}

      </div>
    </div>
  `;
  refreshIcons();
}

function confirmUserIdentity(userId) {
  AppState.activeUserId = userId;
  localStorage.setItem("HSK4_CONFIRMED_USER", userId);
  localStorage.setItem("HSK4_ACTIVE_USER", userId);

  closeModal();
  renderHeaderUserSelector();
  renderNavigation();
  renderCurrentTab();

  const user = getActiveUser();
  const badge = user.role === "teacher" ? "Cô giáo" : `Học viên #${user.orderNumber}`;
  showToast(`Xin chào ${user.name}! Bạn đang thao tác với danh tính: ${badge}`, "success");
}

// Thanh hiển thị danh tính ở góc Header
function renderHeaderUserSelector() {
  const container = document.getElementById("header-user-switcher");
  if (!container) return;

  const currentUser = getActiveUser();
  const isTeacher = currentUser.role === "teacher";

  container.innerHTML = `
    <div class="flex items-center gap-2.5 bg-white/90 border border-slate-200/90 rounded-2xl p-1.5 pl-3 shadow-sm hover:shadow transition-all">
      <img src="${currentUser.avatar}" alt="${currentUser.name}" class="w-9 h-9 rounded-xl object-cover ring-2 ${isTeacher ? 'ring-rose-500' : 'ring-emerald-500'}">
      <div class="text-left hidden sm:block">
        <div class="text-[11px] text-slate-500 flex items-center gap-1.5 font-medium">
          <span>Danh tính hiện tại:</span>
          <span class="inline-block px-1.5 py-0.2 rounded text-[10px] font-extrabold ${isTeacher ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}">
            ${isTeacher ? 'Cô Giáo' : `Học Viên #${currentUser.orderNumber}`}
          </span>
        </div>
        <div class="font-extrabold text-slate-800 text-xs flex items-center gap-1.5">
          <span>${currentUser.name}</span>
          <span class="text-[11px] text-slate-400 font-hanzi">(${currentUser.chineseName})</span>
        </div>
      </div>
      
      <!-- Trạng thái & Nút Đồng bộ Đám mây Drive -->
      <div id="cloud-sync-status" class="hidden sm:flex items-center">
        <span class="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
          <i data-lucide="cloud" class="w-3 h-3 text-emerald-600"></i> Cloud Drive
        </span>
      </div>
      <button onclick="manualSyncCloudData()" title="Đồng bộ dữ liệu lớp học mới nhất từ Google Drive"
        class="flex items-center gap-1 bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs font-bold py-1.5 px-2.5 rounded-xl border border-blue-200 transition">
        <i data-lucide="cloud-download" class="w-3.5 h-3.5 text-blue-600"></i>
        <span class="hidden md:inline">Đồng bộ</span>
      </button>

      <!-- Nút đổi danh tính -->
      <button onclick="openIdentitySelectModal(false)" title="Bấm để đổi người khác"
        class="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 text-xs font-bold py-1.5 px-2.5 rounded-xl transition">
        <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-slate-500"></i>
        <span class="hidden md:inline">Đổi người</span>
      </button>
    </div>
  `;
}

// ==========================================
// 2. ĐIỀU HƯỚNG TABS
// ==========================================
function renderNavigation() {
  const tabs = [
    { id: "students", label: "Học Viên", icon: "users", badge: "4 HV + 1 GV" },
    { id: "schedule", label: "Lịch Học & Báo Bận", icon: "calendar", badge: getScheduleBadge() },
    { id: "materials", label: "Kho Tài Liệu & Drive", icon: "folder-archive", badge: getMaterialsBadge() },
    { id: "homework", label: "Bài Tập & Nộp Bài", icon: "book-open", badge: getHomeworkBadge() },
    { id: "qa", label: "Hỏi Đáp Với Cô Giáo", icon: "message-circle-question", badge: getQABadge() },
    { id: "activity", label: "Nhật Ký Lớp Học", icon: "history", badge: (AppState.data.activityLogs || []).length + " tin" },
    { id: "drive", label: "Cấu Hình Drive", icon: "cloud", badge: DriveService.isRealCloudConnected() ? "Live" : "Demo" }
  ];

  const navContainer = document.getElementById("main-tabs-nav");
  if (!navContainer) return;

  navContainer.innerHTML = tabs.map(tab => {
    const isActive = AppState.currentTab === tab.id;
    const activeClasses = isActive
      ? "bg-rose-600 text-white shadow-md shadow-rose-200"
      : "bg-white/70 hover:bg-white text-slate-600 hover:text-slate-900 border border-slate-200/60";

    return `
      <button onclick="switchTab('${tab.id}')" 
        class="flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs transition-all duration-200 ${activeClasses} flex-shrink-0">
        <i data-lucide="${tab.icon}" class="w-4 h-4"></i>
        <span>${tab.label}</span>
        ${tab.badge ? `
          <span class="text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${isActive ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-600'}">
            ${tab.badge}
          </span>
        ` : ''}
      </button>
    `;
  }).join("");

  refreshIcons();
}

function getScheduleBadge() {
  const rescheduleCount = AppState.data.lessons.filter(l => l.status === "reschedule_proposed").length;
  if (rescheduleCount > 0) return `${rescheduleCount} Báo bận`;
  return `${AppState.data.lessons.length} Buổi`;
}

function getMaterialsBadge() {
  const generalCount = (AppState.data.classInfo.generalMaterials || []).length;
  const lessonsMaterialsCount = AppState.data.lessons.reduce((acc, l) => acc + (l.materials ? l.materials.length : 0), 0);
  return `${generalCount + lessonsMaterialsCount} File`;
}

function getHomeworkBadge() {
  const pendingCount = AppState.data.assignments.reduce((acc, a) => {
    return acc + a.submissions.filter(s => s.status === "submitted").length;
  }, 0);
  if (pendingCount > 0) return `${pendingCount} Chờ chấm`;
  return `${AppState.data.assignments.length} Bài`;
}

function getQABadge() {
  return (AppState.data.discussions || []).length + " Thảo luận";
}

function switchTab(tabId) {
  AppState.currentTab = tabId;
  renderNavigation();
  renderCurrentTab();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function renderCurrentTab() {
  const contentContainer = document.getElementById("tab-content-container");
  if (!contentContainer) return;

  if (AppState.currentTab === "students") {
    renderStudentsTab(contentContainer);
  } else if (AppState.currentTab === "schedule") {
    renderScheduleTab(contentContainer);
  } else if (AppState.currentTab === "materials") {
    renderMaterialsTab(contentContainer);
  } else if (AppState.currentTab === "homework") {
    renderHomeworkTab(contentContainer);
  } else if (AppState.currentTab === "qa") {
    renderQATab(contentContainer);
  } else if (AppState.currentTab === "activity") {
    renderActivityTab(contentContainer);
  } else if (AppState.currentTab === "drive") {
    renderDriveConfigTab(contentContainer);
  }

  refreshIcons();
}

// ==========================================
// 3. TAB 1: DANH SÁCH HỌC VIÊN
// ==========================================
function renderStudentsTab(container) {
  const teacher = AppState.data.users.find(u => u.role === "teacher");
  const students = AppState.data.users.filter(u => u.role === "student").sort((a, b) => a.orderNumber - b.orderNumber);

  container.innerHTML = `
    <div class="space-y-8 animate-fadeIn">
      <!-- Banner giới thiệu lớp học -->
      <div class="relative overflow-hidden bg-gradient-to-r from-rose-900 via-rose-800 to-amber-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div class="absolute -right-10 -bottom-10 opacity-10 font-hanzi text-9xl select-none pointer-events-none">
          汉语学习
        </div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-200 text-xs font-semibold">
              <span class="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              ${AppState.data.classInfo.chineseName}
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              ${AppState.data.classInfo.name}
            </h1>
            <p class="text-rose-100 text-xs sm:text-sm max-w-xl">
              Nhóm học tập tương tác cao: 1 Giáo viên hướng dẫn sát sao & 4 Học viên cùng mục tiêu bứt phá HSK 4 và HSKK Trung cấp.
            </p>
          </div>

          <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center">
            <div class="p-2">
              <div class="text-2xl font-black text-amber-300">4/4</div>
              <div class="text-xs text-rose-200 font-medium">Học viên</div>
            </div>
            <div class="p-2 border-l border-white/15">
              <div class="text-2xl font-black text-emerald-300">96%</div>
              <div class="text-xs text-rose-200 font-medium">Chuyên cần</div>
            </div>
            <div class="p-2 border-l border-white/15 col-span-2 sm:col-span-1">
              <div class="text-2xl font-black text-white">8.8</div>
              <div class="text-xs text-rose-200 font-medium">Điểm TB BTVN</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Khối Giáo viên -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div class="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="seal-badge px-3 py-1 text-xs">Giáo Viên Chủ Nhiệm</span>
            <span class="text-xs text-slate-400 font-medium">Hướng dẫn & Chấm bài</span>
          </div>
          <button onclick="openEditUserModal('${teacher.id}')" class="text-xs text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1">
            <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> Sửa thông tin
          </button>
        </div>

        <div class="flex flex-col md:flex-row items-start md:items-center gap-6">
          <div class="relative">
            <img src="${teacher.avatar}" alt="${teacher.name}" class="w-24 h-24 rounded-2xl object-cover ring-4 ring-rose-100 shadow-md">
            <span class="absolute -bottom-2 -right-2 bg-rose-600 text-white p-1 rounded-lg shadow">
              <i data-lucide="award" class="w-4 h-4"></i>
            </span>
          </div>
          <div class="flex-1 space-y-2">
            <div class="flex flex-wrap items-baseline gap-2">
              <h2 class="text-xl font-black text-slate-900">${teacher.name}</h2>
              <span class="text-base font-bold font-hanzi text-rose-700">${teacher.chineseName}</span>
              <span class="text-xs text-slate-400">(${teacher.pinyin})</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed max-w-3xl">${teacher.bio}</p>
            
            <div class="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-600">
              <span class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                <i data-lucide="phone" class="w-3.5 h-3.5 text-emerald-600"></i> ${teacher.phone}
              </span>
              <span class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                <i data-lucide="message-circle" class="w-3.5 h-3.5 text-blue-600"></i> WeChat: <strong class="text-slate-800">${teacher.wechat}</strong>
              </span>
              <span class="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1.5 rounded-lg border border-slate-100">
                <i data-lucide="mail" class="w-3.5 h-3.5 text-rose-500"></i> ${teacher.email}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Danh sách 4 học sinh -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <div>
            <h3 class="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <span>Danh Sách 4 Học Viên</span>
              <span class="bg-rose-100 text-rose-800 text-xs px-2.5 py-0.5 rounded-full font-bold">Lớp HSK4 Cấp Tốc</span>
            </h3>
            <p class="text-xs text-slate-500">Thông tin chi tiết, mục tiêu điểm số HSK và tiến độ học tập</p>
          </div>
          <button onclick="openQuickUpdateStudentModal()" 
            class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-all">
            <i data-lucide="user-plus" class="w-4 h-4"></i> Cập nhật nhanh danh sách
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
          ${students.map(student => renderStudentCard(student)).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderStudentCard(student) {
  const isMe = student.id === AppState.activeUserId;
  return `
    <div class="bg-white rounded-3xl p-5 border ${isMe ? 'border-rose-400 ring-2 ring-rose-100 shadow-md' : 'border-slate-200/80 shadow-sm'} interactive-card flex flex-col justify-between">
      <div>
        <div class="flex items-start justify-between gap-3 mb-4">
          <div class="flex items-center gap-3">
            <div class="relative">
              <img src="${student.avatar}" alt="${student.name}" class="w-14 h-14 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm">
              <span class="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow">
                #${student.orderNumber}
              </span>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h4 class="font-bold text-slate-900 text-base">${student.name}</h4>
                ${isMe ? '<span class="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Là bạn</span>' : ''}
              </div>
              <div class="flex items-center gap-2 mt-0.5">
                <span class="font-hanzi font-bold text-rose-700 text-sm">${student.chineseName}</span>
                <span class="text-xs text-slate-400">(${student.pinyin})</span>
              </div>
            </div>
          </div>

          <button onclick="openEditUserModal('${student.id}')" title="Chỉnh sửa thông tin"
            class="p-2 hover:bg-slate-100 rounded-xl text-slate-400 hover:text-slate-700 transition">
            <i data-lucide="edit-2" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="bg-rose-50/60 rounded-2xl p-3 border border-rose-100/60 mb-4">
          <div class="text-[11px] font-bold text-rose-800 uppercase tracking-wide flex items-center gap-1.5 mb-1">
            <i data-lucide="target" class="w-3.5 h-3.5 text-rose-600"></i> Mục tiêu khóa học:
          </div>
          <p class="text-xs text-slate-700 font-medium leading-relaxed">${student.target}</p>
        </div>

        <div class="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 mb-4 text-center">
          <div>
            <div class="text-xs text-slate-500 font-medium">Chuyên cần</div>
            <div class="text-sm font-black text-emerald-600 mt-0.5">${student.attendanceRate}%</div>
          </div>
          <div class="border-x border-slate-200">
            <div class="text-xs text-slate-500 font-medium">Làm BTVN</div>
            <div class="text-sm font-black text-blue-600 mt-0.5">${student.homeworkRate}%</div>
          </div>
          <div>
            <div class="text-xs text-slate-500 font-medium">Điểm TB</div>
            <div class="text-sm font-black text-rose-600 mt-0.5">${student.averageGrade}/10</div>
          </div>
        </div>

        <div class="text-xs text-slate-600 bg-amber-50/40 p-2.5 rounded-xl border border-amber-100 mb-4">
          <strong class="text-amber-800 flex items-center gap-1 mb-0.5">
            <i data-lucide="message-square" class="w-3 h-3 text-amber-600"></i> Nhận xét từ cô giáo:
          </strong>
          ${student.notes}
        </div>
      </div>

      <div class="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1" title="Số điện thoại / Zalo">
            <i data-lucide="phone" class="w-3.5 h-3.5 text-emerald-600"></i> ${student.phone}
          </span>
          <span class="flex items-center gap-1" title="WeChat ID">
            <i data-lucide="message-circle" class="w-3.5 h-3.5 text-blue-600"></i> ${student.wechat}
          </span>
        </div>
        <a href="${student.driveFolder ? `https://drive.google.com/drive/search?q=${student.driveFolder}` : '#'}" target="_blank"
          class="inline-flex items-center gap-1 text-slate-700 hover:text-blue-600 font-semibold bg-slate-100 hover:bg-blue-50 px-2 py-1 rounded-lg transition">
          <i data-lucide="folder" class="w-3.5 h-3.5 text-amber-500"></i> Folder nộp bài
        </a>
      </div>
    </div>
  `;
}

// ==========================================
// 4. TAB 2: LỊCH HỌC & BÁO BẬN (GẮN RÕ DANH TÍNH)
// ==========================================
function renderScheduleTab(container) {
  const activeUser = getActiveUser();
  const lessons = AppState.data.lessons;

  const filteredLessons = lessons.filter(lesson => {
    if (AppState.scheduleFilter === "upcoming") return lesson.status === "upcoming" || lesson.status === "reschedule_proposed";
    if (AppState.scheduleFilter === "reschedule") return lesson.status === "reschedule_proposed";
    if (AppState.scheduleFilter === "completed") return lesson.status === "completed";
    return true;
  });

  container.innerHTML = `
    <div class="space-y-6 animate-fadeIn">
      <!-- Cài đặt lịch cố định & Trạng thái -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="space-y-1">
          <div class="flex items-center gap-2">
            <span class="seal-badge px-2.5 py-0.5 text-xs">Lịch Học Cố Định</span>
            <span class="text-xs text-slate-500 font-medium">Tất cả thành viên đều có thể xem và đề xuất dời lịch</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 flex items-center gap-2">
            <i data-lucide="clock" class="w-5 h-5 text-rose-600"></i>
            <span>${AppState.data.classInfo.schedulePattern}</span>
          </h2>
          <p class="text-xs text-slate-500">
            Link phòng học mặc định: <a href="${AppState.data.classInfo.defaultMeetLink}" target="_blank" class="text-blue-600 underline font-semibold">${AppState.data.classInfo.defaultMeetLink}</a>
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button onclick="openEditSchedulePatternModal()" 
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition">
            <i data-lucide="settings" class="w-4 h-4"></i> Đổi giờ học cố định
          </button>
          <button onclick="openAddNewLessonModal()" 
            class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-200 transition">
            <i data-lucide="plus" class="w-4 h-4"></i> Thêm buổi học mới
          </button>
        </div>
      </div>

      <!-- Bộ lọc trạng thái & Thanh chỉ báo -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div class="flex flex-wrap gap-2">
          ${renderScheduleFilterButton("all", "Tất cả buổi học", lessons.length)}
          ${renderScheduleFilterButton("upcoming", "Sắp diễn ra", lessons.filter(l => l.status === "upcoming" || l.status === "reschedule_proposed").length)}
          ${renderScheduleFilterButton("reschedule", "Đang có báo bận", lessons.filter(l => l.status === "reschedule_proposed").length, "bg-amber-100 text-amber-800")}
          ${renderScheduleFilterButton("completed", "Đã hoàn thành", lessons.filter(l => l.status === "completed").length)}
        </div>
        <div class="text-xs text-slate-500 flex items-center gap-1.5">
          <i data-lucide="info" class="w-4 h-4 text-slate-400"></i>
          <span>Bạn đang thao tác với danh tính: <strong class="text-slate-800">${activeUser.name}</strong>. Khi báo bận, tên bạn sẽ được hiển thị công khai.</span>
        </div>
      </div>

      <!-- Danh sách các buổi học -->
      <div class="space-y-4">
        ${filteredLessons.length > 0 ?
      filteredLessons.map(lesson => renderLessonCard(lesson, activeUser)).join("") :
      `<div class="bg-white rounded-3xl p-12 text-center text-slate-400 border border-dashed border-slate-200">
            <i data-lucide="calendar-x" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
            <p class="font-medium text-sm">Không có buổi học nào phù hợp với bộ lọc hiện tại.</p>
          </div>`
    }
      </div>
    </div>
  `;
}

function renderScheduleFilterButton(filterId, label, count, customBadgeColor = null) {
  const isActive = AppState.scheduleFilter === filterId;
  return `
    <button onclick="setScheduleFilter('${filterId}')" 
      class="px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-2 ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'}">
      <span>${label}</span>
      <span class="px-1.5 py-0.2 rounded-full text-[10px] ${customBadgeColor ? customBadgeColor : (isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700')}">
        ${count}
      </span>
    </button>
  `;
}

function setScheduleFilter(filterId) {
  AppState.scheduleFilter = filterId;
  renderCurrentTab();
}

function renderLessonCard(lesson, activeUser) {
  const isRescheduledProposed = lesson.status === "reschedule_proposed" && lesson.reschedule;
  const isCompleted = lesson.status === "completed";

  return `
    <div class="bg-white rounded-3xl p-5 sm:p-6 border ${isRescheduledProposed ? 'border-amber-300 ring-4 ring-amber-50 shadow-md' : 'border-slate-200/80 shadow-sm'} interactive-card space-y-4">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Buổi số & Thông tin ngày giờ học -->
        <div class="flex items-start gap-4">
          <div class="w-14 h-14 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center font-bold shadow-sm ${isCompleted ? 'bg-slate-100 text-slate-600' :
      isRescheduledProposed ? 'bg-amber-500 text-white pulse-attention' :
        'bg-rose-600 text-white'
    }">
            <span class="text-[10px] uppercase tracking-wider font-semibold">Buổi</span>
            <span class="text-xl font-black">${lesson.number}</span>
          </div>

          <div class="space-y-1">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="text-base font-black text-slate-900">${lesson.title}</h3>
              ${renderLessonStatusBadge(lesson.status)}
            </div>
            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
              <span class="flex items-center gap-1.5 text-slate-700 font-semibold">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-rose-500"></i> ${lesson.dayOfWeek}, ${formatDisplayDate(lesson.date)}
              </span>
              <span class="flex items-center gap-1.5">
                <i data-lucide="clock" class="w-3.5 h-3.5 text-amber-500"></i> ${lesson.time}
              </span>
            </div>
          </div>
        </div>

        <!-- Các nút thao tác phòng học & báo bận -->
        <div class="flex flex-wrap items-center gap-2">
          <!-- Nút tham gia phòng học Google Meet nổi bật -->
          <a href="${lesson.meetLink}" target="_blank" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-200">
            <i data-lucide="video" class="w-3.5 h-3.5"></i>
            <span>Vào Google Meet</span>
          </a>

          ${!isCompleted ? `
            <button onclick="openRescheduleModal('${lesson.id}')" 
              class="px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${isRescheduledProposed ?
        'bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-200' :
        'bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200'
      }">
              <i data-lucide="alert-triangle" class="w-3.5 h-3.5"></i>
              <span>${isRescheduledProposed ? 'Xem Biểu Quyết Báo Bận' : 'Báo Bận / Đổi Ngày'}</span>
            </button>
          ` : ''}

          <button onclick="openEditLessonModal('${lesson.id}')" title="Sửa thông tin buổi học"
            class="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 hover:text-slate-900 rounded-xl transition">
            <i data-lucide="edit-3" class="w-4 h-4"></i>
          </button>
        </div>
      </div>

      <!-- Footer liên kết Google Drive & Tài liệu của buổi học -->
      <div class="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
        <div class="flex flex-wrap items-center gap-2">
          ${lesson.driveFolderUrl ? `
            <a href="${lesson.driveFolderUrl}" target="_blank" 
              class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition">
              <i data-lucide="folder" class="w-3.5 h-3.5 text-blue-600"></i>
              <span>Folder Buổi Học</span>
              <i data-lucide="external-link" class="w-3 h-3 text-blue-400"></i>
            </a>
            <a href="${lesson.materialsFolderUrl || lesson.driveFolderUrl}" target="_blank" 
              class="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-200 flex items-center gap-1.5 transition">
              <i data-lucide="file-text" class="w-3.5 h-3.5 text-indigo-600"></i>
              <span>Tài Liệu Buổi Học</span>
              <i data-lucide="external-link" class="w-3 h-3 text-indigo-400"></i>
            </a>
            <button onclick="goToLessonHomework(${lesson.number})" 
              class="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition">
              <i data-lucide="book-open" class="w-3.5 h-3.5 text-emerald-600"></i>
              <span>BTVN & Nộp Bài</span>
            </button>
          ` : `
            <button onclick="createDriveFolderForLesson('${lesson.id}')" id="btn-create-drive-${lesson.id}"
              class="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition">
              <i data-lucide="cloud-plus" class="w-3.5 h-3.5 text-rose-600"></i>
              <span>⚡ Tạo Folder Drive cho buổi này</span>
            </button>
          `}
        </div>

        <button onclick="goToMaterials('${lesson.id}')" 
          class="text-xs font-bold text-slate-600 hover:text-indigo-600 flex items-center gap-1.5 py-1 px-2.5 rounded-lg hover:bg-slate-50 transition">
          <i data-lucide="folder-archive" class="w-3.5 h-3.5 text-amber-500"></i>
          <span>Tra cứu tài liệu Buổi #${lesson.number} →</span>
        </button>
      </div>

      <!-- Khối Báo bận: Ghi rõ danh tính người báo bận và biểu quyết -->
      ${isRescheduledProposed ? renderRescheduleNotificationBox(lesson, activeUser) : ''}
    </div>
  `;
}

function renderLessonStatusBadge(status) {
  if (status === "completed") {
    return `<span class="status-pill graded"><i data-lucide="check" class="w-3 h-3"></i> Đã hoàn thành</span>`;
  }
  if (status === "reschedule_proposed") {
    return `<span class="status-pill reschedule_proposed animate-pulse"><i data-lucide="clock" class="w-3 h-3"></i> Đang đề xuất dời ngày</span>`;
  }
  if (status === "rescheduled") {
    return `<span class="status-pill submitted"><i data-lucide="calendar" class="w-3 h-3"></i> Đã dời lịch mới</span>`;
  }
  return `<span class="status-pill submitted"><i data-lucide="calendar" class="w-3 h-3"></i> Đúng lịch</span>`;
}

function renderRescheduleNotificationBox(lesson, activeUser) {
  const r = lesson.reschedule;
  const agreeCount = r.votes.filter(v => v.decision === "agree").length;
  const totalMembers = AppState.data.users.length; // 5 người

  const userVote = r.votes.find(v => v.userId === activeUser.id);

  return `
    <div class="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3.5">
      <!-- Header thông báo người báo bận có Avatar rõ ràng -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-200/80 pb-3">
        <div class="flex items-center gap-3">
          <img src="${r.proposedByAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}" 
            class="w-10 h-10 rounded-xl object-cover ring-2 ring-amber-400">
          <div>
            <div class="text-xs font-bold text-amber-950 flex items-center gap-1.5">
              <span>${r.proposedByName}</span>
              <span class="px-1.5 py-0.2 rounded bg-amber-200 text-amber-900 text-[10px] font-extrabold">${r.proposedByRole || 'Thành viên'}</span>
              <span class="text-amber-700 font-normal">vừa báo bận:</span>
            </div>
            <div class="text-xs text-amber-800 font-extrabold mt-0.5">
              Đề xuất dời sang: <span class="text-rose-700 font-black text-sm">${r.proposedDayOfWeek}, ${formatDisplayDate(r.proposedDate)} (${r.proposedTime})</span>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2">
          <span class="text-xs font-bold px-3 py-1 rounded-full bg-amber-200 text-amber-900">
            Biểu quyết: ${agreeCount}/${totalMembers} đồng ý
          </span>
        </div>
      </div>

      <div class="text-xs text-amber-900 leading-relaxed bg-white/70 p-3 rounded-xl border border-amber-200/60">
        <strong>Lý do của ${r.proposedByName}:</strong> "${r.reason}"
        <div class="text-[10px] text-amber-600 mt-1">Gửi lúc: ${r.proposedAt}</div>
      </div>

      <!-- Danh sách biểu quyết của từng thành viên -->
      <div>
        <div class="text-[11px] font-bold text-amber-900 mb-1.5">Tình trạng biểu quyết của 5 thành viên (Cô giáo + 4 Học sinh):</div>
        <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
          ${r.votes.map(v => {
    const isAgree = v.decision === "agree";
    const isPending = v.decision === "pending";
    const userObj = AppState.data.users.find(u => u.id === v.userId);
    return `
              <div class="bg-white/95 p-2 rounded-xl border border-amber-200 text-center text-xs shadow-sm">
                <div class="font-extrabold text-slate-800 truncate">${v.userName}</div>
                <div class="text-[10px] text-slate-400">${userObj ? (userObj.role === 'teacher' ? 'Cô giáo' : `#${userObj.orderNumber}`) : ''}</div>
                <div class="mt-1">
                  ${isAgree ?
        '<span class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full"><i data-lucide="check" class="w-3 h-3"></i> Đồng ý</span>' :
        isPending ?
          '<span class="inline-flex items-center gap-1 text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full"><i data-lucide="loader" class="w-3 h-3"></i> Chờ duyệt</span>' :
          '<span class="inline-flex items-center gap-1 text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full"><i data-lucide="x" class="w-3 h-3"></i> Bận</span>'
      }
                </div>
              </div>
            `;
  }).join("")}
        </div>
      </div>

      <!-- Thao tác biểu quyết gắn theo danh tính hiện tại -->
      <div class="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-amber-200/80">
        <div class="text-xs font-semibold text-amber-950 flex items-center gap-1.5">
          <span>Ý kiến của bạn (<strong>${activeUser.name}</strong>):</span>
          <span class="px-2 py-0.5 rounded-lg text-xs font-bold ${userVote && userVote.decision === 'agree' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'}">
            ${userVote ? (userVote.decision === 'agree' ? 'Đã đồng ý dời' : userVote.decision === 'decline' ? 'Bận giờ này' : 'Chưa biểu quyết') : 'Chưa xác nhận'}
          </span>
        </div>

        <div class="flex flex-wrap items-center gap-2">
          <button onclick="voteReschedule('${lesson.id}', 'agree')" 
            class="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition">
            <i data-lucide="check" class="w-3.5 h-3.5"></i> Tôi đồng ý đổi ngày này
          </button>
          <button onclick="voteReschedule('${lesson.id}', 'decline')" 
            class="px-3 py-1.5 bg-rose-100 hover:bg-rose-200 text-rose-800 rounded-xl text-xs font-bold flex items-center gap-1 transition">
            <i data-lucide="x" class="w-3.5 h-3.5"></i> Giờ này tôi cũng bận
          </button>
          <button onclick="finalizeReschedule('${lesson.id}')" 
            class="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition">
            <i data-lucide="check-check" class="w-3.5 h-3.5"></i> Chốt đổi ngày chính thức
          </button>
        </div>
      </div>
    </div>
  `;
}

function voteReschedule(lessonId, decision) {
  const activeUser = getActiveUser();
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  if (!lesson || !lesson.reschedule) return;

  let voteItem = lesson.reschedule.votes.find(v => v.userId === activeUser.id);
  if (!voteItem) {
    voteItem = { userId: activeUser.id, userName: activeUser.name };
    lesson.reschedule.votes.push(voteItem);
  }

  voteItem.decision = decision;
  voteItem.note = decision === "agree" ? "Đã đồng ý đổi" : "Giờ này bận";

  // Ghi nhật ký
  logActivity("vote", `${activeUser.name} biểu quyết dời Buổi ${lesson.number}`, `${decision === "agree" ? "Đồng ý" : "Bận"} với đề xuất dời sang ngày ${lesson.reschedule.proposedDate}`);

  saveAppData(AppState.data);
  renderCurrentTab();
  showToast(`${activeUser.name} đã ${decision === "agree" ? "ĐỒNG Ý" : "TỪ CHỐI"} dời lịch buổi ${lesson.number}!`);
}

function finalizeReschedule(lessonId) {
  const activeUser = getActiveUser();
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  if (!lesson || !lesson.reschedule) return;

  const r = lesson.reschedule;
  const oldDate = lesson.date;

  lesson.date = r.proposedDate;
  lesson.dayOfWeek = r.proposedDayOfWeek;
  lesson.time = r.proposedTime;
  lesson.status = "rescheduled";
  lesson.topicNotes += ` (Đã dời từ ngày ${oldDate} sang ${r.proposedDate} do: ${r.reason})`;

  // Ghi nhật ký
  logActivity("reschedule", `Chốt dời lịch Buổi ${lesson.number}`, `${activeUser.name} đã chốt lịch mới: ${r.proposedDayOfWeek}, ${r.proposedDate}`);

  lesson.reschedule = null;

  saveAppData(AppState.data);
  renderNavigation();
  renderCurrentTab();
  showToast(`Đã chốt cập nhật Buổi ${lesson.number} sang ngày mới: ${lesson.dayOfWeek}, ${lesson.date}!`, "success");
}

// ==========================================
// 4B. TAB RIÊNG BIỆT: KHO TÀI LIỆU & GOOGLE DRIVE
// ==========================================
function renderMaterialsTab(container) {
  const activeUser = getActiveUser();
  const isTeacher = activeUser.role === "teacher";
  const lessons = AppState.data.lessons;
  const generalMaterials = AppState.data.classInfo.generalMaterials || [];
  const parentFolderUrl = AppState.data.classInfo.googleDriveParentFolderUrl;

  const searchQuery = (AppState.materialsSearchQuery || "").toLowerCase();
  const activeCategory = AppState.materialsFilter || "all";

  // Lọc tài liệu theo từ khóa tìm kiếm
  const filteredLessons = lessons.filter(l => {
    if (!searchQuery) return true;
    const matchTitle = l.title.toLowerCase().includes(searchQuery);
    const matchNotes = (l.topicNotes || "").toLowerCase().includes(searchQuery);
    const matchFiles = (l.materials || []).some(m => m.name.toLowerCase().includes(searchQuery) || (m.description || "").toLowerCase().includes(searchQuery));
    return matchTitle || matchNotes || matchFiles;
  });

  const filteredGeneral = generalMaterials.filter(m => {
    if (activeCategory !== "all" && activeCategory !== m.category && activeCategory !== m.type) return false;
    if (!searchQuery) return true;
    return m.name.toLowerCase().includes(searchQuery);
  });

  container.innerHTML = `
    <div class="space-y-6 animate-fadeIn">
      <!-- HEADER KHO TÀI LIỆU & GOOGLE DRIVE -->
      <div class="relative overflow-hidden bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl">
        <div class="absolute -right-10 -bottom-10 opacity-10 font-hanzi text-9xl select-none pointer-events-none">
          资料库
        </div>
        <div class="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div class="space-y-2">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-amber-200 text-xs font-semibold">
              <i data-lucide="folder-archive" class="w-3.5 h-3.5 text-amber-300"></i>
              Kho Học Liệu & Google Drive Khóa Học
            </div>
            <h1 class="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Tra Cứu Tài Liệu Học Tập HSK 4
            </h1>
            <p class="text-slate-300 text-xs sm:text-sm max-w-xl leading-relaxed">
              Toàn bộ giáo trình chuẩn, slide bài giảng, file audio nghe MP3, tóm tắt ngữ pháp và video ghi hình từng buổi học đồng bộ với Google Drive.
            </p>
          </div>

          <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <a href="${parentFolderUrl}" target="_blank" 
              class="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs font-extrabold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 transition">
              <i data-lucide="folder-symlink" class="w-4 h-4"></i>
              <span>Mở Toàn Bộ Drive Của Lớp</span>
            </a>
            ${isTeacher ? `
              <button onclick="openAddGeneralMaterialModal()" 
                class="px-4 py-3 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-2xl text-xs font-bold flex items-center justify-center gap-1.5 transition">
                <i data-lucide="plus" class="w-4 h-4"></i> Thêm tài liệu mới
              </button>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- THANH TÌM KIẾM & BỘ LỌC TÀI LIỆU -->
      <div class="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <!-- Input Search -->
        <div class="relative flex-1">
          <i data-lucide="search" class="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2"></i>
          <input type="text" id="materials-search-input" value="${AppState.materialsSearchQuery || ''}" 
            oninput="handleSearchMaterials(this.value)"
            placeholder="Tìm kiếm tài liệu, giáo trình, ngữ pháp, audio bài khóa..." 
            class="w-full bg-slate-50 border border-slate-200 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none transition">
          ${AppState.materialsSearchQuery ? `
            <button onclick="clearSearchMaterials()" class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          ` : ''}
        </div>

        <!-- Bộ lọc nhanh loại tài liệu -->
        <div class="flex flex-wrap items-center gap-1.5">
          ${renderMaterialFilterBtn("all", "Tất cả")}
          ${renderMaterialFilterBtn("textbook", "Giáo trình")}
          ${renderMaterialFilterBtn("pdf", "Slide PDF")}
          ${renderMaterialFilterBtn("audio", "Audio MP3")}
          ${renderMaterialFilterBtn("exam", "Đề thi HSK")}
        </div>
      </div>

      <!-- PHẦN 1: TÀI LIỆU CHUNG TOÀN KHÓA HỌC (GIÁO TRÌNH & TỪ VỰNG) -->
      <div class="space-y-3">
        <div class="bg-gradient-to-r from-slate-50 to-indigo-50/60 p-5 rounded-3xl border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center flex-shrink-0 shadow-sm">
              <i data-lucide="folder" class="w-5 h-5 text-blue-600"></i>
            </div>
            <div>
              <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                <span>Thư Mục Tài Liệu Gốc Toàn Khóa (Google Drive)</span>
                <span class="px-2 py-0.2 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800">Google Drive</span>
              </h3>
              <p class="text-xs text-slate-500 mt-0.5">
                Nơi lưu trữ giáo trình chuẩn HSK 4, đề cương, sách bài tập và từ vựng dùng cho toàn bộ khóa học.
              </p>
            </div>
          </div>

          <div class="flex items-center gap-2 self-end sm:self-center">
            <a href="${parentFolderUrl}" target="_blank" 
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-200">
              <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
              <span>Mở Google Drive</span>
            </a>
          </div>
        </div>

        ${filteredGeneral.length > 0 ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            ${filteredGeneral.map(m => renderGeneralMaterialCard(m)).join("")}
          </div>
        ` : ''}
      </div>

      <!-- PHẦN 2: TÀI LIỆU THEO TỪNG BUỔI HỌC (KÈM LINK FOLDER TÀI LIỆU RIÊNG) -->
      <div class="space-y-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="folder-tree" class="w-4 h-4 text-indigo-600"></i>
            <span>Tài Liệu Theo Từng Buổi Học (Kèm Thư Mục Drive Tương Ứng)</span>
          </h3>
          <span class="text-xs text-slate-500 font-medium">${filteredLessons.length} Buổi học</span>
        </div>

        <div class="space-y-4">
          ${filteredLessons.map(lesson => renderLessonMaterialsCard(lesson, isTeacher)).join("")}
        </div>
      </div>
    </div>
  `;
}

function renderMaterialFilterBtn(filterId, label) {
  const isActive = (AppState.materialsFilter || "all") === filterId;
  return `
    <button onclick="setMaterialFilter('${filterId}')" 
      class="px-3 py-1.5 rounded-xl text-xs font-bold transition ${isActive ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
    }">
      ${label}
    </button>
  `;
}

function setMaterialFilter(filterId) {
  AppState.materialsFilter = filterId;
  renderCurrentTab();
}

function handleSearchMaterials(val) {
  AppState.materialsSearchQuery = val;
  renderCurrentTab();
  const input = document.getElementById("materials-search-input");
  if (input) {
    input.focus();
    input.setSelectionRange(val.length, val.length);
  }
}

function clearSearchMaterials() {
  AppState.materialsSearchQuery = "";
  renderCurrentTab();
}

function renderGeneralMaterialCard(m) {
  const isPdf = m.type === "pdf";
  const isDoc = m.type === "doc";
  const icon = isPdf ? "file-text" : isDoc ? "table" : "file-archive";
  const iconColor = isPdf ? "text-rose-600 bg-rose-50 border-rose-200" : isDoc ? "text-emerald-600 bg-emerald-50 border-emerald-200" : "text-amber-600 bg-amber-50 border-amber-200";

  return `
    <div class="bg-white p-4 rounded-3xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition interactive-card flex flex-col justify-between space-y-3">
      <div class="flex items-start gap-3">
        <div class="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 border ${iconColor}">
          <i data-lucide="${icon}" class="w-5 h-5"></i>
        </div>
        <div class="min-w-0 flex-1">
          <h4 class="font-bold text-slate-900 text-xs truncate" title="${m.name}">${m.name}</h4>
          <span class="text-[10px] text-slate-400">${m.size}</span>
        </div>
      </div>

      <div class="pt-2 border-t border-slate-100 flex items-center justify-between">
        <span class="text-[10px] font-bold uppercase tracking-wider text-slate-500">${m.category}</span>
        <a href="${m.url}" target="_blank" 
          class="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800">
          <span>Xem trên Drive</span>
          <i data-lucide="external-link" class="w-3 h-3"></i>
        </a>
      </div>
    </div>
  `;
}

function renderLessonMaterialsCard(lesson, isTeacher) {
  const materials = lesson.materials || [];
  return `
    <div id="materials-lesson-${lesson.id}" class="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4 interactive-card">
      <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-slate-100">
        <div class="flex items-start gap-3.5">
          <div class="w-11 h-11 rounded-2xl bg-indigo-600 text-white font-black text-sm flex flex-col items-center justify-center flex-shrink-0 shadow-sm">
            <span class="text-[9px] uppercase tracking-wider font-semibold">Buổi</span>
            <span class="text-base">${lesson.number}</span>
          </div>

          <div>
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="font-extrabold text-slate-900 text-sm sm:text-base">${lesson.title}</h4>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                ${lesson.dayOfWeek}, ${formatDisplayDate(lesson.date)}
              </span>
            </div>
            <p class="text-xs text-slate-600 mt-1 leading-relaxed">
              <strong class="text-slate-800">Trọng điểm kiến thức:</strong> ${lesson.topicNotes}
            </p>
          </div>
        </div>

        <div class="flex flex-wrap items-center gap-2 self-end md:self-center">
          ${(lesson.materialsFolderUrl || lesson.driveFolderUrl) ? `
            <a href="${lesson.materialsFolderUrl || lesson.driveFolderUrl}" target="_blank" 
              class="px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-indigo-200 shadow-sm">
              <i data-lucide="folder-check" class="w-4 h-4 text-indigo-600"></i>
              <span>Folder Tài Liệu Buổi ${lesson.number}</span>
              <i data-lucide="external-link" class="w-3 h-3 text-indigo-400"></i>
            </a>
          ` : `
            <button onclick="createDriveFolderForLesson('${lesson.id}')" id="btn-create-drive-${lesson.id}"
              class="px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm shadow-blue-200">
              <i data-lucide="cloud-plus" class="w-3.5 h-3.5"></i>
              <span>⚡ Tạo Folder Drive Buổi ${lesson.number}</span>
            </button>
          `}

          ${lesson.homeworkFolderUrl ? `
            <a href="${lesson.homeworkFolderUrl}" target="_blank" 
              class="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border border-blue-200">
              <i data-lucide="folder-up" class="w-3.5 h-3.5 text-blue-600"></i>
              <span>Folder Nộp Bài</span>
            </a>
          ` : ''}

          ${isTeacher ? `
            <button onclick="openAddLessonMaterialModal('${lesson.id}')" 
              class="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
              <i data-lucide="plus" class="w-3.5 h-3.5"></i> Ghim link file
            </button>
          ` : ''}
        </div>
      </div>

      <div>
        <div class="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
          <i data-lucide="files" class="w-3.5 h-3.5 text-slate-400"></i> File bài giảng ghim riêng (${materials.length} file):
        </div>

        ${materials.length > 0 ? `
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            ${materials.map(m => renderMaterialItemRow(m)).join("")}
          </div>
        ` : `
          <div class="p-4 bg-slate-50 rounded-2xl border border-dashed border-slate-200 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
            <span>Chưa có file ghim riêng cho buổi này. Bạn có thể mở Folder Drive ở trên để tải slide, audio vào đó.</span>
            ${(lesson.materialsFolderUrl || lesson.driveFolderUrl) ? `
              <a href="${lesson.materialsFolderUrl || lesson.driveFolderUrl}" target="_blank" class="text-indigo-600 font-bold hover:underline flex items-center gap-1 flex-shrink-0">
                <i data-lucide="external-link" class="w-3.5 h-3.5"></i> Mở folder tài liệu Drive
              </a>
            ` : ''}
          </div>
        `}
      </div>
    </div>
  `;
}

function renderMaterialItemRow(m) {
  const isPdf = m.type === "pdf";
  const isAudio = m.type === "audio";
  const isVideo = m.type === "video";
  const icon = isAudio ? "music" : isVideo ? "video" : isPdf ? "file-text" : "file";
  const iconColor = isAudio ? "text-emerald-600 bg-emerald-50 border-emerald-200" :
    isVideo ? "text-purple-600 bg-purple-50 border-purple-200" :
      isPdf ? "text-rose-600 bg-rose-50 border-rose-200" : "text-blue-600 bg-blue-50 border-blue-200";

  return `
    <div class="bg-slate-50/90 hover:bg-white p-3 rounded-2xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-sm transition flex items-center justify-between gap-3">
      <div class="flex items-center gap-2.5 min-w-0">
        <div class="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border ${iconColor}">
          <i data-lucide="${icon}" class="w-4 h-4"></i>
        </div>
        <div class="min-w-0">
          <div class="font-extrabold text-slate-900 text-xs truncate" title="${m.name}">${m.name}</div>
          <div class="text-[10px] text-slate-500 flex items-center gap-1.5 mt-0.5">
            <span>${m.size}</span>
            ${m.description ? `<span>• ${m.description}</span>` : ''}
          </div>
        </div>
      </div>

      <a href="${m.url}" target="_blank" 
        class="flex-shrink-0 p-1.5 bg-white hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg border border-slate-200 transition" title="Mở file trên Drive">
        <i data-lucide="external-link" class="w-3.5 h-3.5"></i>
      </a>
    </div>
  `;
}

function goToMaterials(lessonId) {
  AppState.currentTab = "materials";
  renderNavigation();
  renderCurrentTab();
  setTimeout(() => {
    const el = document.getElementById(`materials-lesson-${lessonId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      el.classList.add("ring-4", "ring-indigo-300");
      setTimeout(() => el.classList.remove("ring-4", "ring-indigo-300"), 2500);
    }
  }, 100);
}

function openAddLessonMaterialModal(lessonId) {
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl modal-enter space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="folder-plus" class="w-5 h-5 text-indigo-600"></i>
              <span>Thêm Tài Liệu: Buổi #${lesson.number}</span>
            </h3>
            <p class="text-xs text-slate-500">${lesson.title}</p>
          </div>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleAddLessonMaterial(event, '${lessonId}')" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên tài liệu</label>
            <input type="text" id="add-mat-name" placeholder="VD: Slide_Bai_${lesson.number}_Chuyen_Sau.pdf" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Loại file</label>
              <select id="add-mat-type" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="pdf">Slide PDF</option>
                <option value="audio">Audio MP3</option>
                <option value="doc">Tài liệu Word / Doc</option>
                <option value="video">Video ghi hình</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Dung lượng ước tính</label>
              <input type="text" id="add-mat-size" value="3.5 MB" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Link file trên Google Drive</label>
            <input type="url" id="add-mat-url" placeholder="https://drive.google.com/file/d/..." required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Mô tả ngắn</label>
            <input type="text" id="add-mat-desc" placeholder="VD: Slide tóm tắt công thức ngữ pháp"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200">
              Lưu tài liệu
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

function handleAddLessonMaterial(e, lessonId) {
  e.preventDefault();
  const activeUser = getActiveUser();
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  const name = document.getElementById("add-mat-name").value.trim();
  const type = document.getElementById("add-mat-type").value;
  const size = document.getElementById("add-mat-size").value.trim();
  const url = document.getElementById("add-mat-url").value.trim();
  const desc = document.getElementById("add-mat-desc").value.trim();

  if (!lesson.materials) lesson.materials = [];
  lesson.materials.push({
    id: "mat_" + Date.now(),
    name: name,
    type: type,
    size: size,
    url: url,
    description: desc
  });

  logActivity("question", `${activeUser.name} đã thêm tài liệu cho Buổi #${lesson.number}`, name);

  saveAppData(AppState.data);
  closeModal();
  renderNavigation();
  renderCurrentTab();
  showToast(`Đã thêm tài liệu mới cho Buổi #${lesson.number}!`, "success");
}

function openAddGeneralMaterialModal() {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl modal-enter space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="book-plus" class="w-5 h-5 text-indigo-600"></i>
            <span>Thêm Tài Liệu Dùng Chung Cả Khóa</span>
          </h3>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleAddGeneralMaterial(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên tài liệu / giáo trình</label>
            <input type="text" id="add-gen-name" placeholder="VD: Giao_Trinh_Luyen_Nghe_HSK4.pdf" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Phân loại</label>
              <select id="add-gen-cat" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none">
                <option value="textbook">Giáo trình chính</option>
                <option value="vocabulary">Từ vựng</option>
                <option value="exam">Đề thi & Luyện thi</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Dung lượng</label>
              <input type="text" id="add-gen-size" value="15.0 MB" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Link file trên Google Drive</label>
            <input type="url" id="add-gen-url" placeholder="https://drive.google.com/file/d/..." required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-indigo-500 outline-none">
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold shadow-md shadow-indigo-200">
              Lưu tài liệu
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

function handleAddGeneralMaterial(e) {
  e.preventDefault();
  const activeUser = getActiveUser();
  const name = document.getElementById("add-gen-name").value.trim();
  const cat = document.getElementById("add-gen-cat").value;
  const size = document.getElementById("add-gen-size").value.trim();
  const url = document.getElementById("add-gen-url").value.trim();

  if (!AppState.data.classInfo.generalMaterials) AppState.data.classInfo.generalMaterials = [];
  AppState.data.classInfo.generalMaterials.push({
    id: "mat_gen_" + Date.now(),
    name: name,
    type: "pdf",
    category: cat,
    size: size,
    url: url,
    date: new Date().toISOString().split("T")[0]
  });

  logActivity("question", `${activeUser.name} đã thêm tài liệu khóa học mới`, name);

  saveAppData(AppState.data);
  closeModal();
  renderNavigation();
  renderCurrentTab();
  showToast("Đã thêm tài liệu chung cho khóa học!", "success");
}

// ==========================================
// 5. TAB 3: BÀI TẬP VỀ NHÀ & GOOGLE DRIVE
// ==========================================
function renderHomeworkTab(container) {
  const activeUser = getActiveUser();
  const isTeacher = activeUser.role === "teacher";
  const assignments = AppState.data.assignments;
  const students = AppState.data.users.filter(u => u.role === "student");

  container.innerHTML = `
    <div class="space-y-6 animate-fadeIn">
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="seal-badge px-2.5 py-0.5 text-xs">Quản Lý Bài Tập Về Nhà</span>
            <span class="text-xs text-slate-500 font-medium">Tự động tạo folder Google Drive theo từng buổi học</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <i data-lucide="book-open" class="w-5 h-5 text-rose-600"></i>
            <span>Kho Bài Tập & Nộp Bài Trực Tuyến</span>
          </h2>
          <p class="text-xs text-slate-500">
            Học viên upload bài -> Tự động lưu vào folder Google Drive -> Cô giáo nhận xét, chấm điểm và trả bài.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-2.5">
          <button onclick="syncAllFromDrive()" 
            class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition">
            <i data-lucide="refresh-cw" class="w-4 h-4 text-blue-600"></i> Đồng bộ từ Drive
          </button>
          ${isTeacher ? `
            <button onclick="openCreateAssignmentModal()" 
              class="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-200 transition">
              <i data-lucide="plus-circle" class="w-4 h-4"></i> Giao bài tập mới (Tạo Drive Folder)
            </button>
          ` : `
            <button onclick="openSubmitHomeworkModal('${assignments[0] ? assignments[0].id : ''}', '${activeUser.id}')" 
              class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-emerald-200 transition">
              <i data-lucide="upload" class="w-4 h-4"></i> Nộp bài của ${activeUser.name}
            </button>
          `}
        </div>
      </div>

      <!-- BẢNG TỔNG HỢP MA TRẬN TIẾN ĐỘ -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm overflow-x-auto">
        <h3 class="text-sm font-extrabold text-slate-900 mb-3 flex items-center gap-2">
          <i data-lucide="layout-grid" class="w-4 h-4 text-rose-600"></i>
          <span>Ma Trận Tiến Độ Nộp Bài Của 4 Học Viên</span>
        </h3>
        ${assignments.length > 0 ? `
        <table class="w-full text-xs text-left">
          <thead>
            <tr class="border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th class="py-2.5 px-3">Buổi học</th>
              <th class="py-2.5 px-3">Hạn nộp</th>
              ${students.map(s => `
                <th class="py-2.5 px-3 text-center">
                  <div class="font-extrabold text-slate-800">${s.name}</div>
                  <div class="text-[10px] text-slate-400 font-hanzi">${s.chineseName}</div>
                </th>
              `).join("")}
              <th class="py-2.5 px-3 text-right">Folder Drive / Thao tác</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${assignments.map(a => {
    return `
                <tr class="hover:bg-slate-50/80 transition">
                  <td class="py-3 px-3 font-bold text-slate-900">
                    <span class="text-rose-600 mr-1.5">#${a.lessonNumber}</span> ${a.title}
                  </td>
                  <td class="py-3 px-3 text-slate-500 font-medium">
                    ${formatDisplayDate(a.deadline.split(" ")[0])}
                  </td>
                  ${students.map(s => {
      const sub = a.submissions.find(subItem => subItem.studentId === s.id);
      const status = sub ? sub.status : "not_submitted";
      const isGraded = status === "graded";
      const isSubmitted = status === "submitted";
      return `
                      <td class="py-3 px-3 text-center">
                        ${isGraded ?
          `<span class="inline-flex items-center gap-1 font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full text-[11px]" title="${sub.grade}">
                            <i data-lucide="check" class="w-3 h-3"></i> ${sub.grade || 'Đã chấm'}
                          </span>` :
          isSubmitted ?
            `<span class="inline-flex items-center gap-1 font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full text-[11px]">
                            <i data-lucide="clock" class="w-3 h-3"></i> Chờ chấm
                          </span>` :
            `<span class="inline-flex items-center gap-1 font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full text-[11px]">
                            <i data-lucide="alert-circle" class="w-3 h-3"></i> Chưa nộp
                          </span>`
        }
                      </td>
                    `;
    }).join("")}
                  <td class="py-3 px-3 text-right">
                    <div class="flex items-center justify-end gap-1.5">
                      <a href="${a.driveFolderUrl}" target="_blank" title="Mở thư mục trên Google Drive"
                        class="px-2.5 py-1 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-bold inline-flex items-center gap-1 border border-blue-200 transition">
                        <i data-lucide="external-link" class="w-3 h-3"></i> Drive
                      </a>
                      <button onclick="handleRecreateAssignmentDriveFolder('${a.id}')" title="Tạo lại / Đồng bộ Folder Drive cho bài này"
                        class="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition" aria-label="Đồng bộ folder">
                        <i data-lucide="refresh-cw" class="w-3.5 h-3.5"></i>
                      </button>
                      <button onclick="handleDeleteAssignment('${a.id}')" title="Xóa bài tập này"
                        class="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition" aria-label="Xóa bài tập">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              `;
  }).join("")}
          </tbody>
        </table>
        ` : `
          <div class="py-8 text-center text-slate-400">
            <i data-lucide="layout-grid" class="w-10 h-10 mx-auto mb-2 text-slate-300"></i>
            <p class="font-bold text-slate-700 text-sm mb-0.5">Chưa có bài tập về nhà nào</p>
            <p class="text-xs text-slate-400">Cô giáo có thể bấm nút "+ Giao bài tập mới" ở góc trên để giao bài đầu tiên.</p>
          </div>
        `}
      </div>

      <!-- DANH SÁCH BÀI TẬP (COLLAPSE / ACCORDION VIEW) -->
      <div class="space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1">
          <div class="flex items-center gap-2">
            <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="layers" class="w-4 h-4 text-rose-600"></i>
              <span>Danh Sách Bài Tập Về Nhà</span>
            </h3>
            <span class="text-xs text-slate-400 font-medium">(Bấm vào từng bài để xem chi tiết & nộp bài)</span>
          </div>
          <div class="flex items-center gap-2 self-end sm:self-center">
            <button onclick="expandAllAssignments()" 
              class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
              <i data-lucide="chevrons-down" class="w-3.5 h-3.5"></i> Mở rộng tất cả
            </button>
            <button onclick="collapseAllAssignments()" 
              class="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1">
              <i data-lucide="chevrons-up" class="w-3.5 h-3.5"></i> Thu gọn tất cả
            </button>
          </div>
        </div>

        <div class="space-y-3.5">
          ${assignments.length > 0 ?
      assignments.map(a => renderAssignmentDetailCard(a, activeUser, isTeacher, students)).join("") :
      `<div class="bg-white rounded-3xl p-8 sm:p-12 text-center text-slate-400 border border-dashed border-slate-200 space-y-4">
              <i data-lucide="folder-plus" class="w-12 h-12 mx-auto text-rose-400"></i>
              <div>
                <p class="font-extrabold text-slate-800 text-sm sm:text-base mb-1">Chưa có bài tập nào trong danh sách</p>
                <p class="text-xs text-slate-500 max-w-md mx-auto">
                  ${isTeacher ? 'Cô giáo có thể bấm nút "+ Giao bài tập mới" ở góc trên hoặc bấm nút bên dưới để tự động tạo bài tập từ các buổi học đã có.' : 'Cô giáo chưa giao bài tập về nhà cho lớp. Bạn hãy theo dõi thêm ở tab "Lịch Học" nhé!'}
                </p>
              </div>
              ${AppState.data.lessons.length > 0 ? `
                <div class="pt-2">
                  <button onclick="autoCreateAssignmentsFromLessons()" 
                    class="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-2xl shadow-md shadow-rose-200 transition inline-flex items-center gap-2">
                    <i data-lucide="sparkles" class="w-4 h-4"></i> Tạo nhanh BTVN từ ${AppState.data.lessons.length} Buổi học đã có
                  </button>
                </div>
              ` : ''}
            </div>`
    }
        </div>
      </div>
    </div>
  `;
}

// Hàm mở rộng / thu gọn bài tập
function toggleAssignmentCollapse(assignmentId) {
  if (!AppState.expandedAssignments) AppState.expandedAssignments = {};
  AppState.expandedAssignments[assignmentId] = !AppState.expandedAssignments[assignmentId];
  renderCurrentTab();
}

function expandAllAssignments() {
  if (!AppState.expandedAssignments) AppState.expandedAssignments = {};
  AppState.data.assignments.forEach(a => {
    AppState.expandedAssignments[a.id] = true;
  });
  renderCurrentTab();
  showToast("Đã mở rộng toàn bộ bài tập!", "info");
}

function collapseAllAssignments() {
  AppState.expandedAssignments = {};
  renderCurrentTab();
  showToast("Đã thu gọn danh sách bài tập!", "info");
}

function renderAssignmentDetailCard(assignment, activeUser, isTeacher, students) {
  const isExpanded = AppState.expandedAssignments && AppState.expandedAssignments[assignment.id];
  const totalStudents = students.length; // 4
  const submittedCount = assignment.submissions.filter(s => s.status === 'submitted' || s.status === 'graded').length;
  const gradedCount = assignment.submissions.filter(s => s.status === 'graded').length;
  const pendingGradeCount = assignment.submissions.filter(s => s.status === 'submitted').length;

  const mySub = !isTeacher ? assignment.submissions.find(s => s.studentId === activeUser.id) : null;
  const myStatus = mySub ? mySub.status : 'not_submitted';

  return `
    <div class="bg-white rounded-3xl border ${isExpanded ? 'border-rose-400 ring-2 ring-rose-50 shadow-md' : 'border-slate-200/90 shadow-sm hover:border-slate-300'} transition-all duration-200 overflow-hidden interactive-card">
      
      <!-- PHẦN OVERVIEW (COLLAPSED VIEW - BẤM VÀO ĐỂ ĐÓNG/MỞ) -->
      <div class="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 cursor-pointer hover:bg-slate-50/80 transition"
           onclick="toggleAssignmentCollapse('${assignment.id}')">
        
        <div class="flex items-start sm:items-center gap-3.5 min-w-0">
          <!-- Buổi số -->
          <div class="w-12 h-12 rounded-2xl flex-shrink-0 flex flex-col items-center justify-center font-bold shadow-sm ${submittedCount === totalStudents && pendingGradeCount === 0 ? 'bg-emerald-600 text-white' :
      pendingGradeCount > 0 ? 'bg-amber-500 text-white' : 'bg-rose-600 text-white'
    }">
            <span class="text-[9px] uppercase tracking-wider font-semibold">Buổi</span>
            <span class="text-lg font-black">${assignment.lessonNumber}</span>
          </div>

          <!-- Tiêu đề & Thông tin overview -->
          <div class="space-y-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="font-black text-slate-900 text-sm sm:text-base">${assignment.title}</h4>
              ${assignment.chineseTitle ? `<span class="text-xs font-bold font-hanzi text-rose-700">(${assignment.chineseTitle})</span>` : ''}
            </div>

            <div class="flex flex-wrap items-center gap-3 text-xs text-slate-500 font-medium">
              <span class="flex items-center gap-1 text-slate-700 font-semibold">
                <i data-lucide="calendar" class="w-3.5 h-3.5 text-rose-500"></i> Giao: ${formatDisplayDate(assignment.assignedDate)}
              </span>
              <span class="flex items-center gap-1 text-amber-600 font-bold">
                <i data-lucide="alarm-clock" class="w-3.5 h-3.5"></i> Hạn: ${assignment.deadline}
              </span>
              
              <!-- Tiến độ nộp bài của cả lớp -->
              <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-extrabold text-[11px] ${submittedCount === totalStudents ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-700'
    }">
                <i data-lucide="users" class="w-3 h-3"></i> Đã nộp: ${submittedCount}/${totalStudents} bạn
              </span>

              ${pendingGradeCount > 0 ? `
                <span class="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-extrabold text-[11px] bg-amber-100 text-amber-800 animate-pulse">
                  <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  ${pendingGradeCount} bài chờ chấm
                </span>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Trạng thái người xem & Nút Thao tác -->
        <div class="flex items-center justify-between md:justify-end gap-2.5 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 flex-shrink-0"
             onclick="event.stopPropagation()">
          
          <!-- Badge trạng thái cá nhân -->
          ${!isTeacher ? `
            <div>
              ${myStatus === 'graded' ? `
                <span class="px-2.5 py-1 rounded-xl font-black text-xs bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                  <i data-lucide="check-circle" class="w-3.5 h-3.5 text-emerald-600"></i> Điểm của bạn: ${mySub.grade}
                </span>
              ` : myStatus === 'submitted' ? `
                <span class="px-2.5 py-1 rounded-xl font-bold text-xs bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1">
                  <i data-lucide="clock" class="w-3.5 h-3.5 text-blue-600"></i> Bài của bạn: Chờ chấm
                </span>
              ` : `
                <button onclick="openSubmitHomeworkModal('${assignment.id}', '${activeUser.id}')"
                  class="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-extrabold flex items-center gap-1 transition">
                  <i data-lucide="upload" class="w-3.5 h-3.5 text-rose-600"></i> Bạn chưa nộp (Nộp ngay)
                </button>
              `}
            </div>
          ` : `
            <div class="text-[11px] font-bold text-slate-500 hidden sm:block">
              ${gradedCount === totalStudents ? 'Đã chấm đủ 4/4' : `Đã chấm ${gradedCount}/${totalStudents}`}
            </div>
          `}

          <!-- Nút Drive Folder -->
          <a href="${assignment.driveFolderUrl}" target="_blank" title="Mở thư mục trên Google Drive"
            class="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-blue-200">
            <i data-lucide="folder" class="w-3.5 h-3.5 text-blue-600"></i>
            <span class="hidden sm:inline">Drive</span>
          </a>

          <!-- Nút Tạo lại / Đồng bộ Folder Drive -->
          <button onclick="handleRecreateAssignmentDriveFolder('${assignment.id}')" title="Tạo lại hoặc đồng bộ lại Folder Google Drive cho bài này"
            class="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-amber-200">
            <i data-lucide="refresh-cw" class="w-3.5 h-3.5 text-amber-600"></i>
            <span class="hidden md:inline">Đồng bộ Folder</span>
          </button>

          <!-- Nút Xóa bài tập -->
          <button onclick="handleDeleteAssignment('${assignment.id}')" title="Xóa bài tập này khỏi hệ thống"
            class="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition flex items-center gap-1 border border-rose-200">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 text-rose-600"></i>
            <span class="hidden md:inline">Xóa</span>
          </button>

          <!-- Nút bấm toggle Expand / Collapse -->
          <button onclick="toggleAssignmentCollapse('${assignment.id}')"
            class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-extrabold flex items-center gap-1 transition shadow-sm">
            <span>${isExpanded ? 'Thu gọn' : 'Xem chi tiết'}</span>
            <i data-lucide="${isExpanded ? 'chevron-up' : 'chevron-down'}" class="w-3.5 h-3.5"></i>
          </button>
        </div>
      </div>

      <!-- PHẦN CHI TIẾT (EXPANDED FULL INFO - CHỈ HIỆN KHI BẤM XEM CHI TIẾT) -->
      ${isExpanded ? `
        <div class="p-5 sm:p-6 pt-0 border-t border-slate-100 space-y-5 animate-fadeIn">
          <!-- Đề bài & File đính kèm của cô giáo -->
          <div class="bg-slate-50/90 p-4 rounded-2xl border border-slate-100 space-y-3 mt-4">
            <div class="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <i data-lucide="file-text" class="w-4 h-4 text-rose-600"></i> Yêu cầu đề bài chi tiết:
            </div>
            <p class="text-xs text-slate-700 whitespace-pre-line leading-relaxed">${assignment.instructions}</p>

            ${assignment.referenceFiles && assignment.referenceFiles.length > 0 ? `
              <div class="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
                <span class="text-xs font-semibold text-slate-500">Tài liệu cô gửi kèm:</span>
                ${assignment.referenceFiles.map(rf => `
                  <a href="${rf.url}" target="_blank" 
                    class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 hover:text-blue-600 shadow-sm transition">
                    <i data-lucide="paperclip" class="w-3 h-3 text-slate-400"></i>
                    <span>${rf.name}</span>
                    <span class="text-[10px] text-slate-400 font-normal">(${rf.size})</span>
                  </a>
                `).join("")}
              </div>
            ` : ''}
          </div>

          <!-- Chi tiết bài làm của 4 học viên -->
          <div class="space-y-3">
            <div class="flex items-center justify-between">
              <h4 class="text-xs font-bold uppercase tracking-wider text-slate-500">
                Tình trạng bài nộp của 4 học viên:
              </h4>
              <span class="text-xs text-slate-400">Cô giáo click "Chữa bài" để nhận xét & cho điểm</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              ${students.map(student => {
      const sub = assignment.submissions.find(s => s.studentId === student.id) || {
        studentId: student.id,
        status: "not_submitted",
        files: [],
        grade: null,
        teacherFeedback: null
      };
      return renderStudentSubmissionBox(assignment.id, assignment.lessonNumber, student, sub, activeUser, isTeacher);
    }).join("")}
            </div>
          </div>

          <!-- Nút thu gọn dưới đáy -->
          <div class="pt-2 text-center border-t border-slate-100">
            <button onclick="toggleAssignmentCollapse('${assignment.id}')" 
              class="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 font-bold px-3 py-1.5 rounded-xl hover:bg-slate-100 transition">
              <i data-lucide="chevron-up" class="w-3.5 h-3.5"></i> Thu gọn bài tập Buổi #${assignment.lessonNumber}
            </button>
          </div>
        </div>
      ` : ''}

    </div>
  `;
}

function renderStudentSubmissionBox(assignmentId, lessonNumber, student, submission, activeUser, isTeacher) {
  const isMe = student.id === activeUser.id;
  const isSubmitted = submission.status === "submitted" || submission.status === "graded";
  const isGraded = submission.status === "graded";

  return `
    <div class="bg-white rounded-2xl p-4 border ${isMe ? 'border-rose-400 ring-2 ring-rose-50 shadow' : 'border-slate-200/80'} space-y-3">
      <div class="flex items-start justify-between gap-2">
        <div class="flex items-center gap-2.5">
          <img src="${student.avatar}" alt="${student.name}" class="w-9 h-9 rounded-xl object-cover ring-1 ring-slate-200">
          <div>
            <div class="font-bold text-slate-900 text-xs flex items-center gap-1.5">
              <span>${student.name}</span>
              <span class="text-[11px] text-slate-400 font-hanzi">(${student.chineseName})</span>
              ${isMe ? '<span class="bg-rose-500 text-white text-[9px] font-bold px-1.5 py-0.2 rounded-full">Bạn</span>' : ''}
            </div>
            <div class="text-[11px] text-slate-500 font-medium">
              ${isSubmitted ? `Nộp lúc: <strong>${submission.submittedAt}</strong>` : 'Chưa nộp bài'}
            </div>
          </div>
        </div>

        <div>
          ${isGraded ? `
            <span class="px-2 py-0.5 rounded-full font-black text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
              ${submission.grade}
            </span>
          ` : isSubmitted ? `
            <span class="px-2 py-0.5 rounded-full font-bold text-[11px] bg-blue-100 text-blue-800 border border-blue-200">
              Chờ chấm
            </span>
          ` : `
            <span class="px-2 py-0.5 rounded-full font-bold text-[11px] bg-rose-100 text-rose-800 border border-rose-200">
              Chưa nộp
            </span>
          `}
        </div>
      </div>

      ${submission.files && submission.files.length > 0 ? `
        <div class="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1.5">
          <div class="text-[11px] font-semibold text-slate-500 flex items-center justify-between">
            <span class="flex items-center gap-1"><i data-lucide="files" class="w-3 h-3 text-slate-400"></i> File đã tải lên Drive:</span>
            <span class="text-[10px] text-slate-400 font-mono">Đã đồng bộ</span>
          </div>
          <div class="flex flex-wrap gap-1.5">
            ${submission.files.map(f => `
              <a href="${f.url}" target="_blank" 
                class="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-blue-50 text-slate-700 hover:text-blue-700 rounded-lg text-xs font-semibold border border-slate-200 transition shadow-sm">
                <i data-lucide="${f.type === 'audio' ? 'music' : f.type === 'image' ? 'image' : 'file-text'}" class="w-3.5 h-3.5 text-blue-500"></i>
                <span class="max-w-[140px] truncate">${f.name}</span>
                <span class="text-[10px] text-slate-400">(${f.size})</span>
              </a>
            `).join("")}
          </div>
          ${submission.studentNotes ? `
            <div class="text-[11px] text-slate-700 pt-1 border-t border-slate-200/50">
              <strong>Lời nhắn của ${student.name}:</strong> "${submission.studentNotes}"
            </div>
          ` : ''}
        </div>
      ` : ''}

      ${submission.teacherFeedback ? `
        <div class="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200/80 text-xs text-slate-700 space-y-1.5">
          <div class="font-bold text-emerald-900 flex items-center justify-between text-[11px]">
            <span class="flex items-center gap-1.5">
              <i data-lucide="message-square" class="w-3.5 h-3.5 text-emerald-600"></i>
              <span>Nhận xét của Cô ${AppState.data.classInfo.teacherName || 'Giáo viên'}:</span>
            </span>
            <span class="text-[10px] text-emerald-700 font-medium">${submission.gradedAt || ''}</span>
          </div>
          <p class="leading-relaxed text-slate-800">${submission.teacherFeedback}</p>
          ${submission.teacherCorrectionFile ? `
            <div class="pt-1">
              <a href="${submission.teacherCorrectionFile}" target="_blank" class="text-xs text-emerald-700 hover:underline font-bold flex items-center gap-1">
                <i data-lucide="check-circle" class="w-3.5 h-3.5"></i> Xem bài cô sửa mực đỏ
              </a>
            </div>
          ` : ''}
        </div>
      ` : ''}

      <div class="pt-1 flex flex-wrap items-center justify-end gap-2">
        ${submission.driveFolderUrl ? `
          <a href="${submission.driveFolderUrl}" target="_blank" 
            class="px-2.5 py-1.5 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 transition">
            <i data-lucide="folder" class="w-3 h-3 text-blue-600"></i>
            <span>Folder ${isMe ? 'của bạn' : student.name}</span>
            <i data-lucide="external-link" class="w-2.5 h-2.5 text-blue-400"></i>
          </a>
        ` : ''}

        ${(isMe || isTeacher) ? `
          <button onclick="openSubmitHomeworkModal('${assignmentId}', '${student.id}')" 
            class="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition ${isSubmitted ? 'bg-slate-100 hover:bg-slate-200 text-slate-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm'
      }">
            <i data-lucide="upload" class="w-3 h-3"></i>
            <span>${isSubmitted ? 'Nộp lại / Bổ sung file' : 'Nộp bài lên Drive'}</span>
          </button>
        ` : ''}

        ${isTeacher ? `
          <button onclick="openGradingModal('${assignmentId}', '${student.id}')" 
            class="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-sm transition">
            <i data-lucide="check-square" class="w-3.5 h-3.5"></i>
            <span>${isGraded ? 'Chấm lại / Sửa nhận xét' : 'Chữa bài & Cho điểm'}</span>
          </button>
        ` : ''}
      </div>
    </div>
  `;
}

// ==========================================
// 6. TAB MỚI: 💬 HỎI ĐÁP & TRAO ĐỔI VỚI CÔ GIÁO
// ==========================================
function renderQATab(container) {
  const activeUser = getActiveUser();
  const discussions = AppState.data.discussions || [];

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <!-- Header Hỏi đáp -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="seal-badge px-2.5 py-0.5 text-xs">Diễn Đàn Học Tập</span>
            <span class="text-xs text-slate-500 font-medium">Hỏi bài cô giáo & Trao đổi bài tập</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <i data-lucide="message-circle-question" class="w-5 h-5 text-rose-600"></i>
            <span>Hỏi Đáp Trực Tiếp Với Cô Giáo</span>
          </h2>
          <p class="text-xs text-slate-500">
            Học viên đặt câu hỏi về ngữ pháp, chữ Hán, phát âm. Cô giáo giải đáp chi tiết, lưu lại kiến thức cho cả nhóm.
          </p>
        </div>

        <button onclick="openNewQuestionModal()" 
          class="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md shadow-rose-200 transition">
          <i data-lucide="plus-circle" class="w-4 h-4"></i> Đặt câu hỏi cho cô giáo
        </button>
      </div>

      <!-- Khối nhận diện người gửi câu hỏi -->
      <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 flex items-center justify-between text-xs">
        <div class="flex items-center gap-2.5">
          <img src="${activeUser.avatar}" class="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-300">
          <span>Bạn đang đặt câu hỏi / trả lời với tên: <strong class="text-slate-900">${activeUser.name}</strong> (${activeUser.role === 'teacher' ? 'Cô giáo' : 'Học viên'})</span>
        </div>
        <button onclick="openIdentitySelectModal(false)" class="text-blue-600 hover:underline font-bold">
          Đổi người ⇄
        </button>
      </div>

      <!-- Danh sách các câu hỏi & câu trả lời -->
      <div class="space-y-4">
        ${discussions.length > 0 ? discussions.map(d => renderDiscussionCard(d, activeUser)).join("") : `
          <div class="bg-white rounded-3xl p-12 text-center text-slate-400 border border-dashed border-slate-200">
            <i data-lucide="message-square" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
            <p class="text-sm font-medium">Chưa có câu hỏi nào. Hãy là người đầu tiên đặt câu hỏi cho cô giáo!</p>
          </div>
        `}
      </div>
    </div>
  `;
}

function renderDiscussionCard(disc, activeUser) {
  const isTeacher = activeUser.role === "teacher";

  return `
    <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4 interactive-card">
      <!-- Người hỏi -->
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <img src="${disc.userAvatar}" class="w-11 h-11 rounded-2xl object-cover ring-2 ring-slate-100 shadow-sm">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-extrabold text-slate-900 text-sm">${disc.userName}</span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                ${disc.userBadge || 'Học viên'}
              </span>
              <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                Buổi #${disc.lessonNumber}
              </span>
            </div>
            <div class="text-[11px] text-slate-400 mt-0.5">${disc.timestamp}</div>
          </div>
        </div>
      </div>

      <!-- Nội dung câu hỏi -->
      <div class="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-800 font-medium leading-relaxed">
        ${disc.content}
      </div>

      <!-- Danh sách câu trả lời của cô giáo / bạn bè -->
      ${disc.replies && disc.replies.length > 0 ? `
        <div class="pl-4 sm:pl-8 space-y-2.5 border-l-2 border-rose-200">
          ${disc.replies.map(rep => `
            <div class="bg-rose-50/60 p-3.5 rounded-2xl border border-rose-100 text-xs space-y-1.5">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <img src="${rep.userAvatar}" class="w-6 h-6 rounded-lg object-cover ring-1 ring-rose-400">
                  <span class="font-extrabold text-slate-900">${rep.userName}</span>
                  <span class="px-1.5 py-0.2 rounded bg-rose-200 text-rose-900 text-[10px] font-extrabold">${rep.userBadge}</span>
                </div>
                <span class="text-[10px] text-slate-400">${rep.timestamp}</span>
              </div>
              <p class="text-slate-800 leading-relaxed pl-8">${rep.content}</p>
            </div>
          `).join("")}
        </div>
      ` : ''}

      <!-- Form gửi câu trả lời nhanh -->
      <form onsubmit="handleSendReply(event, '${disc.id}')" class="flex items-center gap-2 pt-1">
        <input type="text" id="reply-input-${disc.id}" placeholder="Viết phản hồi với tư cách ${activeUser.name}..." required
          class="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
        <button type="submit" 
          class="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition">
          <i data-lucide="send" class="w-3.5 h-3.5"></i> Trả lời
        </button>
      </form>
    </div>
  `;
}

function openNewQuestionModal() {
  const activeUser = getActiveUser();
  const lessons = AppState.data.lessons;
  const modalContainer = document.getElementById("modal-container");

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl modal-enter space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="help-circle" class="w-5 h-5 text-rose-600"></i>
              <span>Đặt Câu Hỏi Cho Cô Giáo</span>
            </h3>
            <p class="text-xs text-slate-500">Người gửi: <strong>${activeUser.name}</strong> (${activeUser.role === 'teacher' ? 'Cô giáo' : 'Học viên'})</p>
          </div>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleCreateQuestion(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Thuộc buổi học nào?</label>
            <select id="qa-lesson-select" class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500 outline-none">
              ${lessons.map(l => `<option value="${l.id}">Buổi ${l.number}: ${l.title}</option>`).join("")}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Nội dung câu hỏi</label>
            <textarea id="qa-content-input" rows="4" required placeholder="Thưa cô, cho em hỏi về ngữ pháp câu chữ 把 hoặc từ mới trong bài..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200">
              Gửi câu hỏi
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

function handleCreateQuestion(e) {
  e.preventDefault();
  const activeUser = getActiveUser();
  const lessonId = document.getElementById("qa-lesson-select").value;
  const content = document.getElementById("qa-content-input").value.trim();

  const lesson = AppState.data.lessons.find(l => l.id === lessonId);

  const newDisc = {
    id: "disc_" + Date.now(),
    lessonId: lessonId,
    lessonNumber: lesson ? lesson.number : 1,
    userId: activeUser.id,
    userName: activeUser.name,
    userAvatar: activeUser.avatar,
    userRole: activeUser.role,
    userBadge: activeUser.role === "teacher" ? "Giáo viên" : `Học viên #${activeUser.orderNumber}`,
    content: content,
    timestamp: new Date().toLocaleString("vi-VN"),
    replies: []
  };

  if (!AppState.data.discussions) AppState.data.discussions = [];
  AppState.data.discussions.unshift(newDisc);

  // Ghi nhật ký
  logActivity("question", `${activeUser.name} đặt câu hỏi ở Buổi ${lesson ? lesson.number : 1}`, content);

  saveAppData(AppState.data);
  closeModal();
  renderNavigation();
  renderCurrentTab();
  showToast("Đã gửi câu hỏi lên diễn đàn lớp học!", "success");
}

function handleSendReply(e, discId) {
  e.preventDefault();
  const activeUser = getActiveUser();
  const inputEl = document.getElementById(`reply-input-${discId}`);
  if (!inputEl) return;
  const content = inputEl.value.trim();
  if (!content) return;

  const disc = AppState.data.discussions.find(d => d.id === discId);
  if (!disc) return;

  if (!disc.replies) disc.replies = [];
  disc.replies.push({
    id: "rep_" + Date.now(),
    userId: activeUser.id,
    userName: activeUser.name,
    userAvatar: activeUser.avatar,
    userRole: activeUser.role,
    userBadge: activeUser.role === "teacher" ? "Giáo viên" : `Học viên #${activeUser.orderNumber}`,
    content: content,
    timestamp: new Date().toLocaleString("vi-VN")
  });

  // Ghi nhật ký
  logActivity("question", `${activeUser.name} trả lời câu hỏi của ${disc.userName}`, content);

  saveAppData(AppState.data);
  renderCurrentTab();
  showToast("Đã gửi câu trả lời!", "success");
}

// ==========================================
// 7. TAB MỚI: ⚡ NHẬT KÝ LỚP HỌC (AI ĐANG LÀM GÌ)
// ==========================================
function renderActivityTab(container) {
  const logs = AppState.data.activityLogs || [];

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <!-- Header Nhật ký -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="seal-badge px-2.5 py-0.5 text-xs">Giám Sát Tương Tác</span>
            <span class="text-xs text-slate-500 font-medium">Toàn bộ hoạt động của Cô giáo & 4 Học viên</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <i data-lucide="history" class="w-5 h-5 text-rose-600"></i>
            <span>Dòng Thời Gian Tương Tác Lớp Học</span>
          </h2>
          <p class="text-xs text-slate-500">
            Cô giáo và các bạn học viên luôn biết rõ ai vừa báo bận, ai vừa nộp bài, ai vừa được chấm điểm và ai vừa hỏi bài.
          </p>
        </div>

        <button onclick="clearActivityLogs()" class="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-xl text-xs font-bold transition">
          Làm mới nhật ký
        </button>
      </div>

      <!-- Dòng thời gian Timeline -->
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div class="relative border-l-2 border-slate-200 pl-6 ml-4 space-y-6">
          ${logs.length > 0 ? logs.map(log => {
    const isReschedule = log.type === "reschedule";
    const isSub = log.type === "submission";
    const isGrade = log.type === "grading";
    const isVote = log.type === "vote";
    const icon = isReschedule ? "alert-triangle" : isSub ? "upload-cloud" : isGrade ? "check-circle" : isVote ? "check" : "message-square";
    const iconBg = isReschedule ? "bg-amber-500 text-white" : isSub ? "bg-blue-600 text-white" : isGrade ? "bg-emerald-600 text-white" : "bg-purple-600 text-white";

    return `
              <div class="relative">
                <span class="absolute -left-[35px] top-1 w-6 h-6 rounded-full ${iconBg} flex items-center justify-center text-[10px] shadow">
                  <i data-lucide="${icon}" class="w-3.5 h-3.5"></i>
                </span>

                <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-1.5">
                  <div class="flex flex-wrap items-center justify-between gap-2">
                    <div class="flex items-center gap-2">
                      <img src="${log.userAvatar}" class="w-6 h-6 rounded-lg object-cover ring-1 ring-slate-200">
                      <strong class="text-slate-900 text-xs">${log.userName}</strong>
                      <span class="px-1.5 py-0.2 rounded text-[10px] font-extrabold bg-slate-200 text-slate-800">${log.userBadge}</span>
                    </div>
                    <span class="text-[11px] text-slate-400 font-medium">${log.timestamp}</span>
                  </div>

                  <div class="text-xs font-extrabold text-slate-900 pt-0.5">${log.action}</div>
                  <p class="text-xs text-slate-600 leading-relaxed">${log.details}</p>
                </div>
              </div>
            `;
  }).join("") : `
            <div class="py-10 text-center text-slate-400 -ml-6">
              <i data-lucide="history" class="w-12 h-12 mx-auto mb-2 text-slate-300"></i>
              <p class="font-bold text-slate-700 text-sm mb-1">Chưa có hoạt động nào được ghi nhận</p>
              <p class="text-xs text-slate-400">Các hoạt động như giao bài, nộp bài, chấm bài, báo bận dời lịch và hỏi đáp sẽ tự động ghi lại tại đây.</p>
            </div>
          `}
        </div>
      </div>
    </div>
  `;
}

function clearActivityLogs() {
  if (confirm("Bạn có muốn làm mới dòng thời gian nhật ký lớp học?")) {
    AppState.data.activityLogs = [];
    saveAppData(AppState.data);
    renderCurrentTab();
    showToast("Đã dọn dẹp nhật ký tương tác!", "info");
  }
}

// ==========================================
// 8. TAB 6: CẤU HÌNH GOOGLE DRIVE
// ==========================================
function renderDriveConfigTab(container) {
  const scriptUrl = DriveService.getScriptUrl();
  const isConnected = DriveService.isRealCloudConnected();

  container.innerHTML = `
    <div class="max-w-4xl mx-auto space-y-6 animate-fadeIn">
      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div class="flex items-center gap-2">
            <span class="seal-badge px-2.5 py-0.5 text-xs">Google Drive Automation</span>
            <span class="text-xs text-slate-500 font-medium">100% Miễn phí & Trực tiếp vào Drive của bạn</span>
          </div>
          <h2 class="text-xl font-black text-slate-900 mt-1 flex items-center gap-2">
            <i data-lucide="cloud" class="w-5 h-5 text-blue-600"></i>
            <span>Cấu Hình Tự Động Hóa Google Drive</span>
          </h2>
          <p class="text-xs text-slate-500">
            Kết nối Web App với Google Drive qua Google Apps Script để tự động tạo thư mục và thu bài tập.
          </p>
        </div>

        <div>
          ${isConnected ? `
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span class="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              Đã kết nối Google Drive thật
            </span>
          ` : `
            <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full font-bold text-xs bg-amber-100 text-amber-800 border border-amber-200">
              <span class="w-2 h-2 rounded-full bg-amber-500"></span>
              Đang ở Chế độ Mô phỏng (Demo Mode)
            </span>
          `}
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <i data-lucide="link" class="w-4 h-4 text-rose-600"></i>
          <span>URL Ứng Dụng Web Google Apps Script</span>
        </h3>
        
        <p class="text-xs text-slate-600 leading-relaxed">
          Dán URL ứng dụng web bạn nhận được sau khi Triển khai file <code class="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">google-apps-script/Code.js</code> vào ô dưới đây.
        </p>

        <div class="flex flex-col sm:flex-row items-center gap-3">
          <input type="text" id="drive-script-url-input" value="${scriptUrl}" 
            placeholder="https://script.google.com/macros/s/AKfycb.../exec"
            class="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-800 font-mono focus:ring-2 focus:ring-rose-500 outline-none">
          
          <button onclick="saveDriveScriptUrl()" 
            class="w-full sm:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition">
            <i data-lucide="save" class="w-4 h-4"></i> Lưu cấu hình
          </button>
        </div>

        <div class="pt-2 flex flex-wrap items-center gap-2">
          <button onclick="testDriveConnection()" 
            class="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold border border-emerald-200 flex items-center gap-1.5 transition">
            <i data-lucide="activity" class="w-3.5 h-3.5 text-emerald-600"></i> Kiểm tra kết nối ngay
          </button>
          <button onclick="openScriptCodeModal()" 
            class="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-800 rounded-xl text-xs font-bold border border-blue-200 flex items-center gap-1.5 transition">
            <i data-lucide="code" class="w-3.5 h-3.5 text-blue-600"></i> Xem mã nguồn Code.js
          </button>
        </div>
      </div>

      <div class="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-4">
        <h3 class="text-sm font-extrabold text-slate-900 flex items-center gap-2">
          <i data-lucide="help-circle" class="w-4 h-4 text-amber-500"></i>
          <span>Hướng Dẫn Cài Đặt Trong 60 Giây (100% Miễn Phí)</span>
        </h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div class="w-6 h-6 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">1</div>
            <h4 class="font-extrabold text-slate-900">Mở script.google.com</h4>
            <p class="text-slate-600 leading-relaxed">
              Truy cập <a href="https://script.google.com" target="_blank" class="text-blue-600 font-bold underline">script.google.com</a> bằng tài khoản Gmail của bạn -> Bấm "Dự án mới".
            </p>
          </div>

          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div class="w-6 h-6 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">2</div>
            <h4 class="font-extrabold text-slate-900">Dán mã Code.js</h4>
            <p class="text-slate-600 leading-relaxed">
              Copy toàn bộ mã trong file <strong class="text-slate-800">google-apps-script/Code.js</strong> dán vào trình soạn thảo và nhấn Ctrl+S để lưu.
            </p>
          </div>

          <div class="bg-slate-50 p-4 rounded-2xl border border-slate-100 space-y-2">
            <div class="w-6 h-6 rounded-full bg-rose-600 text-white font-bold flex items-center justify-center text-xs">3</div>
            <h4 class="font-extrabold text-slate-900">Triển khai Web App</h4>
            <p class="text-slate-600 leading-relaxed">
              Bấm "Triển khai" -> "Ứng dụng web" -> Quyền truy cập: "Bất kỳ ai" -> Copy link dán vào ô bên trên.
            </p>
          </div>
        </div>
      </div>

      <div class="bg-slate-50 rounded-3xl p-6 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 class="text-xs font-bold uppercase tracking-wider text-slate-700">Sao lưu & Khôi phục dữ liệu</h4>
          <p class="text-xs text-slate-500">Tải về file dữ liệu JSON hoặc đặt lại về cấu hình ban đầu</p>
        </div>
        <div class="flex items-center gap-2">
          <button onclick="exportDataBackup()" 
            class="px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-bold border border-slate-200 flex items-center gap-1.5 transition">
            <i data-lucide="download" class="w-3.5 h-3.5"></i> Tải file sao lưu JSON
          </button>
          <button onclick="resetDataToDefault()" 
            class="px-3 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold border border-rose-200 flex items-center gap-1.5 transition">
            <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> Đặt lại mặc định
          </button>
        </div>
      </div>
    </div>
  `;
}

function saveDriveScriptUrl() {
  const input = document.getElementById("drive-script-url-input");
  if (!input) return;
  const val = input.value.trim();
  DriveService.setScriptUrl(val);
  renderNavigation();
  renderCurrentTab();
  showToast("Đã lưu cấu hình Google Apps Script Web App!", "success");
}

async function testDriveConnection() {
  const url = DriveService.getScriptUrl();
  if (!url) {
    showToast("Vui lòng nhập URL Google Apps Script trước khi kiểm tra!", "warning");
    return;
  }

  showToast("Đang kiểm tra kết nối tới Google Apps Script...", "info");
  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.status === "ok") {
      showToast("Kết nối Google Drive Apps Script thành công 100%! Sẵn sàng tự động tạo folder.", "success");
    } else {
      showToast("Script đã phản hồi nhưng có trạng thái: " + JSON.stringify(data), "warning");
    }
  } catch (err) {
    showToast("Lỗi kết nối. Hãy đảm bảo bạn đã chọn 'Ai có quyền truy cập: Bất kỳ ai' khi Deploy!", "error");
  }
}

// ==========================================
// 9. MODALS THAO TÁC CƠ BẢN
// ==========================================

// Sửa thông tin người dùng
function openEditUserModal(userId) {
  const user = AppState.data.users.find(u => u.id === userId);
  if (!user) return;

  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl modal-enter space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="user-check" class="w-5 h-5 text-rose-600"></i>
            <span>Cập nhật thông tin: ${user.name}</span>
          </h3>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleSaveUser(event, '${userId}')" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Họ và tên</label>
              <input type="text" id="edit-user-name" value="${user.name}" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Tên chữ Hán</label>
              <input type="text" id="edit-user-chinese" value="${user.chineseName}" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-hanzi font-bold focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Pinyin (Phiên âm)</label>
              <input type="text" id="edit-user-pinyin" value="${user.pinyin || ''}"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Số điện thoại / Zalo</label>
              <input type="text" id="edit-user-phone" value="${user.phone}" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">WeChat ID</label>
              <input type="text" id="edit-user-wechat" value="${user.wechat || ''}"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Email (chia sẻ Drive)</label>
              <input type="email" id="edit-user-email" value="${user.email}" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
          </div>

          ${user.role === 'student' ? `
            <div>
              <label class="block font-bold text-slate-700 mb-1">Mục tiêu học tập</label>
              <textarea id="edit-user-target" rows="2"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">${user.target}</textarea>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Ghi chú nhận xét của giáo viên</label>
              <textarea id="edit-user-notes" rows="2"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">${user.notes || ''}</textarea>
            </div>
          ` : `
            <div>
              <label class="block font-bold text-slate-700 mb-1">Giới thiệu giáo viên</label>
              <textarea id="edit-user-bio" rows="2"
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">${user.bio || ''}</textarea>
            </div>
          `}

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200">
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

function handleSaveUser(e, userId) {
  e.preventDefault();
  const user = AppState.data.users.find(u => u.id === userId);
  if (!user) return;

  user.name = document.getElementById("edit-user-name").value.trim();
  user.chineseName = document.getElementById("edit-user-chinese").value.trim();
  user.pinyin = document.getElementById("edit-user-pinyin").value.trim();
  user.phone = document.getElementById("edit-user-phone").value.trim();
  user.wechat = document.getElementById("edit-user-wechat").value.trim();
  user.email = document.getElementById("edit-user-email").value.trim();

  if (user.role === "student") {
    user.target = document.getElementById("edit-user-target").value.trim();
    user.notes = document.getElementById("edit-user-notes").value.trim();
  } else {
    user.bio = document.getElementById("edit-user-bio").value.trim();
  }

  saveAppData(AppState.data);
  closeModal();
  renderHeaderUserSelector();
  renderCurrentTab();
  showToast(`Đã cập nhật thông tin cho ${user.name}!`, "success");
}

// Cập nhật nhanh danh sách 4 học sinh
function openQuickUpdateStudentModal() {
  const students = AppState.data.users.filter(u => u.role === "student");
  const modalContainer = document.getElementById("modal-container");

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl modal-enter space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="users" class="w-5 h-5 text-rose-600"></i>
              <span>Cập Nhật Nhanh Danh Sách 4 Học Sinh</span>
            </h3>
            <p class="text-xs text-slate-500">Chỉnh sửa họ tên, tiếng Trung và số liên hệ của 4 học viên trong nhóm</p>
          </div>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleQuickUpdateStudents(event)" class="space-y-4 text-xs">
          ${students.map((s, idx) => `
            <div class="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-2">
              <div class="font-extrabold text-slate-800 flex items-center gap-2">
                <span class="w-5 h-5 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px]">#${s.orderNumber}</span>
                <span>Học viên số ${s.orderNumber}</span>
              </div>
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-0.5">Họ và tên</label>
                  <input type="text" id="quick-name-${s.id}" value="${s.name}" required
                    class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-semibold focus:ring-2 focus:ring-rose-500 outline-none">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-0.5">Tên tiếng Trung</label>
                  <input type="text" id="quick-cn-${s.id}" value="${s.chineseName}" required
                    class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 font-hanzi font-bold focus:ring-2 focus:ring-rose-500 outline-none">
                </div>
                <div>
                  <label class="block text-[11px] font-bold text-slate-600 mb-0.5">Số điện thoại / Zalo</label>
                  <input type="text" id="quick-phone-${s.id}" value="${s.phone}" required
                    class="w-full bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 focus:ring-2 focus:ring-rose-500 outline-none">
                </div>
              </div>
            </div>
          `).join("")}

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200">
              Lưu cả 4 học viên
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

function handleQuickUpdateStudents(e) {
  e.preventDefault();
  const students = AppState.data.users.filter(u => u.role === "student");

  students.forEach(s => {
    const nameEl = document.getElementById(`quick-name-${s.id}`);
    const cnEl = document.getElementById(`quick-cn-${s.id}`);
    const phoneEl = document.getElementById(`quick-phone-${s.id}`);
    if (nameEl) s.name = nameEl.value.trim();
    if (cnEl) s.chineseName = cnEl.value.trim();
    if (phoneEl) s.phone = phoneEl.value.trim();
  });

  saveAppData(AppState.data);
  closeModal();
  renderHeaderUserSelector();
  renderCurrentTab();
  showToast("Đã cập nhật thông tin 4 học viên thành công!", "success");
}

// Sửa thông tin buổi học
function openEditLessonModal(lessonId) {
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl modal-enter space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="calendar" class="w-5 h-5 text-rose-600"></i>
            <span>Chỉnh Sửa Buổi Học #${lesson.number}</span>
          </h3>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleSaveLesson(event, '${lessonId}')" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên chủ đề bài học</label>
            <input type="text" id="edit-lesson-title" value="${lesson.title}" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500 outline-none">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Ngày học</label>
              <input type="date" id="edit-lesson-date" value="${lesson.date}" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Giờ học</label>
              <input type="text" id="edit-lesson-time" value="${lesson.time}" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Link phòng học online (Google Meet / Zoom)</label>
            <input type="url" id="edit-lesson-meet" value="${lesson.meetLink}" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-rose-500 outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Trọng tâm kiến thức / Ngữ pháp</label>
            <textarea id="edit-lesson-notes" rows="2"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">${lesson.topicNotes}</textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
            <button type="button" onclick="deleteLesson('${lessonId}')" class="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl font-bold flex items-center gap-1.5 transition">
              <i data-lucide="trash-2" class="w-4 h-4 text-rose-600"></i> Xóa buổi này
            </button>
            <div class="flex items-center gap-2">
              <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
              <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200">
                Lưu buổi học
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

function deleteLesson(lessonId) {
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  if (!lesson) return;
  if (confirm(`Bạn có chắc chắn muốn xóa Buổi #${lesson.number} ("${lesson.title}") không?`)) {
    AppState.data.lessons = AppState.data.lessons.filter(l => l.id !== lessonId);
    // Đánh lại số thứ tự buổi học
    AppState.data.lessons.forEach((l, idx) => {
      l.number = idx + 1;
    });
    logActivity("reschedule", `Đã xóa Buổi học #${lesson.number}`, lesson.title);
    saveAppData(AppState.data);
    closeModal();
    renderNavigation();
    renderCurrentTab();
    showToast(`Đã xóa Buổi học thành công!`, "info");
  }
}

function handleSaveLesson(e, lessonId) {
  e.preventDefault();
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  lesson.title = document.getElementById("edit-lesson-title").value.trim();
  lesson.date = document.getElementById("edit-lesson-date").value;
  lesson.time = document.getElementById("edit-lesson-time").value.trim();
  lesson.meetLink = document.getElementById("edit-lesson-meet").value.trim();
  lesson.topicNotes = document.getElementById("edit-lesson-notes").value.trim();

  const d = new Date(lesson.date + "T00:00:00");
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  lesson.dayOfWeek = days[d.getDay()];

  saveAppData(AppState.data);
  closeModal();
  renderCurrentTab();
  showToast(`Đã lưu thông tin Buổi ${lesson.number}!`, "success");
}

// Thêm buổi học mới
function openAddNewLessonModal() {
  const nextNum = AppState.data.lessons.length + 1;
  const modalContainer = document.getElementById("modal-container");

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl modal-enter space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="plus-circle" class="w-5 h-5 text-rose-600"></i>
            <span>Thêm Buổi Học Số #${nextNum}</span>
          </h3>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleAddNewLesson(event, ${nextNum})" class="space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Tên chủ đề bài học</label>
            <input type="text" id="add-lesson-title" placeholder="VD: Bài ${nextNum}: Luyện đề thi phần Nghe" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500 outline-none">
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Ngày học</label>
              <input type="date" id="add-lesson-date" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Giờ học</label>
              <input type="text" id="add-lesson-time" value="17:00 - 18:30" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Link phòng học online</label>
            <input type="url" id="add-lesson-meet" value="${AppState.data.classInfo.defaultMeetLink}" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono text-xs focus:ring-2 focus:ring-rose-500 outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Ghi chú trọng điểm</label>
            <textarea id="add-lesson-notes" rows="2" placeholder="Nội dung cần chuẩn bị trước buổi học..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"></textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200">
              Thêm buổi học
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

async function handleAddNewLesson(e, number) {
  e.preventDefault();
  const submitBtn = e.target.querySelector("button[type='submit']");
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.innerHTML = `<span class="inline-block animate-spin mr-1">⏳</span> Đang tạo folder trên Drive...`;
  }

  const activeUser = getActiveUser();
  const title = document.getElementById("add-lesson-title").value.trim();
  const date = document.getElementById("add-lesson-date").value;
  const time = document.getElementById("add-lesson-time").value.trim();
  const meet = document.getElementById("add-lesson-meet").value.trim();
  const notes = document.getElementById("add-lesson-notes").value.trim();

  const d = new Date(date + "T00:00:00");
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];

  const students = AppState.data.users.filter(u => u.role === "student");
  let folderInfo = {
    folderUrl: null,
    materialsFolderUrl: null,
    homeworkFolderUrl: null,
    studentFolders: []
  };

  showToast(`Đang kết nối Google Drive để tự động tạo cấu trúc Folder Buổi ${number}...`, "info");
  try {
    const driveRes = await DriveService.createLessonFolder({ number, title, date }, students);
    if (driveRes && driveRes.success) {
      folderInfo.folderUrl = driveRes.folderUrl;
      folderInfo.materialsFolderUrl = driveRes.materialsFolderUrl || driveRes.folderUrl;
      folderInfo.homeworkFolderUrl = driveRes.homeworkFolderUrl || driveRes.folderUrl;
      folderInfo.studentFolders = driveRes.studentFolders || [];
      showToast(`Đã tự động tạo xong Folder Buổi ${number} và các thư mục nộp bài trên Google Drive!`, "success");
    }
  } catch (err) {
    console.warn("Lỗi khi tạo folder Drive:", err);
  }

  const newLesson = {
    id: "lesson_" + Date.now(),
    number: number,
    title: title,
    date: date,
    dayOfWeek: days[d.getDay()],
    time: time,
    status: "upcoming",
    meetLink: meet,
    topicNotes: notes,
    driveFolderUrl: folderInfo.folderUrl,
    materialsFolderUrl: folderInfo.materialsFolderUrl,
    homeworkFolderUrl: folderInfo.homeworkFolderUrl,
    studentFolders: folderInfo.studentFolders,
    reschedule: null,
    materials: []
  };

  AppState.data.lessons.push(newLesson);

  // TỰ ĐỘNG TẠO BÀI TẬP VỀ NHÀ TƯƠNG ỨNG CHO BUỔI HỌC NÀY
  const newAssignment = {
    id: "assign_" + Date.now(),
    lessonId: newLesson.id,
    lessonNumber: number,
    title: `BTVN Buổi ${number}: ${title}`,
    assignedDate: date || new Date().toISOString().split("T")[0],
    deadline: date ? `${date} 23:59` : "Hạn nộp buổi học",
    instructions: notes ? `Trọng tâm buổi học: ${notes}\n\nYêu cầu: Làm bài tập và nộp file ghi âm/hình ảnh vào thư mục cá nhân trên Google Drive.` : `Bài tập về nhà Buổi ${number}: Làm bài tập và nộp file ghi âm/hình ảnh vào thư mục cá nhân trên Google Drive trước buổi học tiếp theo.`,
    referenceFiles: [],
    driveFolderUrl: folderInfo.homeworkFolderUrl || folderInfo.folderUrl || AppState.data.classInfo.googleDriveParentFolderUrl,
    submissions: students.map(s => {
      const sf = (folderInfo.studentFolders || []).find(item => item.studentId === s.id);
      return {
        studentId: s.id,
        driveFolderUrl: sf ? sf.folderUrl : (folderInfo.homeworkFolderUrl || folderInfo.folderUrl || AppState.data.classInfo.googleDriveParentFolderUrl),
        driveFolderId: sf ? sf.folderId : null,
        status: "not_submitted",
        submittedAt: null,
        files: [],
        studentNotes: null,
        grade: null,
        teacherFeedback: null,
        teacherCorrectionFile: null,
        gradedAt: null
      };
    })
  };
  AppState.data.assignments.unshift(newAssignment);

  logActivity("reschedule", `${activeUser.name} đã thêm Buổi học #${number}`, `${title} (${date}) - Tự động tạo BTVN & Drive Folder`);
  saveAppData(AppState.data);
  closeModal();
  renderNavigation();
  renderCurrentTab();
  showToast(`Đã thêm thành công Buổi số ${number} và tự động tạo Bài tập về nhà!`, "success");
}

async function createDriveFolderForLesson(lessonId) {
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  const btn = document.getElementById(`btn-create-drive-${lesson.id}`);
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="inline-block animate-spin mr-1">⏳</span> Đang tạo folder...`;
  }

  showToast(`Đang gọi Google Drive để tạo thư mục cho Buổi #${lesson.number}...`, "info");
  const students = AppState.data.users.filter(u => u.role === "student");
  try {
    const driveRes = await DriveService.createLessonFolder(lesson, students);
    if (driveRes && driveRes.success) {
      lesson.driveFolderUrl = driveRes.folderUrl;
      lesson.materialsFolderUrl = driveRes.materialsFolderUrl || driveRes.folderUrl;
      lesson.homeworkFolderUrl = driveRes.homeworkFolderUrl || driveRes.folderUrl;
      lesson.studentFolders = driveRes.studentFolders || [];
      saveAppData(AppState.data);
      renderCurrentTab();
      showToast(`Đã tạo xong thư mục Google Drive cho Buổi #${lesson.number}!`, "success");
      return;
    }
  } catch (err) {
    console.error("Lỗi:", err);
  }

  showToast("Chưa thể tạo folder. Vui lòng kiểm tra lại Web App URL trong tab Cấu hình Drive!", "error");
  if (btn) {
    btn.disabled = false;
    btn.innerHTML = `<i data-lucide="cloud-plus" class="w-3.5 h-3.5 text-rose-600"></i> Thử tạo lại`;
    refreshIcons();
  }
}

// Báo bận: Tự động gắn tên người báo bận
function openRescheduleModal(lessonId) {
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  const activeUser = getActiveUser();
  if (!lesson) return;

  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl modal-enter space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="alert-triangle" class="w-5 h-5 text-amber-500"></i>
              <span>Báo Bận & Đề Xuất Dời Lịch Buổi ${lesson.number}</span>
            </h3>
            <p class="text-xs text-slate-500">Lịch hiện tại: ${lesson.dayOfWeek}, ${formatDisplayDate(lesson.date)} (${lesson.time})</p>
          </div>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleProposeReschedule(event, '${lessonId}')" class="space-y-3.5 text-xs">
          <div class="bg-amber-50 p-3.5 rounded-2xl border border-amber-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <img src="${activeUser.avatar}" class="w-9 h-9 rounded-xl object-cover ring-2 ring-amber-400">
              <div>
                <div class="text-[11px] text-amber-800">Người đang gửi báo bận:</div>
                <div class="font-extrabold text-slate-900">${activeUser.name} (${activeUser.role === 'teacher' ? 'Cô giáo' : `Học viên #${activeUser.orderNumber}`})</div>
              </div>
            </div>
            <button type="button" onclick="openIdentitySelectModal(false)" class="text-blue-600 hover:underline font-bold text-[11px]">
              Đổi người ⇄
            </button>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Lý do báo bận của bạn</label>
            <textarea id="reschedule-reason" rows="2" required placeholder="Nhập lý do chi tiết (VD: Tăng ca đột xuất, Đi công tác, Bị ốm...)"
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"></textarea>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Ngày đề xuất học bù</label>
              <input type="date" id="reschedule-date" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Giờ đề xuất</label>
              <input type="text" id="reschedule-time" value="${lesson.time}" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold shadow-md shadow-amber-200">
              Gửi đề xuất để nhóm biểu quyết
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

function handleProposeReschedule(e, lessonId) {
  e.preventDefault();
  const activeUser = getActiveUser();
  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  if (!lesson) return;

  const reason = document.getElementById("reschedule-reason").value.trim();
  const proposedDate = document.getElementById("reschedule-date").value;
  const proposedTime = document.getElementById("reschedule-time").value.trim();

  const d = new Date(proposedDate + "T00:00:00");
  const days = ["Chủ Nhật", "Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy"];
  const proposedDayOfWeek = days[d.getDay()];

  const initialVotes = AppState.data.users.map(u => ({
    userId: u.id,
    userName: u.name,
    decision: u.id === activeUser.id ? "agree" : "pending",
    note: u.id === activeUser.id ? "Người đề xuất" : "Đang chờ biểu quyết"
  }));

  lesson.status = "reschedule_proposed";
  lesson.reschedule = {
    proposedByUserId: activeUser.id,
    proposedByName: activeUser.name,
    proposedByAvatar: activeUser.avatar,
    proposedByRole: activeUser.role === 'teacher' ? 'Cô giáo' : `Học viên #${activeUser.orderNumber}`,
    reason: reason,
    proposedDate: proposedDate,
    proposedDayOfWeek: proposedDayOfWeek,
    proposedTime: proposedTime,
    proposedAt: new Date().toLocaleString("vi-VN"),
    status: "voting",
    votes: initialVotes
  };

  // Ghi nhật ký
  logActivity("reschedule", `${activeUser.name} báo bận Buổi ${lesson.number}`, `Lý do: "${reason}". Đề xuất dời sang ${proposedDayOfWeek}, ${proposedDate} (${proposedTime})`);

  saveAppData(AppState.data);
  closeModal();
  renderNavigation();
  renderCurrentTab();
  showToast(`Đã gửi đề xuất dời Buổi ${lesson.number} từ ${activeUser.name}!`, "warning");
}

// Tạo bài tập mới
function openCreateAssignmentModal() {
  const lessons = AppState.data.lessons;
  const modalContainer = document.getElementById("modal-container");

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl modal-enter space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="plus-circle" class="w-5 h-5 text-rose-600"></i>
              <span>Giao Bài Tập Về Nhà Mới</span>
            </h3>
            <p class="text-xs text-slate-500">Hệ thống sẽ tự động tạo folder buổi học trên Google Drive</p>
          </div>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleCreateAssignment(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Thuộc buổi học</label>
            <select id="assign-lesson-id" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500 outline-none">
              ${lessons.map(l => `<option value="${l.id}">Buổi ${l.number}: ${l.title}</option>`).join("")}
            </select>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Tiêu đề bài tập</label>
            <input type="text" id="assign-title" placeholder="VD: BTVN Buổi 3: Luyện cấu trúc 只要...就... & Ghi âm" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500 outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Hạn nộp bài (Deadline)</label>
            <input type="text" id="assign-deadline" value="2026-11-15 23:59" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Mô tả đề bài chi tiết</label>
            <textarea id="assign-instructions" rows="3" required placeholder="1. Làm bài tập trang 25...\n2. Thu âm bài đọc...\n3. Nộp file ảnh/audio lên folder Drive."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none"></textarea>
          </div>

          <div class="bg-blue-50 p-3 rounded-2xl border border-blue-200 space-y-1">
            <div class="flex items-center gap-1.5 font-bold text-blue-900">
              <i data-lucide="cloud" class="w-4 h-4 text-blue-600"></i>
              <span>Tự động hóa Google Drive</span>
            </div>
            <p class="text-slate-600 text-[11px] leading-relaxed">
              Ngay khi bấm Tạo, hệ thống sẽ tự động kích hoạt tạo thư mục riêng cho buổi học này cùng 4 thư mục con cho 4 học viên trên Google Drive.
            </p>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" id="btn-submit-assign" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200 flex items-center gap-1.5">
              <i data-lucide="plus" class="w-4 h-4"></i> Tạo bài tập & Sinh Drive Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

async function handleCreateAssignment(e) {
  e.preventDefault();
  const btn = document.getElementById("btn-submit-assign");
  if (btn) btn.innerHTML = "Đang tạo folder Drive...";

  const lessonId = document.getElementById("assign-lesson-id").value;
  const title = document.getElementById("assign-title").value.trim();
  const deadline = document.getElementById("assign-deadline").value.trim();
  const instructions = document.getElementById("assign-instructions").value.trim();

  const lesson = AppState.data.lessons.find(l => l.id === lessonId);
  const students = AppState.data.users.filter(u => u.role === "student");

  let homeworkFolderUrl = lesson ? lesson.homeworkFolderUrl : null;
  let studentFolders = lesson && lesson.studentFolders ? lesson.studentFolders : [];

  // Nếu buổi học này chưa có folder Drive, tự động tạo ngay
  if (!homeworkFolderUrl || studentFolders.length === 0) {
    const driveResult = await DriveService.createLessonFolder({
      number: lesson ? lesson.number : 1,
      title: lesson ? lesson.title : title,
      date: lesson ? lesson.date : ""
    }, students);

    if (driveResult && driveResult.success) {
      if (lesson) {
        lesson.driveFolderUrl = driveResult.folderUrl;
        lesson.materialsFolderUrl = driveResult.materialsFolderUrl || driveResult.folderUrl;
        lesson.homeworkFolderUrl = driveResult.homeworkFolderUrl || driveResult.folderUrl;
        lesson.studentFolders = driveResult.studentFolders || [];
      }
      homeworkFolderUrl = driveResult.homeworkFolderUrl || driveResult.folderUrl;
      studentFolders = driveResult.studentFolders || [];
    }
  }

  const newAssignment = {
    id: "assign_" + Date.now(),
    lessonId: lessonId,
    lessonNumber: lesson ? lesson.number : 1,
    title: title,
    assignedDate: new Date().toISOString().split("T")[0],
    deadline: deadline,
    instructions: instructions,
    referenceFiles: [],
    driveFolderUrl: homeworkFolderUrl || AppState.data.classInfo.googleDriveParentFolderUrl,
    submissions: students.map(s => {
      const sf = studentFolders.find(item => item.studentId === s.id);
      return {
        studentId: s.id,
        driveFolderUrl: sf ? sf.folderUrl : (homeworkFolderUrl || AppState.data.classInfo.googleDriveParentFolderUrl),
        driveFolderId: sf ? sf.folderId : null,
        status: "not_submitted",
        submittedAt: null,
        files: [],
        studentNotes: null,
        grade: null,
        teacherFeedback: null,
        teacherCorrectionFile: null,
        gradedAt: null
      };
    })
  };

  AppState.data.assignments.unshift(newAssignment);

  // Ghi nhật ký
  logActivity("grading", `Cô giáo giao bài tập mới: Buổi ${lesson ? lesson.number : 1}`, title);

  saveAppData(AppState.data);
  closeModal();
  renderNavigation();
  renderCurrentTab();
  showToast(`Đã giao bài tập mới và tự động tạo thư mục trên Google Drive!`, "success");
}

/**
 * Xóa bài tập về nhà đã tạo
 */
function handleDeleteAssignment(assignmentId) {
  const assignment = AppState.data.assignments.find(a => a.id === assignmentId);
  if (!assignment) return;

  const confirmMsg = `Bạn có chắc chắn muốn xóa bài tập "${assignment.title}" (Buổi #${assignment.lessonNumber}) không?\n\nToàn bộ dữ liệu điểm số và bài nộp của bài tập này sẽ được gỡ bỏ khỏi hệ thống.`;
  if (!confirm(confirmMsg)) return;

  AppState.data.assignments = AppState.data.assignments.filter(a => a.id !== assignmentId);
  logActivity("grading", `Đã xóa bài tập: Buổi ${assignment.lessonNumber}`, assignment.title);
  
  saveAppData(AppState.data);
  renderNavigation();
  renderCurrentTab();
  showToast(`Đã xóa bài tập "${assignment.title}" thành công!`, "success");
}

/**
 * Tạo lại hoặc đồng bộ lại Folder Google Drive cho một bài tập đã tồn tại
 */
async function handleRecreateAssignmentDriveFolder(assignmentId) {
  const assignment = AppState.data.assignments.find(a => a.id === assignmentId);
  if (!assignment) return;

  const lesson = AppState.data.lessons.find(l => l.id === assignment.lessonId) || {
    number: assignment.lessonNumber,
    title: assignment.title,
    date: ""
  };
  const students = AppState.data.users.filter(u => u.role === "student");

  showToast(`Đang kết nối Google Drive để tạo folder cho Buổi #${assignment.lessonNumber}...`, "info");
  const driveResult = await DriveService.createLessonFolder(lesson, students);

  if (driveResult && driveResult.success && !driveResult.simulated) {
    const hwUrl = driveResult.homeworkFolderUrl || driveResult.folderUrl;
    assignment.driveFolderUrl = hwUrl;
    assignment.driveFolderId = driveResult.homeworkFolderId || driveResult.folderId;

    if (lesson && lesson.id) {
      lesson.driveFolderUrl = driveResult.folderUrl;
      lesson.materialsFolderUrl = driveResult.materialsFolderUrl || driveResult.folderUrl;
      lesson.homeworkFolderUrl = driveResult.homeworkFolderUrl || driveResult.folderUrl;
      lesson.studentFolders = driveResult.studentFolders || [];
    }

    assignment.submissions.forEach(sub => {
      const sf = (driveResult.studentFolders || []).find(s => s.studentId === sub.studentId);
      if (sf) {
        sub.driveFolderUrl = sf.folderUrl;
        sub.driveFolderId = sf.folderId;
      }
    });

    saveAppData(AppState.data);
    renderCurrentTab();
    showToast(`Đã tạo và cập nhật thành công Folder Drive cho Buổi #${assignment.lessonNumber}!`, "success");
  } else {
    showToast("Không tạo được folder trên Google Drive thật. Vui lòng kiểm tra lại Google Apps Script!", "error");
  }
}

/**
 * Tự động tạo bài tập về nhà cho các buổi học hiện có nếu chưa có bài tập
 */
function autoCreateAssignmentsFromLessons() {
  const students = AppState.data.users.filter(u => u.role === "student");
  let createdCount = 0;

  AppState.data.lessons.forEach(l => {
    const exists = AppState.data.assignments.some(a => a.lessonId === l.id || Number(a.lessonNumber) === Number(l.number));
    if (!exists) {
      const newAssign = {
        id: "assign_" + Date.now() + "_" + l.number,
        lessonId: l.id,
        lessonNumber: l.number,
        title: `BTVN Buổi ${l.number}: ${l.title}`,
        assignedDate: l.date || new Date().toISOString().split("T")[0],
        deadline: l.date ? `${l.date} 23:59` : "Hạn nộp buổi học",
        instructions: l.topicNotes ? `Trọng tâm buổi học: ${l.topicNotes}\n\nYêu cầu: Làm bài tập và nộp file ghi âm/hình ảnh vào thư mục cá nhân trên Google Drive.` : `Bài tập về nhà Buổi ${l.number}: Làm bài tập và nộp file ghi âm/hình ảnh vào thư mục cá nhân trên Google Drive trước buổi học tiếp theo.`,
        referenceFiles: [],
        driveFolderUrl: l.homeworkFolderUrl || l.driveFolderUrl || AppState.data.classInfo.googleDriveParentFolderUrl,
        submissions: students.map(s => {
          const sf = (l.studentFolders || []).find(item => item.studentId === s.id);
          return {
            studentId: s.id,
            driveFolderUrl: sf ? sf.folderUrl : (l.homeworkFolderUrl || l.driveFolderUrl || AppState.data.classInfo.googleDriveParentFolderUrl),
            driveFolderId: sf ? sf.folderId : null,
            status: "not_submitted",
            submittedAt: null,
            files: [],
            studentNotes: null,
            grade: null,
            teacherFeedback: null,
            teacherCorrectionFile: null,
            gradedAt: null
          };
        })
      };
      AppState.data.assignments.push(newAssign);
      createdCount++;
    }
  });

  if (createdCount > 0) {
    saveAppData(AppState.data);
    renderNavigation();
    renderCurrentTab();
    showToast(`Đã tạo xong ${createdCount} bài tập về nhà từ các buổi học hiện có!`, "success");
  } else {
    showToast("Tất cả các buổi học hiện có đều đã có bài tập về nhà!", "info");
  }
}

/**
 * Chuyển thẳng sang tab Bài tập và mở bài của buổi tương ứng
 */
function goToLessonHomework(lessonNumber) {
  // Tìm bài tập của buổi này
  const targetAssign = AppState.data.assignments.find(a => Number(a.lessonNumber) === Number(lessonNumber));
  if (targetAssign) {
    if (!AppState.expandedAssignments) AppState.expandedAssignments = {};
    AppState.expandedAssignments[targetAssign.id] = true;
  }
  switchTab("homework");
  showToast(`Đang mở Bài tập về nhà Buổi #${lessonNumber}`, "info");
}

// Nộp bài tập
function openSubmitHomeworkModal(assignmentId, studentId) {
  const assignment = AppState.data.assignments.find(a => a.id === assignmentId) || AppState.data.assignments[0];
  const student = AppState.data.users.find(u => u.id === studentId) || getActiveUser();
  if (!assignment || !student) return;

  const existingSub = assignment.submissions.find(s => s.studentId === student.id);
  const modalContainer = document.getElementById("modal-container");

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl modal-enter space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="upload-cloud" class="w-5 h-5 text-emerald-600"></i>
              <span>Nộp Bài: ${student.name}</span>
            </h3>
            <p class="text-xs text-slate-500">${assignment.title}</p>
          </div>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleSubmitHomework(event, '${assignment.id}', '${student.id}')" class="space-y-3.5 text-xs">
          <!-- Xác nhận danh tính người nộp -->
          <div class="bg-emerald-50 p-3 rounded-2xl border border-emerald-200 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <img src="${student.avatar}" class="w-8 h-8 rounded-lg object-cover ring-1 ring-emerald-400">
              <span class="font-bold text-emerald-950">Bài làm của học viên: ${student.name} (#${student.orderNumber || 1})</span>
            </div>
            <a href="${assignment.driveFolderUrl}" target="_blank" class="text-blue-600 hover:underline font-bold flex items-center gap-1">
              Folder Drive <i data-lucide="external-link" class="w-3 h-3"></i>
            </a>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Chọn file bài làm (Ảnh bài viết tay, Audio MP3, Word hoặc PDF)</label>
            <input type="file" id="submit-file-input" multiple
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Hoặc dán Link file Google Drive / Docs của bạn</label>
            <input type="url" id="submit-url-input" placeholder="https://drive.google.com/file/d/..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-emerald-500 outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Lời nhắn / Ghi chú gửi cô giáo</label>
            <textarea id="submit-notes-input" rows="2" placeholder="Cô xem giúp em bài tập số 2 em chưa chắc ngữ pháp lắm ạ..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none">${existingSub ? (existingSub.studentNotes || '') : ''}</textarea>
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" id="btn-submit-upload" class="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-md shadow-emerald-200 flex items-center gap-1.5">
              <i data-lucide="check" class="w-4 h-4"></i> Xác nhận nộp bài
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

async function handleSubmitHomework(e, assignmentId, studentId) {
  e.preventDefault();
  const fileInput = document.getElementById("submit-file-input");
  const urlInput = document.getElementById("submit-url-input");
  const notesInput = document.getElementById("submit-notes-input");
  const btn = document.getElementById("btn-submit-upload");

  const assignment = AppState.data.assignments.find(a => a.id === assignmentId);
  const student = AppState.data.users.find(u => u.id === studentId);
  if (!assignment || !student) return;

  let sub = assignment.submissions.find(s => s.studentId === studentId);
  if (!sub) {
    sub = { studentId: studentId, files: [] };
    assignment.submissions.push(sub);
  }

  btn.innerHTML = "Đang đồng bộ lên Google Drive...";

  if (fileInput && fileInput.files.length > 0) {
    for (let i = 0; i < fileInput.files.length; i++) {
      const file = fileInput.files[i];
      const uploadRes = await DriveService.uploadSubmissionFile({
        lessonId: assignment.lessonId,
        studentId: studentId,
        studentName: student.name,
        file: file,
        notes: notesInput.value
      });

      sub.files.push({
        name: uploadRes.fileName,
        url: uploadRes.fileUrl,
        size: uploadRes.fileSize,
        type: uploadRes.fileType
      });
    }
  } else if (urlInput && urlInput.value.trim()) {
    sub.files.push({
      name: `BaiNop_${student.name.replace(/\s+/g, '')}.link`,
      url: urlInput.value.trim(),
      size: "Google Drive",
      type: "doc"
    });
  } else if (!sub.files || sub.files.length === 0) {
    sub.files.push({
      name: `${student.name.replace(/\s+/g, '')}_BTVN_Buoi${assignment.lessonNumber}.pdf`,
      url: `https://drive.google.com/file/d/demo_${Date.now()}`,
      size: "1.6 MB",
      type: "pdf"
    });
  }

  sub.status = sub.grade ? "graded" : "submitted";
  sub.submittedAt = new Date().toLocaleString("vi-VN");
  sub.studentNotes = notesInput.value.trim();

  // Ghi nhật ký
  logActivity("submission", `${student.name} đã nộp bài tập Buổi ${assignment.lessonNumber}`, `Tải lên ${sub.files.length} file vào Google Drive. Lời nhắn: "${sub.studentNotes || 'Không có'}"`);

  saveAppData(AppState.data);
  closeModal();
  renderNavigation();
  renderCurrentTab();
  showToast(`Học viên ${student.name} đã nộp bài tập thành công lên Drive!`, "success");
}

// Chấm bài & Cho điểm
function openGradingModal(assignmentId, studentId) {
  const assignment = AppState.data.assignments.find(a => a.id === assignmentId);
  const student = AppState.data.users.find(u => u.id === studentId);
  const teacher = AppState.data.users.find(u => u.role === "teacher");
  if (!assignment || !student) return;

  const sub = assignment.submissions.find(s => s.studentId === studentId);
  const modalContainer = document.getElementById("modal-container");

  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl modal-enter space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <i data-lucide="check-square" class="w-5 h-5 text-rose-600"></i>
              <span>${teacher.name} Chữa Bài Cho: ${student.name}</span>
            </h3>
            <p class="text-xs text-slate-500">${assignment.title}</p>
          </div>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <div class="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-2 text-xs">
          <div class="font-bold text-slate-800 flex items-center justify-between">
            <span>Bài nộp của ${student.name} (${sub ? sub.submittedAt || 'Chưa nộp' : 'Chưa nộp'})</span>
            <span class="text-slate-500">Ghi chú: "${sub && sub.studentNotes ? sub.studentNotes : 'Không có ghi chú'}"</span>
          </div>

          ${sub && sub.files && sub.files.length > 0 ? `
            <div class="flex flex-wrap gap-2 pt-1">
              ${sub.files.map(f => `
                <a href="${f.url}" target="_blank" 
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl border border-slate-200 text-xs font-bold text-slate-800 hover:text-blue-600 shadow-sm transition">
                  <i data-lucide="external-link" class="w-3.5 h-3.5 text-blue-500"></i>
                  <span>${f.name}</span>
                </a>
              `).join("")}
            </div>
          ` : `
            <p class="text-rose-600 italic">Học sinh chưa upload file lên hệ thống.</p>
          `}
        </div>

        <form onsubmit="handleSaveGrading(event, '${assignmentId}', '${studentId}')" class="space-y-3.5 text-xs">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Điểm số (Thang điểm 10)</label>
              <input type="text" id="grade-score" value="${sub && sub.grade ? sub.grade : '9.0/10'}" required
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 font-black text-sm focus:ring-2 focus:ring-rose-500 outline-none">
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Trạng thái hoàn thành</label>
              <select id="grade-status" 
                class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500 outline-none">
                <option value="graded" selected>Đã chấm đạt yêu cầu</option>
                <option value="needs_revision">Cần bổ sung / sửa lại</option>
              </select>
            </div>
          </div>

          <div>
            <div class="text-[11px] font-bold text-slate-500 mb-1">Gợi ý nhận xét nhanh của cô:</div>
            <div class="flex flex-wrap gap-1.5">
              <button type="button" onclick="insertFeedbackText('Phát âm chuẩn 95%, khẩu ngữ rất tự nhiên! Chú ý biến điệu một chút.')" 
                class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] text-slate-700 font-medium">
                + Khen phát âm
              </button>
              <button type="button" onclick="insertFeedbackText('Chữ viết Hán tự rất nắn nót, đúng quy tắc bút thuận.')" 
                class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] text-slate-700 font-medium">
                + Khen chữ Hán đẹp
              </button>
              <button type="button" onclick="insertFeedbackText('Ngữ pháp câu chữ 把 dùng đúng ngữ cảnh, đoạn văn kết bài ấn tượng!')" 
                class="px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded-lg text-[11px] text-slate-700 font-medium">
                + Ngữ pháp tốt
              </button>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Lời nhận xét chi tiết của ${teacher.name}</label>
            <textarea id="grade-feedback" rows="3" required placeholder="Nhận xét cụ thể về phát âm, ngữ pháp, chữ viết..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:ring-2 focus:ring-rose-500 outline-none">${sub && sub.teacherFeedback ? sub.teacherFeedback : ''}</textarea>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Link file bài cô đã chấm sửa (Ảnh mực đỏ / Ghi âm đọc mẫu nếu có)</label>
            <input type="url" id="grade-correction-file" value="${sub && sub.teacherCorrectionFile ? sub.teacherCorrectionFile : ''}" placeholder="https://drive.google.com/..."
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-rose-500 outline-none">
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200">
              Lưu kết quả chấm bài
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

function insertFeedbackText(text) {
  const el = document.getElementById("grade-feedback");
  if (el) {
    el.value = el.value ? el.value + " " + text : text;
  }
}

function handleSaveGrading(e, assignmentId, studentId) {
  e.preventDefault();
  const score = document.getElementById("grade-score").value.trim();
  const status = document.getElementById("grade-status").value;
  const feedback = document.getElementById("grade-feedback").value.trim();
  const fixFile = document.getElementById("grade-correction-file").value.trim();

  const assignment = AppState.data.assignments.find(a => a.id === assignmentId);
  const student = AppState.data.users.find(u => u.id === studentId);
  const teacher = AppState.data.users.find(u => u.role === "teacher");
  if (!assignment || !student) return;

  let sub = assignment.submissions.find(s => s.studentId === studentId);
  if (!sub) {
    sub = { studentId: studentId, files: [] };
    assignment.submissions.push(sub);
  }

  sub.status = status;
  sub.grade = score;
  sub.teacherFeedback = feedback;
  sub.teacherCorrectionFile = fixFile || null;
  sub.gradedAt = new Date().toLocaleString("vi-VN");

  // Ghi nhật ký
  logActivity("grading", `${teacher.name} đã chấm bài cho ${student.name}`, `Điểm: ${score}. Nhận xét: "${feedback.slice(0, 80)}..."`);

  saveAppData(AppState.data);
  closeModal();
  renderNavigation();
  renderCurrentTab();
  showToast(`${teacher.name} đã lưu nhận xét & điểm (${score}) cho ${student.name}!`, "success");
}

function openEditSchedulePatternModal() {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl modal-enter space-y-4">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="settings" class="w-5 h-5 text-rose-600"></i>
            <span>Cài Đặt Lịch Học Cố Định</span>
          </h3>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <form onsubmit="handleSaveSchedulePattern(event)" class="space-y-3.5 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Mô tả lịch học cố định</label>
            <input type="text" id="pattern-text" value="${AppState.data.classInfo.schedulePattern}" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-semibold focus:ring-2 focus:ring-rose-500 outline-none">
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Link phòng học online mặc định</label>
            <input type="url" id="pattern-meet" value="${AppState.data.classInfo.defaultMeetLink}" required
              class="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 font-mono focus:ring-2 focus:ring-rose-500 outline-none">
          </div>

          <div class="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold">Hủy</button>
            <button type="submit" class="px-5 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold shadow-md shadow-rose-200">
              Lưu cài đặt
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
  refreshIcons();
}

function handleSaveSchedulePattern(e) {
  e.preventDefault();
  const text = document.getElementById("pattern-text").value.trim();
  const meet = document.getElementById("pattern-meet").value.trim();

  AppState.data.classInfo.schedulePattern = text;
  AppState.data.classInfo.defaultMeetLink = meet;

  saveAppData(AppState.data);
  closeModal();
  renderCurrentTab();
  showToast("Đã cập nhật lịch học cố định hàng tuần!", "success");
}

function openScriptCodeModal() {
  const modalContainer = document.getElementById("modal-container");
  modalContainer.innerHTML = `
    <div class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div class="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl modal-enter space-y-4 max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 class="text-base font-extrabold text-slate-900 flex items-center gap-2">
            <i data-lucide="code" class="w-5 h-5 text-blue-600"></i>
            <span>Mã Nguồn Google Apps Script Mới Nhất</span>
          </h3>
          <button onclick="closeModal()" class="p-1 rounded-xl text-slate-400 hover:text-slate-700">
            <i data-lucide="x" class="w-5 h-5"></i>
          </button>
        </div>

        <p class="text-xs text-slate-600 leading-relaxed">
          Copy toàn bộ mã này, mở <a href="https://script.google.com" target="_blank" class="text-blue-600 font-bold underline">script.google.com</a>, xóa sạch nội dung cũ trong file <code class="bg-slate-100 px-1 py-0.5 rounded text-rose-600 font-mono">Mã.gs</code>, dán vào và <strong>Triển khai -> Quản lý bản triển khai -> Sửa -> Phiên bản mới</strong>.
        </p>

        <div class="relative">
          <textarea id="script-code-copy-area" readonly class="w-full h-64 bg-slate-900 text-emerald-400 p-4 rounded-2xl text-[11px] font-mono leading-relaxed outline-none border border-slate-800 resize-none font-mono"></textarea>
        </div>

        <div class="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button onclick="copyScriptCodeToClipboard()" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-100 transition">
            <i data-lucide="copy" class="w-4 h-4"></i> Sao chép toàn bộ mã
          </button>
          <button onclick="closeModal()" class="px-5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold">
            Đóng
          </button>
        </div>
      </div>
    </div>
  `;

  // Điền nội dung code
  const codeArea = document.getElementById("script-code-copy-area");
  if (codeArea) {
    codeArea.value = `// GOOGLE APPS SCRIPT CHO WEB APP HSK4 (HỖ TRỢ CLOUD DB & AUTO FOLDER)
var FIXED_PARENT_FOLDER_ID = "18y3IbrKVibG9z9RzgQvVjz-jww54SelP";

function doGet(e) {
  try {
    var pFolder = getTargetFolder(FIXED_PARENT_FOLDER_ID);

    // 1. TẢI DỮ LIỆU LỚP HỌC (GET ?action=loadData)
    if (e && e.parameter && e.parameter.action === "loadData") {
      var files = pFolder.getFilesByName("HSK4_Class_Data.json");
      if (files.hasNext()) {
        var content = files.next().getBlob().getDataAsString();
        return ContentService.createTextOutput(JSON.stringify({
          success: true,
          data: JSON.parse(content),
          timestamp: new Date().toISOString()
        })).setMimeType(ContentService.MimeType.JSON);
      } else {
        return ContentService.createTextOutput(JSON.stringify({
          success: false,
          notFound: true,
          message: "Chưa có file dữ liệu trên Drive"
        })).setMimeType(ContentService.MimeType.JSON);
      }
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      message: "Google Apps Script Web App kết nối thành công với Google Drive!",
      parentFolderName: pFolder ? pFolder.getName() : "HSK4_Parent",
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  try {
    var req = {};
    if (e && e.postData && e.postData.contents) {
      req = JSON.parse(e.postData.contents);
    }
    var action = req.action || "";
    var parentFolder = getTargetFolder(req.parentFolderId || FIXED_PARENT_FOLDER_ID);

    // TẠO FOLDER BUỔI HỌC
    if (action === "createLessonFolder") {
      var folderName = req.folderName || ("[HSK4] Buổi " + (req.lessonNumber || "1"));
      var lessonFolder = getOrCreateSubFolder(parentFolder, folderName);
      try { lessonFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT); } catch(e){}

      var matFolder = getOrCreateSubFolder(lessonFolder, "01_Tai_Lieu_Buoi_Hoc");
      try { matFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT); } catch(e){}

      var hwFolder = getOrCreateSubFolder(lessonFolder, "02_Nop_Bai_Tap_Ve_Nha");
      try { hwFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT); } catch(e){}

      var students = req.students || [
        { id: "student_1", name: "Hà Bin", folderName: "01_Ha_Bin" },
        { id: "student_2", name: "Tien Pham", folderName: "02_Tien_Pham" },
        { id: "student_3", name: "Xuan Mai", folderName: "03_Xuan_Mai" },
        { id: "student_4", name: "Trang", folderName: "04_Trang" }
      ];

      var studentFolders = [];
      for (var i = 0; i < students.length; i++) {
        var s = students[i];
        var sFolder = getOrCreateSubFolder(hwFolder, s.folderName || s.name);
        try { sFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT); } catch(e){}
        studentFolders.push({
          studentId: s.id,
          studentName: s.name,
          folderName: s.folderName || s.name,
          folderUrl: sFolder.getUrl(),
          folderId: sFolder.getId()
        });
      }

      return ContentService.createTextOutput(JSON.stringify({
        success: true,
        folderName: folderName,
        folderId: lessonFolder.getId(),
        folderUrl: lessonFolder.getUrl(),
        materialsFolderUrl: matFolder.getUrl(),
        materialsFolderId: matFolder.getId(),
        homeworkFolderUrl: hwFolder.getUrl(),
        homeworkFolderId: hwFolder.getId(),
        studentFolders: studentFolders
      })).setMimeType(ContentService.MimeType.JSON);
    }

    // LƯU TOÀN BỘ DỮ LIỆU LỚP HỌC LÊN DRIVE (DB)
    if (action === "saveData") {
      var dataContent = JSON.stringify(req.data || {});
      var files = parentFolder.getFilesByName("HSK4_Class_Data.json");
      var dataFile;
      if (files.hasNext()) {
        dataFile = files.next();
        dataFile.setContent(dataContent);
      } else {
        dataFile = parentFolder.createFile("HSK4_Class_Data.json", dataContent, MimeType.PLAIN_TEXT);
        try { dataFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT); } catch (e) {}
      }
      return ContentService.createTextOutput(JSON.stringify({ success: true, timestamp: new Date().toISOString() })).setMimeType(ContentService.MimeType.JSON);
    }

    // TẢI DỮ LIỆU LỚP HỌC
    if (action === "loadData") {
      var dFiles = parentFolder.getFilesByName("HSK4_Class_Data.json");
      if (dFiles.hasNext()) {
        var jText = dFiles.next().getBlob().getDataAsString();
        return ContentService.createTextOutput(JSON.stringify({ success: true, data: JSON.parse(jText) })).setMimeType(ContentService.MimeType.JSON);
      }
      return ContentService.createTextOutput(JSON.stringify({ success: false, notFound: true })).setMimeType(ContentService.MimeType.JSON);
    }

    return ContentService.createTextOutput(JSON.stringify({ success: false, error: "Action không hợp lệ: " + action })).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON);
  }
}

function getTargetFolder(customFolderId) {
  var id = customFolderId || FIXED_PARENT_FOLDER_ID;
  try { return DriveApp.getFolderById(id); } catch(e) { return DriveApp.getRootFolder(); }
}

function getOrCreateSubFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) return folders.next();
  return parentFolder.createFolder(folderName);
}`;
  }
  refreshIcons();
}

function copyScriptCodeToClipboard() {
  const codeArea = document.getElementById("script-code-copy-area");
  if (codeArea) {
    codeArea.select();
    navigator.clipboard.writeText(codeArea.value).then(() => {
      showToast("Đã sao chép mã nguồn Google Apps Script vào bộ nhớ tạm!", "success");
    }).catch(() => {
      showToast("Đã chọn toàn bộ code, bấm Ctrl+C để copy!", "info");
    });
  }
}

function closeModal() {
  const container = document.getElementById("modal-container");
  if (container) container.innerHTML = "";
}

function exportDataBackup() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState.data, null, 2));
  const downloadAnchor = document.createElement("a");
  downloadAnchor.setAttribute("href", dataStr);
  downloadAnchor.setAttribute("download", `HSK4_Class_Data_Backup_${new Date().toISOString().split("T")[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
  showToast("Đã tải file sao lưu JSON về máy!", "success");
}

function resetDataToDefault() {
  if (confirm("Bạn có chắc chắn muốn đặt lại dữ liệu về ban đầu? Mọi chỉnh sửa sẽ được thiết lập lại.")) {
    localStorage.removeItem("HSK4_CLASS_APP_DATA");
    localStorage.removeItem("HSK4_CONFIRMED_USER");
    AppState.data = getAppData();
    renderHeaderUserSelector();
    renderNavigation();
    renderCurrentTab();
    showToast("Đã đặt lại dữ liệu gốc thành công!", "info");
  }
}

function formatDisplayDate(dateStr) {
  if (!dateStr) return "";
  try {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
  } catch (e) { }
  return dateStr;
}

async function syncAllFromDrive() {
  showToast("Đang kết nối và đồng bộ file từ Google Drive...", "info");
  const assignments = AppState.data.assignments;
  for (const a of assignments) {
    if (a.driveFolderUrl) {
      await DriveService.syncLessonSubmissions(a.id, a.driveFolderUrl);
    }
  }
  showToast("Đã đồng bộ kiểm tra trạng thái toàn bộ thư mục Google Drive thành công!", "success");
  renderCurrentTab();
}

/**
 * Tự động đồng bộ dữ liệu đám mây từ Google Drive khi mở app
 */
async function syncCloudDataOnStartup() {
  if (typeof DriveService === "undefined" || !DriveService.isRealCloudConnected()) return;

  const el = document.getElementById("cloud-sync-status");
  if (el) {
    el.innerHTML = `<span class="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded-full"><i data-lucide="refresh-cw" class="w-3 h-3 animate-spin"></i> Đang tải Drive...</span>`;
    if (window.lucide) lucide.createIcons();
  }

  try {
    const cloudData = await DriveService.loadCloudData();
    if (cloudData && cloudData.lessons) {
      // Giữ lại active user ID hiện tại của thiết bị
      AppState.data = cloudData;
      localStorage.setItem("HSK4_CLASS_APP_DATA", JSON.stringify(cloudData));
      renderHeaderUserSelector();
      renderNavigation();
      renderCurrentTab();
      refreshIcons();

      const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (el) {
        el.innerHTML = `<span class="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-extrabold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full"><i data-lucide="cloud-check" class="w-3 h-3 text-emerald-600"></i> Đã đồng bộ ${timeStr}</span>`;
        if (window.lucide) lucide.createIcons();
      }
    } else {
      // Nếu chưa có file dữ liệu trên Drive, tự khởi tạo file DB bằng dữ liệu hiện tại
      await DriveService.saveCloudData(AppState.data);
    }
  } catch (err) {
    console.warn("Lỗi đồng bộ startup:", err);
  }
}

/**
 * Bấm nút để chủ động đồng bộ dữ liệu lớp học mới nhất từ Google Drive
 */
async function manualSyncCloudData() {
  showToast("Đang đồng bộ dữ liệu mới nhất từ Google Drive...", "info");
  try {
    const cloudData = await DriveService.loadCloudData();
    if (cloudData && cloudData.lessons) {
      AppState.data = cloudData;
      localStorage.setItem("HSK4_CLASS_APP_DATA", JSON.stringify(cloudData));
      renderHeaderUserSelector();
      renderNavigation();
      renderCurrentTab();
      refreshIcons();
      showToast("Đã đồng bộ dữ liệu đám mây Google Drive thành công 100%!", "success");
    } else {
      const saveRes = await DriveService.saveCloudData(AppState.data);
      if (saveRes && saveRes.success) {
        showToast("Đã lưu và đồng bộ dữ liệu lớp học lên Google Drive!", "success");
      } else {
        const errMsg = saveRes && saveRes.error ? saveRes.error : "Chưa cập nhật script mới";
        showToast(`Google Apps Script chưa nhận lệnh saveData (${errMsg}). Hãy làm theo hướng dẫn cập nhật mã nguồn!`, "warning");
      }
    }
  } catch (err) {
    showToast("Lỗi khi kết nối Google Drive: " + err.message, "error");
  }
}

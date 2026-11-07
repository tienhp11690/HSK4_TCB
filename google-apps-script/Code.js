/**
 * GOOGLE APPS SCRIPT CHO WEB APP QUẢN LÝ NHÓM HỌC TIẾNG TRUNG HSK 4
 * Lớp học: Lớp Tiếng Trung HSK 4 - Techcombank (1 GV: Sha Sha + 4 HV: Hà Bin, Tien Pham, Xuan Mai, Trang)
 * =====================================================================================================
 * Thư mục gốc Google Drive: https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP
 * Folder ID: 18y3IbrKVibG9z9RzgQvVjz-jww54SelP
 */

// 1. Cấu hình ID thư mục cha cố định
var PARENT_FOLDER_ID = "18y3IbrKVibG9z9RzgQvVjz-jww54SelP";

/**
 * Endpoint kiểm tra kết nối (GET Request)
 * Đã bọc try-catch tuyệt đối để không bao giờ bị lỗi CORS
 */
function doGet(e) {
  try {
    var folderId = "18y3IbrKVibG9z9RzgQvVjz-jww54SelP";
    if (typeof PARENT_FOLDER_ID !== "undefined" && PARENT_FOLDER_ID) {
      folderId = PARENT_FOLDER_ID;
    }

    var parentName = "HSK4_Parent_Folder";
    try {
      var pFolder = getTargetFolder(folderId);
      if (pFolder) {
        parentName = pFolder.getName();
      }
    } catch (errFolder) {
      Logger.log("Lỗi đọc tên folder: " + errFolder.toString());
    }

    return ContentService.createTextOutput(JSON.stringify({
      status: "ok",
      message: "Google Apps Script Web App đang kết nối thành công với Google Drive!",
      parentFolderId: folderId,
      parentFolderName: parentName,
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      error: err.toString(),
      timestamp: new Date().toISOString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

/**
 * Xử lý các yêu cầu từ Web App (POST Request)
 */
function doPost(e) {
  try {
    var requestData = {};
    if (e && e.postData && e.postData.contents) {
      try {
        requestData = JSON.parse(e.postData.contents);
      } catch (errJson) {
        requestData = {};
      }
    }

    var action = requestData.action || "";
    var customParentId = requestData.parentFolderId || "18y3IbrKVibG9z9RzgQvVjz-jww54SelP";
    if (typeof PARENT_FOLDER_ID !== "undefined" && PARENT_FOLDER_ID) {
      customParentId = PARENT_FOLDER_ID;
    }

    // Lấy thư mục cha đã được cấu hình trên Google Drive
    var parentFolder = getTargetFolder(customParentId);

    // -------------------------------------------------------------
    // 1. TỰ ĐỘNG TẠO THƯ MỤC BUỔI HỌC VÀ 4 SUBFOLDER CHO 4 HỌC VIÊN
    // -------------------------------------------------------------
    if (action === "createLessonFolder") {
      var lessonNum = requestData.lessonNumber || "X";
      var folderName = requestData.folderName || ("[HSK4] Buổi " + lessonNum);
      
      // Tạo thư mục buổi học trong Thư mục cha Drive
      var lessonFolder = getOrCreateSubFolder(parentFolder, folderName);
      
      try {
        lessonFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
      } catch (errShare) {}

      // Tạo thư mục tài liệu buổi học
      var materialsFolder = getOrCreateSubFolder(lessonFolder, "00_Tai_Lieu_Buoi_Hoc");
      try {
        materialsFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
      } catch (e) {}

      // Tạo các thư mục con cho từng học viên nộp bài
      var studentFolders = [];
      var students = requestData.students || [
        { id: "student_1", name: "Hà Bin", folderName: "01_Ha_Bin" },
        { id: "student_2", name: "Tien Pham", folderName: "02_Tien_Pham" },
        { id: "student_3", name: "Xuan Mai", folderName: "03_Xuan_Mai" },
        { id: "student_4", name: "Trang", folderName: "04_Trang" }
      ];

      for (var i = 0; i < students.length; i++) {
        var s = students[i];
        var sFolder = getOrCreateSubFolder(lessonFolder, s.folderName || s.name);
        try {
          sFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
        } catch (e) {}

        studentFolders.push({
          studentId: s.id,
          studentName: s.name,
          folderName: s.folderName || s.name,
          folderUrl: sFolder.getUrl(),
          folderId: sFolder.getId()
        });
      }

      return jsonResponse({
        success: true,
        folderName: folderName,
        folderId: lessonFolder.getId(),
        folderUrl: lessonFolder.getUrl(),
        materialsFolderUrl: materialsFolder.getUrl(),
        studentFolders: studentFolders
      });
    }

    // -------------------------------------------------------------
    // 2. UPLOAD FILE BÀI TẬP TRỰC TIẾP LÊN GOOGLE DRIVE
    // -------------------------------------------------------------
    if (action === "uploadFile") {
      var lessonId = requestData.lessonId;
      var studentId = requestData.studentId;
      var studentName = requestData.studentName || "Học viên";
      var fileName = requestData.fileName || ("Bai_Nop_" + Date.now());
      var mimeType = requestData.mimeType || "application/octet-stream";
      var fileContent = requestData.fileContent; // Base64
      var notes = requestData.notes || "";

      // Giải mã dữ liệu file Base64
      var decodedBlob = Utilities.newBlob(Utilities.base64Decode(fileContent), mimeType, fileName);

      // Lưu file vào thư mục Drive
      var createdFile = parentFolder.createFile(decodedBlob);
      try {
        createdFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      } catch (e) {}

      if (notes) {
        createdFile.setDescription("Bài nộp của: " + studentName + " (" + studentId + ")\nGhi chú: " + notes);
      }

      return jsonResponse({
        success: true,
        fileId: createdFile.getId(),
        fileName: createdFile.getName(),
        fileUrl: createdFile.getUrl(),
        downloadUrl: createdFile.getDownloadUrl()
      });
    }

    // -------------------------------------------------------------
    // 3. ĐỒNG BỘ DANH SÁCH FILE TRONG FOLDER
    // -------------------------------------------------------------
    if (action === "syncFolder") {
      var filesList = [];
      var files = parentFolder.getFiles();
      while (files.hasNext()) {
        var file = files.next();
        filesList.push({
          id: file.getId(),
          name: file.getName(),
          url: file.getUrl(),
          size: (file.getSize() / 1024).toFixed(1) + " KB",
          date: file.getLastUpdated().toISOString()
        });
      }

      return jsonResponse({
        success: true,
        files: filesList
      });
    }

    return jsonResponse({ success: false, error: "Action không hợp lệ: " + action });

  } catch (err) {
    return jsonResponse({ success: false, error: err.toString() });
  }
}

/**
 * Hàm lấy thư mục cha Google Drive theo ID
 */
function getTargetFolder(customFolderId) {
  var targetId = customFolderId || "18y3IbrKVibG9z9RzgQvVjz-jww54SelP";
  if (targetId && targetId.trim() !== "") {
    try {
      return DriveApp.getFolderById(targetId.trim());
    } catch (e) {
      Logger.log("Không tìm thấy folder với ID " + targetId + ": " + e.toString());
    }
  }
  return getOrCreateSubFolder(DriveApp.getRootFolder(), "HSK4_Class_Manager_Data");
}

/**
 * Hàm tìm kiếm hoặc tự tạo thư mục con
 */
function getOrCreateSubFolder(parentFolder, folderName) {
  var folders = parentFolder.getFoldersByName(folderName);
  if (folders.hasNext()) {
    return folders.next();
  }
  return parentFolder.createFolder(folderName);
}

function jsonResponse(data) {
  return ContentService.createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}

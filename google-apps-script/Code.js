/**
 * GOOGLE APPS SCRIPT CHO WEB APP QUẢN LÝ NHÓM HỌC TIẾNG TRUNG HSK 4
 * Lớp học: Lớp Tiếng Trung HSK 4 - Techcombank (1 GV: Sha Sha + 4 HV: Hà Bin, Tien Pham, Xuan Mai, Trang)
 * =====================================================================================================
 * Thư mục gốc Google Drive: https://drive.google.com/drive/folders/18y3IbrKVibG9z9RzgQvVjz-jww54SelP
 * Folder ID: 18y3IbrKVibG9z9RzgQvVjz-jww54SelP
 */

// 1. Cấu hình ID thư mục cha cố định trên Google Drive
var FIXED_PARENT_FOLDER_ID = "18y3IbrKVibG9z9RzgQvVjz-jww54SelP";

/**
 * Endpoint kiểm tra kết nối & Tải dữ liệu lớp học (GET Request)
 */
function doGet(e) {
  try {
    var folderId = FIXED_PARENT_FOLDER_ID;
    var pFolder = getTargetFolder(folderId);

    // 1. TẢI TOÀN BỘ DỮ LIỆU LỚP HỌC TRỰC TIẾP TỪ GOOGLE DRIVE (?action=loadData)
    if (e && e.parameter && e.parameter.action === "loadData") {
      var files = pFolder.getFilesByName("HSK4_Class_Data.json");
      if (files.hasNext()) {
        var content = files.next().getBlob().getDataAsString();
        return jsonResponse({
          success: true,
          data: JSON.parse(content),
          timestamp: new Date().toISOString()
        });
      } else {
        return jsonResponse({
          success: false,
          notFound: true,
          message: "Chưa có file dữ liệu HSK4_Class_Data.json trên Drive",
          timestamp: new Date().toISOString()
        });
      }
    }

    var parentName = "HSK4_Parent_Folder";
    if (pFolder) {
      parentName = pFolder.getName();
    }

    return jsonResponse({
      status: "ok",
      message: "Google Apps Script Web App đang kết nối thành công với Google Drive!",
      parentFolderId: folderId,
      parentFolderName: parentName,
      timestamp: new Date().toISOString()
    });

  } catch (err) {
    return jsonResponse({
      status: "error",
      error: err.toString(),
      timestamp: new Date().toISOString()
    });
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
    var customParentId = requestData.parentFolderId || FIXED_PARENT_FOLDER_ID;

    // Lấy thư mục cha đã được cấu hình trên Google Drive
    var parentFolder = getTargetFolder(customParentId);

    // -------------------------------------------------------------------------
    // 1. CẤU TRÚC TỐI ƯU: TẠO THƯ MỤC BUỔI HỌC KÈM 2 THƯ MỤC CON CHUYÊN BIỆT:
    //    📁 [HSK4] Buổi XX - [Tên Bài]
    //         ├── 📁 01_Tai_Lieu_Buoi_Hoc (Slide, Audio, Ghi hình Meet)
    //         └── 📁 02_Nop_Bai_Tap_Ve_Nha (Folder nộp bài tập của buổi này)
    //              ├── 📁 01_Ha_Bin
    //              ├── 📁 02_Tien_Pham
    //              ├── 📁 03_Xuan_Mai
    //              └── 📁 04_Trang
    // -------------------------------------------------------------------------
    if (action === "createLessonFolder") {
      var lessonNum = requestData.lessonNumber || "1";
      var formattedNum = String(lessonNum).padStart(2, "0");
      var lessonTitle = requestData.lessonTitle || ("Buổi " + lessonNum);
      var folderName = requestData.folderName || ("[HSK4] Buổi " + formattedNum + " - " + lessonTitle);
      
      // 1. Tạo thư mục buổi học chính trong Thư mục cha Drive
      var lessonFolder = getOrCreateSubFolder(parentFolder, folderName);
      try {
        lessonFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
      } catch (errShare) {}

      // 2. Tạo Thư mục Tài liệu buổi học (01_Tai_Lieu_Buoi_Hoc)
      var materialsFolder = getOrCreateSubFolder(lessonFolder, "01_Tai_Lieu_Buoi_Hoc");
      try {
        materialsFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
      } catch (e) {}

      // 3. Tạo Thư mục Nộp bài tập về nhà (02_Nop_Bai_Tap_Ve_Nha)
      var homeworkFolder = getOrCreateSubFolder(lessonFolder, "02_Nop_Bai_Tap_Ve_Nha");
      try {
        homeworkFolder.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
      } catch (e) {}

      // 4. Tạo các thư mục con cho 4 học viên bên trong thư mục Nộp bài tập
      var studentFolders = [];
      var students = requestData.students || [
        { id: "student_1", name: "Hà Bin", folderName: "01_Ha_Bin" },
        { id: "student_2", name: "Tien Pham", folderName: "02_Tien_Pham" },
        { id: "student_3", name: "Xuan Mai", folderName: "03_Xuan_Mai" },
        { id: "student_4", name: "Trang", folderName: "04_Trang" }
      ];

      for (var i = 0; i < students.length; i++) {
        var s = students[i];
        var sFolder = getOrCreateSubFolder(homeworkFolder, s.folderName || s.name);
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
        materialsFolderId: materialsFolder.getId(),
        homeworkFolderUrl: homeworkFolder.getUrl(),
        homeworkFolderId: homeworkFolder.getId(),
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
      var targetFolderId = requestData.targetFolderId;

      // Giải mã dữ liệu file Base64
      var decodedBlob = Utilities.newBlob(Utilities.base64Decode(fileContent), mimeType, fileName);

      // Thư mục đích: nếu có targetFolderId thì lưu thẳng vào folder của học viên đó
      var targetFolder = parentFolder;
      if (targetFolderId) {
        try {
          targetFolder = DriveApp.getFolderById(targetFolderId);
        } catch (errTgt) {
          targetFolder = parentFolder;
        }
      }

      var createdFile = targetFolder.createFile(decodedBlob);
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
      var targetF = parentFolder;
      if (requestData.folderId) {
        try {
          targetF = DriveApp.getFolderById(requestData.folderId);
        } catch (e) {}
      }

      var files = targetF.getFiles();
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

    // -------------------------------------------------------------
    // 4. LƯU TOÀN BỘ DỮ LIỆU LỚP HỌC LÊN GOOGLE DRIVE (DB FILE: HSK4_Class_Data.json)
    // -------------------------------------------------------------
    if (action === "saveData") {
      var dataContent = JSON.stringify(requestData.data || {});
      var files = parentFolder.getFilesByName("HSK4_Class_Data.json");
      var dataFile;
      if (files.hasNext()) {
        dataFile = files.next();
        dataFile.setContent(dataContent);
      } else {
        dataFile = parentFolder.createFile("HSK4_Class_Data.json", dataContent, MimeType.PLAIN_TEXT);
        try {
          dataFile.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.EDIT);
        } catch (eShare) {}
      }

      return jsonResponse({
        success: true,
        message: "Đã lưu dữ liệu lớp học lên Google Drive thành công!",
        fileId: dataFile.getId(),
        fileUrl: dataFile.getUrl(),
        timestamp: new Date().toISOString()
      });
    }

    // -------------------------------------------------------------
    // 5. TẢI TOÀN BỘ DỮ LIỆU LỚP HỌC TỪ GOOGLE DRIVE (POST)
    // -------------------------------------------------------------
    if (action === "loadData") {
      var dataFiles = parentFolder.getFilesByName("HSK4_Class_Data.json");
      if (dataFiles.hasNext()) {
        var jsonText = dataFiles.next().getBlob().getDataAsString();
        return jsonResponse({
          success: true,
          data: JSON.parse(jsonText),
          timestamp: new Date().toISOString()
        });
      } else {
        return jsonResponse({
          success: false,
          notFound: true,
          message: "Chưa có file dữ liệu trên Drive",
          timestamp: new Date().toISOString()
        });
      }
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

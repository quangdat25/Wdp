const uploadImage = require("../config/uploadImage");

const createError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

exports.upload = async (file) => {
  if (!file) {
    throw createError(400, "Vui lòng chọn ảnh");
  }

  if (!file.buffer) {
    throw createError(
      400,
      "Không đọc được dữ liệu ảnh. Kiểm tra multer đang dùng memoryStorage"
    );
  }

  const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
    "base64"
  )}`;

  const imageUrl = await uploadImage(base64);

  if (!imageUrl) {
    throw createError(500, "Upload ảnh thất bại, không nhận được URL");
  }

  // Trả thẳng URL giống logic cũ
  return imageUrl;
};
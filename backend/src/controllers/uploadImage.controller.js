const uploadService = require("../services/uploadImage.service");

exports.upload = async (req, res) => {
  try {
    const imageUrl = await uploadService.upload(req.file);

    return res.status(200).json({
      success: true,
      message: "Upload ảnh thành công",

      // Giữ nguyên cấu trúc cũ để frontend vẫn đọc res.data.url
      url: imageUrl,
    });
  } catch (error) {
    console.error("UPLOAD IMAGE ERROR:", error);

    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Upload ảnh thất bại",
    });
  }
};
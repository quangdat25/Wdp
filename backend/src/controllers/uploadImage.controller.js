const uploadImage = require("../config/uploadImage");

exports.upload = async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "Vui lòng chọn ảnh",
      });
    }

    const base64 = `data:${file.mimetype};base64,${file.buffer.toString(
      "base64"
    )}`;

    const imageUrl = await uploadImage(base64);

    return res.status(200).json({
      success: true,
      message: "Upload ảnh thành công",
      url: imageUrl,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Upload ảnh thất bại",
      error: error.message,
    });
  }
};
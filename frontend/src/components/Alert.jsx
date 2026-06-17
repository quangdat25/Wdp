


import Swal from "sweetalert2";
import withReactContent from "sweetalert2-react-content";

const MySwal = withReactContent(Swal);

/**
 * 🔔 Hiển thị thông báo SweetAlert2
 * @param {"success" | "error" | "warning" | "info"} icon - Loại biểu tượng
 * @param {string} title - Tiêu đề
 * @param {string} text - Nội dung
 */
const showAlert = (icon, title, text) => {
  MySwal.fire({
    icon,
    title,
    text,
    confirmButtonColor: icon === "error" ? "#d33" : "#3085d6",
  });
};
export const showSuccess = (message) => {
  showAlert("success", "Thành công!", message);
};

export const showError = (message) => {
  showAlert("error", "Lỗi!", message);
};

export const showWarning = (message) => {
  showAlert("warning", "Cảnh báo!", message);
};

/**
 * ❓ Hiển thị hộp xác nhận (Confirm box)
 * @param {string} title - Tiêu đề xác nhận
 * @param {string} text - Nội dung
 * @param {string} confirmText - (tuỳ chọn) nội dung nút xác nhận
 * @returns {Promise<boolean>} true nếu người dùng chọn "Đồng ý"
 */
export const showConfirm = async (
  title,
  text,
  confirmText = "Đồng ý"
) => {
  const result = await MySwal.fire({
    title,
    text,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: "Hủy",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    reverseButtons: true, // cho nút "Hủy" sang bên trái (thông dụng ở VN)
  });
  return result.isConfirmed;
};

/**
 * 🌟 Hiển thị thông báo dạng toast (góc trên)
 * @param {string} message - Nội dung
 * @param {"success" | "error" | "warning" | "info"} type - Loại thông báo
 */
export const showToast = (message, type = "success") => {
  MySwal.fire({
    toast: true,
    position: "top-end",
    icon: type,
    title: message,
    showConfirmButton: false,
    timer: 2000,
    timerProgressBar: true,
  });
};

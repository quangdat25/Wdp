import axios from "axios";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Interceptor cho Response: Xử lý tự động Refresh Token khi gặp lỗi 401
request.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Nếu lỗi 401 (Hết hạn Access Token) và API này KHÔNG PHẢI là API login/refresh
    // Tránh bị lặp vô hạn
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/login") &&
      !originalRequest.url.includes("/refresh")
    ) {
      originalRequest._retry = true; // Đánh dấu là đang thử lại

      try {
        // Gọi API xin cấp lại Access Token mới (dùng thẳng axios để không bị dính vào request hiện tại)
        await axios.get(`${import.meta.env.VITE_API_URL}/api/user/refresh`, {
          withCredentials: true,
        });

        // Nếu xin token thành công, tự động gọi lại Request vừa bị thất bại
        return request(originalRequest);
      } catch (refreshError) {
        // Nếu Refresh Token cũng chết -> Yêu cầu đăng nhập lại
        localStorage.removeItem("user");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default request;

import request from "../config/request";

const authService = {
  login: async (username, password) => {
    const response = await request.post("/api/user/login", {
      username,
      password,
    });
    return response.data;
  },

  googleLogin: async (token) => {
    const response = await request.post("/api/user/google-login", {
      token,
    });
    return response.data;
  },

  logout: async () => {
    const response = await request.post("/api/user/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await request.get("/api/user/me");
    return response.data;
  },
};

export default authService;

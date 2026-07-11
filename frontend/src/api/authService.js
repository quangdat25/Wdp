import request from "../config/axiosConfig";

const authService = {
  login: async (username, password, requestedRole) => {
    const response = await request.post("/api/users/login", {
      username,
      password,
      requestedRole,
    });
    return response.data;
  },

  googleLogin: async (token) => {
    const response = await request.post("/api/users/google-login", {
      token,
    });
    return response.data;
  },

  logout: async () => {
    const response = await request.post("/api/users/logout");
    return response.data;
  },

  getMe: async () => {
    const response = await request.get("/api/users/me");
    return response.data;
  },

  getMyProfile: async () => {
    const response = await request.get("/api/users/profile");
    return response.data;
  },
};

export default authService;

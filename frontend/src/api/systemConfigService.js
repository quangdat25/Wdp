import request from "../config/axiosConfig";

const systemConfigService = {
  getAllConfigs: async () => {
    const response = await request.get("/api/configs");
    return response.data;
  },

  getActiveConfig: async () => {
    const response = await request.get("/api/configs/active");
    return response.data;
  },

  getConfigById: async (id) => {
    const response = await request.get(`/api/configs/${id}`);
    return response.data;
  },

  createConfig: async (configData) => {
    const response = await request.post(
      "/api/configs",
      configData,
    );
    return response.data;
  },

  updateConfig: async (id, configData) => {
    const response = await request.put(
      `/api/configs/${id}`,
      configData,
    );
    return response.data;
  },

  activateConfig: async (id) => {
    const response = await request.patch(
      `/api/configs/${id}/activate`,
    );
    return response.data;
  },

  deleteConfig: async (id) => {
    const response = await request.delete(
      `/api/configs/${id}`,
    );
    return response.data;
  },
};

export default systemConfigService;
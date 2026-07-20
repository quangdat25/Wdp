import request from "../config/axiosConfig";

const getAdminDashboard = async () => {
  const res = await request.get("/api/dashboard");
  return res.data;
};

export default getAdminDashboard;

import request from "../config/axiosConfig";

export const createViolation = async (data) => {
  const response = await request.post("/api/violations/create", data);
  return response.data;
};

export const getViolations = async () => {
  const response = await request.get("/api/violations");
  return response.data;
};

export const approveViolation = async (id, pointsDeducted) => {
  const response = await request.put(`/api/violations/${id}/approve`, { pointsDeducted });
  return response.data;
};

export const rejectViolation = async (id) => {
  const response = await request.put(`/api/violations/${id}/reject`);
  return response.data;
};

import request from "../config/axiosConfig";

export const getAllSemesters = async () => {
  const response = await request.get("/api/semesters");
  return response.data;
};

export const createSemester = async (data) => {
  const response = await request.post("/api/semesters", data);
  return response.data;
};

export const updateSemester = async (id, data) => {
  const response = await request.patch(`/api/semesters/${id}`, data);
  return response.data;
};

export const setActiveSemester = async (id) => {
  const response = await request.patch(`/api/semesters/${id}/active`);
  return response.data;
};

export const deleteSemester = async (id) => {
  const response = await request.delete(`/api/semesters/${id}`);
  return response.data;
};

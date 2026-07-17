import request from "../config/axiosConfig";

export const getAllStudents = () => {
  return request.get("api/students");
};

export const importStudents = (formData) => {
  return request.post("api/students/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const searchStudents = async (q) => {
  const response = await request.get("/api/students/search", { params: { q } });
  return response.data;
};

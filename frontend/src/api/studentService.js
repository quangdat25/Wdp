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

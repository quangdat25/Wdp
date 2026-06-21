import request from "../config/axiosConfig";

export const getAllPersonnel = () => {
  return request.get("api/personnel");
};

export const getPersonnelById = (id) => {
  return request.get(`api/personnel/${id}`);
};

export const createPersonnel = (data) => {
  return request.post("api/personnel", data);
};

export const updatePersonnel = (id, data) => {
  return request.put(`api/personnel/${id}`, data);
};

export const deletePersonnel = (id) => {
  return request.delete(`api/personnel/${id}`);
};

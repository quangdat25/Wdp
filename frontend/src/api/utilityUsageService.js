// src/api/utilityUsageService.js

import request from "../config/axiosConfig";

export const importUtilityExcel = (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return request.post("api/utility-usages/import", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const getAllUtilityUsages = (params) => {
  return request.get("api/utility-usages", { params });
};

export const createUtilityInvoices = (data) => {
  return request.post("api/utility-usages/create-invoices", data);
};

export const getUtilityByStudentId = (studentId) => {
  return request.get(`api/utility-usages/student/${studentId}`);
};
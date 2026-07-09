import request from "../config/axiosConfig";

export const getMyInvoices = () => {
  return request.get("api/invoices/my");
};

export const getAllInvoices = (params) => {
  return request.get("api/invoices", { params });
};
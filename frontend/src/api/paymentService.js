import request from "../config/axiosConfig";

export const createInvoicePayment = (invoiceId) => {
  return request.post("/api/payment/create-invoice-payment", {
    invoiceId,
  });
};
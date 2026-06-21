import request from "../config/axiosConfig";

export const getAllTicketsForManagement = () => {
  return request.get("api/ticket-management");
};

export const getStaffList = () => {
  return request.get("api/ticket-management/staff");
};

export const approveTicket = (ticketId) => {
  return request.patch(`api/ticket-management/${ticketId}/approve`);
};

export const rejectTicket = (ticketId, rejectedReason) => {
  return request.patch(`api/ticket-management/${ticketId}/reject`, {
    rejectedReason,
  });
};

export const assignTicket = (ticketId, staffId) => {
  return request.patch(`api/ticket-management/${ticketId}/assign`, {
    staffId,
  });
};

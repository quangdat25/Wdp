import request from "../config/axiosConfig";

export const createTicket = (data) => {
  return request.post("api/tickets", data);
};

export const getMyTickets = () => {
  return request.get("api/tickets/my");
};

export const deleteMyTicket = (id) => {
  return request.delete(`api/tickets/my/${id}`);
};

export const getStaffTickets = () => {
  return request.get("api/tickets/staff");
};

export const updateTicketStatus = (id, data) => {
  return request.patch(`api/tickets/staff/${id}/status`, data);
};

export const createStaffTicket = (data) => {
  return request.post("api/tickets/staff-report", data);
};

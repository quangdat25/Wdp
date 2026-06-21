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

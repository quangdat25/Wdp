import request from "../config/axiosConfig";

export const getCheckInOutBookings = (status = "") => {
  return request.get("api/check-in-out", {
    params: status ? { status } : {},
  });
};

export const checkInBooking = (bookingId) => {
  return request.patch(
    `api/check-in-out/${bookingId}/check-in`,
  );
};

export const checkOutBooking = (bookingId) => {
  return request.patch(
    `api/check-in-out/${bookingId}/check-out`,
  );
};
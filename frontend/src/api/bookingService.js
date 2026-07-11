import request from "../config/axiosConfig";

// Kiểm tra điều kiện booking (CFD Score + Invoice)
export const checkEligibility = async () => {
  const res = await request.get("/api/booking/check-eligibility");
  return res.data;
};

// Lấy danh sách phòng trống theo tòa nhà
export const getAvailableRooms = async (buildingId, floor) => {
  let url = `/api/booking/available-rooms/${buildingId}`;
  if (floor) url += `?floor=${floor}`;
  const res = await request.get(url);
  return res.data;
};
// Lấy trạng thái từng giường của phòng trong kỳ tiếp theo
export const getRoomBedAvailability = async (roomId) => {
  const res = await request.get(`/api/booking/rooms/${roomId}/beds`);

  return res.data;
};

// Tạo booking mới
export const createBooking = async (data) => {
  const res = await request.post("/api/booking", data);
  return res.data;
};

// Lấy booking hiện tại
export const getMyBooking = async () => {
  const res = await request.get("/api/booking/my-booking");
  return res.data;
};
// Lấy booking
export const getAllBookings = async () => {
  const res = await request.get("/api/booking");
  return res.data;
};

// Tạo URL thanh toán VNPAY cho booking
export const createBookingPayment = async (bookingId) => {
  const res = await request.post("/api/payment/create-booking-payment", {
    bookingId,
  });
  return res.data;
};

export default {
  checkEligibility,
  getAvailableRooms,
  createBooking,
  getMyBooking,
  createBookingPayment,
};

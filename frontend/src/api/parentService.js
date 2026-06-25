import request from "../config/axiosConfig";

export const getMyChildRoom = async () => {
  const res = await request.get("/api/parents/my-child-room");
  return res.data;
};

export const getStudentInfo = async () => {
  const res = await request.get("/api/parents/student-info");
  return res.data;
};

export default {
  getMyChildRoom,
  getStudentInfo,
};

import request from "../config/axiosConfig";

export const getAllNews = async () => {
  const response = await request.get("/api/news");
  return response.data;
};

export const createNews = async (data) => {
  const response = await request.post("/api/news", data);
  return response.data;
};

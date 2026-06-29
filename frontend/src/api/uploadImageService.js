import request from "../config/request";

export const uploadImage = (data) => {
  return request.post("api/upload-image", data, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};
import request from "../config/axiosConfig";

const semesterService = {
  getAllSemesters: async () => {
    const response = await request.get("/api/semesters");
    return response.data;
  },

  getCurrentSemester: async () => {
    const response = await request.get("/api/semesters/current");
    return response.data;
  },

  getNextSemester: async () => {
    const response = await request.get("/api/semesters/next");
    return response.data;
  },


  createSemesterYear: async (semesterData) => {
    const response = await request.post(
      "/api/semesters",
      semesterData,
    );
    return response.data;
  },
  updateSemester: async (id, semesterData) => {
    const response = await request.put(`/api/semesters/${id}`, semesterData);
    return response.data;
  },

  deleteSemester: async (id) => {
    const response = await request.delete(`/api/semesters/${id}`);
    return response.data;
  },
};

export default semesterService;

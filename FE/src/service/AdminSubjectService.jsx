import axiosInstance from '../config/Axios-config.jsx';

const AdminSubjectService = {
  async getAllSubjects(params = {}) {
    const res = await axiosInstance.get('/courses', { params });
    const data = res?.data ?? res;
    return data?.courses || data?.subjects || data?.data || data || [];
  },

  async getSubjectById(id) {
    const res = await axiosInstance.get(`/courses/${id}`);
    return res?.data;
  },

  async getBooksBySubject(id) {
    const res = await axiosInstance.get('/documents', { params: { courseId: id } });
    return res?.data || [];
  },

  async createSubject(courseData) {
    const res = await axiosInstance.post('/courses', courseData);
    return res;
  },

  async updateSubject(id, courseData) {
    const res = await axiosInstance.put(`/courses/${id}`, courseData);
    return res;
  },

  async deleteSubject(id) {
    const res = await axiosInstance.delete(`/courses/${id}`);
    return res;
  }
};

export default AdminSubjectService;

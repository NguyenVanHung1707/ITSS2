import axiosInstance from '../config/Axios-config.jsx';

const AdminAuthorService = {
  async getAllAuthors(params = {}) {
    const res = await axiosInstance.get('/faculties', { params });
    const data = res?.data ?? res;
    return data?.faculties || data?.authors || data?.data || data || [];
  },

  async getAuthorById(id) {
    const res = await axiosInstance.get(`/faculties/${id}`);
    return res?.data;
  },

  async getBooksByAuthor(id) {
    const res = await axiosInstance.get('/documents', { params: { facultyId: id } });
    return res?.data || [];
  },

  async createAuthor(facultyData) {
    const res = await axiosInstance.post('/faculties', facultyData);
    return res;
  },

  async updateAuthor(id, facultyData) {
    const res = await axiosInstance.put(`/faculties/${id}`, facultyData);
    return res;
  },

  async deleteAuthor(id) {
    const res = await axiosInstance.delete(`/faculties/${id}`);
    return res;
  }
};

export default AdminAuthorService;

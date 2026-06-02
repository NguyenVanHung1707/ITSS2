import axiosClient from "../config/Axios-config";

const AdminStatsService = {
  // Get dashboard overview stats
  getDashboardStats: async () => {
    const response = await axiosClient.get("/admin/stats");
    return response;
  },

  // Get user registration trend
  getRegistrationStats: async (period = 30) => {
    const response = await axiosClient.get(`/admin/stats/registrations?period=${period}`);
    return response;
  },

  getBooksBySubject: async () => {
    const response = await axiosClient.get("/admin/stats/documents-by-course");
    return response;
  },

  // Get recent registered users
  getRecentUsers: async (limit = 5) => {
    const response = await axiosClient.get(`/admin/stats/recent-users?limit=${limit}`);
    return response;
  },

  getRecentComments: async (limit = 5) => {
    const response = await axiosClient.get(`/admin/stats/recent-votes?limit=${limit}`);
    return response;
  },

  getTopBooks: async (limit = 10) => {
    const response = await axiosClient.get(`/admin/stats/top-documents?limit=${limit}`);
    return response;
  },

  // Get user tier distribution
  getUserTierStats: async () => {
    const response = await axiosClient.get("/admin/stats/user-tiers");
    return response;
  },
};

export default AdminStatsService;

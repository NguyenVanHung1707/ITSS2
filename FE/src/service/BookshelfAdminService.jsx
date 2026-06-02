import axiosInstance from '../config/Axios-config.jsx';

const BookshelfAdminService = {
  // Fetch a user's grouped library: { favorites: [...], reading: [...], total }
  async getUserLibrary(userId) {
    if (!userId) return { reading: [], favorites: [], total: 0 };
    return { reading: [], favorites: [], total: 0 };
  },

  // Add book to user's bookshelf with status: 'FAVORITE' | 'READING'
  async addToUserBookshelf(userId, bookId, status) {
    const res = await axiosInstance.post(`/admin/bookshelf/users/${userId}/books/${bookId}`, { status });
    return res;
  },

  // Remove book from user's bookshelf
  async removeFromUserBookshelf(userId, bookId, status) {
    const res = await axiosInstance.delete(`/admin/bookshelf/users/${userId}/books/${bookId}`, { params: { status } });
    return res;
  }
};

export default BookshelfAdminService;

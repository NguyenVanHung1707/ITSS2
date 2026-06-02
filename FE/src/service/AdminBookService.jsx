import axiosInstance from '../config/Axios-config.jsx';
import { DEFAULT_DOCUMENT_TYPE } from '../constants/documentTypes.js';

const normalizeDocumentResponse = (res) => {
  const payload = res?.data ?? res;
  const data = payload?.data ?? payload;

  if (Array.isArray(data)) return { documents: data, totalPages: 1, total: data.length };
  if (Array.isArray(data?.documents)) return data;
  if (Array.isArray(data?.books)) {
    return {
      ...data,
      documents: data.books,
      total: data.total ?? data.books.length,
      totalPages: data.totalPages ?? 1,
    };
  }

  return data || { documents: [], totalPages: 0, total: 0 };
};

const normalizeDocumentPayload = (documentData = {}) => {
  const type = documentData.type || documentData.type_raw || DEFAULT_DOCUMENT_TYPE;

  return {
    title: documentData.title,
    facultyId: documentData.facultyId || documentData.authorId || documentData.author_id || null,
    courseId: documentData.courseId || documentData.course_id || documentData.subjectId || documentData.subject_id || documentData.subjectIds?.[0] || null,
    type,
    summary: documentData.summary || '',
    image_url: documentData.image_url || documentData.imageUrl || '',
    links: Array.isArray(documentData.links) && documentData.links.length > 0
      ? documentData.links
      : [{ title: documentData.title || 'Tai lieu', drive_link: documentData.drive_link || '#' }],
  };
};

const AdminBookService = {
  async getAllBooks(params = {}) {
    const apiParams = {
      ...params,
      facultyId: params.authorId || params.facultyId,
      courseId: params.subjectId || params.courseId,
    };
    delete apiParams.authorId;
    delete apiParams.subjectId;
    const res = await axiosInstance.get('/documents', { params: apiParams });
    return normalizeDocumentResponse(res);
  },

  async getBookById(id) {
    const res = await axiosInstance.get(`/documents/${id}`);
    return res?.data;
  },

  async createBook(documentData) {
    const res = await axiosInstance.post('/documents/upload', normalizeDocumentPayload(documentData));
    return res;
  },

  async updateBook(id, documentData) {
    const res = await axiosInstance.put(`/documents/admin/${id}`, normalizeDocumentPayload(documentData));
    return res;
  },

  async deleteBook(id) {
    const res = await axiosInstance.delete(`/documents/admin/${id}`);
    return res;
  },

  async getBookChapters(id) {
    const res = await axiosInstance.get(`/documents/${id}`);
    const payload = res?.data ?? res;
    const document = payload?.data || payload?.document || payload?.book || payload;
    return (document?.links || []).map((link, index) => ({
      id: link.id,
      title: link.title || `Tài liệu ${index + 1}`,
      content: '',
      chapter_number: index + 1,
      drive_link: link.drive_link || '',
      readOnly: true,
    }));
  }
};

export default AdminBookService;

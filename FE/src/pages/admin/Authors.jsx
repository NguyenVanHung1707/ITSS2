import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import AdminAuthorService from '../../service/AdminAuthorService';
import Pagination from '../../components/admin/Pagination';

const ENTITY_LABEL = 'Khoa | Viện | Trường';

export default function Authors() {
  const [faculties, setFaculties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFaculty, setEditingFaculty] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchFaculties();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sortDirection]);

  const filteredFaculties = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return faculties
      .filter((faculty) => {
        if (!keyword) return true;
        return (
          faculty.name?.toLowerCase().includes(keyword) ||
          faculty.code?.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const result = (a.name || '').localeCompare(b.name || '', 'vi');
        return sortDirection === 'DESC' ? -result : result;
      });
  }, [faculties, search, sortDirection]);

  const totalPages = Math.ceil(filteredFaculties.length / itemsPerPage);
  const pagedFaculties = filteredFaculties.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      const res = await AdminAuthorService.getAllAuthors({ limit: 10000, _t: Date.now() });
      const list = Array.isArray(res)
        ? res
        : res?.faculties || res?.authors || res?.data || [];
      setFaculties(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to fetch faculties', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleOpenModal = (faculty = null) => {
    setEditingFaculty(faculty);
    setFormData(faculty ? { name: faculty.name || '', code: faculty.code || '' } : { name: '', code: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingFaculty) {
        await AdminAuthorService.updateAuthor(editingFaculty.id, formData);
      } else {
        await AdminAuthorService.createAuthor(formData);
      }
      setShowModal(false);
      await fetchFaculties();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${ENTITY_LABEL.toLowerCase()} này?`)) return;
    try {
      await AdminAuthorService.deleteAuthor(id);
      await fetchFaculties();
    } catch (error) {
      alert('Lỗi xóa: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý {ENTITY_LABEL}</h2>
          <p className="text-slate-500 dark:text-slate-400">Thông tin và quản trị {ENTITY_LABEL.toLowerCase()}.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Thêm {ENTITY_LABEL}</span>
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 mx-4 mt-4">
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="faculty-search"
                name="faculty-search"
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="Tìm theo tên hoặc mã..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Sắp xếp tên</label>
            <select
              id="name-sort"
              name="name-sort"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none min-w-[150px]"
              value={sortDirection}
              onChange={(e) => {
                setSortDirection(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="ASC">A đến Z</option>
              <option value="DESC">Z đến A</option>
            </select>
          </div>

          <div className="w-full md:w-auto">
            <button
              onClick={() => {
                setSearch('');
                setSortDirection('ASC');
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3">Tên</th>
                <th className="px-4 py-3">Mã</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
              {loading ? (
                <tr><td colSpan="3" className="text-center py-4"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</td></tr>
              ) : pagedFaculties.length === 0 ? (
                <tr><td colSpan="3" className="text-center py-4">Không có {ENTITY_LABEL.toLowerCase()} nào</td></tr>
              ) : pagedFaculties.map((faculty) => (
                <tr key={faculty.id}>
                  <td className="px-4 py-3 font-medium text-slate-900 dark:text-white">{faculty.name}</td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">{faculty.code}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenModal(faculty)}
                        className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                        aria-label="Sửa"
                        title="Chỉnh sửa"
                      >
                        <Pencil size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(faculty.id)}
                        className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400"
                        aria-label="Xóa"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">{editingFaculty ? `Cập nhật ${ENTITY_LABEL}` : `Thêm ${ENTITY_LABEL}`}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên <span className="text-red-500">*</span></label>
                <input
                  id="faculty-name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mã <span className="text-red-500">*</span></label>
                <input
                  id="faculty-code"
                  name="code"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-600"
                >
                  {editingFaculty ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

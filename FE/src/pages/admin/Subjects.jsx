import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Pencil, Plus, Search, Tag, Trash2, X } from 'lucide-react';
import AdminSubjectService from '../../service/AdminSubjectService';
import Pagination from '../../components/admin/Pagination';

export default function Subjects() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [formData, setFormData] = useState({ name: '', code: '' });
  const [search, setSearch] = useState('');
  const [sortDirection, setSortDirection] = useState('ASC');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCourses();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, sortDirection]);

  const filteredCourses = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return courses
      .filter((course) => {
        if (!keyword) return true;
        return (
          course.name?.toLowerCase().includes(keyword) ||
          course.code?.toLowerCase().includes(keyword)
        );
      })
      .sort((a, b) => {
        const result = (a.code || a.name || '').localeCompare(b.code || b.name || '', 'vi');
        return sortDirection === 'DESC' ? -result : result;
      });
  }, [courses, search, sortDirection]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const pagedCourses = filteredCourses.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const res = await AdminSubjectService.getAllSubjects({ limit: 10000, _t: Date.now() });
      const list = Array.isArray(res) ? res : res?.courses || res?.subjects || res?.data || [];
      setCourses(Array.isArray(list) ? list : []);
    } catch (error) {
      console.error('Failed to fetch courses', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (course = null) => {
    setEditingCourse(course);
    setFormData(course ? { name: course.name || '', code: course.code || '' } : { name: '', code: '' });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCourse) {
        await AdminSubjectService.updateSubject(editingCourse.id, formData);
      } else {
        await AdminSubjectService.createSubject(formData);
      }
      setShowModal(false);
      await fetchCourses();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có muốn xóa học phần này?')) return;
    try {
      await AdminSubjectService.deleteSubject(id);
      await fetchCourses();
    } catch (error) {
      alert('Lỗi: ' + (error.response?.data?.message || error.message));
    }
  };

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Học phần</h2>
          <p className="text-slate-500 dark:text-slate-400">Tổ chức học phần cho tài liệu.</p>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2"
        >
          <Plus size={18} />
          <span>Thêm học phần</span>
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 mx-4 mt-4">
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                id="course-search"
                name="course-search"
                type="text"
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
                placeholder="Tìm theo tên hoặc mã học phần..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>

          <div className="w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Sắp xếp</label>
            <select
              id="course-sort"
              name="course-sort"
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
        </div>
      </div>

      <div className="p-4 pt-0">
        {loading ? (
          <div className="flex justify-center p-8"><Loader2 className="animate-spin text-primary" size={24} /></div>
        ) : pagedCourses.length === 0 ? (
          <div className="text-center p-8 text-slate-500">Chưa có học phần nào</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pagedCourses.map((course) => (
              <div key={course.id} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Tag size={16} className="text-slate-500" />
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-900 dark:text-white">{course.name}</span>
                      <span className="text-xs text-slate-500 dark:text-slate-400">{course.code}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={() => handleOpenModal(course)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-700" aria-label="Sửa">
                      <Pencil size={16} />
                    </button>
                    <button onClick={() => handleDelete(course.id)} className="p-2 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 dark:text-red-400" aria-label="Xóa">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-lg shadow-xl w-full max-w-sm overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b border-slate-200 dark:border-slate-800">
              <h3 className="text-lg font-semibold">{editingCourse ? 'Cập nhật học phần' : 'Thêm học phần mới'}</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Tên học phần <span className="text-red-500">*</span></label>
                <input
                  id="course-name"
                  name="name"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Mã học phần <span className="text-red-500">*</span></label>
                <input
                  id="course-code"
                  name="code"
                  type="text"
                  required
                  className="w-full px-3 py-2 border rounded-md dark:bg-slate-800 dark:border-slate-700"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-md hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700">
                  Hủy
                </button>
                <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary rounded-md hover:bg-blue-600">
                  {editingCourse ? 'Cập nhật' : 'Thêm mới'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

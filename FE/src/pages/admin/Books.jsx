import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { Plus, Search, Filter, Pencil, Trash2, Loader2, X, ChevronDown, BookOpen } from 'lucide-react';
import AdminBookService from '../../service/AdminBookService';
import AdminAuthorService from '../../service/AdminAuthorService';
import AdminSubjectService from '../../service/AdminSubjectService';
import AdminChapterService from '../../service/AdminChapterService';
import Pagination from '../../components/admin/Pagination';
import { DEFAULT_DOCUMENT_TYPE, DOCUMENT_TYPES } from '../../constants/documentTypes';


// Custom Searchable Course Select Component
function CourseSelect({ courses, value, onChange, placeholder = "Tất cả học phần" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedCourse = courses.find(c => c.id === value);

  useEffect(() => {
    if (!value) {
      setSearchTerm('');
    } else if (selectedCourse) {
      setSearchTerm(selectedCourse.name);
    }
  }, [value, selectedCourse]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        if (selectedCourse) {
          setSearchTerm(selectedCourse.name);
        } else if (!value) {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, selectedCourse]);

  const filteredCourses = courses
    .filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.code?.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (course) => {
    onChange(course.id);
    setSearchTerm(course.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none h-[38px] pr-8 cursor-text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onChange('');
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredCourses.length > 0 ? (
            filteredCourses.map(course => (
              <button
                key={course.id}
                onClick={() => handleSelect(course)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${value === course.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}
              >
                {course.code ? `${course.code} - ${course.name}` : course.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400 text-center">Không tìm thấy</div>
          )}
        </div>
      )}
    </div>
  );
}

// Custom Searchable Select Component
function AuthorSelect({ authors, value, onChange, placeholder = "Tất cả Khoa | Viện | Trường" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  const selectedAuthor = authors.find(a => a.id === value);

  useEffect(() => {
    // Reset search term when value changes externally (e.g. clear filters)
    if (!value) {
      setSearchTerm('');
    } else if (selectedAuthor) {
      setSearchTerm(selectedAuthor.name);
    }
  }, [value, selectedAuthor]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
        // If closed without selection, revert text to selected value or empty
        if (selectedAuthor) {
          setSearchTerm(selectedAuthor.name);
        } else if (!value) {
          setSearchTerm('');
        }
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [value, selectedAuthor]);

  const filteredAuthors = authors
    .filter(a => a.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleSelect = (author) => {
    onChange(author.id);
    setSearchTerm(author.name);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={wrapperRef}>
      <div className="relative">
        <input
          type="text"
          className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none h-[38px] pr-8 cursor-text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (e.target.value === '') {
              onChange(''); // Clear filter if input cleared
            }
          }}
          onFocus={() => setIsOpen(true)}
        />
        <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
      </div>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredAuthors.length > 0 ? (
            filteredAuthors.map(author => (
              <button
                key={author.id}
                onClick={() => handleSelect(author)}
                className={`w-full text-left px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${value === author.id ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}
              >
                {author.name}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-slate-400 text-center">Không tìm thấy</div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Books() {
  const location = useLocation();
  const [books, setBooks] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Chapter Modal State
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [selectedBookForChapters, setSelectedBookForChapters] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [selectedChapter, setSelectedChapter] = useState(null);
  const [chapterLoading, setChapterLoading] = useState(false);
  const [chapterForm, setChapterForm] = useState({ title: '', content: '', chapter_number: 0, drive_link: '' });
  // ... (rest of the file content)


  const itemsPerPage = 10;

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingBook, setEditingBook] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    author_id: '',
    courseId: '',
    type: DEFAULT_DOCUMENT_TYPE,
    page_count: '',
    image_url: '',
    summary: '',
    language: 'Tiếng Việt'
  });

  const [authorFilter, setAuthorFilter] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  useEffect(() => {
    fetchData();
  }, [currentPage, search, authorFilter, courseFilter, typeFilter]);

  const fetchFilterData = async () => {
    try {
      const authorsData = await AdminAuthorService.getAllAuthors({ limit: 10000, _t: Date.now() });
      const coursesData = await AdminSubjectService.getAllSubjects({ limit: 10000, _t: Date.now() });

      let authorsList = [];
      if (Array.isArray(authorsData)) {
        authorsList = authorsData;
      } else if (authorsData?.faculties && Array.isArray(authorsData.faculties)) {
        authorsList = authorsData.faculties;
      } else if (authorsData?.authors && Array.isArray(authorsData.authors)) {
        authorsList = authorsData.authors;
      } else if (authorsData?.data && Array.isArray(authorsData.data)) {
        authorsList = authorsData.data;
      }
      authorsList.sort((a, b) => parseInt(b.books_count || 0) - parseInt(a.books_count || 0));
      setAuthors(authorsList);

      let coursesList = [];
      if (Array.isArray(coursesData)) {
        coursesList = coursesData;
      } else if (coursesData?.courses && Array.isArray(coursesData.courses)) {
        coursesList = coursesData.courses;
      } else if (coursesData?.subjects && Array.isArray(coursesData.subjects)) {
        coursesList = coursesData.subjects;
      } else if (coursesData?.data && Array.isArray(coursesData.data)) {
        coursesList = coursesData.data;
      }
      coursesList.sort((a, b) => parseInt(b.documents_count || b.books_count || 0) - parseInt(a.documents_count || a.books_count || 0));
      setCourses(coursesList);
    } catch (error) {
      console.error("Failed to fetch filter data", error);
    }
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = {
        page: currentPage,
        limit: itemsPerPage,
        q: search,
        facultyId: authorFilter,
        courseId: courseFilter,
        type: typeFilter
      };

      const booksData = await AdminBookService.getAllBooks(params);

      // Robust Data Handling
      if (booksData && Array.isArray(booksData.documents)) {
        setBooks(booksData.documents);
        setTotalPages(booksData.totalPages || 0);
      } else if (booksData && Array.isArray(booksData.books)) {
        setBooks(booksData.books);
        setTotalPages(booksData.totalPages || 0);
      } else if (booksData && typeof booksData === 'object' && Array.isArray(booksData.data)) { // Support alternate format
        setBooks(booksData.data);
      } else if (Array.isArray(booksData)) {
        setBooks(booksData);
      } else {
        console.warn("Invalid Books Data Structure", booksData);
        setBooks([]);
      }

      await fetchFilterData();

    } catch (error) {
      console.error("Failed to fetch data", error);
      setBooks([]);
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setAuthorFilter('');
    setCourseFilter('');
    setTypeFilter('');
    setSearch('');
    setCurrentPage(1);
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // Safe filtering
  const filteredBooks = Array.isArray(books) ? books.filter(b => {
    // Basic safety checks
    if (!b) return false;
    return true; // Simplified filtering for stability
  }) : [];

  const handleOpenChapterModal = async (book) => {
    setSelectedBookForChapters(book);
    setShowChapterModal(true);
    setSelectedChapter(null);
    setChapterForm({ title: '', content: '', chapter_number: 0, drive_link: '' });
    await fetchChapters(book.id);
  };

  const fetchChapters = async (bookId) => {
    try {
      setChapterLoading(true);
      const res = await AdminBookService.getBookChapters(bookId);
      
      let fetchedChapters = [];
      if (Array.isArray(res)) {
        fetchedChapters = res;
      } else if (res && res.data) {
        fetchedChapters = res.data;
      }
      
      // Sắp xếp theo chapter_number tăng dần
      fetchedChapters.sort((a, b) => (a.chapter_number || 0) - (b.chapter_number || 0));
      
      setChapters(fetchedChapters);
    } catch (error) {
      console.error("Failed to fetch chapters", error);
      alert("Lỗi tải danh sách chương");
    } finally {
      setChapterLoading(false);
    }
  };

  const handleSelectChapter = (chapter) => {
    setSelectedChapter(chapter);
    setChapterForm({
      title: chapter.title,
      content: chapter.content,
      chapter_number: chapter.chapter_number,
      drive_link: chapter.drive_link || ''
    });
  };

  const handleAddChapter = () => {
    const nextNum = chapters.length > 0 ? Math.max(...chapters.map(c => c.chapter_number || 0)) + 1 : 1;
    setSelectedChapter({ id: null }); // Temp object to indicate "New" mode
    setChapterForm({
      title: `Chương ${nextNum}`,
      content: '',
      chapter_number: nextNum,
      drive_link: ''
    });
  };

  const handleSaveChapter = async () => {
    try {
      if (selectedChapter && selectedChapter.id) {
        // Update existing
        await AdminChapterService.updateChapter(selectedChapter.id, chapterForm);
        alert("Cập nhật chương thành công!");
      } else {
        // Create new
        await AdminChapterService.createChapter({
          ...chapterForm,
          book_id: selectedBookForChapters.id
        });
        alert("Thêm chương mới thành công!");
      }
      await fetchChapters(selectedBookForChapters.id); // Refresh list
    } catch (error) {
      console.error(error);
      alert("Lỗi lưu chương: " + (error.response?.data?.message || error.message));
    }
  };

  const handleDeleteChapter = async (id) => {
    if (!id) return;
    if (window.confirm("Bạn có chắc chắn muốn xóa chương này?")) {
      try {
        await AdminChapterService.deleteChapter(id);
        alert("Xóa chương thành công!");
        await fetchChapters(selectedBookForChapters.id);
        setSelectedChapter(null);
      } catch (error) {
        console.error(error);
        alert("Lỗi xóa chương");
      }
    }
  }

  const handleOpenModal = (book = null) => {
    fetchFilterData();
    setEditingBook(book);
    if (book) {
      setFormData({
        title: book.title || '',
        author_id: book.faculty_id || book.author_id || '',
        courseId: book.course_id || book.course?.id || book.subject?.id || '',
        type: book.type_raw || book.type || DEFAULT_DOCUMENT_TYPE,
        document_count: book.link_count || book.document_count || book.links?.length || 0,
        page_count: book.page_count || '',
        image_url: book.image_url || '',
        summary: book.summary || '',
        language: book.language || 'Tiếng Việt'
      });
    } else {
      setFormData({
        title: '', author_id: '', courseId: '', document_count: 0, type: DEFAULT_DOCUMENT_TYPE, page_count: 0, image_url: '', summary: '', language: 'Tiếng Việt'
      });
    }
    setShowModal(true);
  };

  useEffect(() => {
    if (location.state?.openAddModal) {
      handleOpenModal();
      window.history.replaceState({}, '');
    }
  }, [location]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.author_id) {
      alert("Vui lòng chọn Khoa | Viện | Trường!");
      return;
    }
    try {
      if (editingBook) {
        await AdminBookService.updateBook(editingBook.id, formData);
        alert('Cập nhật sách thành công!');
      } else {
        await AdminBookService.createBook(formData);
        alert('Thêm sách mới thành công!');
      }
      setShowModal(false);
      fetchData(); // Refresh list
    } catch (error) {
      console.error(error);
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sách này?')) {
      try {
        await AdminBookService.deleteBook(id);
        alert('Xóa sách thành công!');
        fetchData();
      } catch (error) {
        console.error(error);
        alert('Có lỗi xảy ra khi xóa!');
      }
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-card-dark rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold dark:text-white">Quản lý Sách</h2>
        <button onClick={() => handleOpenModal()} className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/20 flex items-center gap-2">
          <Plus size={18} /> <span>Thêm sách mới</span>
        </button>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-6">
        <div className="flex flex-col md:flex-row gap-4 items-end md:items-center">
          <div className="flex-1 w-full md:w-auto">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Tìm kiếm</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Tìm tiêu đề..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
              />
            </div>
          </div>

          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Khoa | Viện | Trường</label>
            <AuthorSelect
              authors={authors}
              value={authorFilter}
              onChange={setAuthorFilter}
            />
          </div>

          <div className="w-full md:w-48">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Học phần</label>
            <CourseSelect
              courses={courses}
              value={courseFilter}
              onChange={setCourseFilter}
            />
          </div>

          <div className="w-full md:w-40">
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1 uppercase">Loại tài liệu</label>
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none h-[38px]"
            >
              <option value="">Tất cả loại</option>
              {DOCUMENT_TYPES.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <button
            onClick={clearFilters}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-medium transition-colors h-[38px] whitespace-nowrap"
          >
            Đặt lại
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 dark:bg-slate-800/30 text-xs uppercase text-slate-500 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">Ảnh</th>
              <th className="px-4 py-3">Tiêu đề</th>
              <th className="px-4 py-3">Khoa | Viện | Trường</th>
              <th className="px-4 py-3">Học phần</th>
              <th className="px-4 py-3">Loại</th>
              <th className="px-4 py-3">Ngôn ngữ</th>
              <th className="px-4 py-3">Số lượng tài liệu</th>
              <th className="px-4 py-3">Tùy chọn</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-sm">
            {loading ? (

              <tr><td colSpan="9" className="text-center py-4"><Loader2 className="animate-spin inline mr-2" /> Đang tải...</td></tr>
            ) : filteredBooks.length === 0 ? (
              <tr><td colSpan="9" className="text-center py-4">Không có dữ liệu</td></tr>
            ) : filteredBooks.map((b) => (
              <tr key={b.id || Math.random()}>
                <td className="px-4 py-3">{b.id}</td>
                <td className="px-4 py-3">
                  <img
                    src={b.image_url || '/placeholder-book.svg'}
                    alt={b.title}
                    className="w-10 h-14 object-cover rounded border border-slate-200 dark:border-slate-700"
                    onError={(e) => { e.target.onerror = null; e.target.src = '/placeholder-book.svg'; }}
                  />
                </td>
                <td className="px-4 py-3 font-medium">{b.title}</td>
                <td className="px-4 py-3 text-slate-600">
                  {b.faculty?.name || b.author?.name || b.faculty_name || b.author_name || 'N/A'}
                </td>
                <td className="px-4 py-3 text-slate-600">
                  <div className="flex flex-wrap gap-1">
                    {b.course || b.subject ? (
                      <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-1.5 py-0.5 rounded">
                        {(b.course || b.subject).code ? `${(b.course || b.subject).code} - ${(b.course || b.subject).name}` : (b.course || b.subject).name}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">Trống</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                    {b.type_raw || b.type || DEFAULT_DOCUMENT_TYPE}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-600">{b.language || 'Tiếng Việt'}</td>
                <td className="px-4 py-3 text-slate-600">{b.link_count || b.document_count || b.links?.length || 0}</td>
                <td className="px-4 py-3">
                  <button onClick={() => handleOpenChapterModal(b)} className="p-2 text-purple-600 hover:bg-purple-50 rounded-full transition-colors" title="Quản lý tài liệu"><BookOpen size={18} /></button>
                  <button onClick={() => handleOpenModal(b)} className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition-colors mr-1" title="Sửa"><Pencil size={18} /></button>
                  <button onClick={() => handleDelete(b.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Xóa"><Trash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />

      {
        showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white dark:bg-card-dark p-6 rounded-xl w-full max-w-2xl shadow-xl border border-slate-200 dark:border-slate-800 max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold dark:text-white">{editingBook ? 'Cập nhật Sách' : 'Thêm Sách Mới'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tiêu đề <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={e => setFormData({ ...formData, title: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                      placeholder="Nhập tiêu đề sách..."
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Khoa | Viện | Trường <span className="text-red-500">*</span></label>
                    <AuthorSelect
                      authors={authors}
                      value={formData.author_id}
                      onChange={(id) => setFormData({ ...formData, author_id: id })}
                      placeholder="Chọn Khoa | Viện | Trường..."
                    />
                  </div>



                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Số lượng tài liệu</label>
                    <input
                      type="number"
                      readOnly
                      min="0"
                      value={formData.document_count || 0}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-primary/50 text-sm bg-slate-100 dark:bg-slate-800 cursor-not-allowed"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Loại tài liệu</label>
                    <select
                      value={formData.type}
                      onChange={e => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                    >
                      {DOCUMENT_TYPES.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Ngôn ngữ</label>
                    <input
                      type="text"
                      value={formData.language}
                      onChange={e => setFormData({ ...formData, language: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5 md:col-span-1">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Học phần</label>
                    <CourseSelect
                      courses={courses}
                      value={formData.courseId}
                      onChange={(id) => setFormData({ ...formData, courseId: id })}
                      placeholder="Chọn học phần..."
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">URL Ảnh bìa</label>
                  <input
                    type="text"
                    value={formData.image_url}
                    onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Tóm tắt nội dung</label>
                  <textarea
                    rows={4}
                    value={formData.summary}
                    onChange={e => setFormData({ ...formData, summary: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 text-sm"
                    placeholder="Nhập tóm tắt..."
                  />
                </div>

                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-slate-200 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors font-medium"
                  >
                    Hủy bỏ
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-500/20"
                  >
                    {editingBook ? 'Cập nhật' : 'Thêm mới'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }
      {/* Chapter Modal */}
      {showChapterModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-card-dark rounded-xl w-full max-w-5xl h-[80vh] shadow-xl border border-slate-200 dark:border-slate-800 flex overflow-hidden">
            {/* Sidebar: List of Chapters */}
            <div className="w-1/3 border-r border-slate-200 dark:border-slate-700 flex flex-col bg-slate-50 dark:bg-slate-900/50">
              <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                <h3 className="font-bold text-lg dark:text-white truncate flex-1">Chương: {selectedBookForChapters?.title}</h3>
                <button
                  onClick={handleAddChapter}
                  className="p-1.5 bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                  title="Thêm chương mới"
                >
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex-1 overflow-y-auto p-2">
                {chapterLoading ? (
                  <div className="text-center py-4 text-slate-500">Đang tải...</div>
                ) : chapters.length === 0 ? (
                  <div className="text-center py-4 text-slate-500">Chưa có chương nào.</div>
                ) : (
                  chapters.map(ch => (
                    <div
                      key={ch.id}
                      onClick={() => handleSelectChapter(ch)}
                      className={`p-3 rounded-lg cursor-pointer mb-2 transition-colors ${selectedChapter?.id === ch.id ? 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 border' : 'hover:bg-slate-200 dark:hover:bg-slate-800 border border-transparent'}`}
                    >
                      <div className="font-medium text-sm text-slate-800 dark:text-slate-200">{ch.title}</div>
                      <div className="text-xs text-slate-500 truncate">{ch.content ? ch.content.substring(0, 50) + "..." : "No content"}</div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Main Content: Editor */}
            <div className="flex-1 flex flex-col relative">
              <button onClick={() => setShowChapterModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={24} />
              </button>

              <div className="p-6 h-full flex flex-col">
                {selectedChapter ? (
                  <>
                    <h3 className="text-xl font-bold mb-4 dark:text-white">
                      {selectedChapter.readOnly ? `Tài liệu ${selectedChapter.chapter_number}` : selectedChapter.id ? `Chỉnh sửa chương ${selectedChapter.chapter_number}` : 'Thêm chương mới'}
                    </h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Tiêu đề chương</label>
                        <input
                          type="text"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          value={chapterForm.title}
                          disabled={selectedChapter.readOnly}
                          onChange={e => setChapterForm({ ...chapterForm, title: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Số thứ tự</label>
                        <input
                          type="number"
                          className="w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white"
                          value={chapterForm.chapter_number}
                          disabled={selectedChapter.readOnly}
                          onChange={e => setChapterForm({ ...chapterForm, chapter_number: e.target.value })}
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Link Google Drive (Nếu có)</label>
                      <input
                        type="text"
                        className={`w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white text-sm ${chapterForm.content ? 'bg-slate-100 cursor-not-allowed opacity-60 dark:bg-slate-700' : ''}`}
                        placeholder="https://drive.google.com/file/d/..."
                        value={chapterForm.drive_link}
                        disabled={selectedChapter.readOnly || !!chapterForm.content}
                        onChange={e => setChapterForm({ ...chapterForm, drive_link: e.target.value })}
                      />
                    </div>

                    <div className="flex-1 mb-4 flex flex-col">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Nội dung</label>
                      <textarea
                        className={`flex-1 w-full px-3 py-2 border rounded-lg dark:bg-slate-800 dark:border-slate-700 dark:text-white font-mono text-sm resize-none ${chapterForm.drive_link ? 'bg-slate-100 cursor-not-allowed opacity-60 dark:bg-slate-700' : ''}`}
                        value={chapterForm.content}
                        disabled={selectedChapter.readOnly || !!chapterForm.drive_link}
                        onChange={e => setChapterForm({ ...chapterForm, content: e.target.value })}
                      ></textarea>
                    </div>

                    <div className="flex justify-between items-center pt-4 border-t border-slate-200 dark:border-slate-700">
                      {selectedChapter.id && !selectedChapter.readOnly ? (
                        <button
                          onClick={() => handleDeleteChapter(selectedChapter.id)}
                          className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors font-medium flex items-center gap-2"
                        >
                          <Trash2 size={18} /> Xóa chương
                        </button>
                      ) : (
                        <div></div>
                      )}
                      {selectedChapter.readOnly ? (
                        <a
                          href={chapterForm.drive_link}
                          target="_blank"
                          rel="noreferrer"
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-medium"
                        >
                          Mở tài liệu
                        </a>
                      ) : (
                        <button
                          onClick={handleSaveChapter}
                          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-500/20 font-medium"
                        >
                          Lưu thay đổi
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <BookOpen size={48} className="mb-4 opacity-50" />
                    <p>Chọn một chương bên trái để chỉnh sửa</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useEffect, useMemo, useState } from 'react';
import { FileText, Loader2, Search } from 'lucide-react';
import AdminBookService from '../../service/AdminBookService';
import { DOCUMENT_TYPES } from '../../constants/documentTypes';

export default function DocumentTypes() {
  const [documents, setDocuments] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        setLoading(true);
        const res = await AdminBookService.getAllBooks({ limit: 10000, _t: Date.now() });
        setDocuments(res?.documents || res?.books || res?.data || []);
      } catch (error) {
        console.error('Failed to fetch document type stats', error);
        setDocuments([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  const typeRows = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return DOCUMENT_TYPES
      .map((type) => ({
        name: type,
        count: documents.filter((document) => (document.type_raw || document.type) === type).length,
      }))
      .filter((type) => !keyword || type.name.toLowerCase().includes(keyword));
  }, [documents, search]);

  return (
    <div className="bg-white dark:bg-card-dark rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm relative">
      <div className="p-6 flex items-end justify-between gap-4 border-b border-slate-100 dark:border-slate-800/50">
        <div>
          <h2 className="text-xl font-semibold">Quản lý Loại tài liệu</h2>
          <p className="text-slate-500 dark:text-slate-400">Danh mục loại tài liệu theo enum hệ thống.</p>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900/50 p-4 rounded-lg border border-slate-200 dark:border-slate-800 mb-6 mx-4 mt-4">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            id="document-type-search"
            name="document-type-search"
            type="text"
            className="w-full pl-9 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-primary/50 outline-none"
            placeholder="Tìm loại tài liệu..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="p-4 pt-0">
        {loading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="animate-spin text-primary" size={24} />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {typeRows.map((type) => (
              <div key={type.name} className="border border-slate-200 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-800 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-indigo-500" />
                    <span className="font-medium text-slate-900 dark:text-white">{type.name}</span>
                  </div>
                  <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-slate-900 text-xs font-semibold text-slate-600 dark:text-slate-300">
                    {type.count} tài liệu
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

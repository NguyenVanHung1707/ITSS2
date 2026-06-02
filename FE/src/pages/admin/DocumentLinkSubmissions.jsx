import { useEffect, useState } from "react";
import { Check, ExternalLink, FilePlus, Loader2, X } from "lucide-react";
import { toast } from "react-toastify";
import axiosInstance from "@/config/Axios-config";

export default function DocumentLinkSubmissions() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [actionId, setActionId] = useState(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await axiosInstance.get("/documents/admin/link-submissions");
      setItems(res?.data || []);
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể tải danh sách chờ duyệt");
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleApprove = async (id) => {
    try {
      setActionId(id);
      await axiosInstance.put(`/documents/admin/link-submissions/${id}/approve`);
      toast.success("Đã duyệt tài liệu bổ sung");
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể duyệt tài liệu");
    } finally {
      setActionId(null);
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt("Lý do từ chối (không bắt buộc):") || "";
    try {
      setActionId(id);
      await axiosInstance.put(`/documents/admin/link-submissions/${id}/reject`, { reason });
      toast.success("Đã từ chối tài liệu bổ sung");
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      toast.error(error.response?.data?.message || "Không thể từ chối tài liệu");
    } finally {
      setActionId(null);
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-card-dark">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-bold dark:text-white">
            <FilePlus size={20} />
            Kiểm duyệt tài liệu bổ sung
          </h2>
          <p className="mt-1 text-sm text-slate-500">
            Duyệt các Google Drive link được người dùng gửi vào tài liệu có sẵn.
          </p>
        </div>
        <button
          onClick={fetchItems}
          className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
        >
          Tải lại
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase text-slate-500 dark:bg-slate-800/40 dark:text-slate-400">
            <tr>
              <th className="px-4 py-3">Tài liệu gốc</th>
              <th className="px-4 py-3">Link được gửi</th>
              <th className="px-4 py-3">Người gửi</th>
              <th className="px-4 py-3">Ngày gửi</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {loading ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                  <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
                  Đang tải...
                </td>
              </tr>
            ) : items.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-4 py-8 text-center text-slate-500">
                  Không có tài liệu bổ sung chờ duyệt
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr key={item.id}>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-900 dark:text-white">
                      {item.document?.title || `Document #${item.document_id}`}
                    </div>
                    <div className="text-xs text-slate-500">
                      {item.document?.faculty?.code || "HUST"} · {item.document?.course?.code || "Chung"}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-700 dark:text-slate-200">{item.title}</div>
                    <a
                      href={item.drive_link}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline"
                    >
                      Mở link <ExternalLink size={12} />
                    </a>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    <div>{item.uploader?.full_name || item.uploader?.name || "Người dùng"}</div>
                    <div className="text-xs text-slate-500">{item.uploader?.email || item.user_id}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 dark:text-slate-300">
                    {item.created_at ? new Date(item.created_at).toLocaleString("vi-VN") : ""}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleApprove(item.id)}
                        disabled={actionId === item.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-60"
                      >
                        <Check size={14} />
                        Duyệt
                      </button>
                      <button
                        onClick={() => handleReject(item.id)}
                        disabled={actionId === item.id}
                        className="inline-flex items-center gap-1 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700 disabled:opacity-60"
                      >
                        <X size={14} />
                        Từ chối
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

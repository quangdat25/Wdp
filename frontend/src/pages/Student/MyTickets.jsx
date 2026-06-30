import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showError, showSuccess, showConfirm } from "../../components/alert";
import {
  createTicket,
  deleteMyTicket,
  getCurrentRoom,
  getMyTickets,
} from "../../api/ticketService";
import { uploadImage } from "../../api/uploadImageService";

const ticketTypes = [
  { value: "Điện", label: "Điện" },
  { value: "Nước", label: "Nước" },
  { value: "Internet", label: "Internet" },
  { value: "Nội thất", label: "Nội thất" },
  { value: "Vệ sinh", label: "Vệ sinh" },
  { value: "An ninh", label: "An ninh" },
  { value: "Khác", label: "Khác" },
];

const typeLabels = {
  electricity: "Điện",
  water: "Nước",
  internet: "Internet",
  furniture: "Nội thất",
  cleaning: "Vệ sinh",
  security: "An ninh",
  other: "Khác",
  Điện: "Điện",
  Nước: "Nước",
  Internet: "Internet",
  "Nội thất": "Nội thất",
  "Vệ sinh": "Vệ sinh",
  "An ninh": "An ninh",
  Khác: "Khác",
};

const statusLabels = {
  pending: "Chờ duyệt",
  approved: "Đã duyệt",
  rejected: "Từ chối",
  assigned: "Đã phân công",
  in_progress: "Đang xử lý",
  completed: "Hoàn thành",
  cancelled: "Đã hủy",
};

const statusClasses = {
  pending: "bg-yellow-100 text-yellow-700",
  approved: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
  assigned: "bg-purple-100 text-purple-700",
  in_progress: "bg-orange-100 text-orange-700",
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-slate-100 text-slate-600",
};

function MyTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getMyTickets();
      setTickets(res.data.data || []);
    } catch (error) {
      showError(
        error.response?.data?.message || "Lỗi khi tải danh sách yêu cầu"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const filteredTickets = useMemo(() => {
    if (statusFilter === "all") return tickets;
    return tickets.filter((ticket) => ticket.status === statusFilter);
  }, [tickets, statusFilter]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [currentPage, filteredTickets, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));

    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, filteredTickets.length, pageSize]);

  const formatDate = (date) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleString("vi-VN");
  };

  const handleDeleteTicket = async (ticketId) => {
    const confirm = await showConfirm(
      "Bạn có chắc chắn muốn xóa yêu cầu này?",
      "Hành động này không thể hoàn tác."
    );

    if (!confirm) return;

    try {
      await deleteMyTicket(ticketId);
      showSuccess("Xóa yêu cầu thành công");
      setSelectedTicket(null);
      fetchTickets();
    } catch (error) {
      showError(error.response?.data?.message || "Xóa yêu cầu thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50">
      <Sidebar />

      <main className="ml-[270px] min-h-screen w-[calc(100%-270px)] px-7 py-6">
        <Header />

        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-6 shadow-sm backdrop-blur">
          <div>
            <h1 className="m-0 text-3xl font-extrabold text-blue-800">
              Yêu cầu hỗ trợ
            </h1>
            <p className="mt-2 text-slate-500">
              Theo dõi và tạo yêu cầu hỗ trợ ký túc xá.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsCreateModalOpen(true)}
            className="h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-blue-600"
          >
            + Tạo yêu cầu
          </button>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard title="Tất cả" value={tickets.length} />
          <SummaryCard
            title="Chờ duyệt"
            value={tickets.filter((item) => item.status === "pending").length}
          />
          <SummaryCard
            title="Đang xử lý"
            value={
              tickets.filter((item) =>
                ["approved", "assigned", "in_progress"].includes(item.status)
              ).length
            }
          />
          <SummaryCard
            title="Hoàn thành"
            value={tickets.filter((item) => item.status === "completed").length}
          />
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-slate-800">
              Danh sách yêu cầu
            </h2>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="h-11 rounded-2xl border border-slate-300 px-4 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="assigned">Đã phân công</option>
              <option value="in_progress">Đang xử lý</option>
              <option value="completed">Hoàn thành</option>
              <option value="rejected">Từ chối</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px] overflow-hidden rounded-2xl bg-white text-left">
              <thead>
                <tr className="bg-slate-50 text-sm text-slate-600">
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Tòa / Phòng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người xử lý</TableHead>
                  <TableHead>Ngày gửi</TableHead>
                  <TableHead>Chi tiết</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Chưa có yêu cầu hỗ trợ nào
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-slate-800">
                        {ticket.title}
                      </TableCell>

                      <TableCell>
                        {typeLabels[ticket.type] || ticket.type}
                      </TableCell>

                      <TableCell>
                        {ticket.buildingName || "Chưa có"} - Phòng{" "}
                        {ticket.roomNumber || "Chưa có"}
                      </TableCell>

                      <TableCell>
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${
                            statusClasses[ticket.status] ||
                            "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {statusLabels[ticket.status] || ticket.status}
                        </span>
                      </TableCell>

                      <TableCell>
                        {ticket.assignedTo?.fullName ||
                          ticket.assignedTo?.username ||
                          "Chưa phân công"}
                      </TableCell>

                      <TableCell>{formatDate(ticket.createdAt)}</TableCell>

                      <TableCell>
                        <button
                          type="button"
                          onClick={() => setSelectedTicket(ticket)}
                          className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white shadow-md shadow-blue-500/20 hover:bg-blue-700"
                        >
                          Xem
                        </button>
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-center">
            <Pagination
              current={currentPage}
              total={filteredTickets.length}
              pageSize={pageSize}
              showSizeChanger
              pageSizeOptions={["5", "10", "20", "50"]}
              onChange={(page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              }}
            />
          </div>
        </section>
      </main>

      {isCreateModalOpen && (
        <CreateTicketModal
          onClose={() => setIsCreateModalOpen(false)}
          onCreated={() => {
            setIsCreateModalOpen(false);
            fetchTickets();
          }}
        />
      )}

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          onClose={() => setSelectedTicket(null)}
          onDelete={handleDeleteTicket}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

function CreateTicketModal({ onClose, onCreated }) {
  const [currentRoom, setCurrentRoom] = useState({
    buildingName: "",
    roomNumber: "",
  });

  const [formData, setFormData] = useState({
    title: "",
    type: "",
    description: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [roomLoading, setRoomLoading] = useState(true);
  const [canCreateTicket, setCanCreateTicket] = useState(false);

  const previewImage = useMemo(() => {
    if (!imageFile) return "";
    return URL.createObjectURL(imageFile);
  }, [imageFile]);

  useEffect(() => {
    const fetchCurrentRoom = async () => {
      try {
        setRoomLoading(true);

        const res = await getCurrentRoom();
        const roomData = res.data.data;

        setCurrentRoom({
          buildingName: roomData.buildingName || "",
          roomNumber: roomData.roomNumber || "",
        });

        setCanCreateTicket(true);
      } catch (error) {
        setCanCreateTicket(false);
        showError(
          error.response?.data?.message ||
            "Không lấy được thông tin phòng hiện tại"
        );
      } finally {
        setRoomLoading(false);
      }
    };

    fetchCurrentRoom();
  }, []);

  useEffect(() => {
    return () => {
      if (previewImage) URL.revokeObjectURL(previewImage);
    };
  }, [previewImage]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("Chỉ được chọn file ảnh");
      e.target.value = "";
      return;
    }

    setImageFile(file);
    e.target.value = "";
  };

  const resetForm = () => {
    setFormData({
      title: "",
      type: "",
      description: "",
    });
    setImageFile(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!canCreateTicket) {
      showError("Chỉ sinh viên đang ở ký túc xá mới được gửi yêu cầu hỗ trợ");
      return;
    }

    if (!formData.title || !formData.type || !formData.description) {
      showError("Vui lòng nhập đầy đủ thông tin bắt buộc");
      return;
    }

    try {
      setLoading(true);

      let imageUrl = "";

      if (imageFile) {
        const imageData = new FormData();
        imageData.append("image", imageFile);

        const uploadRes = await uploadImage(imageData);
        imageUrl = uploadRes.data.url;
      }

      await createTicket({
        title: formData.title,
        type: formData.type,
        description: formData.description,
        image: imageUrl,
      });

      showSuccess("Gửi yêu cầu hỗ trợ thành công");
      resetForm();
      onCreated();
    } catch (error) {
      showError(error.response?.data?.message || "Gửi yêu cầu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 p-5">
      <div className="w-[820px] max-w-full overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Tạo yêu cầu hỗ trợ
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Tòa nhà và phòng sẽ được lấy tự động theo booking hiện tại.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
            <div
              className={`mb-5 rounded-2xl border px-4 py-4 text-sm font-semibold ${
                canCreateTicket
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-red-200 bg-red-50 text-red-700"
              }`}
            >
              {roomLoading
                ? "Đang kiểm tra thông tin phòng hiện tại..."
                : canCreateTicket
                ? "Thông tin tòa nhà và phòng được lấy tự động từ booking hiện tại."
                : "Bạn chưa có booking đang ở ký túc xá nên chưa thể gửi yêu cầu hỗ trợ."}
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Tòa nhà
                </label>
                <input
                  value={roomLoading ? "Đang tải..." : currentRoom.buildingName}
                  disabled
                  className="h-12 w-full cursor-not-allowed rounded-2xl border border-slate-300 bg-slate-100 px-4 font-semibold text-slate-600 outline-none"
                />
              </div>

              <div>
                <label className="mb-2 block font-bold text-slate-700">
                  Phòng
                </label>
                <input
                  value={roomLoading ? "Đang tải..." : currentRoom.roomNumber}
                  disabled
                  className="h-12 w-full cursor-not-allowed rounded-2xl border border-slate-300 bg-slate-100 px-4 font-semibold text-slate-600 outline-none"
                />
              </div>
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-bold text-slate-700">
                Tiêu đề <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                value={formData.title}
                onChange={handleChange}
                disabled={!canCreateTicket || roomLoading}
                placeholder="Ví dụ: Bóng đèn phòng bị hỏng"
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-bold text-slate-700">
                Loại yêu cầu <span className="text-red-500">*</span>
              </label>
              <select
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={!canCreateTicket || roomLoading}
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              >
                <option value="">Chọn loại yêu cầu</option>
                {ticketTypes.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-bold text-slate-700">
                Mô tả chi tiết <span className="text-red-500">*</span>
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!canCreateTicket || roomLoading}
                rows={5}
                placeholder="Mô tả rõ vấn đề cần hỗ trợ..."
                className="w-full resize-none rounded-2xl border border-slate-300 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
              />
            </div>

            <div className="mt-5">
              <label className="mb-2 block font-bold text-slate-700">
                Ảnh minh họa
              </label>

              <label
                className={`flex min-h-[135px] flex-col items-center justify-center rounded-3xl border-2 border-dashed px-5 py-6 text-center transition ${
                  canCreateTicket && !roomLoading
                    ? "cursor-pointer border-slate-300 bg-slate-50 hover:border-blue-400 hover:bg-blue-50/40"
                    : "cursor-not-allowed border-slate-200 bg-slate-100 opacity-70"
                }`}
              >
                <div className="text-base font-extrabold text-slate-800">
                  Chọn 1 ảnh từ máy
                </div>
                <div className="mt-2 text-sm text-slate-500">
                  Hỗ trợ JPG, PNG, JPEG
                </div>
                <div className="mt-4 rounded-2xl bg-blue-600 px-5 py-2 text-sm font-bold text-white shadow-lg shadow-blue-500/20">
                  Chọn file
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  disabled={!canCreateTicket || roomLoading}
                  className="hidden"
                />
              </label>

              {previewImage && (
                <div className="mt-4 w-full max-w-xs overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="relative">
                    <img
                      src={previewImage}
                      alt={imageFile?.name}
                      className="h-48 w-full object-cover"
                    />

                    <button
                      type="button"
                      onClick={() => setImageFile(null)}
                      className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-slate-900/75 text-lg font-bold text-white hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>

                  <div className="truncate px-3 py-2 text-xs font-semibold text-slate-600">
                    {imageFile?.name}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
            <button
              type="button"
              onClick={resetForm}
              disabled={loading || !canCreateTicket || roomLoading}
              className="h-11 rounded-2xl border border-slate-300 bg-white px-5 font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Làm mới
            </button>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="h-11 rounded-2xl bg-slate-100 px-5 font-bold text-slate-700 hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Hủy
            </button>

            <button
              type="submit"
              disabled={loading || !canCreateTicket || roomLoading}
              className="h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-6 font-bold text-white shadow-lg shadow-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Đang gửi..." : "Gửi yêu cầu"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function TicketDetailModal({ ticket, onClose, onDelete, formatDate }) {
  const canDelete = ["pending", "rejected", "cancelled"].includes(ticket.status);

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 p-5">
      <div className="w-[760px] max-w-full overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Chi tiết yêu cầu
            </h2>
            <p className="mt-1 text-sm text-slate-500">{ticket.title}</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-xl font-bold text-slate-600 hover:bg-red-100 hover:text-red-600"
          >
            ×
          </button>
        </div>

        <div className="max-h-[72vh] overflow-y-auto px-6 py-5">
          {ticket.image ? (
            <img
              src={ticket.image}
              alt={ticket.title}
              className="mb-5 h-[260px] w-full rounded-3xl object-cover"
            />
          ) : (
            <div className="mb-5 flex h-[180px] items-center justify-center rounded-3xl bg-slate-100 text-slate-500">
              Không có ảnh minh họa
            </div>
          )}

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <DetailBox
              label="Loại yêu cầu"
              value={typeLabels[ticket.type] || ticket.type}
            />
            <DetailBox label="Trạng thái" value={statusLabels[ticket.status]} />
            <DetailBox label="Tòa nhà" value={ticket.buildingName} />
            <DetailBox label="Phòng" value={ticket.roomNumber} />
            <DetailBox label="Ngày gửi" value={formatDate(ticket.createdAt)} />
            <DetailBox
              label="Người xử lý"
              value={
                ticket.assignedTo?.fullName ||
                ticket.assignedTo?.username ||
                "Chưa phân công"
              }
            />
          </div>

          <div className="mt-5 rounded-3xl bg-slate-50 p-5">
            <h3 className="mb-2 font-extrabold text-slate-800">Mô tả</h3>
            <p className="whitespace-pre-wrap text-slate-700">
              {ticket.description}
            </p>
          </div>

          {ticket.rejectedReason && (
            <div className="mt-5 rounded-3xl bg-red-50 p-5">
              <h3 className="mb-2 font-extrabold text-red-700">
                Lý do từ chối
              </h3>
              <p className="text-red-700">{ticket.rejectedReason}</p>
            </div>
          )}

          {ticket.resolution && (
            <div className="mt-5 rounded-3xl bg-green-50 p-5">
              <h3 className="mb-2 font-extrabold text-green-700">
                Kết quả xử lý
              </h3>
              <p className="text-green-700">{ticket.resolution}</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
          {canDelete && (
            <button
              type="button"
              onClick={() => onDelete(ticket._id)}
              className="h-11 rounded-2xl bg-red-600 px-5 font-bold text-white hover:bg-red-700"
            >
              Xóa yêu cầu
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="h-11 rounded-2xl bg-slate-900 px-5 font-bold text-white hover:bg-slate-800"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
      <div className="font-bold text-slate-500">{title}</div>
      <div className="mt-2 text-3xl font-extrabold text-slate-800">{value}</div>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="text-sm font-bold text-slate-500">{label}</div>
      <div className="mt-1 font-extrabold text-slate-800">
        {value || "Chưa có"}
      </div>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="border-b border-slate-200 px-4 py-4 font-extrabold">
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }) {
  return (
    <td
      className={`border-b border-slate-100 px-4 py-4 text-slate-600 ${className}`}
    >
      {children}
    </td>
  );
}

export default MyTickets;

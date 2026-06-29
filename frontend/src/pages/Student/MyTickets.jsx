import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import { showError, showSuccess, showConfirm } from "../../components/alert";
import { deleteMyTicket, getMyTickets } from "../../api/ticketService";
import Header from "../../components/Headers";
const typeLabels = {
  electricity: "Điện",
  water: "Nước",
  internet: "Internet",
  furniture: "Nội thất",
  cleaning: "Vệ sinh",
  security: "An ninh",
  other: "Khác",
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

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getMyTickets();
      setTickets(res.data.data || []);
    } catch (error) {
      showError(
        error.response?.data?.message || "Lỗi khi tải danh sách yêu cầu",
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

  const formatDate = (date) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleString("vi-VN");
  };

  const handleDeleteTicket = async (ticketId) => {
    if (
      !(await showConfirm(
        "Bạn có chắc chắn muốn xóa yêu cầu này?",
        "Hành động này không thể hoàn tác.",
      ))
    ) {
      return;
    }

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
        <Header/>
        <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-6 shadow-sm backdrop-blur">
          <h1 className="m-0 text-3xl font-extrabold text-blue-800">
            Yêu cầu hỗ trợ
          </h1>
          <p className="mt-2 text-slate-500">
            Theo dõi các yêu cầu hỗ trợ bạn đã gửi.
          </p>
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
                ["approved", "assigned", "in_progress"].includes(item.status),
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
                  filteredTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-slate-800">
                        {ticket.title}
                      </TableCell>

                      <TableCell>
                        {typeLabels[ticket.type] || ticket.type}
                      </TableCell>

                      <TableCell>
                        {ticket.buildingName} - Phòng {ticket.roomNumber}
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
        </section>
      </main>

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

function TicketDetailModal({ ticket, onClose, onDelete, formatDate }) {
  const canDelete = ["pending", "rejected", "cancelled"].includes(
    ticket.status,
  );

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
            <DetailBox label="Loại yêu cầu" value={typeLabels[ticket.type]} />
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

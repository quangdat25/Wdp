import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import {
  getAllTicketsForManagement,
  getStaffList,
  approveTicket,
  rejectTicket,
  assignTicket,
} from "../../api/ticketManagementService";
import { showSuccess, showError, showConfirm } from "../../components/Alert";
import Sidebar from "../../components/Sidebar";
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

function TicketManagement() {
  const [tickets, setTickets] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [rejectReason, setRejectReason] = useState("");
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [loading, setLoading] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const res = await getAllTicketsForManagement();
      setTickets(res.data.data || []);
    } catch (error) {
      showError(
        error.response?.data?.message || "Lỗi khi lấy danh sách yêu cầu",
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchStaffList = async () => {
    try {
      const res = await getStaffList();
      setStaffList(res.data.data || []);
    } catch (error) {
      showError(
        error.response?.data?.message || "Lỗi khi lấy danh sách nhân viên",
      );
    }
  };

  useEffect(() => {
    fetchTickets();
    fetchStaffList();
  }, []);

  const filteredTickets = useMemo(() => {
    if (statusFilter === "all") return tickets;
    return tickets.filter((ticket) => ticket.status === statusFilter);
  }, [tickets, statusFilter]);

  const paginatedTickets = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredTickets.length / pageSize),
    );
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, filteredTickets.length, pageSize]);

  const formatDate = (date) => {
    if (!date) return "Chưa có";
    return new Date(date).toLocaleString("vi-VN");
  };

  const closeModal = () => {
    setSelectedTicket(null);
    setRejectReason("");
    setSelectedStaffId("");
  };

  const handleApprove = async (ticketId) => {
    const confirm = await showConfirm(
      "Duyệt yêu cầu?",
      "Yêu cầu này sẽ được chuyển sang trạng thái đã duyệt.",
      "Duyệt",
    );

    if (!confirm) return;

    try {
      await approveTicket(ticketId);
      showSuccess("Duyệt yêu cầu thành công");
      closeModal();
      fetchTickets();
    } catch (error) {
      showError(error.response?.data?.message || "Duyệt yêu cầu thất bại");
    }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) {
      showError("Vui lòng nhập lý do từ chối yêu cầu");
      return;
    }

    try {
      await rejectTicket(selectedTicket._id, rejectReason);
      showSuccess("Từ chối yêu cầu thành công");
      closeModal();
      fetchTickets();
    } catch (error) {
      showError(error.response?.data?.message || "Từ chối yêu cầu thất bại");
    }
  };

  const handleAssign = async () => {
    if (!selectedStaffId) {
      showError("Vui lòng chọn nhân viên xử lý");
      return;
    }

    try {
      await assignTicket(selectedTicket._id, selectedStaffId);
      showSuccess("Giao việc thành công");
      closeModal();
      fetchTickets();
    } catch (error) {
      showError(error.response?.data?.message || "Giao việc thất bại");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50">
      <Sidebar />

      <main className="ml-[270px] min-h-screen w-[calc(100%-270px)] px-7 py-6">
        <Header />

        <div className="h-6" />

        <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-6 shadow-sm backdrop-blur">
          <h1 className="m-0 text-3xl font-extrabold text-blue-800">
            Quản lý yêu cầu hỗ trợ
          </h1>
          <p className="mt-2 text-slate-500">
            Duyệt yêu cầu, phân công nhân viên và theo dõi tiến độ xử lý ticket.
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
            <div>
              <h2 className="text-xl font-extrabold text-slate-800">
                Danh sách yêu cầu
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                {loading
                  ? "Đang tải dữ liệu..."
                  : `Hiển thị ${filteredTickets.length} yêu cầu`}
              </p>
            </div>

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
            <table className="w-full min-w-[1150px] overflow-hidden rounded-2xl bg-white text-left">
              <thead>
                <tr className="bg-slate-50 text-sm text-slate-600">
                  <TableHead>Sinh viên</TableHead>
                  <TableHead>Tiêu đề</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Tòa / Phòng</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Người xử lý</TableHead>
                  <TableHead>Chi tiết</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Chưa có yêu cầu hỗ trợ nào
                    </td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => (
                    <tr key={ticket._id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="font-bold text-slate-800">
                          {ticket.studentId?.fullName || "Không rõ"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {ticket.studentId?.studentCode || "Không có mã SV"}
                        </div>
                      </TableCell>

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
                          className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${statusClasses[ticket.status] ||
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
                      <TableCell>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedTicket(ticket);
                            setRejectReason("");
                            setSelectedStaffId(ticket.assignedTo?._id || "");
                          }}
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

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginTop: 20,
            }}
          >
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

      {selectedTicket && (
        <TicketDetailModal
          ticket={selectedTicket}
          staffList={staffList}
          rejectReason={rejectReason}
          selectedStaffId={selectedStaffId}
          setRejectReason={setRejectReason}
          setSelectedStaffId={setSelectedStaffId}
          onApprove={handleApprove}
          onReject={handleReject}
          onAssign={handleAssign}
          onClose={closeModal}
          formatDate={formatDate}
        />
      )}
    </div>
  );
}

function TicketDetailModal({
  ticket,
  staffList,
  rejectReason,
  selectedStaffId,
  setRejectReason,
  setSelectedStaffId,
  onApprove,
  onReject,
  onAssign,
  onClose,
  formatDate,
}) {
  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-slate-900/50 p-5">
      <div className="w-[780px] max-w-full overflow-hidden rounded-[28px] bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-6 py-5">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">
              Chi tiết yêu cầu
            </h2>
            <p className="mt-1 text-sm text-slate-500">{ticket.title}</p>
          </div>
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
              label="Sinh viên"
              value={ticket.studentId?.fullName || "Không rõ"}
            />
            <DetailBox
              label="Mã sinh viên"
              value={ticket.studentId?.studentCode || "Chưa có"}
            />
            <DetailBox
              label="Loại yêu cầu"
              value={typeLabels[ticket.type] || ticket.type}
            />
            <DetailBox
              label="Trạng thái"
              value={statusLabels[ticket.status] || ticket.status}
            />
            <DetailBox label="Tòa nhà" value={ticket.buildingName} />
            <DetailBox label="Phòng" value={ticket.roomNumber} />
            <DetailBox label="Ngày gửi" value={formatDate(ticket.createdAt)} />
            <DetailBox
              label="Thời gian hoàn thành"
              value={formatDate(ticket.completedAt)}
            />
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
              {ticket.description || "Không có mô tả"}
            </p>
          </div>

          {ticket.damageReported && ticket.damageReported.description && (
            <div className="mt-5 rounded-3xl bg-amber-50 border border-amber-200 p-5">
              <h3 className="mb-2 font-extrabold text-amber-800">
                Sự cố hỏng hóc do nhân viên báo cáo
              </h3>
              <p className="text-sm font-semibold text-amber-700">
                Mức độ nghiêm trọng:{" "}
                <span className="font-extrabold">
                  {ticket.damageReported.severity === "HIGH"
                    ? "Nghiêm trọng"
                    : ticket.damageReported.severity === "LOW"
                      ? "Thấp"
                      : "Trung bình"}
                </span>
              </p>
              <p className="mt-2 text-slate-700 whitespace-pre-wrap">
                {ticket.damageReported.description}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                Báo cáo bởi:{" "}
                <strong>
                  {ticket.damageReported.reportedBy?.fullName ||
                    ticket.damageReported.reportedBy?.username ||
                    "Nhân viên dọn dẹp"}
                </strong>{" "}
                vào {ticket.damageReported.date}
              </p>
            </div>
          )}

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

          {ticket.status === "pending" && (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 font-extrabold text-slate-800">
                Xử lý yêu cầu
              </h3>

              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="Nhập lý do nếu muốn từ chối yêu cầu..."
                className="min-h-[100px] w-full resize-y rounded-2xl border border-slate-300 p-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <div className="mt-4 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  onClick={() => onApprove(ticket._id)}
                  className="h-11 rounded-2xl bg-green-600 px-5 font-bold text-white hover:bg-green-700"
                >
                  Duyệt yêu cầu
                </button>

                <button
                  type="button"
                  onClick={onReject}
                  className="h-11 rounded-2xl bg-red-600 px-5 font-bold text-white hover:bg-red-700"
                >
                  Từ chối
                </button>
              </div>
            </div>
          )}

          {ticket.status === "approved" && (
            <div className="mt-5 rounded-3xl border border-slate-200 bg-white p-5">
              <h3 className="mb-3 font-extrabold text-slate-800">
                Phân công nhân viên
              </h3>

              <select
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              >
                <option value="">-- Chọn nhân viên xử lý --</option>
                {staffList.map((staff) => (
                  <option key={staff._id} value={staff._id}>
                    {staff.fullName || staff.username} -{" "}
                    {staff.staffType || "Chưa có loại"}
                  </option>
                ))}
              </select>

              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onAssign}
                  className="h-11 rounded-2xl bg-purple-600 px-5 font-bold text-white hover:bg-purple-700"
                >
                  Giao việc
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 border-t border-slate-100 px-6 py-4">
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

export default TicketManagement;

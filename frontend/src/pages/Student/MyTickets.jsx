import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPlus,
  FaInbox,
  FaHourglassHalf,
  FaCog,
  FaCheckCircle,
  FaPhone,
  FaHeadset,
  FaExclamationTriangle,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showError, showSuccess, showConfirm } from "../../components/alert";
import { deleteMyTicket, getMyTickets } from "../../api/ticketService";
import "./MyTickets.css";

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

const badgeClass = {
  pending: "badge-pending",
  approved: "badge-approved",
  rejected: "badge-rejected",
  assigned: "badge-assigned",
  in_progress: "badge-in_progress",
  completed: "badge-completed",
  cancelled: "badge-cancelled",
};

function MyTickets() {
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [pageSize, setPageSize] = useState(5);
  const [currentPage, setCurrentPage] = useState(1);

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

  // Reset về trang 1 khi thay đổi filter hoặc page size
  useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter, typeFilter, pageSize]);

  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const statusMatch = statusFilter === "all" || ticket.status === statusFilter;
      const typeMatch = typeFilter === "all" || ticket.type === typeFilter;
      return statusMatch && typeMatch;
    });
  }, [tickets, statusFilter, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / pageSize));
  const safePage = Math.min(currentPage, totalPages);

  const paginatedTickets = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return filteredTickets.slice(start, start + pageSize);
  }, [filteredTickets, safePage, pageSize]);

  const startItem = filteredTickets.length === 0 ? 0 : (safePage - 1) * pageSize + 1;
  const endItem = Math.min(safePage * pageSize, filteredTickets.length);

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

  const countByStatus = (statuses) =>
    tickets.filter((t) => statuses.includes(t.status)).length;

  return (
    <div className="my-tickets-shell">
      <Sidebar />

      <main className="my-tickets-main">
        <Header />

        {/* Page Header */}
        <div className="mt-page-header">
          <div>
            <h2>Yêu cầu hỗ trợ</h2>
            <p>Theo dõi các yêu cầu hỗ trợ bạn đã gửi.</p>
          </div>
          <button
            className="mt-create-btn"
            onClick={() => navigate("/student/support/request")}
          >
            <FaPlus />
            Tạo yêu cầu mới
          </button>
        </div>

        {/* Summary Cards */}
        <section className="mt-summary-grid">
          <SummaryCard icon={<FaInbox />} iconClass="icon-default" label="Tất cả" value={tickets.length} />
          <SummaryCard icon={<FaHourglassHalf />} iconClass="icon-pending" label="Chờ duyệt" value={countByStatus(["pending"])} />
          <SummaryCard icon={<FaCog />} iconClass="icon-progress" label="Đang xử lý" value={countByStatus(["approved", "assigned", "in_progress"])} />
          <SummaryCard icon={<FaCheckCircle />} iconClass="icon-done" label="Hoàn thành" value={countByStatus(["completed"])} />
        </section>

        {/* Main Table */}
        <div className="mt-table-container">
          {/* Controls */}
          <div className="mt-table-controls">
            <div className="mt-controls-left">
              {/* Status filter */}
              <div className="mt-select-wrapper">
                <select
                  className="mt-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
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
                <span className="mt-select-arrow">▾</span>
              </div>
              {/* Type filter */}
              <div className="mt-select-wrapper">
                <select
                  className="mt-select"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="all">Tất cả loại yêu cầu</option>
                  {Object.entries(typeLabels).map(([key, val]) => (
                    <option key={key} value={key}>{val}</option>
                  ))}
                </select>
                <span className="mt-select-arrow">▾</span>
              </div>
              {/* Page size selector */}
              <div className="mt-select-wrapper">
                <select
                  className="mt-select"
                  value={pageSize}
                  onChange={(e) => setPageSize(Number(e.target.value))}
                >
                  <option value={5}>5 / trang</option>
                  <option value={10}>10 / trang</option>
                </select>
                <span className="mt-select-arrow">▾</span>
              </div>
            </div>
            <div className="mt-controls-info">
              Hiển thị{" "}
              <strong>{filteredTickets.length}</strong>{" "}
              / <strong>{tickets.length}</strong> yêu cầu
            </div>
          </div>

          {/* Table */}
          <div className="mt-table-scroll">
            <table className="mt-table">
              <thead>
                <tr>
                  <th>Tiêu đề</th>
                  <th>Loại</th>
                  <th>Tòa / Phòng</th>
                  <th>Trạng thái</th>
                  <th>Người xử lý</th>
                  <th>Ngày gửi</th>
                  <th style={{ textAlign: "center" }}>Chi tiết</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="mt-loading">Đang tải dữ liệu...</td>
                  </tr>
                ) : filteredTickets.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="mt-empty">Chưa có yêu cầu hỗ trợ nào</td>
                  </tr>
                ) : (
                  paginatedTickets.map((ticket) => (
                    <tr key={ticket._id}>
                      <td className="mt-td-title">{ticket.title}</td>
                      <td>{typeLabels[ticket.type] || ticket.type}</td>
                      <td>
                        <span className="mt-room-tag">
                          {ticket.buildingName} - {ticket.roomNumber}
                        </span>
                      </td>
                      <td>
                        <span className={`mt-badge ${badgeClass[ticket.status] || "badge-cancelled"}`}>
                          {statusLabels[ticket.status] || ticket.status}
                        </span>
                      </td>
                      <td>
                        {ticket.assignedTo?.fullName ||
                          ticket.assignedTo?.username || (
                            <span style={{ fontStyle: "italic", color: "#999" }}>Đang cập nhật...</span>
                          )}
                      </td>
                      <td>{formatDate(ticket.createdAt)}</td>
                      <td style={{ textAlign: "center" }}>
                        <button
                          type="button"
                          className="mt-view-btn"
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          Xem
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Table Footer – info + pagination */}
          <div className="mt-table-footer">
            <p>
              Đang xem <strong>{startItem}</strong> – <strong>{endItem}</strong>{" "}
              trên tổng số <strong>{filteredTickets.length}</strong> yêu cầu
            </p>
            <div className="mt-pagination">
              <button
                type="button"
                className="mt-pagination-btn"
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={safePage === 1}
              >
                <FaChevronLeft />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  type="button"
                  className={`mt-pagination-btn ${page === safePage ? "active" : ""}`}
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                className="mt-pagination-btn"
                onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                disabled={safePage === totalPages}
              >
                <FaChevronRight />
              </button>
            </div>
          </div>
        </div>

        {/* Bento Info Section */}
        <div className="mt-bento">
          <div className="mt-bento-alert">
            <div style={{ maxWidth: "420px" }}>
              <h4>Bạn cần hỗ trợ khẩn cấp?</h4>
              <p>
                Nếu có vấn đề nghiêm trọng liên quan đến an ninh hoặc hỏa
                hoạn, vui lòng liên hệ ngay với đường dây nóng của ban quản
                lý tòa nhà.
              </p>
              <div className="mt-bento-contact-row">
                <span><FaPhone style={{ marginRight: 6 }} />1900 6000</span>
                <span><FaHeadset style={{ marginRight: 6 }} />Kỹ thuật 24/7</span>
              </div>
            </div>
            <div className="mt-bento-alert-icon"><FaExclamationTriangle /></div>
          </div>

          <div className="mt-bento-guide">
            <h4>Hướng dẫn quy trình</h4>
            <ul className="mt-bento-steps">
              <li className="mt-bento-step">
                <span className="mt-step-num">1</span>
                Tạo yêu cầu và mô tả chi tiết lỗi
              </li>
              <li className="mt-bento-step">
                <span className="mt-step-num">2</span>
                Ban quản lý duyệt và phân công nhân sự
              </li>
              <li className="mt-bento-step">
                <span className="mt-step-num">3</span>
                Đánh giá mức độ hài lòng sau khi hoàn thành
              </li>
            </ul>
          </div>
        </div>
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

function SummaryCard({ icon, iconClass, label, value }) {
  return (
    <div className="mt-summary-card">
      <div className="mt-summary-card-top">
        <span className={`mt-summary-icon ${iconClass}`}>{icon}</span>
      </div>
      <p>{label}</p>
      <h3>{String(value).padStart(2, "0")}</h3>
    </div>
  );
}

function TicketDetailModal({ ticket, onClose, onDelete, formatDate }) {
  const canDelete = ["pending", "rejected", "cancelled"].includes(ticket.status);

  return (
    <div className="mt-modal-overlay" onClick={onClose}>
      <div className="mt-modal" onClick={(e) => e.stopPropagation()}>
        <div className="mt-modal-header">
          <div>
            <h2>Chi tiết yêu cầu</h2>
            <p>{ticket.title}</p>
          </div>
          <button type="button" className="mt-modal-close" onClick={onClose}>×</button>
        </div>

        <div className="mt-modal-body">
          {ticket.image ? (
            <img src={ticket.image} alt={ticket.title} className="mt-modal-img" />
          ) : (
            <div className="mt-modal-no-img">Không có ảnh minh họa</div>
          )}

          <div className="mt-modal-detail-grid">
            <DetailBox label="Loại yêu cầu" value={typeLabels[ticket.type]} />
            <DetailBox label="Trạng thái" value={statusLabels[ticket.status]} />
            <DetailBox label="Tòa nhà" value={ticket.buildingName} />
            <DetailBox label="Phòng" value={ticket.roomNumber} />
            <DetailBox label="Ngày gửi" value={formatDate(ticket.createdAt)} />
            <DetailBox
              label="Người xử lý"
              value={ticket.assignedTo?.fullName || ticket.assignedTo?.username || "Chưa phân công"}
            />
          </div>

          <div className="mt-modal-desc">
            <h3>Mô tả</h3>
            <p>{ticket.description}</p>
          </div>

          {ticket.rejectedReason && (
            <div className="mt-modal-rejected">
              <h3>Lý do từ chối</h3>
              <p>{ticket.rejectedReason}</p>
            </div>
          )}

          {ticket.resolution && (
            <div className="mt-modal-resolved">
              <h3>Kết quả xử lý</h3>
              <p>{ticket.resolution}</p>
            </div>
          )}
        </div>

        <div className="mt-modal-footer">
          {canDelete && (
            <button type="button" className="mt-modal-delete-btn" onClick={() => onDelete(ticket._id)}>
              Xóa yêu cầu
            </button>
          )}
          <button type="button" className="mt-modal-close-btn" onClick={onClose}>Đóng</button>
        </div>
      </div>
    </div>
  );
}

function DetailBox({ label, value }) {
  return (
    <div className="mt-detail-box">
      <div className="label">{label}</div>
      <div className="value">{value || "Chưa có"}</div>
    </div>
  );
}

export default MyTickets;
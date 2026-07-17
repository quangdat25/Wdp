import { useState, useEffect } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { getStudentInvoices } from "../../api/parentService";
import "./ParentDashboard.css";

function ParentPayments() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const res = await getStudentInvoices();
        if (res.success) {
          setInvoices(res.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải hóa đơn:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "paid":
        return <span className="status-badge status-paid">Đã thanh toán</span>;
      case "unpaid":
        return <span className="status-badge status-unpaid">Chưa thanh toán</span>;
      case "overdue":
        return <span className="status-badge status-overdue">Quá hạn</span>;
      case "cancelled":
        return <span className="status-badge status-cancelled">Đã hủy</span>;
      default:
        return <span className="status-badge">{status}</span>;
    }
  };

  return (
    <div className="parent-shell">
      <Sidebar />
      <main className="parent-main">
        <Header avatarText="P" />
        <div className="parent-stack">
          <div className="parent-panel">
            <div className="parent-panel__header">
              <div>
                <h3>Lịch sử thanh toán</h3>
                <p>Danh sách các hóa đơn tiền phòng và điện nước của con</p>
              </div>
            </div>

            <div className="invoice-table-container">
              {loading ? (
                <p>Đang tải dữ liệu...</p>
              ) : invoices.length === 0 ? (
                <p>Không có hóa đơn nào.</p>
              ) : (
                <table className="invoice-table">
                  <thead>
                    <tr>
                      <th>Mã Hóa Đơn</th>
                      <th>Loại</th>
                      <th>Học Kỳ/Tháng</th>
                      <th>Số Tiền</th>
                      <th>Trạng Thái</th>
                      <th>Hạn Đóng</th>
                      <th>Hành Động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv._id}>
                        <td>{inv.invoiceCode}</td>
                        <td>{inv.type === "room_fee" ? "Tiền phòng" : "Điện nước"}</td>
                        <td>
                          {inv.type === "utility"
                            ? `Tháng ${inv.billingMonth}/${inv.semester}`
                            : inv.semester}
                        </td>
                        <td style={{ color: "var(--amber-600)" }}>
                          <div style={{ fontWeight: "bold" }}>{formatCurrency(inv.amount)}</div>
                        </td>
                        <td>{getStatusBadge(inv.status)}</td>
                        <td>
                          {inv.dueDate
                            ? new Date(inv.dueDate).toLocaleDateString("vi-VN")
                            : "N/A"}
                        </td>
                        <td>
                          <button
                            className="parent-btn-detail"
                            onClick={() => setSelectedInvoice(inv)}
                          >
                            Chi tiết
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>

      {selectedInvoice && (
        <div className="parent-modal-overlay" onClick={() => setSelectedInvoice(null)}>
          <div className="parent-modal" onClick={(e) => e.stopPropagation()}>
            <div className="parent-modal__header">
              <h3>Chi tiết hóa đơn</h3>
              <button className="parent-modal__close" onClick={() => setSelectedInvoice(null)}>&times;</button>
            </div>
            <div className="parent-modal__body">
              <div className="parent-modal__row">
                <span className="parent-modal__label">Mã hóa đơn:</span>
                <span className="parent-modal__value">{selectedInvoice.invoiceCode}</span>
              </div>
              <div className="parent-modal__row">
                <span className="parent-modal__label">Loại hóa đơn:</span>
                <span className="parent-modal__value">
                  {selectedInvoice.type === "room_fee" ? "Tiền phòng" : "Điện nước"}
                </span>
              </div>
              <div className="parent-modal__row">
                <span className="parent-modal__label">Học kỳ/Tháng:</span>
                <span className="parent-modal__value">
                  {selectedInvoice.type === "utility"
                    ? `Tháng ${selectedInvoice.billingMonth}/${selectedInvoice.semester}`
                    : selectedInvoice.semester}
                </span>
              </div>
              <div className="parent-modal__row">
                <span className="parent-modal__label">Trạng thái:</span>
                <span className="parent-modal__value">{getStatusBadge(selectedInvoice.status)}</span>
              </div>
              <div className="parent-modal__row">
                <span className="parent-modal__label">Hạn đóng:</span>
                <span className="parent-modal__value">
                  {selectedInvoice.dueDate ? new Date(selectedInvoice.dueDate).toLocaleDateString("vi-VN") : "N/A"}
                </span>
              </div>
              {selectedInvoice.paidAt && (
                <div className="parent-modal__row">
                  <span className="parent-modal__label">Ngày thanh toán:</span>
                  <span className="parent-modal__value">
                    {new Date(selectedInvoice.paidAt).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              )}

              <div style={{ margin: "20px 0", borderTop: "1px solid #e5e7eb" }}></div>

              {selectedInvoice.type === "utility" && selectedInvoice.items && selectedInvoice.items.length > 0 && (
                <>
                  <h4 style={{ margin: "0 0 10px 0", color: "#14532d", fontSize: "0.95rem" }}>Chi tiết sử dụng</h4>
                  {selectedInvoice.items.map(item => (
                    <div key={item._id || item.name} className="parent-modal__row" style={{ alignItems: "flex-start" }}>
                      <span className="parent-modal__label">
                        {item.name === "electricity" ? "Điện" : item.name === "water" ? "Nước" : item.name}
                        {item.oldIndex != null && item.newIndex != null && (
                          <div style={{ fontSize: "0.8rem", color: "#9ca3af", marginTop: "2px" }}>
                            Chỉ số: {item.oldIndex} &rarr; {item.newIndex}
                          </div>
                        )}
                      </span>
                      <span className="parent-modal__value">{formatCurrency(item.amount)}</span>
                    </div>
                  ))}
                  <div style={{ margin: "16px 0", borderTop: "1px solid #e5e7eb" }}></div>
                </>
              )}

              <div className="parent-modal__row" style={{ borderBottom: "none" }}>
                <span className="parent-modal__label" style={{ fontWeight: "bold", color: "#111827", fontSize: "1.1rem" }}>
                  Tổng thanh toán:
                </span>
                <span className="parent-modal__value" style={{ color: "var(--amber-600)", fontSize: "1.2rem" }}>
                  {formatCurrency(selectedInvoice.amount)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ParentPayments;

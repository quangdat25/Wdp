import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showError } from "../../components/alert";
import { getMyInvoices } from "../../api/invoiceService";
import { createInvoicePayment } from "../../api/paymentService";

function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await getMyInvoices();
      setInvoices(res.data.data || []);
    } catch (error) {
      showError(error.response?.data?.message || "Lỗi khi tải hóa đơn");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handlePayInvoice = async (invoiceId) => {
    try {
      setPayingId(invoiceId);

      const res = await createInvoicePayment(invoiceId);
      const paymentUrl = res.data?.data?.paymentUrl;

      if (!paymentUrl) {
        showError("Không tạo được link thanh toán VNPay");
        return;
      }

      window.location.href = paymentUrl;
    } catch (error) {
      showError(
        error.response?.data?.message || "Lỗi khi tạo thanh toán VNPay"
      );
    } finally {
      setPayingId(null);
    }
  };

  const filteredInvoices = useMemo(() => {
    if (statusFilter === "all") return invoices;
    return invoices.filter((item) => item.status === statusFilter);
  }, [invoices, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredInvoices.slice(start, start + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  const unpaidTotal = useMemo(() => {
    return invoices
      .filter((i) => i.status === "unpaid" || i.status === "overdue")
      .reduce((sum, i) => sum + Number(i.amount || 0), 0);
  }, [invoices]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50">
      <Sidebar />

      <main className="ml-[270px] min-h-screen w-[calc(100%-270px)] px-7 py-6">
        <Header />

        <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-6 shadow-sm backdrop-blur">
          <h1 className="m-0 text-3xl font-extrabold text-blue-800">
            Hóa đơn của tôi
          </h1>
          <p className="mt-2 text-slate-500">
            Xem tiền phòng và tiền điện nước cần thanh toán.
          </p>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard title="Tất cả" value={invoices.length} />
          <SummaryCard
            title="Chưa thanh toán"
            value={invoices.filter((i) => i.status === "unpaid").length}
          />
          <SummaryCard
            title="Đã thanh toán"
            value={invoices.filter((i) => i.status === "paid").length}
          />
          <SummaryCard title="Tổng chưa thanh toán" value={formatMoney(unpaidTotal)} />
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-slate-800">
              Danh sách hóa đơn
            </h2>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-2xl border border-slate-300 px-4 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="unpaid">Chưa thanh toán</option>
              <option value="paid">Đã thanh toán</option>
              <option value="overdue">Quá hạn</option>
              <option value="cancelled">Đã hủy</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] bg-white text-left">
              <thead>
                <tr className="bg-slate-50 text-sm text-slate-600">
                  <TableHead>Mã hóa đơn</TableHead>
                  <TableHead>Loại</TableHead>
                  <TableHead>Chi tiết</TableHead>
                  <TableHead>Số tiền</TableHead>
                  <TableHead>Hạn thanh toán</TableHead>
                  <TableHead>Thời gian thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                  <TableHead>Thanh toán</TableHead>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredInvoices.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="px-4 py-8 text-center text-slate-500">
                      Chưa có hóa đơn
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice) => (
                    <tr key={invoice._id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-slate-800">
                        {invoice.invoiceCode}
                      </TableCell>

                      <TableCell>
                        {invoice.type === "room_fee" ? "Tiền phòng" : "Điện nước"}
                      </TableCell>

                      <TableCell>
                        {invoice.items?.length > 0 ? (
                          <div className="space-y-1">
                            {invoice.items.map((item, index) => (
                              <div key={index}>
                                {getItemLabel(item.name)}:{" "}
                                <b>{formatMoney(item.amount)}</b>
                              </div>
                            ))}
                          </div>
                        ) : (
                          "Không có"
                        )}
                      </TableCell>

                      <TableCell className="font-extrabold text-blue-700">
                        {formatMoney(invoice.amount)}
                      </TableCell>

                      <TableCell>{formatDateTime(invoice.dueDate)}</TableCell>

                      <TableCell className={!invoice.paidAt ? "text-center font-bold" : ""}>
                        {formatDateTime(invoice.paidAt)}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>

                      <TableCell>
                        {invoice.status === "unpaid" || invoice.status === "overdue" ? (
                          <button
                            type="button"
                            disabled={payingId === invoice._id}
                            onClick={() => handlePayInvoice(invoice._id)}
                            className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
                          >
                            {payingId === invoice._id ? "Đang xử lý..." : "Thanh toán"}
                          </button>
                        ) : (
                          <span className="text-sm font-bold text-slate-400">-</span>
                        )}
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
              total={filteredInvoices.length}
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
    </div>
  );
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatDateTime(date) {
  if (!date) return ".....";

  const d = new Date(date);
  const pad = (n) => String(n).padStart(2, "0");

  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())} ${pad(
    d.getDate()
  )}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

function getItemLabel(name) {
  const map = {
    electricity: "Điện",
    water: "Nước",
    internet: "Internet",
  };

  return map[name] || name || "Khác";
}

function StatusBadge({ status }) {
  const map = {
    unpaid: {
      label: "Chưa thanh toán",
      className: "bg-yellow-100 text-yellow-700",
    },
    paid: {
      label: "Đã thanh toán",
      className: "bg-green-100 text-green-700",
    },
    overdue: {
      label: "Quá hạn",
      className: "bg-red-100 text-red-700",
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-slate-100 text-slate-600",
    },
  };

  const item = map[status] || {
    label: status || "Không rõ",
    className: "bg-slate-100 text-slate-600",
  };

  return (
    <span
      className={`inline-flex rounded-full px-3 py-1 text-sm font-bold ${item.className}`}
    >
      {item.label}
    </span>
  );
}

function SummaryCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
      <div className="font-bold text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-800">{value}</div>
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
    <td className={`border-b border-slate-100 px-4 py-4 text-slate-600 ${className}`}>
      {children}
    </td>
  );
}

export default MyInvoices;
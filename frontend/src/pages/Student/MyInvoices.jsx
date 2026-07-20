import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import {
  FaBolt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaExclamationTriangle,
  FaFileInvoiceDollar,
  FaFilter,
  FaHome,
  FaMoneyBillWave,
  FaReceipt,
  FaSpinner,
  FaTimesCircle,
  FaWallet,
} from "react-icons/fa";

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

      const response = await getMyInvoices();
      setInvoices(response?.data?.data || []);
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

      const response = await createInvoicePayment(invoiceId);
      const paymentUrl = response?.data?.data?.paymentUrl;

      if (!paymentUrl) {
        showError("Không tạo được liên kết thanh toán VNPay");
        return;
      }

      window.location.href = paymentUrl;
    } catch (error) {
      showError(
        error.response?.data?.message || "Lỗi khi tạo thanh toán VNPay",
      );
    } finally {
      setPayingId(null);
    }
  };

  const invoiceStats = useMemo(() => {
    const unpaid = invoices.filter((invoice) => invoice.status === "unpaid");
    const paid = invoices.filter((invoice) => invoice.status === "paid");
    const overdue = invoices.filter((invoice) => invoice.status === "overdue");

    const unpaidTotal = invoices
      .filter(
        (invoice) =>
          invoice.status === "unpaid" || invoice.status === "overdue",
      )
      .reduce((sum, invoice) => sum + Number(invoice.amount || 0), 0);

    return {
      total: invoices.length,
      unpaid: unpaid.length,
      paid: paid.length,
      overdue: overdue.length,
      unpaidTotal,
    };
  }, [invoices]);

  const filteredInvoices = useMemo(() => {
    if (statusFilter === "all") return invoices;

    return invoices.filter((invoice) => invoice.status === statusFilter);
  }, [invoices, statusFilter]);

  const paginatedInvoices = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredInvoices.slice(startIndex, startIndex + pageSize);
  }, [filteredInvoices, currentPage, pageSize]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredInvoices.length / pageSize));

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredInvoices.length, pageSize, currentPage]);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-h-screen px-4 pb-10 pt-5 lg:ml-[270px] lg:w-[calc(100%-270px)] lg:px-7">
        <Header />

        <div className="mx-auto mt-6 max-w-[1500px]">
          <section className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <SummaryCard
              title="Tổng hóa đơn"
              value={invoiceStats.total}
              icon={<FaReceipt />}
              type="default"
            />

            <SummaryCard
              title="Chưa thanh toán"
              value={invoiceStats.unpaid}
              icon={<FaClock />}
              type="warning"
            />

            <SummaryCard
              title="Đã thanh toán"
              value={invoiceStats.paid}
              icon={<FaCheckCircle />}
              type="success"
            />

            <SummaryCard
              title="Tổng cần thanh toán"
              value={formatMoney(invoiceStats.unpaidTotal)}
              icon={<FaWallet />}
              type="danger"
              compact
            />
          </section>

          <section className="mt-6 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-5 sm:px-7">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                <div>
                  <h2 className="text-lg font-black text-slate-900">
                    Danh sách hóa đơn
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    Theo dõi hạn thanh toán và thực hiện thanh toán trực tuyến.
                  </p>
                </div>

                <div className="flex w-full items-center gap-3 sm:w-auto">
                  <div className="relative w-full sm:w-[230px]">
                    <FaFilter className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-slate-400" />

                    <select
                      value={statusFilter}
                      onChange={(event) => {
                        setStatusFilter(event.target.value);
                        setCurrentPage(1);
                      }}
                      className="h-11 w-full appearance-none rounded-xl border border-slate-200 bg-white pl-10 pr-10 text-sm font-bold text-slate-700 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="all">Tất cả trạng thái</option>
                      <option value="unpaid">Chưa thanh toán</option>
                      <option value="paid">Đã thanh toán</option>
                      <option value="overdue">Quá hạn</option>
                      <option value="cancelled">Đã hủy</option>
                    </select>

                    <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      ▼
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 sm:p-6">
              {loading ? (
                <LoadingState />
              ) : filteredInvoices.length === 0 ? (
                <EmptyState statusFilter={statusFilter} />
              ) : (
                <>
                  <div className="hidden overflow-hidden rounded-2xl border border-slate-200 xl:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1180px] text-left">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                            <TableHead>Mã hóa đơn</TableHead>
                            <TableHead>Loại</TableHead>
                            <TableHead>Chi tiết</TableHead>
                            <TableHead>Số tiền</TableHead>
                            <TableHead>Hạn thanh toán</TableHead>
                            <TableHead>Đã thanh toán lúc</TableHead>
                            <TableHead>Trạng thái</TableHead>
                            <TableHead className="text-right">
                              Thao tác
                            </TableHead>
                          </tr>
                        </thead>

                        <tbody>
                          {paginatedInvoices.map((invoice) => (
                            <InvoiceTableRow
                              key={invoice._id}
                              invoice={invoice}
                              payingId={payingId}
                              onPay={handlePayInvoice}
                            />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="space-y-4 xl:hidden">
                    {paginatedInvoices.map((invoice) => (
                      <InvoiceMobileCard
                        key={invoice._id}
                        invoice={invoice}
                        payingId={payingId}
                        onPay={handlePayInvoice}
                      />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row">
                    <Pagination
                      current={currentPage}
                      total={filteredInvoices.length}
                      pageSize={pageSize}
                      showSizeChanger
                      pageSizeOptions={["5", "10", "20", "50"]}
                      showLessItems
                      onChange={(page, size) => {
                        setCurrentPage(page);
                        setPageSize(size);
                      }}
                    />
                  </div>
                </>
              )}
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}

function InvoiceTableRow({ invoice, payingId, onPay }) {
  const canPay = invoice.status === "unpaid" || invoice.status === "overdue";

  return (
    <tr className="transition hover:bg-slate-50/80">
      <TableCell>
        <div className="font-black text-slate-900">
          {invoice.invoiceCode || "-"}
        </div>
        <div className="mt-1 text-xs font-semibold text-slate-400">
          {invoice._id ? `#${invoice._id.slice(-6).toUpperCase()}` : ""}
        </div>
      </TableCell>

      <TableCell>
        <InvoiceTypeBadge type={invoice.type} />
      </TableCell>

      <TableCell>
        <InvoiceItems items={invoice.items} />
      </TableCell>

      <TableCell>
        <div className="whitespace-nowrap text-base font-black text-blue-700">
          {formatMoney(invoice.amount)}
        </div>
      </TableCell>

      <TableCell>
        {invoice.type === "room_fee" ? (
          <span className="font-bold text-slate-300">—</span>
        ) : (
          <DateDisplay
            date={invoice.dueDate}
            overdue={invoice.status === "overdue"}
          />
        )}
      </TableCell>

      <TableCell>
        {invoice.paidAt ? (
          <DateDisplay date={invoice.paidAt} />
        ) : (
          <span className="font-bold text-slate-300">—</span>
        )}
      </TableCell>

      <TableCell>
        <StatusBadge status={invoice.status} />
      </TableCell>

      <TableCell className="text-right">
        {canPay && (
          <PayButton
            invoiceId={invoice._id}
            loading={payingId === invoice._id}
            onPay={onPay}
          />
        )}
      </TableCell>
    </tr>
  );
}

function InvoiceMobileCard({ invoice, payingId, onPay }) {
  const canPay = invoice.status === "unpaid" || invoice.status === "overdue";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="truncate font-black text-slate-900">
            {invoice.invoiceCode || "-"}
          </div>

          <div className="mt-2">
            <InvoiceTypeBadge type={invoice.type} />
          </div>
        </div>

        <StatusBadge status={invoice.status} />
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
          Tổng thanh toán
        </div>

        <div className="mt-1 text-2xl font-black text-blue-700">
          {formatMoney(invoice.amount)}
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-black uppercase tracking-wide text-slate-400">
          Chi tiết
        </div>

        <div className="mt-2">
          <InvoiceItems items={invoice.items} />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">
        <div>
          <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">
            Hạn thanh toán
          </div>

          {invoice.type === "room_fee" ? (
            <span className="font-bold text-slate-300">—</span>
          ) : (
            <DateDisplay
              date={invoice.dueDate}
              overdue={invoice.status === "overdue"}
            />
          )}
        </div>

        <div>
          <div className="mb-2 text-xs font-black uppercase tracking-wide text-slate-400">
            Đã thanh toán lúc
          </div>

          {invoice.paidAt ? (
            <DateDisplay date={invoice.paidAt} />
          ) : (
            <span className="font-bold text-slate-300">Chưa thanh toán</span>
          )}
        </div>
      </div>

      {canPay && (
        <div className="mt-5">
          <PayButton
            invoiceId={invoice._id}
            loading={payingId === invoice._id}
            onPay={onPay}
            fullWidth
          />
        </div>
      )}
    </article>
  );
}

function InvoiceItems({ items }) {
  if (!items?.length) {
    return (
      <span className="text-sm font-semibold text-slate-400">Không có</span>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item, index) => (
        <div
          key={`${item.name || "item"}-${index}`}
          className="flex items-center justify-between gap-4 text-sm"
        >
          <span className="flex items-center gap-2 font-semibold text-slate-500">
            {getItemIcon(item.name)}
            {getItemLabel(item.name)}
          </span>

          <span className="whitespace-nowrap font-black text-slate-700">
            {formatMoney(item.amount)}
          </span>
        </div>
      ))}
    </div>
  );
}

function InvoiceTypeBadge({ type }) {
  const isRoomFee = type === "room_fee";

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-black ${
        isRoomFee ? "bg-violet-50 text-violet-700" : "bg-cyan-50 text-cyan-700"
      }`}
    >
      {isRoomFee ? <FaHome /> : <FaBolt />}
      {isRoomFee ? "Tiền phòng" : "Điện nước"}
    </span>
  );
}

function DateDisplay({ date, overdue = false }) {
  if (!date) {
    return <span className="font-bold text-slate-300">—</span>;
  }

  const { dateText, timeText } = formatDateParts(date);

  return (
    <div className={overdue ? "text-red-600" : "text-slate-600"}>
      <div className="flex items-center gap-2 whitespace-nowrap text-sm font-extrabold">
        <FaCalendarAlt className="text-xs opacity-70" />
        {dateText}
      </div>

      <div className="mt-1 flex items-center gap-2 whitespace-nowrap text-xs font-semibold opacity-70">
        <FaClock />
        {timeText}
      </div>
    </div>
  );
}

function PayButton({ invoiceId, loading, onPay, fullWidth = false }) {
  return (
    <button
      type="button"
      disabled={loading}
      onClick={() => onPay(invoiceId)}
      className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-black text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-400 ${
        fullWidth ? "w-full" : ""
      }`}
    >
      {loading ? (
        <>
          <FaSpinner className="animate-spin" />
          Đang xử lý...
        </>
      ) : (
        <>
          <FaCreditCard />
          Thanh toán
        </>
      )}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
      <FaSpinner className="text-3xl text-blue-600 animate-spin" />
      <div className="mt-4 font-black text-slate-800">
        Đang tải danh sách hóa đơn
      </div>
      <p className="mt-1 text-sm text-slate-500">
        Hệ thống đang lấy dữ liệu thanh toán của bạn.
      </p>
    </div>
  );
}

function EmptyState({ statusFilter }) {
  return (
    <div className="flex min-h-[320px] flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/60 px-6 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-3xl text-slate-300 shadow-sm">
        <FaFileInvoiceDollar />
      </div>

      <div className="mt-4 font-black text-slate-800">
        {statusFilter === "all"
          ? "Bạn chưa có hóa đơn"
          : "Không có hóa đơn phù hợp"}
      </div>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-500">
        {statusFilter === "all"
          ? "Các hóa đơn tiền phòng và điện nước sẽ xuất hiện tại đây."
          : "Hãy chọn trạng thái khác để xem các hóa đơn còn lại."}
      </p>
    </div>
  );
}

function SummaryCard({
  title,
  value,
  icon,
  type = "default",
  compact = false,
}) {
  const styles = {
    default: {
      wrapper: "border-slate-200 bg-white",
      icon: "bg-slate-100 text-slate-600",
      value: "text-slate-900",
    },
    warning: {
      wrapper: "border-amber-200 bg-amber-50/50",
      icon: "bg-amber-100 text-amber-700",
      value: "text-amber-800",
    },
    success: {
      wrapper: "border-emerald-200 bg-emerald-50/50",
      icon: "bg-emerald-100 text-emerald-700",
      value: "text-emerald-800",
    },
    danger: {
      wrapper: "border-red-200 bg-red-50/50",
      icon: "bg-red-100 text-red-700",
      value: "text-red-700",
    },
  };

  const currentStyle = styles[type] || styles.default;

  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${currentStyle.wrapper}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="text-sm font-bold text-slate-500">{title}</div>

          <div
            className={`mt-2 truncate font-black ${currentStyle.value} ${
              compact ? "text-xl" : "text-2xl"
            }`}
            title={String(value)}
          >
            {value}
          </div>
        </div>

        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-xl ${currentStyle.icon}`}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    unpaid: {
      label: "Chưa thanh toán",
      className: "bg-amber-50 text-amber-700",
      icon: <FaClock />,
    },
    paid: {
      label: "Đã thanh toán",
      className: "bg-emerald-50 text-emerald-700",
      icon: <FaCheckCircle />,
    },
    overdue: {
      label: "Quá hạn",
      className: "bg-red-50 text-red-700",
      icon: <FaExclamationTriangle />,
    },
    cancelled: {
      label: "Đã hủy",
      className: "bg-slate-100 text-slate-600",
      icon: <FaTimesCircle />,
    },
  };

  const item = map[status] || {
    label: status || "Không rõ",
    className: "bg-slate-100 text-slate-600",
    icon: <FaReceipt />,
  };

  return (
    <span
      className={`inline-flex w-fit items-center gap-2 whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-black ${item.className}`}
    >
      {item.icon}
      {item.label}
    </span>
  );
}

function TableHead({ children, className = "" }) {
  return (
    <th
      className={`border-b border-slate-200 px-4 py-3.5 font-black ${className}`}
    >
      {children}
    </th>
  );
}

function TableCell({ children, className = "" }) {
  return (
    <td
      className={`border-b border-slate-100 px-4 py-4 align-middle text-sm text-slate-600 ${className}`}
    >
      {children}
    </td>
  );
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatDateParts(date) {
  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return {
      dateText: "Không hợp lệ",
      timeText: "--:--",
    };
  }

  const pad = (number) => String(number).padStart(2, "0");

  return {
    dateText: `${pad(parsedDate.getDate())}/${pad(
      parsedDate.getMonth() + 1,
    )}/${parsedDate.getFullYear()}`,
    timeText: `${pad(parsedDate.getHours())}:${pad(
      parsedDate.getMinutes(),
    )}:${pad(parsedDate.getSeconds())}`,
  };
}

function getItemLabel(name) {
  const map = {
    electricity: "Tiền điện",
    water: "Tiền nước",
    internet: "Internet",
  };

  return map[name] || name || "Khoản khác";
}

function getItemIcon(name) {
  const iconClassName = "text-xs text-slate-400";

  const map = {
    electricity: <FaBolt className={iconClassName} />,
    water: <FaReceipt className={iconClassName} />,
    internet: <FaReceipt className={iconClassName} />,
  };

  return map[name] || <FaReceipt className={iconClassName} />;
}

export default MyInvoices;

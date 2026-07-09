import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showError, showSuccess } from "../../components/alert";
import {
  createUtilityInvoices,
  getAllUtilityUsages,
} from "../../api/utilityUsageService";
import { getAllInvoices } from "../../api/invoiceService";

function UtilityInvoiceManagement() {
  const [formData, setFormData] = useState({
    semester: "Summer 2026",
    dueDate: "",
  });

  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);

  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [creating, setCreating] = useState(false);

  const [filters, setFilters] = useState({
    buildingName: "",
    floor: "",
    roomNumber: "",
    semester: "",
    month: "",
    year: "",
  });

  const [utilityPage, setUtilityPage] = useState(1);
  const [utilityPageSize, setUtilityPageSize] = useState(5);

  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(5);

  const fetchUtilityUsages = async (customFilters = filters) => {
    try {
      setLoadingRecords(true);

      const params = {};
      Object.entries(customFilters).forEach(([key, value]) => {
        if (value) params[key] = value;
      });

      const res = await getAllUtilityUsages(params);
      setRecords(res.data.data || []);
    } catch (error) {
      showError(
        error.response?.data?.message || "Lỗi khi tải danh sách điện nước",
      );
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchInvoices = async () => {
    try {
      setLoadingInvoices(true);

      const res = await getAllInvoices({
        type: "utility",
      });

      setInvoices(res.data.data || []);
    } catch (error) {
      showError(
        error.response?.data?.message || "Lỗi khi tải danh sách hóa đơn",
      );
    } finally {
      setLoadingInvoices(false);
    }
  };

  useEffect(() => {
    fetchUtilityUsages();
    fetchInvoices();
  }, []);

  const utilityRecordsOfSemester = useMemo(() => {
    return records.filter((item) => item.semester === formData.semester);
  }, [records, formData.semester]);

  const canCreateInvoice =
    Boolean(formData.semester) &&
    Boolean(formData.dueDate) &&
    utilityRecordsOfSemester.length > 0;

  const paginatedRecords = useMemo(() => {
    const start = (utilityPage - 1) * utilityPageSize;
    return records.slice(start, start + utilityPageSize);
  }, [records, utilityPage, utilityPageSize]);

  const paginatedInvoices = useMemo(() => {
    const start = (invoicePage - 1) * invoicePageSize;
    return invoices.slice(start, start + invoicePageSize);
  }, [invoices, invoicePage, invoicePageSize]);

  const totalElectricity = useMemo(
    () =>
      records.reduce(
        (sum, item) => sum + Number(item.electricityAmount || 0),
        0,
      ),
    [records],
  );

  const totalWater = useMemo(
    () => records.reduce((sum, item) => sum + Number(item.waterAmount || 0), 0),
    [records],
  );

  const totalAmount = useMemo(
    () => records.reduce((sum, item) => sum + Number(item.totalAmount || 0), 0),
    [records],
  );

  const unpaidAmount = useMemo(() => {
    return invoices
      .filter((item) => item.status === "unpaid")
      .reduce((sum, item) => sum + Number(item.amount || 0), 0);
  }, [invoices]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSearch = () => {
    setUtilityPage(1);
    fetchUtilityUsages();
  };

  const handleResetFilter = () => {
    const resetFilters = {
      buildingName: "",
      floor: "",
      roomNumber: "",
      semester: "",
      month: "",
      year: "",
    };

    setFilters(resetFilters);
    setUtilityPage(1);
    fetchUtilityUsages(resetFilters);
  };

  const handleCreateInvoices = async () => {
    if (!formData.semester || !formData.dueDate) {
      showError("Vui lòng nhập đầy đủ kỳ và hạn thanh toán");
      return;
    }

    if (utilityRecordsOfSemester.length === 0) {
      showError("Kỳ này chưa có dữ liệu điện nước do staff import");
      return;
    }

    try {
      setCreating(true);

      await createUtilityInvoices(formData);

      showSuccess("Tạo hóa đơn điện nước thành công");
      fetchInvoices();
    } catch (error) {
      showError(
        error.response?.data?.message || "Tạo hóa đơn điện nước thất bại",
      );
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50">
      <Sidebar />

      <main className="ml-[270px] min-h-screen w-[calc(100%-270px)] px-7 py-6">
        <Header />

        <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-6 shadow-sm backdrop-blur">
          <h1 className="m-0 text-3xl font-extrabold text-blue-800">
            Quản lý hóa đơn điện nước
          </h1>
          <p className="mt-2 text-slate-500">
            Kiểm tra dữ liệu staff đã import, sau đó chốt hóa đơn cho sinh viên.
          </p>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard title="Bản ghi điện nước" value={records.length} />
          <SummaryCard
            title="Tổng điện"
            value={formatMoney(totalElectricity)}
          />
          <SummaryCard title="Tổng nước" value={formatMoney(totalWater)} />
          <SummaryCard
            title="Tổng điện nước"
            value={formatMoney(totalAmount)}
          />
        </section>

        <section className="mb-6 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
          <h2 className="mb-5 text-xl font-extrabold text-slate-800">
            Chốt kỳ tạo hóa đơn
          </h2>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Kỳ thanh toán
              </label>
              <input
                name="semester"
                value={formData.semester}
                onChange={handleChange}
                placeholder="Ví dụ: Summer 2026"
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              {formData.semester && utilityRecordsOfSemester.length > 0 && (
                <p className="mt-2 text-sm font-semibold text-emerald-600">
                  Đã có {utilityRecordsOfSemester.length} bản ghi điện nước cho
                  kỳ này.
                </p>
              )}

              {formData.semester && utilityRecordsOfSemester.length === 0 && (
                <p className="mt-2 text-sm font-semibold text-red-600">
                  Kỳ này chưa có dữ liệu điện nước do staff import.
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block font-bold text-slate-700">
                Hạn thanh toán
              </label>
              <input
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                type="date"
                className="h-12 w-full rounded-2xl border border-slate-300 px-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateInvoices}
            disabled={creating || !canCreateInvoice}
            className="mt-6 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-7 font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {creating ? "Đang tạo hóa đơn..." : "Tạo hóa đơn cho sinh viên"}
          </button>
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <SummaryCard title="Tổng hóa đơn" value={invoices.length} />
          <SummaryCard
            title="Chưa thanh toán"
            value={invoices.filter((item) => item.status === "unpaid").length}
          />
          <SummaryCard
            title="Đã thanh toán"
            value={invoices.filter((item) => item.status === "paid").length}
          />
          <SummaryCard title="Công nợ" value={formatMoney(unpaidAmount)} />
        </section>

        <section className="mb-6 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
          <h2 className="mb-5 text-xl font-extrabold text-slate-800">
            Danh sách hóa đơn điện nước
          </h2>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] bg-white text-left">
              <thead>
                <tr className="bg-slate-50 text-sm text-slate-600">
                  <TableHead>Mã hóa đơn</TableHead>
                  <TableHead>Sinh viên</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Tiền điện</TableHead>
                  <TableHead>Tiền nước</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Hạn thanh toán</TableHead>
                  <TableHead>Thời gian thanh toán</TableHead>
                  <TableHead>Trạng thái</TableHead>
                </tr>
              </thead>

              <tbody>
                {loadingInvoices ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Đang tải hóa đơn...
                    </td>
                  </tr>
                ) : invoices.length === 0 ? (
                  <tr>
                    <td
                      colSpan="8"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Chưa có hóa đơn điện nước
                    </td>
                  </tr>
                ) : (
                  paginatedInvoices.map((invoice) => {
                    const electricity =
                      invoice.items?.find((item) => item.name === "electricity")
                        ?.amount || 0;

                    const water =
                      invoice.items?.find((item) => item.name === "water")
                        ?.amount || 0;

                    const room = invoice.bookingId?.roomId;

                    return (
                      <tr key={invoice._id} className="hover:bg-slate-50">
                        <TableCell className="font-bold text-slate-800">
                          {invoice.invoiceCode}
                        </TableCell>

                        <TableCell>
                          {invoice.studentId?.fullName ||
                            invoice.studentId?.username ||
                            "Chưa có"}
                          <div className="text-xs text-slate-400">
                            {invoice.studentId?.studentCode || ""}
                          </div>
                        </TableCell>

                        <TableCell>
                          {room?.displayName || room?.roomNumber || "Chưa có"}
                        </TableCell>

                        <TableCell>{formatMoney(electricity)}</TableCell>
                        <TableCell>{formatMoney(water)}</TableCell>

                        <TableCell className="font-extrabold text-blue-700">
                          {formatMoney(invoice.amount)}
                        </TableCell>

                        <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                        <TableCell
                          className={
                            !invoice.paidAt ? "text-center font-bold" : ""
                          }
                        >
                          {formatDate(invoice.paidAt)}
                        </TableCell>
                        <TableCell>
                          <InvoiceStatusBadge status={invoice.status} />
                        </TableCell>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-center">
            <Pagination
              current={invoicePage}
              total={invoices.length}
              pageSize={invoicePageSize}
              showSizeChanger
              pageSizeOptions={["5", "10", "20", "50"]}
              onChange={(page, size) => {
                setInvoicePage(page);
                setInvoicePageSize(size);
              }}
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
            <h2 className="text-xl font-extrabold text-slate-800">
              Dữ liệu điện nước staff đã import
            </h2>

            <div className="flex flex-wrap gap-3">
              <input
                name="buildingName"
                value={filters.buildingName}
                onChange={handleFilterChange}
                placeholder="Tòa"
                className="h-11 w-24 rounded-2xl border border-slate-300 px-4 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <input
                name="floor"
                value={filters.floor}
                onChange={handleFilterChange}
                placeholder="Tầng"
                type="number"
                min="1"
                className="h-11 w-24 rounded-2xl border border-slate-300 px-4 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <input
                name="roomNumber"
                value={filters.roomNumber}
                onChange={handleFilterChange}
                placeholder="Phòng"
                className="h-11 w-28 rounded-2xl border border-slate-300 px-4 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <input
                name="semester"
                value={filters.semester}
                onChange={handleFilterChange}
                placeholder="Kỳ"
                className="h-11 rounded-2xl border border-slate-300 px-4 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <input
                name="month"
                value={filters.month}
                onChange={handleFilterChange}
                placeholder="Tháng"
                type="number"
                min="1"
                max="12"
                className="h-11 w-28 rounded-2xl border border-slate-300 px-4 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <input
                name="year"
                value={filters.year}
                onChange={handleFilterChange}
                placeholder="Năm"
                type="number"
                className="h-11 w-32 rounded-2xl border border-slate-300 px-4 font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              />

              <button
                type="button"
                onClick={handleSearch}
                className="h-11 rounded-2xl bg-blue-600 px-5 font-bold text-white hover:bg-blue-700"
              >
                Lọc
              </button>

              <button
                type="button"
                onClick={handleResetFilter}
                className="h-11 rounded-2xl bg-slate-100 px-5 font-bold text-slate-700 hover:bg-slate-200"
              >
                Làm mới
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1200px] overflow-hidden rounded-2xl bg-white text-left">
              <thead>
                <tr className="bg-slate-50 text-sm text-slate-600">
                  <TableHead>Tòa</TableHead>
                  <TableHead>Tầng</TableHead>
                  <TableHead>Phòng</TableHead>
                  <TableHead>Kỳ</TableHead>
                  <TableHead>Tháng/Năm</TableHead>
                  <TableHead>Tiền điện</TableHead>
                  <TableHead>Tiền nước</TableHead>
                  <TableHead>Tổng tiền</TableHead>
                  <TableHead>Người import</TableHead>
                </tr>
              </thead>

              <tbody>
                {loadingRecords ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : records.length === 0 ? (
                  <tr>
                    <td
                      colSpan="9"
                      className="px-4 py-8 text-center text-slate-500"
                    >
                      Chưa có dữ liệu điện nước
                    </td>
                  </tr>
                ) : (
                  paginatedRecords.map((item) => (
                    <tr key={item._id} className="hover:bg-slate-50">
                      <TableCell className="font-bold text-slate-800">
                        {item.buildingName ||
                          item.roomId?.building?.name ||
                          "Chưa có"}
                      </TableCell>
                      <TableCell>
                        {item.floor || item.roomId?.floor || "Chưa có"}
                      </TableCell>
                      <TableCell>
                        {item.roomNumber ||
                          item.roomId?.roomNumber ||
                          "Chưa có"}
                      </TableCell>
                      <TableCell>{item.semester}</TableCell>
                      <TableCell>
                        {item.month}/{item.year}
                      </TableCell>
                      <TableCell>
                        {formatMoney(item.electricityAmount)}
                      </TableCell>
                      <TableCell>{formatMoney(item.waterAmount)}</TableCell>
                      <TableCell className="font-extrabold text-blue-700">
                        {formatMoney(item.totalAmount)}
                      </TableCell>
                      <TableCell>
                        {item.importedBy?.fullName ||
                          item.importedBy?.username ||
                          "Chưa có"}
                      </TableCell>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex justify-center">
            <Pagination
              current={utilityPage}
              total={records.length}
              pageSize={utilityPageSize}
              showSizeChanger
              pageSizeOptions={["5", "10", "20", "50"]}
              onChange={(page, size) => {
                setUtilityPage(page);
                setUtilityPageSize(size);
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

function formatDate(date) {
  if (!date) return ".....";

  const d = new Date(date);

  return d.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
function InvoiceStatusBadge({ status }) {
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
    <td
      className={`border-b border-slate-100 px-4 py-4 text-slate-600 ${className}`}
    >
      {children}
    </td>
  );
}

export default UtilityInvoiceManagement;

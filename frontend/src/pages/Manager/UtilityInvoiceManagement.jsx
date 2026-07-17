import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showError, showSuccess } from "../../components/alert";
import {
  createUtilityInvoices,
  getAllUtilityUsages,
  getUtilityByStudentId,
} from "../../api/utilityUsageService";
import { getAllInvoices } from "../../api/invoiceService";
import { FaSpinner } from "react-icons/fa";
const EMPTY_FILTERS = {
  buildingName: "",
  floor: "",
  roomNumber: "",
  semester: "",
  month: "",
  year: "",
};

function UtilityInvoiceManagement() {
  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");

  const [formData, setFormData] = useState({
    semester: "",
    dueDate: "",
  });

  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [utilityPage, setUtilityPage] = useState(1);
  const [utilityPageSize, setUtilityPageSize] = useState(10);
  const [invoicePage, setInvoicePage] = useState(1);
  const [invoicePageSize, setInvoicePageSize] = useState(10);

  const fetchUtilityUsages = async () => {
    try {
      setLoadingRecords(true);
      const response = await getAllUtilityUsages();
      setRecords(response?.data?.data || []);
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
      const response = await getAllInvoices({ type: "utility" });
      setInvoices(response?.data?.data || []);
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

  const semesterOptions = useMemo(() => {
    return [
      ...new Set(records.map((item) => item.semester).filter(Boolean)),
    ].sort((a, b) => b.localeCompare(a));
  }, [records]);

  useEffect(() => {
    if (!formData.semester && semesterOptions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        semester: semesterOptions[0],
      }));
    }
  }, [semesterOptions, formData.semester]);

  const selectedSemesterRecords = useMemo(() => {
    return records.filter((item) => item.semester === formData.semester);
  }, [records, formData.semester]);

  const semesterSummary = useMemo(() => {
    const rooms = new Set();
    const months = new Set();

    let electricity = 0;
    let water = 0;

    selectedSemesterRecords.forEach((item) => {
      const roomKey =
        item.roomId?._id ||
        item.roomId ||
        `${item.buildingName}-${item.floor}-${item.roomNumber}`;

      rooms.add(String(roomKey));
      months.add(`${item.year}-${item.month}`);
      electricity += Number(item.electricityAmount || 0);
      water += Number(item.waterAmount || 0);
    });

    return {
      records: selectedSemesterRecords.length,
      rooms: rooms.size,
      months: months.size,
      total: electricity + water,
    };
  }, [selectedSemesterRecords]);

  const filteredRecords = useMemo(() => {
    return records.filter((item) => {
      const building = item.buildingName || item.roomId?.building?.name || "";
      const floor = item.floor || item.roomId?.floor || "";
      const room = item.roomNumber || item.roomId?.roomNumber || "";

      return (
        includesText(building, filters.buildingName) &&
        includesText(floor, filters.floor) &&
        includesText(room, filters.roomNumber) &&
        includesText(item.semester, filters.semester) &&
        includesText(item.month, filters.month) &&
        includesText(item.year, filters.year)
      );
    });
  }, [records, filters]);

  const paginatedRecords = useMemo(() => {
    const start = (utilityPage - 1) * utilityPageSize;
    return filteredRecords.slice(start, start + utilityPageSize);
  }, [filteredRecords, utilityPage, utilityPageSize]);

  const paginatedInvoices = useMemo(() => {
    const start = (invoicePage - 1) * invoicePageSize;
    return invoices.slice(start, start + invoicePageSize);
  }, [invoices, invoicePage, invoicePageSize]);

  const invoiceSummary = useMemo(() => {
    const unpaid = invoices.filter((item) => item.status === "unpaid");
    const overdue = invoices.filter((item) => item.status === "overdue");
    const paid = invoices.filter((item) => item.status === "paid");

    const debt = [...unpaid, ...overdue].reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0,
    );

    return {
      total: invoices.length,
      unpaid: unpaid.length,
      overdue: overdue.length,
      paid: paid.length,
      debt,
    };
  }, [invoices]);

  const canCreateInvoice =
    Boolean(formData.semester) &&
    Boolean(formData.dueDate) &&
    selectedSemesterRecords.length > 0;

  const handleCreateInvoices = async () => {
    if (!formData.semester || !formData.dueDate) {
      showError("Vui lòng chọn kỳ và hạn thanh toán");
      return;
    }

    if (selectedSemesterRecords.length === 0) {
      showError("Kỳ này chưa có dữ liệu điện nước");
      return;
    }

    try {
      setCreating(true);
      const response = await createUtilityInvoices(formData);
      const result = response?.data?.data || [];

      const successCount = result.filter(
        (item) => item.status === "success",
      ).length;

      const skippedCount = result.filter(
        (item) => item.status === "skipped",
      ).length;

      showSuccess(
        skippedCount > 0
          ? `Đã tạo ${successCount} hóa đơn, bỏ qua ${skippedCount} hóa đơn đã tồn tại`
          : "Tạo hóa đơn điện nước thành công",
      );

      await fetchInvoices();
      setActiveTab("invoices");
    } catch (error) {
      showError(
        error.response?.data?.message || "Tạo hóa đơn điện nước thất bại",
      );
    } finally {
      setCreating(false);
    }
  };

  const handleFilterChange = (event) => {
    const { name, value } = event.target;

    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));

    setUtilityPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-h-screen px-4 pb-10 pt-5 lg:ml-[270px] lg:w-[calc(100%-270px)] lg:px-7">
        <Header />

        <div className="mx-auto mt-6 max-w-[1500px]">
          <section className="rounded-2xl border border-slate-200 bg-white px-6 py-5 shadow-sm">
            <h1 className="text-2xl font-bold text-slate-900">
              Quản lý hóa đơn điện nước
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Kiểm tra dữ liệu staff import, chốt kỳ và theo dõi công nợ sinh
              viên.
            </p>
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-lg font-bold text-slate-900">
                Tạo hóa đơn cuối kỳ
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Chọn kỳ đã đủ dữ liệu, đặt hạn thanh toán rồi tạo hóa đơn.
              </p>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_1fr_auto] lg:items-end">
                <Field label="Kỳ thanh toán">
                  <select
                    name="semester"
                    value={formData.semester}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        semester: event.target.value,
                      }))
                    }
                    className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  >
                    {semesterOptions.length === 0 && (
                      <option value="">Chưa có kỳ được import</option>
                    )}
                    {semesterOptions.map((semester) => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field label="Hạn thanh toán">
                  <input
                    name="dueDate"
                    value={formData.dueDate}
                    onChange={(event) =>
                      setFormData((prev) => ({
                        ...prev,
                        dueDate: event.target.value,
                      }))
                    }
                    type="date"
                    min={getTodayInputValue()}
                    className="h-11 w-full rounded-lg border border-slate-300 px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </Field>

                <button
                  type="button"
                  onClick={handleCreateInvoices}
                  disabled={creating || !canCreateInvoice}
                  className="h-11 rounded-lg bg-blue-600 px-5 text-sm font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
                >
                  {creating ? "Đang tạo..." : "Tạo hóa đơn"}
                </button>
              </div>

              <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
                {loadingRecords ? (
                  <span className="text-sm text-slate-500">
                    Đang kiểm tra dữ liệu...
                  </span>
                ) : selectedSemesterRecords.length === 0 ? (
                  <span className="text-sm font-medium text-red-600">
                    Kỳ đã chọn chưa có dữ liệu điện nước.
                  </span>
                ) : (
                  <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <MiniStat label="Bản ghi" value={semesterSummary.records} />
                    <MiniStat label="Phòng" value={semesterSummary.rooms} />
                    <MiniStat
                      label="Tháng đã nhập"
                      value={`${semesterSummary.months}/4`}
                    />
                    <MiniStat
                      label="Tổng điện nước"
                      value={formatMoney(semesterSummary.total)}
                    />
                    <MiniStat
                      label="Tình trạng"
                      value={
                        semesterSummary.months >= 4
                          ? "Đủ dữ liệu"
                          : "Chưa đủ 4 tháng"
                      }
                      className={
                        semesterSummary.months >= 4
                          ? "text-emerald-700"
                          : "text-amber-700"
                      }
                    />
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex border-b border-slate-200 px-5">
              <TabButton
                active={activeTab === "invoices"}
                onClick={() => setActiveTab("invoices")}
              >
                Hóa đơn đã tạo
              </TabButton>
              <TabButton
                active={activeTab === "records"}
                onClick={() => setActiveTab("records")}
              >
                Dữ liệu staff import
              </TabButton>
            </div>

            {activeTab === "invoices" ? (
              <InvoiceTab
                invoices={invoices}
                rows={paginatedInvoices}
                loading={loadingInvoices}
                summary={invoiceSummary}
                current={invoicePage}
                pageSize={invoicePageSize}
                onPageChange={(page, size) => {
                  setInvoicePage(page);
                  setInvoicePageSize(size);
                }}
              />
            ) : (
              <RecordTab
                records={filteredRecords}
                rows={paginatedRecords}
                loading={loadingRecords}
                filters={filters}
                current={utilityPage}
                pageSize={utilityPageSize}
                onFilterChange={handleFilterChange}
                onReset={() => {
                  setFilters(EMPTY_FILTERS);
                  setUtilityPage(1);
                }}
                onPageChange={(page, size) => {
                  setUtilityPage(page);
                  setUtilityPageSize(size);
                }}
              />
            )}
          </section>
        </div>
      </main>
    </div>
  );
}

function InvoiceTab({
  invoices,
  rows,
  loading,
  summary,
  current,
  pageSize,
  onPageChange,
}) {
  const [detailOpen, setDetailOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [studentUtilities, setStudentUtilities] = useState([]);

  const handleViewDetail = async (invoice) => {
    const studentId = invoice.studentId?._id || invoice.studentId;

    if (!studentId) {
      showError("Không xác định được sinh viên");
      return;
    }

    setSelectedStudent({
      student: invoice.studentId || {},
      booking: invoice.bookingId || {},
    });
    setStudentUtilities([]);
    setDetailOpen(true);

    try {
      setDetailLoading(true);

      const response = await getUtilityByStudentId(studentId);
      const data = response?.data?.data || response?.data || [];

      setStudentUtilities(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Không thể tải chi tiết điện nước của sinh viên",
      );
      setStudentUtilities([]);
    } finally {
      setDetailLoading(false);
    }
  };

  return (
    <div className="p-5 sm:p-6">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <SummaryItem label="Tổng hóa đơn" value={summary.total} />
        <SummaryItem label="Chưa thanh toán" value={summary.unpaid} />
        <SummaryItem label="Quá hạn" value={summary.overdue} />
        <SummaryItem label="Đã thanh toán" value={summary.paid} />
        <SummaryItem
          label="Công nợ"
          value={formatMoney(summary.debt)}
          important
        />
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1220px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <TableHead>Mã hóa đơn</TableHead>
                <TableHead>Kỳ</TableHead>
                <TableHead>Sinh viên</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Tiền điện</TableHead>
                <TableHead>Tiền nước</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Hạn thanh toán</TableHead>
                <TableHead>Đã thanh toán lúc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead className="text-right">Thao tác</TableHead>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableMessage colSpan={11}>Đang tải hóa đơn...</TableMessage>
              ) : invoices.length === 0 ? (
                <TableMessage colSpan={11}>
                  Chưa có hóa đơn điện nước
                </TableMessage>
              ) : (
                rows.map((invoice) => {
                  const electricity =
                    invoice.items?.find((item) => item.name === "electricity")
                      ?.amount || 0;

                  const water =
                    invoice.items?.find((item) => item.name === "water")
                      ?.amount || 0;

                  const room = invoice.bookingId?.roomId;
                  const period = parseUtilityPeriod(invoice.invoiceCode);

                  return (
                    <tr key={invoice._id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold text-slate-900">
                        {invoice.invoiceCode || "—"}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                          {invoice.bookingId?.semester || "—"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <div className="font-medium text-slate-800">
                          {invoice.studentId?.fullName ||
                            invoice.studentId?.username ||
                            "Chưa có"}
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          {invoice.studentId?.studentCode || ""}
                        </div>
                      </TableCell>

                      <TableCell>
                        {room?.displayName || room?.roomNumber || "—"}
                      </TableCell>

                      <TableCell>{formatMoney(electricity)}</TableCell>
                      <TableCell>{formatMoney(water)}</TableCell>

                      <TableCell className="font-bold text-blue-700">
                        {formatMoney(invoice.amount)}
                      </TableCell>

                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>

                      <TableCell>
                        {invoice.paidAt ? formatDate(invoice.paidAt) : "—"}
                      </TableCell>

                      <TableCell>
                        <StatusBadge status={invoice.status} />
                      </TableCell>

                      <TableCell className="text-right">
                        <button
                          type="button"
                          onClick={() => handleViewDetail(invoice)}
                          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:bg-blue-50 hover:text-blue-700"
                        >
                          Xem chi tiết
                        </button>
                      </TableCell>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {invoices.length > 0 && (
        <PaginationFooter
          current={current}
          total={invoices.length}
          pageSize={pageSize}
          onChange={onPageChange}
          label="hóa đơn"
        />
      )}

      {detailOpen && (
        <StudentMonthlyDetailModal
          selectedStudent={selectedStudent}
          records={studentUtilities}
          loading={detailLoading}
          onClose={() => {
            setDetailOpen(false);
            setSelectedStudent(null);
            setStudentUtilities([]);
          }}
        />
      )}
    </div>
  );
}

function StudentMonthlyDetailModal({
  selectedStudent,
  records,
  loading,
  onClose,
}) {
  const student = selectedStudent?.student || {};
  const booking = selectedStudent?.booking || {};

  const normalizedRecords = useMemo(() => {
    return records.map(normalizeStudentUtilityRecord).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [records]);

  const totalElectricity = normalizedRecords.reduce(
    (sum, item) => sum + item.studentElectricity,
    0,
  );

  const totalWater = normalizedRecords.reduce(
    (sum, item) => sum + item.studentWater,
    0,
  );

  const room = normalizedRecords[0]?.room || booking?.roomId || {};

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-slate-900/45 p-4"
      onMouseDown={onClose}
    >
      <div
        className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-2xl bg-white shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
          <div>
            <h3 className="text-xl font-bold text-slate-900">
              Chi tiết điện nước theo tháng
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {student.fullName || student.username || "Sinh viên"}
              {student.studentCode ? ` · ${student.studentCode}` : ""}
              {room?.roomNumber ? ` · Phòng ${room.roomNumber}` : ""}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Đóng
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6">
          {loading ? (
            <div className="flex min-h-[260px] flex-col items-center justify-center text-slate-500">
              <FaSpinner className="animate-spin text-2xl text-blue-600" />
              <span className="mt-3 text-sm">
                Đang tải dữ liệu điện nước...
              </span>
            </div>
          ) : normalizedRecords.length === 0 ? (
            <div className="flex min-h-[260px] items-center justify-center text-sm text-slate-500">
              Sinh viên chưa có dữ liệu điện nước.
            </div>
          ) : (
            <>
              <div className="overflow-hidden rounded-xl border border-slate-200">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1120px] text-left">
                    <thead>
                      <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <TableHead>Tháng</TableHead>
                        <TableHead>Phòng</TableHead>
                        <TableHead>Học kỳ</TableHead>
                        <TableHead>Tổng điện phòng</TableHead>
                        <TableHead>Tổng nước phòng</TableHead>
                        <TableHead>Số người</TableHead>
                        <TableHead>Tiền điện</TableHead>
                        <TableHead>Tiền nước</TableHead>
                        <TableHead>Tổng tiền</TableHead>
                      </tr>
                    </thead>

                    <tbody>
                      {normalizedRecords.map((item) => (
                        <tr
                          key={item.id}
                          className="transition hover:bg-slate-50"
                        >
                          <TableCell className="font-semibold text-slate-900">
                            {String(item.month).padStart(2, "0")}/{item.year}
                          </TableCell>

                          <TableCell>
                            <div className="font-medium text-slate-800">
                              Phòng {item.room.roomNumber || "—"}
                            </div>

                            <div className="mt-1 text-xs text-slate-400">
                              Tòa {item.room.building || "—"} · Tầng{" "}
                              {item.room.floor || "—"}
                            </div>
                          </TableCell>

                          <TableCell>{item.semester || "—"}</TableCell>

                          <TableCell>
                            {formatMoney(item.roomElectricity)}
                          </TableCell>

                          <TableCell>{formatMoney(item.roomWater)}</TableCell>

                          <TableCell>{item.studentCount} người</TableCell>

                          <TableCell>
                            {formatMoney(item.studentElectricity)}
                          </TableCell>

                          <TableCell>
                            {formatMoney(item.studentWater)}
                          </TableCell>

                          <TableCell className="font-bold text-blue-700">
                            {formatMoney(item.studentTotal)}
                          </TableCell>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function normalizeStudentUtilityRecord(record) {
  const room = record.room || record.roomId || {};

  const roomElectricity = Number(
    record.roomAmount?.electricity ?? record.electricityAmount ?? 0,
  );

  const roomWater = Number(record.roomAmount?.water ?? record.waterAmount ?? 0);

  const roomTotal = Number(
    record.roomAmount?.total ??
      record.totalAmount ??
      roomElectricity + roomWater,
  );

  const studentCount = Math.max(1, Number(record.studentCount || 1));

  const studentElectricity = Number(
    record.studentAmount?.electricity ??
      Math.round(roomElectricity / studentCount),
  );

  const studentWater = Number(
    record.studentAmount?.water ?? Math.round(roomWater / studentCount),
  );

  const studentTotal = Number(
    record.studentAmount?.total ?? studentElectricity + studentWater,
  );

  const building =
    room.building?.name ||
    room.building?.buildingName ||
    room.building?.displayName ||
    room.building ||
    record.buildingName ||
    "";

  return {
    id:
      record.utilityUsageId ||
      record._id ||
      `${record.year}-${record.month}-${room._id || room.roomNumber}`,
    semester: record.semester || "",
    month: Number(record.month || 0),
    year: Number(record.year || 0),

    room: {
      _id: room._id || null,
      roomNumber: room.roomNumber || record.roomNumber || "",
      floor: room.floor || record.floor || "",
      building,
    },

    roomElectricity,
    roomWater,
    roomTotal,
    studentCount,
    studentElectricity,
    studentWater,
    studentTotal,
  };
}

function RecordTab({
  records,
  rows,
  loading,
  filters,
  current,
  pageSize,
  onFilterChange,
  onReset,
  onPageChange,
}) {
  return (
    <div className="p-5 sm:p-6">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <FilterInput
          name="buildingName"
          value={filters.buildingName}
          onChange={onFilterChange}
          placeholder="Tòa"
        />
        <FilterInput
          name="floor"
          value={filters.floor}
          onChange={onFilterChange}
          placeholder="Tầng"
          type="number"
        />
        <FilterInput
          name="roomNumber"
          value={filters.roomNumber}
          onChange={onFilterChange}
          placeholder="Phòng"
        />
        <FilterInput
          name="semester"
          value={filters.semester}
          onChange={onFilterChange}
          placeholder="Học kỳ"
        />
        <FilterInput
          name="month"
          value={filters.month}
          onChange={onFilterChange}
          placeholder="Tháng"
          type="number"
        />
        <FilterInput
          name="year"
          value={filters.year}
          onChange={onFilterChange}
          placeholder="Năm"
          type="number"
        />
      </div>

      <div className="mt-3 flex justify-end">
        <button
          type="button"
          onClick={onReset}
          className="h-9 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
        >
          Xóa bộ lọc
        </button>
      </div>

      <div className="mt-5 overflow-hidden rounded-xl border border-slate-200">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <TableHead>Tòa</TableHead>
                <TableHead>Tầng</TableHead>
                <TableHead>Phòng</TableHead>
                <TableHead>Học kỳ</TableHead>
                <TableHead>Tháng</TableHead>
                <TableHead>Tiền điện</TableHead>
                <TableHead>Tiền nước</TableHead>
                <TableHead>Tổng tiền</TableHead>
                <TableHead>Người import</TableHead>
                <TableHead>Ngày import</TableHead>
              </tr>
            </thead>

            <tbody>
              {loading ? (
                <TableMessage colSpan={10}>Đang tải dữ liệu...</TableMessage>
              ) : records.length === 0 ? (
                <TableMessage colSpan={10}>
                  Không có dữ liệu phù hợp
                </TableMessage>
              ) : (
                rows.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50">
                    <TableCell className="font-semibold text-slate-900">
                      {item.buildingName || item.roomId?.building?.name || "—"}
                    </TableCell>
                    <TableCell>
                      {item.floor || item.roomId?.floor || "—"}
                    </TableCell>
                    <TableCell>
                      {item.roomNumber || item.roomId?.roomNumber || "—"}
                    </TableCell>
                    <TableCell>{item.semester || "—"}</TableCell>
                    <TableCell>
                      {item.month && item.year
                        ? `${String(item.month).padStart(2, "0")}/${item.year}`
                        : "—"}
                    </TableCell>
                    <TableCell>{formatMoney(item.electricityAmount)}</TableCell>
                    <TableCell>{formatMoney(item.waterAmount)}</TableCell>
                    <TableCell className="font-bold text-blue-700">
                      {formatMoney(item.totalAmount)}
                    </TableCell>
                    <TableCell>
                      {item.importedBy?.fullName ||
                        item.importedBy?.username ||
                        "—"}
                    </TableCell>
                    <TableCell>{formatDate(item.createdAt)}</TableCell>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {records.length > 0 && (
        <PaginationFooter
          current={current}
          total={records.length}
          pageSize={pageSize}
          onChange={onPageChange}
          label="bản ghi"
        />
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-700">
        {label}
      </span>
      {children}
    </label>
  );
}

function MiniStat({ label, value, className = "text-slate-900" }) {
  return (
    <div>
      <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </div>
      <div className={`mt-1 font-bold ${className}`}>{value}</div>
    </div>
  );
}

function SummaryItem({ label, value, important = false }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div
        className={`mt-1 font-bold ${
          important ? "text-blue-700" : "text-slate-900"
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-4 py-4 text-sm font-semibold ${
        active
          ? "border-blue-600 text-blue-700"
          : "border-transparent text-slate-500 hover:text-slate-800"
      }`}
    >
      {children}
    </button>
  );
}

function FilterInput({ name, value, onChange, placeholder, type = "text" }) {
  return (
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      className="h-10 w-full rounded-lg border border-slate-300 px-3 text-sm text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
    />
  );
}

function PaginationFooter({ current, total, pageSize, onChange, label }) {
  return (
    <div className="mt-5 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row">
      <Pagination
        current={current}
        total={total}
        pageSize={pageSize}
        showSizeChanger
        showLessItems
        pageSizeOptions={["10", "20", "50"]}
        onChange={onChange}
      />
    </div>
  );
}

function TableMessage({ colSpan, children }) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className="px-4 py-12 text-center text-sm text-slate-500"
      >
        {children}
      </td>
    </tr>
  );
}

function StatusBadge({ status }) {
  const map = {
    unpaid: ["Chưa thanh toán", "bg-amber-50 text-amber-700"],
    paid: ["Đã thanh toán", "bg-emerald-50 text-emerald-700"],
    overdue: ["Quá hạn", "bg-red-50 text-red-700"],
    cancelled: ["Đã hủy", "bg-slate-100 text-slate-600"],
  };

  const [label, className] = map[status] || [
    status || "Không rõ",
    "bg-slate-100 text-slate-600",
  ];

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function TableHead({ children, className = "" }) {
  return (
    <th
      className={`border-b border-slate-200 px-4 py-3.5 font-bold ${className}`}
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

function includesText(source, filter) {
  if (!filter) return true;

  return String(source || "")
    .toLowerCase()
    .includes(String(filter).trim().toLowerCase());
}

function parseUtilityPeriod(invoiceCode) {
  const match = invoiceCode?.match(/^UTIL-(\d{4})-(\d{2})-/);

  if (!match) return null;

  return {
    year: Number(match[1]),
    month: Number(match[2]),
  };
}

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatDate(date) {
  if (!date) return "—";

  const parsedDate = new Date(date);
  if (Number.isNaN(parsedDate.getTime())) return "—";

  return parsedDate.toLocaleString("vi-VN", {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getTodayInputValue() {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;

  return new Date(now.getTime() - offset).toISOString().slice(0, 10);
}

export default UtilityInvoiceManagement;

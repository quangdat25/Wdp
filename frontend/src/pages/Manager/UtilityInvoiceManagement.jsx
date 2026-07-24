import { useEffect, useMemo, useRef, useState } from "react";
import { Pagination } from "antd";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import {showError, showSuccess } from "../../components/alert";
import {
  createUtilityInvoices,
  getAllUtilityUsages,
  getUtilityByStudentId,
  importUtilityExcel,
} from "../../api/utilityUsageService";
import { getAllInvoices } from "../../api/invoiceService";
import {
  FaCheckCircle,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaFileExcel,
  FaInfoCircle,
  FaRegTrashAlt,
  FaSpinner,
} from "react-icons/fa";
const EMPTY_FILTERS = {
  buildingName: "",
  floor: "",
  roomNumber: "",
  semester: "",
  month: "",
  year: "",
};

function UtilityInvoiceManagement() {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [records, setRecords] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingInvoices, setLoadingInvoices] = useState(false);
  const [creating, setCreating] = useState(false);
  const [activeTab, setActiveTab] = useState("invoices");

  const [formData, setFormData] = useState({
    semester: "",
    billingMonth: "",
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

  const monthOptions = useMemo(() => {
    if (!formData.semester) return [];

    return [
      ...new Set(
        records
          .filter((item) => item.semester === formData.semester)
          .map((item) => Number(item.month))
          .filter((month) => Number.isInteger(month) && month >= 1 && month <= 12),
      ),
    ].sort((a, b) => a - b);
  }, [records, formData.semester]);

  useEffect(() => {
    if (!formData.semester && semesterOptions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        semester: semesterOptions[0],
      }));
    }
  }, [semesterOptions, formData.semester]);

  useEffect(() => {
    if (!formData.semester) {
      setFormData((prev) => ({
        ...prev,
        billingMonth: "",
      }));
      return;
    }

    const currentMonth = Number(formData.billingMonth);
    const monthStillExists = monthOptions.includes(currentMonth);

    if (!monthStillExists) {
      setFormData((prev) => ({
        ...prev,
        billingMonth:
          monthOptions.length > 0 ? String(monthOptions[monthOptions.length - 1]) : "",
      }));
    }
  }, [formData.semester, formData.billingMonth, monthOptions]);

  const selectedMonthlyRecords = useMemo(() => {
    return records.filter(
      (item) =>
        item.semester === formData.semester &&
        Number(item.month) === Number(formData.billingMonth),
    );
  }, [records, formData.semester, formData.billingMonth]);

  const monthlySummary = useMemo(() => {
    const rooms = new Set();

    let electricity = 0;
    let water = 0;

    selectedMonthlyRecords.forEach((item) => {
      const roomKey =
        item.roomId?._id ||
        item.roomId ||
        `${item.buildingName}-${item.floor}-${item.roomNumber}`;

      rooms.add(String(roomKey));
      electricity += Number(item.electricityAmount || 0);
      water += Number(item.waterAmount || 0);
    });

    return {
      records: selectedMonthlyRecords.length,
      rooms: rooms.size,
      electricity,
      water,
      total: electricity + water,
    };
  }, [selectedMonthlyRecords]);

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

  const fileSize = useMemo(() => {
    if (!file) return "";

    const sizeInKB = file.size / 1024;
    return sizeInKB >= 1024
      ? `${(sizeInKB / 1024).toFixed(2)} MB`
      : `${sizeInKB.toFixed(1)} KB`;
  }, [file]);

  const canCreateInvoice =
    Boolean(formData.semester) &&
    Boolean(formData.billingMonth) &&
    Boolean(formData.dueDate) &&
    selectedMonthlyRecords.length > 0;

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const isExcel = fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isExcel) {
      showError("Chỉ được chọn file Excel có định dạng .xlsx hoặc .xls");
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      showError("Dung lượng file không được vượt quá 10 MB");
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
  };

  const handleFileChange = (event) => {
    validateAndSetFile(event.target.files?.[0]);
    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    if (!importLoading) setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);
    if (!importLoading) validateAndSetFile(event.dataTransfer.files?.[0]);
  };

  const handleChooseFile = () => {
    if (!importLoading) fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    if (importLoading) return;
    setFile(null);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      showError("Vui lòng chọn file Excel trước khi import");
      return;
    }

    try {
      setImportLoading(true);
      setImportResult(null);

      const response = await importUtilityExcel(file);
      const result = response?.data;

      setImportResult(result);
      setFile(null);
      showSuccess(result?.message || "Import dữ liệu tiền điện nước thành công");

      await fetchUtilityUsages();
      setActiveTab("records");
    } catch (error) {
      const data = error.response?.data;
      setImportResult(data || null);
      showError(data?.message || "Import tiền điện nước thất bại");
    } finally {
      setImportLoading(false);
    }
  };

  const handleCreateInvoices = async () => {
    if (
      !formData.semester ||
      !formData.billingMonth ||
      !formData.dueDate
    ) {
      showError("Vui lòng chọn học kỳ, tháng thanh toán và hạn thanh toán");
      return;
    }

    if (selectedMonthlyRecords.length === 0) {
      showError(
        `Học kỳ ${formData.semester} chưa có dữ liệu điện nước tháng ${String(
          formData.billingMonth,
        ).padStart(2, "0")}`,
      );
      return;
    }

    try {
      setCreating(true);

      const payload = {
        semester: formData.semester,
        billingMonth: Number(formData.billingMonth),
        dueDate: formData.dueDate,
      };

      const response = await createUtilityInvoices(payload);
      const result = response?.data?.data || [];

      const successCount = result.filter(
        (item) => item.status === "success",
      ).length;

      const skippedCount = result.filter(
        (item) => item.status === "skipped",
      ).length;

      const failedCount = result.filter(
        (item) => item.status === "failed",
      ).length;

      const periodLabel = `tháng ${String(formData.billingMonth).padStart(
        2,
        "0",
      )} - ${formData.semester}`;

      if (successCount > 0) {
        showSuccess(
          `Đã tạo ${successCount} hóa đơn ${periodLabel}` +
            (skippedCount > 0
              ? `, bỏ qua ${skippedCount} hóa đơn đã tồn tại`
              : "") +
            (failedCount > 0 ? `, ${failedCount} hóa đơn thất bại` : ""),
        );
      } else if (skippedCount > 0) {
        showSuccess(
          `Không có hóa đơn mới. ${skippedCount} hóa đơn ${periodLabel} đã tồn tại`,
        );
      }

      await fetchInvoices();
      setInvoicePage(1);
      setActiveTab("invoices");
    } catch (error) {
      showError(
        error.response?.data?.message ||
          "Tạo hóa đơn điện nước theo tháng thất bại",
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
          <ManagerPageHeader />

          <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(380px,0.85fr)]">
            <ManagerImportPanel
              file={file}
              fileSize={fileSize}
              loading={importLoading}
              isDragging={isDragging}
              fileInputRef={fileInputRef}
              onFileChange={handleFileChange}
              onChooseFile={handleChooseFile}
              onRemoveFile={handleRemoveFile}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onImport={handleImport}
            />

            <InvoiceCreationPanel
              formData={formData}
              setFormData={setFormData}
              semesterOptions={semesterOptions}
              monthOptions={monthOptions}
              loadingRecords={loadingRecords}
              selectedMonthlyRecords={selectedMonthlyRecords}
              monthlySummary={monthlySummary}
              creating={creating}
              canCreateInvoice={canCreateInvoice}
              onCreate={handleCreateInvoices}
            />
          </div>

          {importResult && (
            <ImportResultPanel
              result={importResult}
              onClose={() => setImportResult(null)}
            />
          )}

          <section className="mt-5 rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-wrap border-b border-slate-200 px-5">
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
                Dữ liệu điện nước đã import
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


function ManagerPageHeader() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative px-6 py-7 sm:px-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute bottom-0 right-24 h-28 w-28 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
              <FaFileExcel />
              Quản lý dịch vụ ký túc xá
            </div>
            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Điện nước và hóa đơn sinh viên
            </h1>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
              Import dữ liệu điện nước theo tháng, tạo hóa đơn tháng và theo dõi công nợ trên cùng một màn hình.
            </p>
          </div>

          <div className="grid min-w-fit grid-cols-2 gap-3">
            <HeaderMetric label="Bản ghi" value="Theo tháng" />
            <HeaderMetric label="Quy trình" value="Import → Hóa đơn" />
          </div>
        </div>
      </div>
    </section>
  );
}

function HeaderMetric({ label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/90 px-4 py-3 shadow-sm backdrop-blur">
      <div className="text-[11px] font-bold uppercase tracking-wide text-slate-400">{label}</div>
      <div className="mt-1 whitespace-nowrap text-sm font-extrabold text-slate-800">{value}</div>
    </div>
  );
}

function ManagerImportPanel({
  file,
  fileSize,
  loading,
  isDragging,
  fileInputRef,
  onFileChange,
  onChooseFile,
  onRemoveFile,
  onDragOver,
  onDragLeave,
  onDrop,
  onImport,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-xl text-emerald-700">
            <FaCloudUploadAlt />
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">1. Import tiền dịch vụ</h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Nhập tiền điện, tiền nước theo phòng và theo tháng từ file Excel.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.xls"
          onChange={onFileChange}
          className="hidden"
        />

        {!file ? (
          <div
            role="button"
            tabIndex={0}
            onClick={onChooseFile}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") onChooseFile();
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`cursor-pointer rounded-2xl border-2 border-dashed px-5 py-10 text-center transition ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/50"
            }`}
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-3xl text-blue-600 shadow-sm">
              <FaCloudUploadAlt />
            </div>
            <h3 className="mt-4 text-base font-black text-slate-800">
              {isDragging ? "Thả file vào đây" : "Kéo thả hoặc chọn file Excel"}
            </h3>
            <p className="mt-2 text-sm text-slate-500">Hỗ trợ .xlsx, .xls · tối đa 10 MB</p>
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChooseFile();
              }}
              className="mt-5 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white transition hover:bg-blue-700"
            >
              <FaFileExcel />
              Chọn file Excel
            </button>
          </div>
        ) : (
          <div className="rounded-2xl border border-blue-200 bg-blue-50/70 p-5">
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-xl text-emerald-700">
                  <FaFileExcel />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide text-blue-600">File đã chọn</div>
                  <div className="mt-1 truncate font-black text-slate-900" title={file.name}>{file.name}</div>
                  <div className="mt-1 text-sm font-medium text-slate-500">{fileSize} · Sẵn sàng import</div>
                </div>
              </div>
              <button
                type="button"
                onClick={onRemoveFile}
                disabled={loading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <FaRegTrashAlt />
                Xóa file
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center">
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <FaInfoCircle className="mt-0.5 shrink-0 text-blue-500" />
            <span>Toàn bộ dòng bắt buộc phải hợp lệ trước khi hệ thống lưu dữ liệu.</span>
          </div>
          <button
            type="button"
            onClick={onImport}
            disabled={!file || loading}
            className="inline-flex h-11 min-w-[170px] items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 text-sm font-extrabold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? <><FaSpinner className="animate-spin" />Đang import...</> : <><FaCloudUploadAlt />Import dữ liệu</>}
          </button>
        </div>
      </div>
    </section>
  );
}

function InvoiceCreationPanel({
  formData,
  setFormData,
  semesterOptions,
  monthOptions,
  loadingRecords,
  selectedMonthlyRecords,
  monthlySummary,
  creating,
  canCreateInvoice,
  onCreate,
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl font-black text-blue-700">
            2
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">
              Tạo hóa đơn theo tháng
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Chọn học kỳ, tháng đã import và hạn thanh toán cho sinh viên.
            </p>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Học kỳ">
            <select
              value={formData.semester}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  semester: event.target.value,
                  billingMonth: "",
                }))
              }
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
            >
              {semesterOptions.length === 0 && (
                <option value="">Chưa có học kỳ được import</option>
              )}

              {semesterOptions.map((semester) => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Tháng thanh toán">
            <select
              value={formData.billingMonth}
              onChange={(event) =>
                setFormData((prev) => ({
                  ...prev,
                  billingMonth: event.target.value,
                }))
              }
              disabled={!formData.semester || monthOptions.length === 0}
              className="h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              {monthOptions.length === 0 ? (
                <option value="">Chưa có tháng được import</option>
              ) : (
                monthOptions.map((month) => (
                  <option key={month} value={String(month)}>
                    Tháng {String(month).padStart(2, "0")}
                  </option>
                ))
              )}
            </select>
          </Field>

          <div className="sm:col-span-2">
            <Field label="Hạn thanh toán">
              <input
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
          </div>
        </div>

        <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
          {loadingRecords ? (
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <FaSpinner className="animate-spin" />
              Đang kiểm tra dữ liệu...
            </div>
          ) : !formData.semester ? (
            <div className="flex items-start gap-2 text-sm font-medium text-amber-700">
              <FaExclamationTriangle className="mt-0.5" />
              Chưa có học kỳ được import.
            </div>
          ) : monthOptions.length === 0 ? (
            <div className="flex items-start gap-2 text-sm font-medium text-amber-700">
              <FaExclamationTriangle className="mt-0.5" />
              Học kỳ đã chọn chưa có dữ liệu điện nước theo tháng.
            </div>
          ) : selectedMonthlyRecords.length === 0 ? (
            <div className="flex items-start gap-2 text-sm font-medium text-amber-700">
              <FaExclamationTriangle className="mt-0.5" />
              Tháng đã chọn chưa có dữ liệu điện nước.
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <MiniStat label="Bản ghi" value={monthlySummary.records} />
              <MiniStat label="Phòng" value={monthlySummary.rooms} />
              <MiniStat
                label="Tiền điện"
                value={formatMoney(monthlySummary.electricity)}
              />
              <MiniStat
                label="Tiền nước"
                value={formatMoney(monthlySummary.water)}
              />

              <div className="col-span-2 border-t border-slate-200 pt-3">
                <MiniStat
                  label={`Tổng dịch vụ tháng ${String(
                    formData.billingMonth,
                  ).padStart(2, "0")}`}
                  value={formatMoney(monthlySummary.total)}
                  className="text-blue-700"
                />
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={onCreate}
          disabled={creating || !canCreateInvoice}
          className="mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 text-sm font-extrabold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {creating ? (
            <>
              <FaSpinner className="animate-spin" />
              Đang tạo hóa đơn...
            </>
          ) : (
            <>
              <FaCheckCircle />
              Tạo hóa đơn tháng{" "}
              {formData.billingMonth
                ? String(formData.billingMonth).padStart(2, "0")
                : ""}
            </>
          )}
        </button>
      </div>
    </section>
  );
}

function ImportResultPanel({ result, onClose }) {
  const errors = Array.isArray(result?.errors) ? result.errors : [];
  const existedRows = Array.isArray(result?.existedRows) ? result.existedRows : [];
  const success = Boolean(result?.success);

  return (
    <section className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col justify-between gap-4 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${success ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {success ? <FaCheckCircle /> : <FaExclamationTriangle />}
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900">Kết quả import</h2>
            <p className="mt-1 text-sm text-slate-500">{result?.message || "Hệ thống đã xử lý file Excel."}</p>
          </div>
        </div>
        <button type="button" onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">Đóng</button>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ResultMetric label="Tổng dòng" value={result?.totalRows || 0} />
          <ResultMetric label="Đã import" value={result?.imported || 0} className="text-emerald-700" />
          <ResultMetric label="Đã tồn tại" value={result?.existed || 0} className="text-amber-700" />
          <ResultMetric label="Có lỗi" value={result?.failed || 0} className="text-red-700" />
        </div>

        {errors.length > 0 && (
          <div className="mt-5 overflow-hidden rounded-xl border border-red-200">
            <div className="bg-red-50 px-4 py-3 text-sm font-bold text-red-700">Danh sách dữ liệu lỗi</div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] text-left">
                <thead><tr className="bg-slate-50 text-xs font-bold uppercase text-slate-500"><TableHead>Dòng</TableHead><TableHead>Cột</TableHead><TableHead>Tòa</TableHead><TableHead>Tầng</TableHead><TableHead>Phòng</TableHead><TableHead>Nội dung lỗi</TableHead></tr></thead>
                <tbody>{errors.map((item, index) => <tr key={`${item.row || "row"}-${index}`}><TableCell>{item.row || "—"}</TableCell><TableCell>{item.column || "—"}</TableCell><TableCell>{item.buildingName || "—"}</TableCell><TableCell>{item.floor || "—"}</TableCell><TableCell>{item.roomNumber || "—"}</TableCell><TableCell className="font-medium text-red-600">{item.reason || "Dữ liệu không hợp lệ"}</TableCell></tr>)}</tbody>
              </table>
            </div>
          </div>
        )}

        {existedRows.length > 0 && (
          <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-800">
            Có {existedRows.length} bản ghi đã tồn tại nên hệ thống không tạo lại.
          </div>
        )}
      </div>
    </section>
  );
}

function ResultMetric({ label, value, className = "text-slate-900" }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-4">
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">{label}</div>
      <div className={`mt-2 text-2xl font-black ${className}`}>{value}</div>
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
      invoice,
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
          <table className="w-full min-w-[1320px] text-left">
            <thead>
              <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                <TableHead>Mã hóa đơn</TableHead>
                <TableHead>Học kỳ</TableHead>
                <TableHead>Tháng</TableHead>
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
                <TableMessage colSpan={12}>Đang tải hóa đơn...</TableMessage>
              ) : invoices.length === 0 ? (
                <TableMessage colSpan={12}>
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
                  return (
                    <tr key={invoice._id} className="hover:bg-slate-50">
                      <TableCell className="font-semibold text-slate-900">
                        {invoice.invoiceCode || "—"}
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700">
                          {invoice.semester ||
                            invoice.bookingId?.semester ||
                            "—"}
                        </span>
                      </TableCell>

                      <TableCell>
                        <span className="inline-flex whitespace-nowrap rounded-lg bg-blue-50 px-2.5 py-1.5 text-xs font-bold text-blue-700">
                          {invoice.billingMonth
                            ? `Tháng ${String(invoice.billingMonth).padStart(
                                2,
                                "0",
                              )}`
                            : "—"}
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
  const invoice = selectedStudent?.invoice || {};

  const normalizedRecords = useMemo(() => {
    return records
      .map(normalizeStudentUtilityRecord)
      .filter((item) => {
        const sameSemester =
          !invoice.semester || item.semester === invoice.semester;

        const sameMonth =
          !invoice.billingMonth ||
          item.month === Number(invoice.billingMonth);

        return sameSemester && sameMonth;
      })
      .sort((a, b) => {
        if (a.year !== b.year) return b.year - a.year;
        return b.month - a.month;
      });
  }, [records, invoice.semester, invoice.billingMonth]);

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
              Chi tiết hóa đơn điện nước
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              {student.fullName || student.username || "Sinh viên"}
              {student.studentCode ? ` · ${student.studentCode}` : ""}
              {room?.roomNumber ? ` · Phòng ${room.roomNumber}` : ""}
              {invoice.billingMonth
                ? ` · Tháng ${String(invoice.billingMonth).padStart(2, "0")}`
                : ""}
              {invoice.semester ? ` · ${invoice.semester}` : ""}
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
              Không tìm thấy dữ liệu điện nước của hóa đơn này.
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
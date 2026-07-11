import { useMemo, useRef, useState } from "react";
import {
  FaCheckCircle,
  FaCloudUploadAlt,
  FaExclamationTriangle,
  FaFileExcel,
  FaInfoCircle,
  FaRegTrashAlt,
  FaSpinner,
  FaTimesCircle,
} from "react-icons/fa";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showError, showSuccess } from "../../components/alert";
import { importUtilityExcel } from "../../api/utilityUsageService";

function UtilityUsageManagement() {
  const fileInputRef = useRef(null);

  const [file, setFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const fileSize = useMemo(() => {
    if (!file) return "";

    const sizeInKB = file.size / 1024;

    if (sizeInKB >= 1024) {
      return `${(sizeInKB / 1024).toFixed(2)} MB`;
    }

    return `${sizeInKB.toFixed(1)} KB`;
  }, [file]);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();

    const isExcel =
      fileName.endsWith(".xlsx") || fileName.endsWith(".xls");

    if (!isExcel) {
      showError("Chỉ được chọn file Excel có định dạng .xlsx hoặc .xls");
      return;
    }

    const maxSize = 10 * 1024 * 1024;

    if (selectedFile.size > maxSize) {
      showError("Dung lượng file không được vượt quá 10 MB");
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
  };

  const handleFileChange = (event) => {
    const selectedFile = event.target.files?.[0];

    validateAndSetFile(selectedFile);

    event.target.value = "";
  };

  const handleDragOver = (event) => {
    event.preventDefault();

    if (!importLoading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragging(false);

    if (importLoading) return;

    const selectedFile = event.dataTransfer.files?.[0];

    validateAndSetFile(selectedFile);
  };

  const handleRemoveFile = () => {
    if (importLoading) return;

    setFile(null);
    setImportResult(null);
  };

  const handleChooseFile = () => {
    if (importLoading) return;

    fileInputRef.current?.click();
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

      showSuccess(
        result?.message || "Import dữ liệu tiền điện nước thành công",
      );
    } catch (error) {
      const data = error.response?.data;

      setImportResult(data || null);

      if (data?.errors?.length > 0) {
        showError(data.message || "File có dữ liệu không hợp lệ");
      } else {
        showError(data?.message || "Import tiền điện nước thất bại");
      }
    } finally {
      setImportLoading(false);
    }
  };

  const totalRows = Number(importResult?.totalRows || 0);
  const importedRows = Number(importResult?.imported || 0);
  const failedRows = Number(importResult?.failed || 0);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-h-screen px-4 pb-10 pt-5 lg:ml-[270px] lg:w-[calc(100%-270px)] lg:px-7">
        <Header />

        <div className="mx-auto mt-6 max-w-[1500px]">
          <PageHeader />

          <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
            <div className="space-y-6">
              <UploadSection
                file={file}
                fileSize={fileSize}
                isDragging={isDragging}
                importLoading={importLoading}
                fileInputRef={fileInputRef}
                onFileChange={handleFileChange}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onChooseFile={handleChooseFile}
                onRemoveFile={handleRemoveFile}
                onImport={handleImport}
              />

              {importResult && (
                <ImportResultSection
                  importResult={importResult}
                  totalRows={totalRows}
                  importedRows={importedRows}
                  failedRows={failedRows}
                />
              )}
            </div>

            <div className="space-y-6">
              <FileRequirementCard />
              <ProcessCard />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function PageHeader() {
  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="relative px-6 py-7 sm:px-8">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute bottom-0 right-24 h-28 w-28 rounded-full bg-emerald-100/70 blur-3xl" />

        <div className="relative flex flex-col justify-between gap-5 lg:flex-row lg:items-center">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1.5 text-sm font-bold text-blue-700">
              <FaFileExcel />
              Quản lý điện nước
            </div>

            <h1 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
              Import dữ liệu tiền điện nước
            </h1>

            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 sm:text-base">
              Tải dữ liệu điện nước theo phòng và theo tháng. Hệ thống sẽ kiểm
              tra cấu trúc file trước khi lưu để manager tạo hóa đơn.
            </p>
          </div>

          <div className="flex min-w-fit items-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700">
              <FaCheckCircle />
            </div>

            <div>
              <div className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Định dạng hỗ trợ
              </div>
              <div className="mt-0.5 font-extrabold text-emerald-900">
                Excel .xlsx và .xls
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function UploadSection({
  file,
  fileSize,
  isDragging,
  importLoading,
  fileInputRef,
  onFileChange,
  onDragOver,
  onDragLeave,
  onDrop,
  onChooseFile,
  onRemoveFile,
  onImport,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-xl text-blue-700">
            <FaCloudUploadAlt />
          </div>

          <div>
            <h2 className="text-lg font-black text-slate-900">
              Tải file dữ liệu
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              Chọn hoặc kéo thả file Excel vào khu vực bên dưới.
            </p>
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-7">
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
              if (event.key === "Enter" || event.key === " ") {
                onChooseFile();
              }
            }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            className={`group cursor-pointer rounded-3xl border-2 border-dashed px-5 py-12 text-center transition-all duration-200 ${
              isDragging
                ? "border-blue-500 bg-blue-50"
                : "border-slate-300 bg-slate-50/70 hover:border-blue-400 hover:bg-blue-50/50"
            }`}
          >
            <div
              className={`mx-auto flex h-16 w-16 items-center justify-center rounded-2xl text-3xl transition ${
                isDragging
                  ? "bg-blue-600 text-white"
                  : "bg-white text-blue-600 shadow-sm group-hover:scale-105"
              }`}
            >
              <FaCloudUploadAlt />
            </div>

            <h3 className="mt-5 text-lg font-black text-slate-800">
              {isDragging
                ? "Thả file vào đây"
                : "Kéo thả file Excel hoặc chọn từ máy"}
            </h3>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Hỗ trợ file .xlsx, .xls với dung lượng tối đa 10 MB.
            </p>

            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                onChooseFile();
              }}
              className="mt-6 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100"
            >
              <FaFileExcel />
              Chọn file Excel
            </button>
          </div>
        ) : (
          <div className="rounded-3xl border border-blue-200 bg-blue-50/60 p-5 sm:p-6">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 items-center gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-2xl text-emerald-700">
                  <FaFileExcel />
                </div>

                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-wide text-blue-600">
                    File đã chọn
                  </div>

                  <div
                    className="mt-1 truncate text-base font-black text-slate-900"
                    title={file.name}
                  >
                    {file.name}
                  </div>

                  <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm font-semibold text-slate-500">
                    <span>{fileSize}</span>
                    <span className="hidden h-1 w-1 rounded-full bg-slate-300 sm:block" />
                    <span>Sẵn sàng import</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={onRemoveFile}
                disabled={importLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <FaRegTrashAlt />
                Xóa file
              </button>
            </div>
          </div>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-2 text-sm text-slate-500">
            <FaInfoCircle className="mt-0.5 shrink-0 text-blue-500" />
            <span>
              Dữ liệu chỉ được lưu khi toàn bộ thông tin bắt buộc hợp lệ.
            </span>
          </div>

          <button
            type="button"
            onClick={onImport}
            disabled={!file || importLoading}
            className="inline-flex h-12 min-w-[180px] items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 text-sm font-extrabold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
          >
            {importLoading ? (
              <>
                <FaSpinner className="animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <FaCloudUploadAlt />
                Import dữ liệu
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}

function ImportResultSection({
  importResult,
  totalRows,
  importedRows,
  failedRows,
}) {
  const hasErrors = importResult?.errors?.length > 0;
  const isSuccess = Boolean(importResult?.success);

  return (
    <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-6 py-5 sm:px-7">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-start gap-3">
            <div
              className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-xl ${
                isSuccess
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {isSuccess ? <FaCheckCircle /> : <FaExclamationTriangle />}
            </div>

            <div>
              <h2 className="text-lg font-black text-slate-900">
                Kết quả import
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                {importResult?.message ||
                  "Chi tiết dữ liệu sau khi hệ thống xử lý."}
              </p>
            </div>
          </div>

          <StatusBadge success={isSuccess} />
        </div>
      </div>

      <div className="p-5 sm:p-7">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <ResultCard
            title="Tổng dòng"
            value={totalRows}
            type="default"
          />

          <ResultCard
            title="Đã import"
            value={importedRows}
            type="success"
          />

          <ResultCard title="Có lỗi" value={failedRows} type="error" />

          <ResultCard
            title="Tỷ lệ thành công"
            value={
              totalRows > 0
                ? `${Math.round((importedRows / totalRows) * 100)}%`
                : "0%"
            }
            type="info"
          />
        </div>

        {isSuccess && !hasErrors && (
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4 text-sm text-emerald-800">
            <FaCheckCircle className="mt-0.5 shrink-0 text-lg" />

            <div>
              <div className="font-extrabold">
                Import dữ liệu thành công
              </div>

              <p className="mt-1 leading-6">
                Manager có thể kiểm tra dữ liệu và tạo hóa đơn điện nước cho
                sinh viên.
              </p>
            </div>
          </div>
        )}

        {hasErrors && (
          <div className="mt-6">
            <div className="mb-4 flex flex-col justify-between gap-2 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-black text-slate-900">
                  Danh sách dữ liệu lỗi
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Kiểm tra và chỉnh sửa các dòng bên dưới trước khi import lại.
                </p>
              </div>

              <div className="inline-flex w-fit items-center gap-2 rounded-full bg-red-50 px-3 py-1.5 text-sm font-bold text-red-700">
                <FaTimesCircle />
                {importResult.errors.length} lỗi
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-black uppercase tracking-wide text-slate-500">
                      <TableHead className="w-16 text-center">STT</TableHead>
                      <TableHead>Dòng Excel</TableHead>
                      <TableHead>Cột lỗi</TableHead>
                      <TableHead>Tòa</TableHead>
                      <TableHead>Tầng</TableHead>
                      <TableHead>Phòng</TableHead>
                      <TableHead className="min-w-[260px]">
                        Nội dung lỗi
                      </TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {importResult.errors.map((error, index) => (
                      <tr
                        key={`${error.row || "row"}-${index}`}
                        className="transition hover:bg-slate-50"
                      >
                        <TableCell className="text-center font-bold text-slate-400">
                          {index + 1}
                        </TableCell>

                        <TableCell>
                          <span className="font-extrabold text-slate-800">
                            {error.row || "-"}
                          </span>
                        </TableCell>

                        <TableCell>
                          <span className="inline-flex rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-extrabold text-amber-700">
                            {error.column || "Không xác định"}
                          </span>
                        </TableCell>

                        <TableCell>{error.buildingName || "-"}</TableCell>
                        <TableCell>{error.floor || "-"}</TableCell>
                        <TableCell>{error.roomNumber || "-"}</TableCell>

                        <TableCell>
                          <div className="flex items-start gap-2 font-semibold text-red-600">
                            <FaExclamationTriangle className="mt-0.5 shrink-0" />
                            <span>{error.reason || "Không rõ lỗi"}</span>
                          </div>
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function FileRequirementCard() {
  const columns = [
    "Tòa",
    "Tầng",
    "Phòng",
    "Tiền điện",
    "Tiền nước",
    "Tháng",
    "Năm",
    "Kỳ",
    "Tổng tiền",
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-amber-50 text-lg text-amber-700">
          <FaInfoCircle />
        </div>

        <div>
          <h2 className="font-black text-slate-900">Cấu trúc file Excel</h2>
          <p className="mt-1 text-sm leading-6 text-slate-500">
            File cần có đầy đủ các cột dưới đây và đúng tên tiêu đề.
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {columns.map((column) => (
          <span
            key={column}
            className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold text-slate-700"
          >
            {column}
          </span>
        ))}
      </div>

      <div className="mt-5 rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-800">
        Không đổi tên cột, không gộp ô và không để trống các thông tin bắt buộc.
      </div>
    </section>
  );
}

function ProcessCard() {
  const steps = [
    {
      number: "01",
      title: "Chọn file",
      description: "Chọn file Excel dữ liệu điện nước từ máy.",
    },
    {
      number: "02",
      title: "Kiểm tra dữ liệu",
      description: "Hệ thống xác thực phòng, tháng, kỳ và số tiền.",
    },
    {
      number: "03",
      title: "Lưu dữ liệu",
      description: "Dữ liệu hợp lệ được lưu để manager xử lý.",
    },
    {
      number: "04",
      title: "Tạo hóa đơn",
      description: "Manager kiểm tra và tạo hóa đơn cho sinh viên.",
    },
  ];

  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="font-black text-slate-900">Quy trình xử lý</h2>

      <div className="mt-5 space-y-5">
        {steps.map((step, index) => (
          <div key={step.number} className="relative flex gap-3">
            {index !== steps.length - 1 && (
              <div className="absolute left-4 top-9 h-[calc(100%+4px)] w-px bg-slate-200" />
            )}

            <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-black text-blue-700">
              {step.number}
            </div>

            <div className="pb-1">
              <div className="text-sm font-extrabold text-slate-800">
                {step.title}
              </div>

              <p className="mt-1 text-sm leading-5 text-slate-500">
                {step.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function ResultCard({ title, value, type = "default" }) {
  const styles = {
    default: {
      wrapper: "border-slate-200 bg-slate-50",
      value: "text-slate-900",
    },
    success: {
      wrapper: "border-emerald-200 bg-emerald-50",
      value: "text-emerald-700",
    },
    error: {
      wrapper: "border-red-200 bg-red-50",
      value: "text-red-700",
    },
    info: {
      wrapper: "border-blue-200 bg-blue-50",
      value: "text-blue-700",
    },
  };

  const currentStyle = styles[type] || styles.default;

  return (
    <div className={`rounded-2xl border p-4 ${currentStyle.wrapper}`}>
      <div className="text-xs font-bold uppercase tracking-wide text-slate-500">
        {title}
      </div>

      <div className={`mt-2 text-2xl font-black ${currentStyle.value}`}>
        {value}
      </div>
    </div>
  );
}

function StatusBadge({ success }) {
  return (
    <span
      className={`inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-sm font-extrabold ${
        success
          ? "bg-emerald-50 text-emerald-700"
          : "bg-amber-50 text-amber-700"
      }`}
    >
      {success ? <FaCheckCircle /> : <FaExclamationTriangle />}
      {success ? "Import thành công" : "Cần kiểm tra"}
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
      className={`border-b border-slate-100 px-4 py-4 text-sm text-slate-600 ${className}`}
    >
      {children}
    </td>
  );
}

export default UtilityUsageManagement;
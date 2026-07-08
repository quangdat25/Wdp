import { useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showError, showSuccess } from "../../components/alert";
import { importUtilityExcel } from "../../api/utilityUsageService";

function UtilityUsageManagement() {
  const [file, setFile] = useState(null);
  const [importLoading, setImportLoading] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const fileSize = useMemo(() => {
    if (!file) return "";
    return `${(file.size / 1024).toFixed(1)} KB`;
  }, [file]);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) return;

    const isExcel =
      selectedFile.name.endsWith(".xlsx") ||
      selectedFile.name.endsWith(".xls");

    if (!isExcel) {
      showError("Chỉ được chọn file Excel .xlsx hoặc .xls");
      e.target.value = "";
      return;
    }

    setFile(selectedFile);
    setImportResult(null);
    e.target.value = "";
  };

  const handleRemoveFile = () => {
    setFile(null);
    setImportResult(null);
  };

  const handleImport = async () => {
    if (!file) {
      showError("Vui lòng chọn file Excel");
      return;
    }

    try {
      setImportLoading(true);

      const res = await importUtilityExcel(file);

      setImportResult(res.data);
      setFile(null);
      showSuccess("Import tiền điện nước thành công");
    } catch (error) {
      const data = error.response?.data;

      setImportResult(data || null);

      if (data?.errors?.length > 0) {
        showError(data.message || "File có lỗi, vui lòng kiểm tra lại");
      } else {
        showError(data?.message || "Import tiền điện nước thất bại");
      }
    } finally {
      setImportLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-emerald-50">
      <Sidebar />

      <main className="ml-[270px] min-h-screen w-[calc(100%-270px)] px-7 py-6">
        <Header />

        <div className="mb-6 rounded-3xl border border-slate-200/70 bg-white/80 px-6 py-6 shadow-sm backdrop-blur">
          <h1 className="m-0 text-3xl font-extrabold text-blue-800">
            Import tiền điện nước
          </h1>
          <p className="mt-2 text-slate-500">
            Nhân viên chỉ cần upload file Excel tiền điện nước theo tháng.
            Manager sẽ kiểm tra và chốt hóa đơn sau.
          </p>
        </div>

        <section className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <InfoCard title="Định dạng" value=".xlsx / .xls" />
          <InfoCard title="Dữ liệu" value="Theo phòng, theo tháng" />
          <InfoCard title="Người xử lý tiếp" value="Manager" />
        </section>

        <section className="rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
          <div className="mb-5">
            <h2 className="text-xl font-extrabold text-slate-800">
              Chọn file Excel
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              File cần có đúng các cột:{" "}
              <b>Tòa, Tầng, Phòng, Tiền điện, Tiền nước, Tháng, Năm, Kỳ, Tổng tiền</b>
            </p>
          </div>

          <div className="rounded-3xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
            <div className="text-lg font-extrabold text-slate-800">
              Tải lên file tiền điện nước
            </div>

            <p className="mt-2 text-sm text-slate-500">
              Chọn file Excel đã được điền theo mẫu chuẩn.
            </p>

            <label className="mt-6 inline-flex cursor-pointer rounded-2xl bg-blue-600 px-6 py-3 font-bold text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700">
              Chọn file Excel
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {file && (
              <div className="mx-auto mt-6 max-w-xl rounded-3xl border border-blue-100 bg-white p-5 text-left shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-extrabold text-slate-800">
                      {file.name}
                    </div>
                    <div className="mt-1 text-sm font-semibold text-slate-500">
                      Dung lượng: {fileSize}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    disabled={importLoading}
                    className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-700 hover:bg-red-100 hover:text-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Xóa file
                  </button>
                </div>
              </div>
            )}

            {file && (
              <button
                type="button"
                onClick={handleImport}
                disabled={importLoading}
                className="mt-6 h-12 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 px-8 font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-700 hover:to-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {importLoading ? "Đang import..." : "Import dữ liệu"}
              </button>
            )}
          </div>
        </section>

        {importResult && (
          <section className="mt-6 rounded-3xl border border-slate-200/70 bg-white/90 p-6 shadow-lg">
            <h2 className="mb-5 text-xl font-extrabold text-slate-800">
              Kết quả import
            </h2>

            <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-4">
              <InfoCard title="Tổng dòng" value={importResult.totalRows || 0} />
              <InfoCard title="Đã import" value={importResult.imported || 0} />
              <InfoCard title="Lỗi" value={importResult.failed || 0} />
              <InfoCard
                title="Trạng thái"
                value={importResult.success ? "Thành công" : "Có lỗi"}
              />
            </div>

            {importResult.errors?.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[900px] bg-white text-left">
                  <thead>
                    <tr className="bg-red-50 text-sm text-red-700">
                      <TableHead>Dòng</TableHead>
                      <TableHead>Cột</TableHead>
                      <TableHead>Tòa</TableHead>
                      <TableHead>Tầng</TableHead>
                      <TableHead>Phòng</TableHead>
                      <TableHead>Lý do</TableHead>
                    </tr>
                  </thead>

                  <tbody>
                    {importResult.errors.map((error, index) => (
                      <tr key={index} className="hover:bg-slate-50">
                        <TableCell>{error.row || "-"}</TableCell>
                        <TableCell>{error.column || "-"}</TableCell>
                        <TableCell>{error.buildingName || "-"}</TableCell>
                        <TableCell>{error.floor || "-"}</TableCell>
                        <TableCell>{error.roomNumber || "-"}</TableCell>
                        <TableCell className="font-semibold text-red-600">
                          {error.reason || "Không rõ lỗi"}
                        </TableCell>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {importResult.success && (
              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 font-semibold text-emerald-700">
                Dữ liệu đã được import thành công. Manager có thể kiểm tra và
                tạo hóa đơn điện nước cho sinh viên.
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}

function InfoCard({ title, value }) {
  return (
    <div className="rounded-3xl border border-slate-200/70 bg-white/90 p-5 shadow-sm">
      <div className="font-bold text-slate-500">{title}</div>
      <div className="mt-2 text-2xl font-extrabold text-slate-800">
        {value}
      </div>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="border-b border-red-100 px-4 py-4 font-extrabold">
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

export default UtilityUsageManagement;
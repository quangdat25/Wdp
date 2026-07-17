import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import { FaSpinner } from "react-icons/fa";

import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import { showError } from "../../components/alert";
import { getMyUtilities } from "../../api/utilityUsageService";

function MyUtilities() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [semesterFilter, setSemesterFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchUtilities = async () => {
    try {
      setLoading(true);

      const response = await getMyUtilities();
      const data = response?.data?.data || response?.data || [];

      setRecords(Array.isArray(data) ? data : []);
    } catch (error) {
      showError(
        error.response?.data?.message || "Không thể tải dữ liệu điện nước",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUtilities();
  }, []);

  const normalizedRecords = useMemo(() => {
    return records.map(normalizeUtilityRecord).sort((a, b) => {
      if (a.year !== b.year) return b.year - a.year;
      return b.month - a.month;
    });
  }, [records]);

  const semesterOptions = useMemo(() => {
    return [
      ...new Set(
        normalizedRecords.map((item) => item.semester).filter(Boolean),
      ),
    ];
  }, [normalizedRecords]);

  const yearOptions = useMemo(() => {
    return [
      ...new Set(normalizedRecords.map((item) => item.year).filter(Boolean)),
    ].sort((a, b) => b - a);
  }, [normalizedRecords]);

  const filteredRecords = useMemo(() => {
    return normalizedRecords.filter((item) => {
      const matchSemester =
        semesterFilter === "all" || item.semester === semesterFilter;

      const matchYear =
        yearFilter === "all" || String(item.year) === yearFilter;

      return matchSemester && matchYear;
    });
  }, [normalizedRecords, semesterFilter, yearFilter]);

  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize;

    return filteredRecords.slice(startIndex, startIndex + pageSize);
  }, [filteredRecords, currentPage, pageSize]);

  const totalAmount = useMemo(() => {
    return filteredRecords.reduce((sum, item) => sum + item.studentTotal, 0);
  }, [filteredRecords]);

  useEffect(() => {
    const maxPage = Math.max(1, Math.ceil(filteredRecords.length / pageSize));

    if (currentPage > maxPage) {
      setCurrentPage(maxPage);
    }
  }, [filteredRecords.length, pageSize, currentPage]);

  const handleSemesterChange = (event) => {
    setSemesterFilter(event.target.value);
    setCurrentPage(1);
  };

  const handleYearChange = (event) => {
    setYearFilter(event.target.value);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar />

      <main className="min-h-screen px-4 pb-10 pt-5 lg:ml-[270px] lg:w-[calc(100%-270px)] lg:px-7">
        <Header />

        <div className="mx-auto mt-6 max-w-[1500px]">
          <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
              <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-end">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    Điện nước theo tháng
                  </h1>

                  <p className="mt-1 text-sm text-slate-500">
                    Theo dõi chi phí điện nước được chia cho bạn theo từng
                    tháng.
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <FilterSelect
                    value={semesterFilter}
                    onChange={handleSemesterChange}
                  >
                    <option value="all">Tất cả học kỳ</option>

                    {semesterOptions.map((semester) => (
                      <option key={semester} value={semester}>
                        {semester}
                      </option>
                    ))}
                  </FilterSelect>

                  <FilterSelect value={yearFilter} onChange={handleYearChange}>
                    <option value="all">Tất cả năm</option>

                    {yearOptions.map((year) => (
                      <option key={year} value={String(year)}>
                        Năm {year}
                      </option>
                    ))}
                  </FilterSelect>
                </div>
              </div>

              {!loading && filteredRecords.length > 0 && (
                <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-slate-100 pt-4 text-sm">
                  <span className="text-slate-500">
                    Tổng:{" "}
                    <b className="text-blue-700">{formatMoney(totalAmount)}</b>
                  </span>
                </div>
              )}
            </div>

            <div className="p-4 sm:p-6">
              {loading ? (
                <LoadingState />
              ) : filteredRecords.length === 0 ? (
                <EmptyState />
              ) : (
                <>
                  <div className="hidden overflow-hidden rounded-xl border border-slate-200 xl:block">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[1100px] text-left">
                        <thead>
                          <tr className="bg-slate-50 text-xs font-bold uppercase tracking-wide text-slate-500">
                            <TableHead>Tháng</TableHead>
                            <TableHead>Phòng</TableHead>
                            <TableHead>Học kỳ</TableHead>
                            <TableHead>Tổng tiền phòng</TableHead>
                            <TableHead>Tiền điện</TableHead>
                            <TableHead>Tiền nước</TableHead>
                            <TableHead>Tổng tiền</TableHead>
                          </tr>
                        </thead>

                        <tbody>
                          {paginatedRecords.map((record) => (
                            <UtilityTableRow key={record.id} record={record} />
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:hidden">
                    {paginatedRecords.map((record) => (
                      <UtilityMobileCard key={record.id} record={record} />
                    ))}
                  </div>

                  <div className="mt-6 flex flex-col items-center justify-between gap-4 border-t border-slate-100 pt-5 sm:flex-row">
                    <Pagination
                      current={currentPage}
                      total={filteredRecords.length}
                      pageSize={pageSize}
                      showSizeChanger
                      showLessItems
                      pageSizeOptions={["5", "10", "15", "20"]}
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

function UtilityTableRow({ record }) {
  return (
    <tr className="transition hover:bg-slate-50">
      <TableCell>
        <div className="font-semibold text-slate-900">
          Tháng {String(record.month).padStart(2, "0")}/{record.year}
        </div>

        {record.importedAt && (
          <div className="mt-1 text-xs text-slate-400">
            Cập nhật {formatDate(record.importedAt)}
          </div>
        )}
      </TableCell>

      <TableCell>
        <div className="font-semibold text-slate-800">
          Phòng {record.room.roomNumber || "-"}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          Tòa {record.room.building || "-"} · Tầng {record.room.floor || "-"}
        </div>
      </TableCell>

      <TableCell>
        <span className="font-medium text-slate-700">
          {record.semester || "Không xác định"}
        </span>
      </TableCell>

      <TableCell>
        <div className="space-y-1.5 text-sm">
          <div className="flex items-center">
            <span className="w-14 text-slate-500">Điện</span>
            <span className="font-medium text-slate-700">
              {formatMoney(record.roomElectricity)}
            </span>
          </div>

          <div className="flex items-center">
            <span className="w-14 text-slate-500">Nước</span>
            <span className="font-medium text-slate-700">
              {formatMoney(record.roomWater)}
            </span>
          </div>
        </div>
      </TableCell>

      <TableCell>
        <span className="whitespace-nowrap font-medium text-slate-700">
          {formatMoney(record.studentElectricity)}
        </span>
      </TableCell>

      <TableCell>
        <span className="whitespace-nowrap font-medium text-slate-700">
          {formatMoney(record.studentWater)}
        </span>
      </TableCell>

      <TableCell>
        <span className="whitespace-nowrap font-bold text-blue-700">
          {formatMoney(record.studentTotal)}
        </span>
      </TableCell>
    </tr>
  );
}

function UtilityMobileCard({ record }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Tháng {String(record.month).padStart(2, "0")}/{record.year}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Phòng {record.room.roomNumber || "-"} · Tòa{" "}
            {record.room.building || "-"} · Tầng {record.room.floor || "-"}
          </p>
        </div>

        <span className="shrink-0 text-xs font-medium text-slate-500">
          {record.semester || "Không rõ kỳ"}
        </span>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-4 border-y border-slate-100 py-4">
        <InfoItem
          label="Tiền điện"
          value={formatMoney(record.studentElectricity)}
        />

        <InfoItem label="Tiền nước" value={formatMoney(record.studentWater)} />
      </div>

      <div className="mt-4 flex items-center justify-between">
        <span className="text-sm text-slate-500">Tổng phần của bạn</span>

        <span className="text-lg font-bold text-blue-700">
          {formatMoney(record.studentTotal)}
        </span>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
        <span className="text-slate-500">Tổng chi phí phòng</span>

        <span className="font-semibold text-slate-700">
          {formatMoney(record.roomTotal)}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between text-sm">
        <span className="text-slate-500">Số sinh viên chia tiền</span>

        <span className="font-semibold text-slate-700">
          {record.studentCount} người
        </span>
      </div>
    </article>
  );
}

function InfoItem({ label, value }) {
  return (
    <div>
      <div className="text-xs font-medium text-slate-400">{label}</div>

      <div className="mt-1 font-semibold text-slate-800">{value}</div>
    </div>
  );
}

function FilterSelect({ value, onChange, children }) {
  return (
    <div className="relative w-full sm:w-[200px]">
      <select
        value={value}
        onChange={onChange}
        className="h-10 w-full appearance-none rounded-lg border border-slate-300 bg-white px-3 pr-9 text-sm font-medium text-slate-700 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        {children}
      </select>

      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
        ▼
      </span>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center text-center">
      <FaSpinner className="animate-spin text-2xl text-blue-600" />

      <div className="mt-3 font-semibold text-slate-700">Đang tải dữ liệu</div>

      <p className="mt-1 text-sm text-slate-400">
        Vui lòng chờ trong giây lát.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
      <div className="font-semibold text-slate-700">
        Chưa có dữ liệu điện nước
      </div>

      <p className="mt-2 max-w-md text-sm leading-6 text-slate-400">
        Dữ liệu sẽ hiển thị sau khi nhân viên import tiền điện nước của phòng.
      </p>
    </div>
  );
}

function TableHead({ children }) {
  return (
    <th className="border-b border-slate-200 px-4 py-3 font-bold">
      {children}
    </th>
  );
}

function TableCell({ children }) {
  return (
    <td className="border-b border-slate-100 px-4 py-4 align-middle text-sm text-slate-600">
      {children}
    </td>
  );
}

function normalizeUtilityRecord(record) {
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
    importedAt: record.importedAt || record.createdAt || null,

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

function formatMoney(value) {
  return `${Number(value || 0).toLocaleString("vi-VN")} đ`;
}

function formatDate(date) {
  if (!date) return "";

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(parsedDate);
}

export default MyUtilities;

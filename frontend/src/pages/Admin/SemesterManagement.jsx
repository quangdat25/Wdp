import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import semesterService from "../../api/semesterService";
import { showError, showSuccess,showConfirm } from "../../components/alert";

const statusColors = {
  Ongoing: { background: "#dcfce7", color: "#166534", label: "Đang diễn ra" },
  Upcoming: { background: "#e2e8f0", color: "#475569", label: "Sắp tới" },
  Completed: { background: "#fee2e2", color: "#991b1b", label: "Đã kết thúc" },
};

const semesterNameMap = {
  spring: "Spring",
  summer: "Summer",
  fall: "Fall",
};

const semesterCodeMap = {
  spring: "SP",
  summer: "SU",
  fall: "FA",
};

const semesterKeys = ["spring", "summer", "fall"];

const defaultYearForm = () => ({
  year: new Date().getFullYear(),
  springStartDate: "",
  springEndDate: "",
  summerStartDate: "",
  summerEndDate: "",
  fallStartDate: "",
  fallEndDate: "",
});

const formatDateInput = (date) => {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  return value.toISOString().split("T")[0];
};

const formatDisplayDate = (date) => {
  if (!date) return "Chưa thiết lập";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Chưa thiết lập";

  return value.toLocaleDateString("vi-VN");
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate && !endDate) return "Chưa thiết lập";
  return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
};

function SemesterManagement() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);

  const [isYearModalOpen, setIsYearModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [editingYearId, setEditingYearId] = useState(null);
  const [yearForm, setYearForm] = useState(defaultYearForm());

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const data = await semesterService.getAllSemesters();
      setAcademicYears(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showError("Lỗi khi tải danh sách năm học");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSemesters();
  }, []);

  const yearRows = useMemo(() => {
    return academicYears.map((item) => {
      const semesters = normalizeSemesters(item);

      return {
        ...item,
        semesters,
        startDate: semesters[0]?.startDate,
        endDate: semesters[semesters.length - 1]?.endDate,
        status: item.status || getYearStatusFromSemesters(semesters),
      };
    });
  }, [academicYears]);

  const openCreateModal = () => {
    setModalMode("create");
    setEditingYearId(null);
    setYearForm(defaultYearForm());
    setIsYearModalOpen(true);
  };

  const openEditModal = (yearItem) => {
    setModalMode("edit");
    setEditingYearId(yearItem._id);

    setYearForm({
      year: yearItem.year,
      springStartDate: formatDateInput(yearItem.spring?.startDate),
      springEndDate: formatDateInput(yearItem.spring?.endDate),
      summerStartDate: formatDateInput(yearItem.summer?.startDate),
      summerEndDate: formatDateInput(yearItem.summer?.endDate),
      fallStartDate: formatDateInput(yearItem.fall?.startDate),
      fallEndDate: formatDateInput(yearItem.fall?.endDate),
    });

    setIsYearModalOpen(true);
  };

  const closeYearModal = () => {
    setIsYearModalOpen(false);
    setEditingYearId(null);
    setModalMode("create");
    setYearForm(defaultYearForm());
  };

  const handleYearInputChange = (e) => {
    const { name, value } = e.target;

    setYearForm((prev) => ({
      ...prev,
      [name]: name === "year" ? Number(value) : value,
    }));
  };

  const validateDateRange = (startDate, endDate, label) => {
    if (!startDate || !endDate) {
      showError(`Vui lòng nhập đủ ngày bắt đầu và kết thúc của kỳ ${label}`);
      return false;
    }

    if (new Date(startDate) >= new Date(endDate)) {
      showError(`Ngày bắt đầu phải nhỏ hơn ngày kết thúc của kỳ ${label}`);
      return false;
    }

    return true;
  };

  const validateYearForm = () => {
    if (!yearForm.year) {
      showError("Vui lòng nhập năm học");
      return false;
    }

    const isSpringValid = validateDateRange(
      yearForm.springStartDate,
      yearForm.springEndDate,
      "Spring",
    );

    const isSummerValid = validateDateRange(
      yearForm.summerStartDate,
      yearForm.summerEndDate,
      "Summer",
    );

    const isFallValid = validateDateRange(
      yearForm.fallStartDate,
      yearForm.fallEndDate,
      "Fall",
    );

    if (!isSpringValid || !isSummerValid || !isFallValid) return false;

    if (
      new Date(yearForm.springEndDate) >= new Date(yearForm.summerStartDate)
    ) {
      showError("Kỳ Summer phải bắt đầu sau khi kỳ Spring kết thúc");
      return false;
    }

    if (new Date(yearForm.summerEndDate) >= new Date(yearForm.fallStartDate)) {
      showError("Kỳ Fall phải bắt đầu sau khi kỳ Summer kết thúc");
      return false;
    }

    return true;
  };

  const buildYearPayload = () => ({
    year: yearForm.year,
    spring: {
      startDate: yearForm.springStartDate,
      endDate: yearForm.springEndDate,
    },
    summer: {
      startDate: yearForm.summerStartDate,
      endDate: yearForm.summerEndDate,
    },
    fall: {
      startDate: yearForm.fallStartDate,
      endDate: yearForm.fallEndDate,
    },
  });

  const handleSubmitYear = async (e) => {
    e.preventDefault();

    if (!validateYearForm()) return;

    try {
      const payload = buildYearPayload();

      if (modalMode === "create") {
        await semesterService.createSemesterYear(payload);
        showSuccess("Tạo năm học thành công");
      } else {
        await semesterService.updateSemester(editingYearId, payload);
        showSuccess("Cập nhật năm học thành công");
      }

      closeYearModal();
      fetchSemesters();
    } catch (error) {
      showError(
        error.response?.data?.message ||
          (modalMode === "create"
            ? "Lỗi khi tạo năm học"
            : "Lỗi khi cập nhật năm học"),
      );
    }
  };

  const handleDeleteYear = async (id, year) => {
    const confirm = await showConfirm(
      "Xóa?",
      "Bạn có chắc muốn xóa năm học?",
      "Xóa",
    );

    if (!confirm) return;

    try {
      await semesterService.deleteSemester(id);
      showSuccess("Xóa năm học thành công");
      fetchSemesters();
    } catch (error) {
      showError(error.response?.data?.message || "Lỗi khi xóa năm học");
    }
  };

  return (
    <div style={pageStyle}>
      <Sidebar />

      <main style={mainStyle}>
        <div style={headerCardStyle}>
          <div>
            <p style={eyebrowStyle}>Academic year management</p>
            <h1 style={pageTitleStyle}>Quản lý năm học</h1>
            <p style={pageDescStyle}>
              Mỗi năm học là một khung riêng, bên trong hiển thị Spring, Summer,
              Fall theo từng dòng.
            </p>
          </div>
        </div>

        <section style={sectionStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Danh sách năm học</h2>
              <p style={sectionDescStyle}>
                Theo dõi thời gian học kỳ, gia hạn phòng và mở booking mới.
              </p>
            </div>

            <button
              type="button"
              onClick={openCreateModal}
              style={primaryButtonStyle}
            >
              + Thêm năm học
            </button>
          </div>

          {loading ? (
            <div style={emptyCardStyle}>Đang tải dữ liệu...</div>
          ) : yearRows.length === 0 ? (
            <div style={emptyCardStyle}>Chưa có năm học nào</div>
          ) : (
            <div style={yearGridStyle}>
              {yearRows.map((yearItem) => {
                const yearBadge =
                  statusColors[yearItem.status] || statusColors.Upcoming;

                return (
                  <div key={yearItem._id} style={yearCardStyle}>
                    <div style={yearCardHeaderStyle}>
                      <div style={{ minWidth: 0 }}>
                        <div style={yearTitleRowStyle}>
                          <h3 style={yearTitleStyle}>
                            Năm học {yearItem.year}
                          </h3>
                          <StatusBadge badge={yearBadge} />
                        </div>

                        <p style={yearTimeStyle}>
                          {formatDateRange(
                            yearItem.startDate,
                            yearItem.endDate,
                          )}
                        </p>
                      </div>

                      <div style={yearActionStyle}>
                        <button
                          onClick={() => openEditModal(yearItem)}
                          style={editButtonStyle}
                        >
                          Sửa
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteYear(yearItem._id, yearItem.year)
                          }
                          style={deleteButtonStyle}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>

                    <div style={semesterTableWrapStyle}>
                      <table style={semesterTableStyle}>
                        <thead>
                          <tr>
                            <th style={{ ...semesterThStyle, width: 92 }}>
                              Kỳ
                            </th>
                            <th style={semesterThStyle}>Thời gian học</th>
                            <th style={semesterThStyle}>Gia hạn</th>
                            <th style={semesterThStyle}>Booking</th>
                            <th style={{ ...semesterThStyle, width: 118 }}>
                              Trạng thái
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {yearItem.semesters.map((sem) => {
                            const semBadge =
                              statusColors[sem.status] || statusColors.Upcoming;

                            return (
                              <tr key={`${yearItem._id}-${sem.semesterKey}`}>
                                <td style={semesterTdStyle}>
                                  <div style={semesterNameCellStyle}>
                                    <span style={semesterCodeStyle}>
                                      {sem.code}
                                    </span>
                                    <span style={semesterNameStyle}>
                                      {sem.name}
                                    </span>
                                  </div>
                                </td>

                                <td style={semesterTdStyle}>
                                  {formatDateRange(sem.startDate, sem.endDate)}
                                </td>

                                <td style={semesterTdStyle}>
                                  {formatDateRange(
                                    sem.renewalStartDate,
                                    sem.renewalEndDate,
                                  )}
                                </td>

                                <td style={semesterTdStyle}>
                                  {formatDateRange(
                                    sem.bookingStartDate,
                                    sem.bookingEndDate,
                                  )}
                                </td>

                                <td style={semesterTdStyle}>
                                  <StatusBadge badge={semBadge} compact />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {isYearModalOpen && (
        <Modal
          title={
            modalMode === "create"
              ? "Thêm năm học"
              : `Cập nhật năm học ${yearForm.year}`
          }
          onClose={closeYearModal}
          width={760}
        >
          <form onSubmit={handleSubmitYear} style={formStyle}>
            <div>
              <label style={labelStyle}>Năm học</label>
              <input
                type="number"
                name="year"
                value={yearForm.year}
                onChange={handleYearInputChange}
                min="2020"
                max="2100"
                required
                disabled={modalMode === "edit"}
                style={modalMode === "edit" ? disabledInputStyle : inputStyle}
              />
            </div>

            <SemesterDateGroup
              title="Spring"
              startName="springStartDate"
              endName="springEndDate"
              startValue={yearForm.springStartDate}
              endValue={yearForm.springEndDate}
              onChange={handleYearInputChange}
            />

            <SemesterDateGroup
              title="Summer"
              startName="summerStartDate"
              endName="summerEndDate"
              startValue={yearForm.summerStartDate}
              endValue={yearForm.summerEndDate}
              onChange={handleYearInputChange}
            />

            <SemesterDateGroup
              title="Fall"
              startName="fallStartDate"
              endName="fallEndDate"
              startValue={yearForm.fallStartDate}
              endValue={yearForm.fallEndDate}
              onChange={handleYearInputChange}
            />

            <ModalActions
              onCancel={closeYearModal}
              submitText={
                modalMode === "create" ? "Tạo năm học" : "Lưu thay đổi"
              }
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

function normalizeSemesters(yearItem) {
  if (Array.isArray(yearItem.semesters) && yearItem.semesters.length > 0) {
    return yearItem.semesters.map((semester) => {
      const key = semester.key || semester.semesterKey;

      return {
        ...semester,
        _id: yearItem._id,
        academicYearId: semester.academicYearId || yearItem._id,
        semesterKey: key,
        name: semester.name || semesterNameMap[key],
        code: semester.code || buildSemesterCode(key, yearItem.year),
        status: semester.status || getSemesterStatus(semester),
      };
    });
  }

  return semesterKeys.map((key) => {
    const period = yearItem[key];

    return {
      _id: yearItem._id,
      academicYearId: yearItem._id,
      year: yearItem.year,
      semesterKey: key,
      name: semesterNameMap[key],
      code: buildSemesterCode(key, yearItem.year),
      startDate: period?.startDate,
      endDate: period?.endDate,
      renewalStartDate: period?.renewalStartDate,
      renewalEndDate: period?.renewalEndDate,
      bookingStartDate: period?.bookingStartDate,
      bookingEndDate: period?.bookingEndDate,
      status: getSemesterStatus(period),
    };
  });
}

function buildSemesterCode(key, year) {
  const shortYear = year?.toString().slice(-2) || "";
  return `${semesterCodeMap[key] || ""}${shortYear}`;
}

function getSemesterStatus(period) {
  if (!period?.startDate || !period?.endDate) return "Upcoming";

  const now = new Date();
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);

  if (now > end) return "Completed";
  if (now >= start && now <= end) return "Ongoing";
  return "Upcoming";
}

function getYearStatusFromSemesters(semesters) {
  const statuses = semesters.map(
    (semester) => semester.status || getSemesterStatus(semester),
  );

  if (statuses.includes("Ongoing")) return "Ongoing";
  if (
    statuses.length > 0 &&
    statuses.every((status) => status === "Completed")
  ) {
    return "Completed";
  }

  return "Upcoming";
}

function StatusBadge({ badge, compact = false }) {
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        whiteSpace: "nowrap",
        minWidth: compact ? 86 : 100,
        padding: compact ? "4px 8px" : "6px 12px",
        borderRadius: 999,
        background: badge.background,
        color: badge.color,
        fontWeight: 700,
        fontSize: compact ? 12 : 13,
      }}
    >
      {badge.label}
    </span>
  );
}

function Modal({ title, children, onClose, width = 500 }) {
  return (
    <div style={modalOverlayStyle} onClick={onClose}>
      <div
        style={{
          width,
          maxWidth: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#fff",
          borderRadius: 24,
          padding: 24,
          boxShadow: "0 24px 80px rgba(15, 23, 42, 0.28)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: 24, color: "#0f172a" }}>{title}</h2>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function SemesterDateGroup({
  title,
  startName,
  endName,
  startValue,
  endValue,
  onChange,
}) {
  return (
    <div style={dateGroupStyle}>
      <div style={dateGroupHeaderStyle}>
        <h3 style={{ margin: 0, color: "#1e4f8f", fontSize: 18 }}>{title}</h3>
      </div>

      <div style={dateInputGridStyle}>
        <div>
          <label style={labelStyle}>Ngày bắt đầu</label>
          <input
            type="date"
            name={startName}
            value={startValue}
            onChange={onChange}
            required
            style={inputStyle}
          />
        </div>

        <div>
          <label style={labelStyle}>Ngày kết thúc</label>
          <input
            type="date"
            name={endName}
            value={endValue}
            onChange={onChange}
            required
            style={inputStyle}
          />
        </div>
      </div>
    </div>
  );
}

function ModalActions({ onCancel, submitText }) {
  return (
    <div style={modalActionStyle}>
      <button type="button" onClick={onCancel} style={cancelButtonStyle}>
        Hủy
      </button>

      <button type="submit" style={submitButtonStyle}>
        {submitText}
      </button>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "linear-gradient(180deg, #f8fbff 0%, #f3f8f6 100%)",
};

const mainStyle = {
  marginLeft: "270px",
  width: "calc(100% - 270px)",
  padding: "18px 24px 28px",
  minHeight: "100vh",
};

const headerCardStyle = {
  marginBottom: 16,
  background: "rgba(255,255,255,0.78)",
  border: "1px solid rgba(148, 163, 184, 0.16)",
  borderRadius: 20,
  padding: "18px 22px",
  boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
};

const eyebrowStyle = {
  margin: "0 0 8px",
  color: "#f59e0b",
  fontWeight: 800,
  fontSize: 13,
  textTransform: "uppercase",
  letterSpacing: 0.5,
};

const pageTitleStyle = {
  fontSize: 30,
  color: "#1e4f8f",
  margin: 0,
};

const pageDescStyle = {
  color: "#64748b",
  margin: "6px 0 0",
  maxWidth: 760,
};

const sectionStyle = {
  background: "rgba(255,255,255,0.84)",
  borderRadius: 20,
  padding: 18,
  boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
  border: "1px solid rgba(148, 163, 184, 0.15)",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 14,
  marginBottom: 14,
  flexWrap: "wrap",
};

const sectionTitleStyle = {
  margin: 0,
  fontSize: 22,
  color: "#0f172a",
};

const sectionDescStyle = {
  margin: "6px 0 0",
  color: "#64748b",
};

const yearGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr",
  gap: 12,
};

const yearCardStyle = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 16,
  padding: 14,
  boxShadow: "0 10px 26px rgba(15, 23, 42, 0.05)",
};

const yearCardHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  gap: 12,
  alignItems: "flex-start",
  borderBottom: "1px solid #eef2f7",
  paddingBottom: 10,
  marginBottom: 10,
};

const yearTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  flexWrap: "wrap",
};

const yearTitleStyle = {
  margin: 0,
  fontSize: 19,
  color: "#1e4f8f",
};

const yearTimeStyle = {
  margin: "5px 0 0",
  color: "#64748b",
  fontSize: 13,
};

const yearActionStyle = {
  display: "flex",
  gap: 8,
  flexWrap: "wrap",
  justifyContent: "flex-end",
};

const semesterTableWrapStyle = {
  width: "100%",
  overflowX: "auto",
  border: "1px solid #e2e8f0",
  borderRadius: 12,
};

const semesterTableStyle = {
  width: "100%",
  minWidth: 900,
  borderCollapse: "collapse",
  background: "#fff",
};

const semesterThStyle = {
  background: "#f8fafc",
  color: "#475569",
  fontSize: 12,
  fontWeight: 800,
  textAlign: "left",
  padding: "8px 10px",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const semesterTdStyle = {
  color: "#334155",
  fontSize: 13,
  fontWeight: 600,
  padding: "8px 10px",
  borderBottom: "1px solid #eef2f7",
  verticalAlign: "middle",
  whiteSpace: "nowrap",
};

const semesterNameCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: 8,
};

const semesterCodeStyle = {
  minWidth: 42,
  height: 26,
  padding: "0 8px",
  borderRadius: 999,
  background: "#eff6ff",
  color: "#1d4ed8",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: 800,
  fontSize: 12,
  flexShrink: 0,
};

const semesterNameStyle = {
  fontWeight: 800,
  color: "#0f172a",
  fontSize: 13,
};

const emptyCardStyle = {
  padding: 28,
  textAlign: "center",
  background: "#fff",
  borderRadius: 18,
  border: "1px dashed #cbd5e1",
  color: "#64748b",
  fontWeight: 600,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  fontWeight: 700,
  color: "#334155",
  fontSize: 14,
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 16,
};

const inputStyle = {
  width: "100%",
  padding: "11px 14px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  outline: "none",
  fontSize: 15,
  boxSizing: "border-box",
  background: "#fff",
};

const disabledInputStyle = {
  ...inputStyle,
  background: "#f1f5f9",
  color: "#64748b",
  cursor: "not-allowed",
};

const primaryButtonStyle = {
  background: "linear-gradient(135deg, #f59e0b 0%, #fb923c 100%)",
  color: "#fff",
  borderRadius: 14,
  padding: "12px 16px",
  fontSize: 14,
  fontWeight: 800,
  cursor: "pointer",
  boxShadow: "0 12px 24px rgba(245, 158, 11, 0.22)",
  border: "none",
};

const editButtonStyle = {
  border: "none",
  background: "#eff6ff",
  color: "#2563eb",
  padding: "8px 13px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const deleteButtonStyle = {
  border: "none",
  background: "#fef2f2",
  color: "#dc2626",
  padding: "8px 13px",
  borderRadius: 10,
  fontWeight: 800,
  cursor: "pointer",
  whiteSpace: "nowrap",
};

const cancelButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "1px solid #cbd5e1",
  background: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const submitButtonStyle = {
  padding: "10px 16px",
  borderRadius: 12,
  border: "none",
  background: "#2563eb",
  color: "#fff",
  fontWeight: 800,
  cursor: "pointer",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  display: "grid",
  placeItems: "center",
  zIndex: 1000,
  padding: 20,
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 16,
  marginBottom: 20,
};

const closeButtonStyle = {
  width: 36,
  height: 36,
  borderRadius: 999,
  border: "none",
  background: "#f1f5f9",
  color: "#334155",
  fontSize: 24,
  lineHeight: 1,
  cursor: "pointer",
};

const dateGroupStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  padding: 16,
  background: "#f8fafc",
};

const dateGroupHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 14,
};

const dateInputGridStyle = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 14,
};

const modalActionStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 12,
  marginTop: 10,
};

export default SemesterManagement;

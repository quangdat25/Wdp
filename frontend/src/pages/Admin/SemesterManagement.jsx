import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import semesterService from "../../api/semesterService";
import {
  showConfirm,
  showError,
  showSuccess,
} from "../../components/alert";

const STATUS_META = {
  Ongoing: {
    background: "#dcfce7",
    color: "#166534",
    border: "#bbf7d0",
    label: "Đang diễn ra",
  },
  Upcoming: {
    background: "#eff6ff",
    color: "#1d4ed8",
    border: "#bfdbfe",
    label: "Sắp tới",
  },
  Completed: {
    background: "#fef2f2",
    color: "#b91c1c",
    border: "#fecaca",
    label: "Đã kết thúc",
  },
};

const SEMESTER_KEYS = ["spring", "summer", "fall"];

const SEMESTER_META = {
  spring: { name: "Spring", prefix: "SP" },
  summer: { name: "Summer", prefix: "SU" },
  fall: { name: "Fall", prefix: "FA" },
};

const getTodayInputValue = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const defaultYearForm = () => ({
  year: new Date().getFullYear(),
  springStartDate: "",
  springEndDate: "",
  summerStartDate: "",
  summerEndDate: "",
  fallStartDate: "",
  fallEndDate: "",
});

const defaultSemesterForm = () => ({
  academicYearId: "",
  year: "",
  key: "",
  name: "",
  startDate: "",
  endDate: "",
});

const formatDateInput = (date) => {
  if (!date) return "";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "";

  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
};

const formatDisplayDate = (date) => {
  if (!date) return "Chưa thiết lập";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Chưa thiết lập";

  return value.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatDateRange = (startDate, endDate) => {
  if (!startDate || !endDate) return "Chưa thiết lập";
  return `${formatDisplayDate(startDate)} - ${formatDisplayDate(endDate)}`;
};

const getSemesterStatus = (period) => {
  if (!period?.startDate || !period?.endDate) return "Upcoming";

  const now = new Date();
  const start = new Date(period.startDate);
  const end = new Date(period.endDate);

  if (now > end) return "Completed";
  if (now >= start && now <= end) return "Ongoing";
  return "Upcoming";
};

const getYearStatus = (semesters) => {
  const statuses = semesters.map((semester) => semester.status);

  if (statuses.includes("Ongoing")) return "Ongoing";
  if (statuses.length > 0 && statuses.every((status) => status === "Completed")) {
    return "Completed";
  }

  return "Upcoming";
};

const normalizeSemesters = (yearItem) => {
  if (Array.isArray(yearItem.semesters) && yearItem.semesters.length > 0) {
    return yearItem.semesters.map((semester) => {
      const key = semester.key || semester.semesterKey;
      const meta = SEMESTER_META[key] || {};
      const status = semester.status || getSemesterStatus(semester);

      return {
        ...semester,
        academicYearId: semester.academicYearId || yearItem._id,
        semesterKey: key,
        key,
        year: semester.year || yearItem.year,
        name: semester.name || meta.name,
        code:
          semester.code ||
          `${meta.prefix || ""}${String(yearItem.year || "").slice(-2)}`,
        status,
        canEdit:
          typeof semester.canEdit === "boolean"
            ? semester.canEdit
            : status === "Upcoming",
      };
    });
  }

  return SEMESTER_KEYS.map((key) => {
    const period = yearItem[key] || {};
    const meta = SEMESTER_META[key];
    const status = getSemesterStatus(period);

    return {
      ...period,
      academicYearId: yearItem._id,
      semesterKey: key,
      key,
      year: yearItem.year,
      name: meta.name,
      code: `${meta.prefix}${String(yearItem.year || "").slice(-2)}`,
      status,
      canEdit: status === "Upcoming",
    };
  });
};

function SemesterManagement() {
  const [academicYears, setAcademicYears] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [yearForm, setYearForm] = useState(defaultYearForm());
  const [semesterForm, setSemesterForm] = useState(defaultSemesterForm());

  const fetchSemesters = async () => {
    try {
      setLoading(true);
      const data = await semesterService.getAllSemesters();
      setAcademicYears(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(error);
      showError(
        error.response?.data?.message || "Không thể tải danh sách năm học",
      );
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
      const calculatedCanDelete = semesters.every(
        (semester) => semester.status === "Upcoming",
      );

      return {
        ...item,
        semesters,
        startDate: semesters[0]?.startDate,
        endDate: semesters[semesters.length - 1]?.endDate,
        status: item.status || getYearStatus(semesters),
        canDelete:
          typeof item.canDelete === "boolean"
            ? item.canDelete
            : calculatedCanDelete,
      };
    });
  }, [academicYears]);


  const openCreateModal = () => {
    setYearForm(defaultYearForm());
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    setIsCreateModalOpen(false);
    setYearForm(defaultYearForm());
  };

  const openEditSemesterModal = (semester) => {
    if (!semester.canEdit || semester.status !== "Upcoming") {
      showError("Chỉ được chỉnh sửa kỳ học chưa bắt đầu");
      return;
    }

    setSemesterForm({
      academicYearId: semester.academicYearId,
      year: semester.year,
      key: semester.key,
      name: semester.name,
      startDate: formatDateInput(semester.startDate),
      endDate: formatDateInput(semester.endDate),
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSemesterForm(defaultSemesterForm());
  };

  const handleYearInputChange = (event) => {
    const { name, value } = event.target;

    setYearForm((previous) => ({
      ...previous,
      [name]: name === "year" ? Number(value) : value,
    }));
  };

  const handleSemesterInputChange = (event) => {
    const { name, value } = event.target;

    setSemesterForm((previous) => ({
      ...previous,
      [name]: value,
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
    if (!yearForm.year || yearForm.year < 2020 || yearForm.year > 2100) {
      showError("Năm học phải nằm trong khoảng từ 2020 đến 2100");
      return false;
    }

    const springValid = validateDateRange(
      yearForm.springStartDate,
      yearForm.springEndDate,
      "Spring",
    );
    const summerValid = validateDateRange(
      yearForm.summerStartDate,
      yearForm.summerEndDate,
      "Summer",
    );
    const fallValid = validateDateRange(
      yearForm.fallStartDate,
      yearForm.fallEndDate,
      "Fall",
    );

    if (!springValid || !summerValid || !fallValid) return false;

    if (new Date(yearForm.springStartDate) <= new Date()) {
      showError("Ngày bắt đầu kỳ Spring phải lớn hơn thời điểm hiện tại");
      return false;
    }

    if (new Date(yearForm.springEndDate) >= new Date(yearForm.summerStartDate)) {
      showError("Kỳ Summer phải bắt đầu sau khi kỳ Spring kết thúc");
      return false;
    }

    if (new Date(yearForm.summerEndDate) >= new Date(yearForm.fallStartDate)) {
      showError("Kỳ Fall phải bắt đầu sau khi kỳ Summer kết thúc");
      return false;
    }

    return true;
  };

  const validateSemesterForm = () => {
    if (
      !validateDateRange(
        semesterForm.startDate,
        semesterForm.endDate,
        semesterForm.name,
      )
    ) {
      return false;
    }

    if (new Date(semesterForm.startDate) <= new Date()) {
      showError("Ngày bắt đầu kỳ học phải lớn hơn thời điểm hiện tại");
      return false;
    }

    return true;
  };

  const handleCreateYear = async (event) => {
    event.preventDefault();

    if (!validateYearForm()) return;

    const payload = {
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
    };

    try {
      setSubmitting(true);
      await semesterService.createSemesterYear(payload);
      showSuccess("Tạo năm học thành công");
      closeCreateModal();
      await fetchSemesters();
    } catch (error) {
      showError(error.response?.data?.message || "Không thể tạo năm học");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateSemester = async (event) => {
    event.preventDefault();

    if (!validateSemesterForm()) return;

    try {
      setSubmitting(true);

      await semesterService.updateSemester(semesterForm.academicYearId, {
        key: semesterForm.key,
        startDate: semesterForm.startDate,
        endDate: semesterForm.endDate,
      });

      showSuccess(`Cập nhật kỳ ${semesterForm.name} thành công`);
      closeEditModal();
      await fetchSemesters();
    } catch (error) {
      showError(error.response?.data?.message || "Không thể cập nhật kỳ học");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteYear = async (yearItem) => {
    if (!yearItem.canDelete) {
      showError("Chỉ được xóa năm học khi tất cả các kỳ đều chưa bắt đầu");
      return;
    }

    const confirmed = await showConfirm(
      `Xóa năm học ${yearItem.year}?`,
      "Toàn bộ Spring, Summer và Fall của năm này sẽ bị xóa vĩnh viễn.",
      "Xóa năm học",
    );

    if (!confirmed) return;

    try {
      await semesterService.deleteSemester(yearItem._id);
      showSuccess(`Đã xóa năm học ${yearItem.year}`);
      await fetchSemesters();
    } catch (error) {
      showError(error.response?.data?.message || "Không thể xóa năm học");
    }
  };

  return (
    <div style={pageStyle}>
      <Sidebar />

      <main style={mainStyle}>
        <section style={heroStyle}>
          <div>
            <h1 style={pageTitleStyle}>Quản lý năm học</h1>
            <p style={pageDescriptionStyle}>
              Quản lý lịch học, thời gian gia hạn và thời gian mở booking. Kỳ
              hiện tại và kỳ đã kết thúc sẽ tự động bị khóa chỉnh sửa.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            style={primaryButtonStyle}
          >
            Thêm năm học
          </button>
        </section>


        <section style={contentCardStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Danh sách năm học</h2>
              <p style={sectionDescriptionStyle}>
                Chỉ kỳ sắp tới mới được sửa. Chỉ năm học chưa có kỳ nào bắt đầu
                mới được xóa.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchSemesters}
              disabled={loading}
              style={{
                ...secondaryButtonStyle,
                ...(loading ? disabledButtonStyle : {}),
              }}
            >
              {loading ? "Đang tải..." : "Làm mới"}
            </button>
          </div>

          {loading ? (
            <LoadingState />
          ) : yearRows.length === 0 ? (
            <EmptyState onCreate={openCreateModal} />
          ) : (
            <div style={yearListStyle}>
              {yearRows.map((yearItem) => (
                <YearCard
                  key={yearItem._id}
                  yearItem={yearItem}
                  onEditSemester={openEditSemesterModal}
                  onDeleteYear={handleDeleteYear}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {isCreateModalOpen && (
        <Modal
          title="Thêm năm học"
          description="Thiết lập đầy đủ thời gian của Spring, Summer và Fall."
          onClose={closeCreateModal}
          width={820}
        >
          <form onSubmit={handleCreateYear} style={formStyle}>
            <div>
              <label style={labelStyle}>Năm học</label>
              <input
                type="number"
                name="year"
                min="2020"
                max="2100"
                value={yearForm.year}
                onChange={handleYearInputChange}
                style={inputStyle}
                required
              />
            </div>

            <SemesterDateGroup
              title="Spring"
              code="SP"
              startName="springStartDate"
              endName="springEndDate"
              startValue={yearForm.springStartDate}
              endValue={yearForm.springEndDate}
              onChange={handleYearInputChange}
              minDate={getTodayInputValue()}
            />

            <SemesterDateGroup
              title="Summer"
              code="SU"
              startName="summerStartDate"
              endName="summerEndDate"
              startValue={yearForm.summerStartDate}
              endValue={yearForm.summerEndDate}
              onChange={handleYearInputChange}
              minDate={yearForm.springEndDate || getTodayInputValue()}
            />

            <SemesterDateGroup
              title="Fall"
              code="FA"
              startName="fallStartDate"
              endName="fallEndDate"
              startValue={yearForm.fallStartDate}
              endValue={yearForm.fallEndDate}
              onChange={handleYearInputChange}
              minDate={yearForm.summerEndDate || getTodayInputValue()}
            />

            <ModalActions
              onCancel={closeCreateModal}
              submitText="Tạo năm học"
              submitting={submitting}
            />
          </form>
        </Modal>
      )}

      {isEditModalOpen && (
        <Modal
          title={`Cập nhật kỳ ${semesterForm.name}`}
          description={`Năm học ${semesterForm.year} • ${semesterForm.name} là kỳ sắp tới nên vẫn có thể chỉnh sửa.`}
          onClose={closeEditModal}
          width={560}
        >
          <form onSubmit={handleUpdateSemester} style={formStyle}>
            <div style={editInfoStyle}>
              <span style={semesterCodeLargeStyle}>
                {SEMESTER_META[semesterForm.key]?.prefix}
                {String(semesterForm.year).slice(-2)}
              </span>

              <div>
                <strong style={editInfoTitleStyle}>{semesterForm.name}</strong>
                <p style={editInfoTextStyle}>
                  Sau khi kỳ bắt đầu, hệ thống sẽ tự động khóa chức năng sửa.
                </p>
              </div>
            </div>

            <div style={dateInputGridStyle}>
              <div>
                <label style={labelStyle}>Ngày bắt đầu</label>
                <input
                  type="date"
                  name="startDate"
                  min={getTodayInputValue()}
                  value={semesterForm.startDate}
                  onChange={handleSemesterInputChange}
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle}>Ngày kết thúc</label>
                <input
                  type="date"
                  name="endDate"
                  min={semesterForm.startDate || getTodayInputValue()}
                  value={semesterForm.endDate}
                  onChange={handleSemesterInputChange}
                  style={inputStyle}
                  required
                />
              </div>
            </div>

            <div style={noticeStyle}>
              Thời gian gia hạn và booking sẽ được backend tự động tính lại theo
              ngày kết thúc mới.
            </div>

            <ModalActions
              onCancel={closeEditModal}
              submitText="Lưu thay đổi"
              submitting={submitting}
            />
          </form>
        </Modal>
      )}
    </div>
  );
}

function YearCard({ yearItem, onEditSemester, onDeleteYear }) {
  const yearBadge = STATUS_META[yearItem.status] || STATUS_META.Upcoming;

  return (
    <article style={yearCardStyle}>
      <div style={yearHeaderStyle}>
        <div style={yearHeadingStyle}>
          <div>
            <div style={yearTitleRowStyle}>
              <h3 style={yearTitleStyle}>Năm học {yearItem.year}</h3>
              <StatusBadge meta={yearBadge} />
            </div>

            <p style={yearRangeStyle}>
              {formatDateRange(yearItem.startDate, yearItem.endDate)}
            </p>
          </div>
        </div>

        <div style={yearActionStyle}>
          <button
            type="button"
            onClick={() => onDeleteYear(yearItem)}
            disabled={!yearItem.canDelete}
            title={yearItem.canDelete ? "Xóa năm học" : "Năm học không thể xóa"}
            aria-label="Xóa năm học"
            style={{
              ...trashButtonStyle,
              ...(!yearItem.canDelete ? disabledActionStyle : {}),
            }}
          >
            🗑
          </button>
        </div>
      </div>

      <div style={tableWrapStyle}>
        <table style={tableStyle}>
          <thead>
            <tr>
              <th style={{ ...thStyle, width: 150 }}>Học kỳ</th>
              <th style={thStyle}>Thời gian học</th>
              <th style={thStyle}>Thời gian gia hạn</th>
              <th style={thStyle}>Thời gian booking</th>
              <th style={{ ...thStyle, width: 130 }}>Trạng thái</th>
              <th style={{ ...thStyle, width: 130, textAlign: "right" }}>
                Thao tác
              </th>
            </tr>
          </thead>

          <tbody>
            {yearItem.semesters.map((semester) => {
              const statusMeta = STATUS_META[semester.status] || STATUS_META.Upcoming;
              const locked = !semester.canEdit || semester.status !== "Upcoming";

              return (
                <tr key={`${yearItem._id}-${semester.key}`}>
                  <td style={tdStyle}>
                    <div style={semesterIdentityStyle}>
                      <span style={semesterCodeStyle}>{semester.code}</span>
                      <div>
                        <strong style={semesterNameStyle}>{semester.name}</strong>
                        <span style={semesterSubTextStyle}>Học kỳ chính</span>
                      </div>
                    </div>
                  </td>

                  <td style={tdStyle}>
                    <DateRangeCell
                      startDate={semester.startDate}
                      endDate={semester.endDate}
                    />
                  </td>

                  <td style={tdStyle}>
                    <DateRangeCell
                      startDate={semester.renewalStartDate}
                      endDate={semester.renewalEndDate}
                    />
                  </td>

                  <td style={tdStyle}>
                    <DateRangeCell
                      startDate={semester.bookingStartDate}
                      endDate={semester.bookingEndDate}
                    />
                  </td>

                  <td style={tdStyle}>
                    <StatusBadge meta={statusMeta} compact />
                  </td>

                  <td style={{ ...tdStyle, textAlign: "right" }}>
                    <button
                      type="button"
                      disabled={locked}
                      onClick={() => onEditSemester(semester)}
                      style={{
                        ...editButtonStyle,
                        ...(locked ? disabledActionStyle : {}),
                      }}
                    >
                      Sửa
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function DateRangeCell({ startDate, endDate }) {
  return (
    <div style={dateRangeCellStyle}>
      <span>{formatDisplayDate(startDate)}</span>
      <span style={dateArrowStyle}>→</span>
      <span>{formatDisplayDate(endDate)}</span>
    </div>
  );
}

function StatusBadge({ meta, compact = false }) {
  return (
    <span
      style={{
        ...statusBadgeStyle,
        background: meta.background,
        color: meta.color,
        borderColor: meta.border,
        padding: compact ? "5px 9px" : "6px 11px",
        fontSize: compact ? 12 : 13,
      }}
    >
      {meta.label}
    </span>
  );
}

function SemesterDateGroup({
  title,
  code,
  startName,
  endName,
  startValue,
  endValue,
  onChange,
  minDate,
}) {
  return (
    <div style={dateGroupStyle}>
      <div style={dateGroupHeaderStyle}>
        <div style={dateGroupTitleWrapStyle}>
          <span style={dateGroupCodeStyle}>{code}</span>
          <div>
            <h3 style={dateGroupTitleStyle}>{title}</h3>
            <p style={dateGroupDescriptionStyle}>Thiết lập thời gian học kỳ</p>
          </div>
        </div>
      </div>

      <div style={dateInputGridStyle}>
        <div>
          <label style={labelStyle}>Ngày bắt đầu</label>
          <input
            type="date"
            name={startName}
            min={minDate}
            value={startValue}
            onChange={onChange}
            style={inputStyle}
            required
          />
        </div>

        <div>
          <label style={labelStyle}>Ngày kết thúc</label>
          <input
            type="date"
            name={endName}
            min={startValue || minDate}
            value={endValue}
            onChange={onChange}
            style={inputStyle}
            required
          />
        </div>
      </div>
    </div>
  );
}

function Modal({ title, description, children, onClose, width = 560 }) {
  return (
    <div style={modalOverlayStyle} onMouseDown={onClose}>
      <div
        style={{ ...modalCardStyle, width }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div style={modalHeaderStyle}>
          <div>
            <h2 style={modalTitleStyle}>{title}</h2>
            {description && <p style={modalDescriptionStyle}>{description}</p>}
          </div>

          <button type="button" onClick={onClose} style={closeButtonStyle}>
            ×
          </button>
        </div>

        {children}
      </div>
    </div>
  );
}

function ModalActions({ onCancel, submitText, submitting }) {
  return (
    <div style={modalActionStyle}>
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        style={{
          ...cancelButtonStyle,
          ...(submitting ? disabledButtonStyle : {}),
        }}
      >
        Hủy
      </button>

      <button
        type="submit"
        disabled={submitting}
        style={{
          ...submitButtonStyle,
          ...(submitting ? disabledButtonStyle : {}),
        }}
      >
        {submitting ? "Đang xử lý..." : submitText}
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={stateCardStyle}>
      <div style={loaderStyle} />
      <strong style={stateTitleStyle}>Đang tải dữ liệu</strong>
      <span style={stateTextStyle}>Vui lòng chờ trong giây lát...</span>
    </div>
  );
}

function EmptyState({ onCreate }) {
  return (
    <div style={stateCardStyle}>
      <strong style={stateTitleStyle}>Chưa có năm học nào</strong>
      <span style={stateTextStyle}>
        Tạo năm học đầu tiên để bắt đầu quản lý lịch học và booking.
      </span>
      <button type="button" onClick={onCreate} style={primaryButtonStyle}>
        Thêm năm học
      </button>
    </div>
  );
}

const pageStyle = {
  minHeight: "100vh",
  background: "#f4f7fb",
};

const mainStyle = {
  marginLeft: 270,
  width: "calc(100% - 270px)",
  minHeight: "100vh",
  padding: "22px 26px 32px",
  boxSizing: "border-box",
};

const heroStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 20,
  padding: "18px 20px",
  borderRadius: 12,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
};


const pageTitleStyle = {
  margin: 0,
  color: "#0f3f78",
  fontSize: 30,
  lineHeight: 1.2,
};

const pageDescriptionStyle = {
  margin: "8px 0 0",
  maxWidth: 760,
  color: "#64748b",
  fontSize: 14,
  lineHeight: 1.6,
};





const contentCardStyle = {
  marginTop: 16,
  padding: 20,
  borderRadius: 12,
  background: "#ffffff",
  border: "1px solid #e2e8f0",
};

const sectionHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: 16,
  marginBottom: 16,
};

const sectionTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: 21,
};

const sectionDescriptionStyle = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: 13,
};

const yearListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const yearCardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  background: "#ffffff",
  overflow: "hidden",
};

const yearHeaderStyle = {
  padding: "16px 18px",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  background: "#fbfdff",
  borderBottom: "1px solid #e2e8f0",
};

const yearHeadingStyle = {
  minWidth: 0,
};

const yearTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const yearTitleStyle = {
  margin: 0,
  color: "#174d87",
  fontSize: 19,
};

const yearRangeStyle = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: 13,
  fontWeight: 600,
};

const yearActionStyle = {
  display: "flex",
  justifyContent: "flex-end",
};

const tableWrapStyle = {
  width: "100%",
  overflowX: "auto",
};

const tableStyle = {
  width: "100%",
  minWidth: 1080,
  borderCollapse: "collapse",
};

const thStyle = {
  padding: "11px 14px",
  background: "#f8fafc",
  color: "#64748b",
  fontSize: 11,
  fontWeight: 900,
  letterSpacing: 0.35,
  textTransform: "uppercase",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
  whiteSpace: "nowrap",
};

const tdStyle = {
  padding: "13px 14px",
  color: "#334155",
  fontSize: 13,
  borderBottom: "1px solid #eef2f7",
  verticalAlign: "middle",
};

const semesterIdentityStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const semesterCodeStyle = {
  minWidth: 48,
  height: 31,
  padding: "0 8px",
  borderRadius: 10,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eaf2ff",
  color: "#1d4ed8",
  fontWeight: 900,
  fontSize: 12,
};

const semesterNameStyle = {
  display: "block",
  color: "#0f172a",
  fontSize: 13,
};

const semesterSubTextStyle = {
  display: "block",
  marginTop: 2,
  color: "#94a3b8",
  fontSize: 11,
};

const dateRangeCellStyle = {
  display: "flex",
  alignItems: "center",
  gap: 7,
  whiteSpace: "nowrap",
  fontWeight: 600,
};

const dateArrowStyle = {
  color: "#94a3b8",
};

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  gap: 6,
  border: "1px solid",
  borderRadius: 999,
  fontWeight: 800,
  whiteSpace: "nowrap",
};


const primaryButtonStyle = {
  minHeight: 42,
  padding: "0 16px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 7,
  border: "none",
  borderRadius: 12,
  background: "linear-gradient(135deg, #f59e0b 0%, #f97316 100%)",
  color: "#ffffff",
  fontSize: 14,
  fontWeight: 900,
  cursor: "pointer",
  boxShadow: "0 10px 22px rgba(249, 115, 22, 0.2)",
  whiteSpace: "nowrap",
};


const secondaryButtonStyle = {
  minHeight: 38,
  padding: "0 14px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#334155",
  fontWeight: 800,
  cursor: "pointer",
};

const editButtonStyle = {
  minHeight: 34,
  padding: "0 12px",
  borderRadius: 9,
  border: "1px solid #bfdbfe",
  background: "#eff6ff",
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 900,
  cursor: "pointer",
};

const trashButtonStyle = {
  width: 36,
  height: 36,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 8,
  border: "1px solid #fecaca",
  background: "#fff5f5",
  color: "#dc2626",
  fontSize: 17,
  cursor: "pointer",
};

const disabledActionStyle = {
  opacity: 0.35,
  cursor: "not-allowed",
};

const modalOverlayStyle = {
  position: "fixed",
  inset: 0,
  zIndex: 2000,
  padding: 20,
  display: "grid",
  placeItems: "center",
  background: "rgba(15, 23, 42, 0.58)",
  backdropFilter: "blur(3px)",
};

const modalCardStyle = {
  maxWidth: "100%",
  maxHeight: "90vh",
  overflowY: "auto",
  padding: 24,
  borderRadius: 22,
  background: "#ffffff",
  boxShadow: "0 26px 90px rgba(15, 23, 42, 0.32)",
};

const modalHeaderStyle = {
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 18,
  marginBottom: 20,
};

const modalTitleStyle = {
  margin: 0,
  color: "#0f172a",
  fontSize: 23,
};

const modalDescriptionStyle = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.5,
};

const closeButtonStyle = {
  width: 36,
  height: 36,
  flexShrink: 0,
  borderRadius: "50%",
  border: "none",
  background: "#f1f5f9",
  color: "#334155",
  fontSize: 23,
  lineHeight: 1,
  cursor: "pointer",
};

const formStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 15,
};

const labelStyle = {
  display: "block",
  marginBottom: 6,
  color: "#334155",
  fontSize: 13,
  fontWeight: 800,
};

const inputStyle = {
  width: "100%",
  height: 43,
  padding: "0 13px",
  boxSizing: "border-box",
  borderRadius: 11,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#0f172a",
  fontSize: 14,
  outline: "none",
};

const dateGroupStyle = {
  padding: 15,
  borderRadius: 16,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const dateGroupHeaderStyle = {
  marginBottom: 13,
};

const dateGroupTitleWrapStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
};

const dateGroupCodeStyle = {
  width: 42,
  height: 34,
  borderRadius: 10,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#eaf2ff",
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 900,
};

const dateGroupTitleStyle = {
  margin: 0,
  color: "#174d87",
  fontSize: 16,
};

const dateGroupDescriptionStyle = {
  margin: "2px 0 0",
  color: "#94a3b8",
  fontSize: 11,
};

const dateInputGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 13,
};

const editInfoStyle = {
  display: "flex",
  alignItems: "center",
  gap: 12,
  padding: 14,
  borderRadius: 14,
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
};

const semesterCodeLargeStyle = {
  minWidth: 62,
  height: 44,
  padding: "0 10px",
  borderRadius: 12,
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  background: "#ffffff",
  color: "#1d4ed8",
  fontWeight: 900,
};

const editInfoTitleStyle = {
  display: "block",
  color: "#1e3a8a",
  fontSize: 15,
};

const editInfoTextStyle = {
  margin: "3px 0 0",
  color: "#64748b",
  fontSize: 12,
};

const noticeStyle = {
  padding: "11px 13px",
  borderRadius: 11,
  background: "#fffbeb",
  border: "1px solid #fde68a",
  color: "#92400e",
  fontSize: 12,
  lineHeight: 1.5,
};

const modalActionStyle = {
  display: "flex",
  justifyContent: "flex-end",
  gap: 10,
  paddingTop: 5,
};

const cancelButtonStyle = {
  minHeight: 40,
  padding: "0 16px",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  color: "#334155",
  fontWeight: 800,
  cursor: "pointer",
};

const submitButtonStyle = {
  minHeight: 40,
  padding: "0 17px",
  borderRadius: 10,
  border: "none",
  background: "#2563eb",
  color: "#ffffff",
  fontWeight: 900,
  cursor: "pointer",
};

const disabledButtonStyle = {
  opacity: 0.6,
  cursor: "not-allowed",
};

const stateCardStyle = {
  minHeight: 260,
  padding: 30,
  borderRadius: 16,
  border: "1px dashed #cbd5e1",
  background: "#fbfdff",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 10,
  textAlign: "center",
};

const stateTitleStyle = {
  color: "#0f172a",
  fontSize: 16,
};

const stateTextStyle = {
  maxWidth: 430,
  marginBottom: 5,
  color: "#64748b",
  fontSize: 13,
  lineHeight: 1.5,
};


const loaderStyle = {
  width: 34,
  height: 34,
  borderRadius: "50%",
  border: "4px solid #dbeafe",
  borderTopColor: "#2563eb",
};

export default SemesterManagement;
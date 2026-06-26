/* eslint-disable react/prop-types */

import { useEffect, useMemo, useState } from "react";
import { Pagination } from "antd";
import {
  FaEye,
  FaPencilAlt,
  FaPlus,
  FaTrashAlt,
  FaUserCog,
} from "react-icons/fa";
import { showError, showSuccess } from "../../components/alert";

import {
  getAllPersonnel,
  createPersonnel,
  updatePersonnel,
  deletePersonnel,
} from "../../api/personnelService";

import { getAllBuildings } from "../../api/roomService";
import Sidebar from "../../components/Sidebar";

const CONFIG = {
  status: {
    active: { background: "#dcfce7", color: "#166534", label: "Đang làm việc" },
    leave: { background: "#fef3c7", color: "#92400e", label: "Tạm nghỉ" },
    probation: { background: "#dbeafe", color: "#1d4ed8", label: "Thử việc" },
    inactive: {
      background: "#fee2e2",
      color: "#991b1b",
      label: "Ngừng hoạt động",
    },
  },
  role: {
    staff: "Nhân viên",
    manager: "Quản lý",
  },
  staffType: {
    security: "Bảo vệ",
    maintenance: "Bảo trì",
    cleaner: "Tạp vụ",
  },
  shift: {
    office: "Hành chính",
    morning: "Ca sáng",
    afternoon: "Ca chiều",
    night: "Ca đêm",
  },
};

const defaultForm = {
  role: "staff",
  staffCode: "",
  managerCode: "",
  fullName: "",
  email: "",
  username: "",
  password: "",
  phone: "",
  staffType: "security",
  buildingId: "",
  department: "",
  shift: "office",
  status: "active",
  startDate: "",
};

const tableHeads = [
  "Mã",
  "Họ tên",
  "Email",
  "Username",
  "SĐT",
  "Vai trò",
  "Loại/Bộ phận",
  "Tòa nhà",
  "Ca làm",
  "Trạng thái",
  "Thao tác",
];

const getCode = (personnel) =>
  personnel.staffCode || personnel.managerCode || "Chưa có";

const getStatusBadge = (status) =>
  CONFIG.status[status] || CONFIG.status.active;

const getBuildingName = (building) => {
  if (!building) return "Chưa phân tòa";

  if (typeof building === "string") return building;

  return (
    building.name ||
    building.buildingName ||
    building.code ||
    building._id ||
    "Chưa phân tòa"
  );
};

const getBuildingIdValue = (buildingId) => {
  if (!buildingId) return "";
  if (typeof buildingId === "object") return buildingId._id || "";
  return buildingId;
};

const buildPayload = (formData, isEditing) => {
  const payload = { ...formData };

  if (payload.role === "staff") {
    delete payload.managerCode;
    delete payload.department;

    if (payload.staffType !== "security") {
      delete payload.buildingId;
    }
  }

  if (payload.role === "manager") {
    delete payload.staffCode;
    delete payload.staffType;
    delete payload.shift;
    delete payload.buildingId;
  }

  if (isEditing && !payload.password) {
    delete payload.password;
  }

  return payload;
};

function PersonnelManagement() {
  const [personnelList, setPersonnelList] = useState([]);
  const [buildingList, setBuildingList] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedPersonnel, setSelectedPersonnel] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPersonnelId, setEditingPersonnelId] = useState(null);
  const [formData, setFormData] = useState(defaultForm);
  const [loading, setLoading] = useState(false);
  const [buildingLoading, setBuildingLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const fetchPersonnel = async () => {
    try {
      setLoading(true);
      const res = await getAllPersonnel();
      setPersonnelList(res.data.data || []);
    } catch (error) {
      showError(
        error.response?.data?.message || "Không thể tải danh sách nhân sự"
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchBuildings = async () => {
    try {
      setBuildingLoading(true);
      const res = await getAllBuildings();
      setBuildingList(res.data || []);
    } catch (error) {
      showError(
        error.response?.data?.message || "Không thể tải danh sách tòa nhà"
      );
    } finally {
      setBuildingLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonnel();
    fetchBuildings();
  }, []);

  const filteredPersonnel = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    if (!keyword) return personnelList;

    return personnelList.filter((item) =>
      [
        item.staffCode,
        item.managerCode,
        item.fullName,
        item.email,
        item.username,
        item.phone,
        item.role,
        item.staffType,
        item.department,
        item.shift,
        item.status,
        getBuildingName(item.buildingId),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(keyword)
    );
  }, [searchText, personnelList]);

  const paginatedPersonnel = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredPersonnel.slice(start, start + pageSize);
  }, [currentPage, filteredPersonnel, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchText]);

  useEffect(() => {
    const totalPages = Math.max(
      1,
      Math.ceil(filteredPersonnel.length / pageSize)
    );
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, filteredPersonnel.length, pageSize]);

  const stats = useMemo(
    () => ({
      total: personnelList.length,
      working: personnelList.filter((item) => item.status === "active").length,
      leave: personnelList.filter((item) => item.status === "leave").length,
      probation: personnelList.filter((item) => item.status === "probation")
        .length,
    }),
    [personnelList]
  );

  const openCreateForm = () => {
    setEditingPersonnelId(null);
    setFormData(defaultForm);
    setIsFormOpen(true);
  };

  const openEditForm = (personnel) => {
    setEditingPersonnelId(personnel._id);

    setFormData({
      ...defaultForm,
      ...personnel,
      password: "",
      buildingId: getBuildingIdValue(personnel.buildingId),
      startDate: personnel.startDate ? personnel.startDate.slice(0, 10) : "",
    });

    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingPersonnelId(null);
    setFormData(defaultForm);
  };

  const handleChange = ({ target: { name, value } }) => {
    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "role" && value === "manager") {
        next.staffType = "security";
        next.shift = "office";
        next.buildingId = "";
      }

      if (name === "staffType" && value !== "security") {
        next.buildingId = "";
      }

      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const isEditing = Boolean(editingPersonnelId);
      const payload = buildPayload(formData, isEditing);

      if (!isEditing && !payload.password) {
        showError("Vui lòng nhập mật khẩu");
        return;
      }

      if (payload.role === "staff" && payload.staffType === "security") {
        if (!payload.buildingId) {
          showError("Vui lòng chọn tòa nhà làm việc cho bảo vệ");
          return;
        }
      }

      if (isEditing) {
        await updatePersonnel(editingPersonnelId, payload);
        showSuccess("Cập nhật nhân sự thành công");
      } else {
        await createPersonnel(payload);
        showSuccess("Thêm nhân sự thành công");
      }

      closeForm();
      fetchPersonnel();
    } catch (error) {
      showError(
        error.response?.data?.message || "Có lỗi xảy ra khi lưu nhân sự"
      );
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Bạn có chắc muốn xóa nhân sự này không?")) return;

    try {
      await deletePersonnel(id);
      showSuccess("Xóa nhân sự thành công");
      fetchPersonnel();
    } catch (error) {
      showError(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa nhân sự"
      );
    }
  };

  return (
    <div style={styles.pageShell}>
      <Sidebar />

      <main style={styles.main}>
        <section style={styles.hero}>
          <div>
            <p style={styles.eyebrow}>Quản trị nội bộ</p>
            <h1 style={{ fontSize: 34, color: "#166534", margin: 0 }}>
              Quản lý nhân sự
            </h1>
            <p style={styles.subtitle}>
              Theo dõi staff, manager, tài khoản đăng nhập, tòa nhà làm việc và
              trạng thái làm việc.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            style={styles.primaryButton}
          >
            <FaPlus />
            Thêm nhân sự
          </button>
        </section>

        <section style={styles.statsGrid}>
          <SummaryCard
            title="Tổng nhân sự"
            value={stats.total}
            accent="#16a34a"
          />
          <SummaryCard
            title="Đang làm việc"
            value={stats.working}
            accent="#2563eb"
          />
          <SummaryCard title="Tạm nghỉ" value={stats.leave} accent="#f59e0b" />
          <SummaryCard
            title="Thử việc"
            value={stats.probation}
            accent="#0f766e"
          />
        </section>

        <section style={styles.tableCard}>
          <div style={styles.toolbar}>
            <div>
              <h2 style={{ margin: 0, fontSize: 22 }}>Danh sách nhân sự</h2>
              <p style={{ color: "#64748b", marginTop: 6 }}>
                {loading
                  ? "Đang tải dữ liệu..."
                  : `Hiển thị ${filteredPersonnel.length} nhân sự.`}
              </p>
            </div>

            <input
              value={searchText}
              onChange={(event) => setSearchText(event.target.value)}
              placeholder="Tìm theo mã, tên, email, username, tòa nhà..."
              style={styles.searchInput}
            />
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={styles.table}>
              <thead>
                <tr style={{ background: "#f7fafc", textAlign: "left" }}>
                  {tableHeads.map((head) => (
                    <th key={head} style={styles.headCell}>
                      {head}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td
                      colSpan={11}
                      style={{ padding: 20, textAlign: "center" }}
                    >
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : paginatedPersonnel.length === 0 ? (
                  <tr>
                    <td colSpan={11} style={styles.emptyState}>
                      Không có nhân sự nào phù hợp.
                    </td>
                  </tr>
                ) : (
                  paginatedPersonnel.map((item) => (
                    <PersonnelRow
                      key={item._id}
                      item={item}
                      onView={setSelectedPersonnel}
                      onEdit={openEditForm}
                      onDelete={handleDelete}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div
            style={{ display: "flex", justifyContent: "center", marginTop: 20 }}
          >
            <Pagination
              current={currentPage}
              total={filteredPersonnel.length}
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

      {selectedPersonnel && (
        <PersonnelDetailModal
          personnel={selectedPersonnel}
          onClose={() => setSelectedPersonnel(null)}
        />
      )}

      {isFormOpen && (
        <PersonnelFormModal
          editing={Boolean(editingPersonnelId)}
          formData={formData}
          buildingList={buildingList}
          buildingLoading={buildingLoading}
          onChange={handleChange}
          onClose={closeForm}
          onSubmit={handleSubmit}
        />
      )}
    </div>
  );
}

function PersonnelRow({ item, onView, onEdit, onDelete }) {
  const badge = getStatusBadge(item.status);

  return (
    <tr>
      <td style={styles.bodyCell}>{getCode(item)}</td>
      <td style={styles.bodyCell}>{item.fullName}</td>
      <td style={styles.bodyCell}>{item.email}</td>
      <td style={styles.bodyCell}>{item.username || "Chưa có"}</td>
      <td style={styles.bodyCell}>{item.phone || "Chưa có"}</td>
      <td style={styles.bodyCell}>{CONFIG.role[item.role] || item.role}</td>
      <td style={styles.bodyCell}>
        {item.role === "staff"
          ? CONFIG.staffType[item.staffType] || item.staffType
          : item.department || "Quản lý ký túc xá"}
      </td>
      <td style={styles.bodyCell}>
        {item.role === "staff" && item.staffType === "security"
          ? getBuildingName(item.buildingId)
          : "-"}
      </td>
      <td style={styles.bodyCell}>
        {item.role === "staff"
          ? CONFIG.shift[item.shift] || item.shift
          : "Hành chính"}
      </td>
      <td style={styles.bodyCell}>
        <Badge badge={badge} />
      </td>
      <td style={styles.bodyCell}>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <ActionButton
            icon={<FaEye />}
            label="Xem"
            onClick={() => onView(item)}
          />
          <ActionButton
            icon={<FaPencilAlt />}
            label="Sửa"
            onClick={() => onEdit(item)}
          />
          <ActionButton
            danger
            icon={<FaTrashAlt />}
            label="Xóa"
            onClick={() => onDelete(item._id)}
          />
        </div>
      </td>
    </tr>
  );
}

function SummaryCard({ title, value, accent }) {
  return (
    <div style={styles.summaryCard}>
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 16,
          background: `${accent}18`,
          color: accent,
          display: "grid",
          placeItems: "center",
          fontSize: 20,
        }}
      >
        <FaUserCog />
      </div>
      <div>
        <p style={{ margin: 0, color: "#64748b", fontSize: 14 }}>{title}</p>
        <h3 style={{ margin: "6px 0 0", fontSize: 28, color: "#0f172a" }}>
          {value}
        </h3>
      </div>
    </div>
  );
}

function Badge({ badge }) {
  return (
    <span
      style={{
        ...styles.badge,
        background: badge.background,
        color: badge.color,
      }}
    >
      {badge.label}
    </span>
  );
}

function ActionButton({ icon, label, onClick, danger = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={danger ? styles.dangerButton : styles.actionButton}
    >
      {icon}
      {label}
    </button>
  );
}

function PersonnelDetailModal({ personnel, onClose }) {
  const badge = getStatusBadge(personnel.status);

  const fields = [
    ["Mã", getCode(personnel)],
    ["Họ tên", personnel.fullName],
    ["Email", personnel.email],
    ["Username", personnel.username || "Chưa có"],
    ["Số điện thoại", personnel.phone || "Chưa có"],
    ["Vai trò", CONFIG.role[personnel.role]],
    [
      "Loại/Bộ phận",
      personnel.role === "staff"
        ? CONFIG.staffType[personnel.staffType]
        : personnel.department || "Quản lý ký túc xá",
    ],
    [
      "Tòa nhà làm việc",
      personnel.role === "staff" && personnel.staffType === "security"
        ? getBuildingName(personnel.buildingId)
        : "-",
    ],
    [
      "Ca làm",
      personnel.role === "staff" ? CONFIG.shift[personnel.shift] : "Hành chính",
    ],
    [
      "Ngày vào làm",
      personnel.startDate
        ? new Date(personnel.startDate).toLocaleDateString("vi-VN")
        : "Chưa có",
    ],
  ];

  return (
    <Modal onClose={onClose}>
      <div style={styles.modalHeader}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24 }}>Chi tiết nhân sự</h2>
          <p style={{ margin: "6px 0 0", color: "#64748b" }}>
            Thông tin tổng quan của nhân sự đang được chọn.
          </p>
        </div>

        <CloseButton onClick={onClose} />
      </div>

      <div style={styles.detailGrid}>
        {fields.map(([label, value]) => (
          <DetailField key={label} label={label} value={value} />
        ))}

        <DetailField label="Trạng thái" value={<Badge badge={badge} />} />
      </div>
    </Modal>
  );
}

function PersonnelFormModal({
  editing,
  formData,
  buildingList,
  buildingLoading,
  onChange,
  onClose,
  onSubmit,
}) {
  return (
    <div style={styles.modalOverlay}>
      <button
        type="button"
        aria-label="Đóng hộp thoại"
        onClick={onClose}
        style={styles.modalBackdropButton}
      />

      <form style={styles.modalCard} onSubmit={onSubmit}>
        <div style={styles.modalHeader}>
          <h2 style={{ margin: 0, fontSize: 24 }}>
            {editing ? "Cập nhật nhân sự" : "Thêm nhân sự"}
          </h2>

          <CloseButton onClick={onClose} />
        </div>

        <div style={styles.formGrid}>
          <Field
            label="Vai trò"
            name="role"
            value={formData.role}
            onChange={onChange}
            as="select"
            disabled={editing}
          >
            <option value="staff">Staff</option>
            <option value="manager">Manager</option>
          </Field>

          {formData.role === "staff" ? (
            <Field
              label="Mã nhân viên"
              name="staffCode"
              value={formData.staffCode}
              onChange={onChange}
              disabled={editing}
            />
          ) : (
            <Field
              label="Mã quản lý"
              name="managerCode"
              value={formData.managerCode}
              onChange={onChange}
              disabled={editing}
            />
          )}

          <Field
            label="Họ tên"
            name="fullName"
            value={formData.fullName}
            onChange={onChange}
          />

          <Field
            label="Email"
            name="email"
            value={formData.email}
            onChange={onChange}
            type="email"
          />

          <Field
            label="Username"
            name="username"
            value={formData.username}
            onChange={onChange}
          />

          <Field
            label={editing ? "Mật khẩu mới" : "Mật khẩu"}
            name="password"
            value={formData.password}
            onChange={onChange}
            type="password"
          />

          <Field
            label="Số điện thoại"
            name="phone"
            value={formData.phone}
            onChange={onChange}
          />

          {formData.role === "staff" ? (
            <>
              <Field
                label="Loại staff"
                name="staffType"
                value={formData.staffType}
                onChange={onChange}
                as="select"
              >
                <option value="security">Bảo vệ</option>
                <option value="maintenance">Bảo trì</option>
                <option value="cleaner">Tạp vụ</option>
              </Field>

              {formData.staffType === "security" && (
                <Field
                  label="Tòa nhà làm việc"
                  name="buildingId"
                  value={formData.buildingId}
                  onChange={onChange}
                  as="select"
                >
                  <option value="">
                    {buildingLoading ? "Đang tải tòa nhà..." : "Chọn tòa nhà"}
                  </option>

                  {buildingList.map((building) => (
                    <option key={building._id} value={building._id}>
                      {getBuildingName(building)}
                    </option>
                  ))}
                </Field>
              )}

              <Field
                label="Ca làm"
                name="shift"
                value={formData.shift}
                onChange={onChange}
                as="select"
              >
                <option value="office">Hành chính</option>
                <option value="morning">Ca sáng</option>
                <option value="afternoon">Ca chiều</option>
                <option value="night">Ca đêm</option>
              </Field>
            </>
          ) : (
            <Field
              label="Bộ phận"
              name="department"
              value={formData.department}
              onChange={onChange}
            />
          )}

          <Field
            label="Trạng thái"
            name="status"
            value={formData.status}
            onChange={onChange}
            as="select"
          >
            <option value="active">Đang làm việc</option>
            <option value="leave">Tạm nghỉ</option>
            <option value="probation">Thử việc</option>
            <option value="inactive">Ngừng hoạt động</option>
          </Field>

          <Field
            label="Ngày vào làm"
            name="startDate"
            value={formData.startDate}
            onChange={onChange}
            type="date"
          />
        </div>

        <div style={styles.formActions}>
          <button type="button" onClick={onClose} style={styles.secondaryButton}>
            Hủy
          </button>

          <button type="submit" style={styles.primarySubmit}>
            {editing ? "Lưu thay đổi" : "Thêm nhân sự"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Modal({ children, onClose }) {
  return (
    <div style={styles.modalOverlay}>
      <button
        type="button"
        aria-label="Đóng hộp thoại"
        onClick={onClose}
        style={styles.modalBackdropButton}
      />

      <div style={styles.modalCard}>{children}</div>
    </div>
  );
}

function CloseButton({ onClick }) {
  return (
    <button type="button" onClick={onClick} style={styles.closeButton}>
      ×
    </button>
  );
}

function Field({
  label,
  name,
  value,
  onChange,
  type = "text",
  as = "input",
  children,
  disabled = false,
}) {
  const commonProps = {
    name,
    value,
    onChange,
    disabled,
    style: {
      ...styles.fieldControl,
      ...(disabled ? styles.disabledField : {}),
    },
  };

  return (
    <label>
      <span style={styles.fieldLabel}>{label}</span>

      {as === "select" ? (
        <select {...commonProps}>{children}</select>
      ) : (
        <input {...commonProps} type={type} />
      )}
    </label>
  );
}

function DetailField({ label, value }) {
  return (
    <div>
      <p style={styles.detailLabel}>{label}</p>
      <div style={styles.detailValue}>{value || "Chưa có"}</div>
    </div>
  );
}

const styles = {
  pageShell: {
    minHeight: "100vh",
    background: "linear-gradient(180deg, #f8fbff 0%, #f4fbf5 100%)",
  },
  main: {
    marginLeft: 270,
    width: "calc(100% - 270px)",
    padding: "24px 28px 32px",
    minHeight: "100vh",
  },
  hero: {
    marginBottom: 24,
    background: "rgba(255,255,255,0.76)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: 24,
    padding: "22px 24px",
    boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "center",
    flexWrap: "wrap",
  },
  eyebrow: {
    margin: 0,
    color: "#16a34a",
    fontWeight: 800,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    fontSize: 13,
  },
  subtitle: {
    color: "#64748b",
    margin: "8px 0 0",
    maxWidth: 760,
  },
  primaryButton: {
    background: "linear-gradient(135deg, #16a34a 0%, #22c55e 100%)",
    color: "#fff",
    border: "none",
    borderRadius: 14,
    padding: "12px 16px",
    minHeight: 46,
    fontSize: 14,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    boxShadow: "0 12px 24px rgba(34, 197, 94, 0.22)",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 24,
  },
  summaryCard: {
    background: "rgba(255,255,255,0.82)",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
    display: "flex",
    alignItems: "center",
    gap: 14,
  },
  tableCard: {
    background: "rgba(255,255,255,0.82)",
    borderRadius: 24,
    padding: 22,
    boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
    border: "1px solid rgba(148, 163, 184, 0.15)",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 18,
    flexWrap: "wrap",
    alignItems: "center",
  },
  searchInput: {
    minWidth: 320,
    minHeight: 46,
    borderRadius: 14,
    border: "1px solid #d7e0ea",
    padding: "0 16px",
    fontSize: 14,
    background: "#fdfefe",
    outline: "none",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    minWidth: 1420,
    background: "#fff",
    borderRadius: 18,
    overflow: "hidden",
  },
  headCell: {
    padding: "14px 16px",
    borderBottom: "1px solid #e2e8f0",
    color: "#475569",
    fontSize: 14,
    fontWeight: 700,
  },
  bodyCell: {
    padding: "14px 16px",
    borderBottom: "1px solid #eef2f7",
    color: "#334155",
    verticalAlign: "middle",
  },
  emptyState: {
    padding: 20,
    textAlign: "center",
    color: "#64748b",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    whiteSpace: "nowrap",
    minWidth: 118,
    padding: "7px 14px",
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 13,
    lineHeight: 1,
  },
  actionButton: {
    border: "1px solid #dbe4ee",
    background: "#fff",
    color: "#0f172a",
    padding: "9px 12px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  dangerButton: {
    border: "1px solid #fecaca",
    background: "#fff",
    color: "#b91c1c",
    padding: "9px 12px",
    borderRadius: 10,
    fontWeight: 700,
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
  },
  modalOverlay: {
    position: "fixed",
    inset: 0,
    display: "grid",
    placeItems: "center",
    zIndex: 1000,
    padding: 20,
  },
  modalBackdropButton: {
    position: "absolute",
    inset: 0,
    width: "100%",
    height: "100%",
    border: "none",
    padding: 0,
    background: "rgba(15, 23, 42, 0.55)",
    cursor: "pointer",
  },
  modalCard: {
    position: "relative",
    zIndex: 1,
    width: 820,
    maxWidth: "100%",
    background: "#fff",
    borderRadius: 24,
    padding: 24,
    boxShadow: "0 24px 80px rgba(15, 23, 42, 0.28)",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "start",
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 999,
    border: "none",
    background: "#e2e8f0",
    color: "#0f172a",
    fontSize: 18,
    cursor: "pointer",
  },
  detailGrid: {
    marginTop: 22,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  detailLabel: {
    margin: "0 0 6px",
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },
  detailValue: {
    minHeight: 46,
    borderRadius: 14,
    border: "1px solid #e2e8f0",
    padding: "12px 16px",
    color: "#0f172a",
    background: "#f8fafc",
    display: "flex",
    alignItems: "center",
  },
  formGrid: {
    marginTop: 22,
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    gap: 16,
  },
  fieldLabel: {
    display: "block",
    margin: "0 0 6px",
    color: "#475569",
    fontSize: 13,
    fontWeight: 700,
  },
  fieldControl: {
    width: "100%",
    minHeight: 46,
    borderRadius: 14,
    border: "1px solid #d7e0ea",
    padding: "0 14px",
    fontSize: 14,
    background: "#fff",
    outline: "none",
    boxSizing: "border-box",
  },
  disabledField: {
    background: "#f1f5f9",
    color: "#64748b",
    cursor: "not-allowed",
  },
  formActions: {
    display: "flex",
    justifyContent: "flex-end",
    gap: 12,
    marginTop: 24,
  },
  secondaryButton: {
    minWidth: 110,
    height: 46,
    borderRadius: 14,
    border: "1px solid #cbd5e1",
    background: "#fff",
    color: "#0f172a",
    fontWeight: 800,
    cursor: "pointer",
  },
  primarySubmit: {
    minWidth: 140,
    height: 46,
    borderRadius: 14,
    border: "none",
    background: "#16a34a",
    color: "#fff",
    fontWeight: 800,
    cursor: "pointer",
  },
};

export default PersonnelManagement;
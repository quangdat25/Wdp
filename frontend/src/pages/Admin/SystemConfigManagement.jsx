import { useEffect, useMemo, useState } from "react";
import Sidebar from "../../components/Sidebar";
import systemConfigService from "../../api/systemConfigService";
import {
  showConfirm,
  showError,
  showSuccess,
} from "../../components/alert";

const STATUS_META = {
  active: {
    background: "#dcfce7",
    color: "#166534",
    border: "#bbf7d0",
    label: "Đang hoạt động",
  },
  inactive: {
    background: "#f1f5f9",
    color: "#475569",
    border: "#cbd5e1",
    label: "Chưa hoạt động",
  },
};

const defaultConfigForm = () => ({
  name: "",
  roomPrice: "",
  electricityPrice: "",
  waterPrice: "",
});

const formatMoney = (value) => {
  const number = Number(value);

  if (!Number.isFinite(number)) return "0 ₫";

  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(number);
};

const formatDateTime = (date) => {
  if (!date) return "Chưa có";

  const value = new Date(date);
  if (Number.isNaN(value.getTime())) return "Chưa có";

  return value.toLocaleString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

function SystemConfigManagement() {
  const [configs, setConfigs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedConfig, setSelectedConfig] = useState(null);
  const [configForm, setConfigForm] = useState(defaultConfigForm());

  const fetchConfigs = async () => {
    try {
      setLoading(true);

      const response = await systemConfigService.getAllConfigs();
      const data = Array.isArray(response)
        ? response
        : Array.isArray(response?.data)
          ? response.data
          : [];

      setConfigs(data);
    } catch (error) {
      console.error(error);
      showError(
        error.response?.data?.message ||
          "Không thể tải danh sách cấu hình hệ thống",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConfigs();
  }, []);

  const sortedConfigs = useMemo(() => {
    return [...configs].sort((a, b) => {
      if (a.status === "active" && b.status !== "active") return -1;
      if (a.status !== "active" && b.status === "active") return 1;

      return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
    });
  }, [configs]);

  const activeConfig = useMemo(() => {
    return configs.find((config) => config.status === "active") || null;
  }, [configs]);

  const openCreateModal = () => {
    setConfigForm(defaultConfigForm());
    setIsCreateModalOpen(true);
  };

  const closeCreateModal = () => {
    if (submitting) return;

    setIsCreateModalOpen(false);
    setConfigForm(defaultConfigForm());
  };

  const openEditModal = (config) => {
    if (config.status === "active") {
      showError("Không thể chỉnh sửa cấu hình đang hoạt động");
      return;
    }

    setSelectedConfig(config);
    setConfigForm({
      name: config.name || "",
      roomPrice: config.roomPrice ?? "",
      electricityPrice: config.electricityPrice ?? "",
      waterPrice: config.waterPrice ?? "",
    });
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    if (submitting) return;

    setIsEditModalOpen(false);
    setSelectedConfig(null);
    setConfigForm(defaultConfigForm());
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;

    setConfigForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const validateConfigForm = () => {
    if (!configForm.name.trim()) {
      showError("Vui lòng nhập tên cấu hình");
      return false;
    }

    const priceFields = [
      { key: "roomPrice", label: "Giá phòng" },
      { key: "electricityPrice", label: "Giá điện" },
      { key: "waterPrice", label: "Giá nước" },
    ];

    for (const field of priceFields) {
      const value = configForm[field.key];
      const number = Number(value);

      if (value === "" || !Number.isFinite(number) || number < 0) {
        showError(`${field.label} phải là số lớn hơn hoặc bằng 0`);
        return false;
      }
    }

    return true;
  };

  const buildPayload = () => ({
    name: configForm.name.trim(),
    roomPrice: Number(configForm.roomPrice),
    electricityPrice: Number(configForm.electricityPrice),
    waterPrice: Number(configForm.waterPrice),
  });

  const handleCreateConfig = async (event) => {
    event.preventDefault();

    if (!validateConfigForm()) return;

    try {
      setSubmitting(true);
      await systemConfigService.createConfig(buildPayload());

      showSuccess("Tạo cấu hình hệ thống thành công");
      closeCreateModal();
      await fetchConfigs();
    } catch (error) {
      showError(
        error.response?.data?.message || "Không thể tạo cấu hình hệ thống",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateConfig = async (event) => {
    event.preventDefault();

    if (!selectedConfig) return;
    if (!validateConfigForm()) return;

    try {
      setSubmitting(true);

      await systemConfigService.updateConfig(
        selectedConfig._id,
        buildPayload(),
      );

      showSuccess("Cập nhật cấu hình hệ thống thành công");
      closeEditModal();
      await fetchConfigs();
    } catch (error) {
      showError(
        error.response?.data?.message || "Không thể cập nhật cấu hình",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleActivateConfig = async (config) => {
    if (config.status === "active") return;

    const confirmed = await showConfirm(
      `Kích hoạt cấu hình \"${config.name}\"?`,
      activeConfig
        ? `Cấu hình \"${activeConfig.name}\" đang hoạt động sẽ tự động chuyển sang trạng thái chưa hoạt động.`
        : "Cấu hình này sẽ được sử dụng cho các booking và hóa đơn mới.",
      "Kích hoạt",
    );

    if (!confirmed) return;

    try {
      await systemConfigService.activateConfig(config._id);
      showSuccess(`Đã kích hoạt cấu hình \"${config.name}\"`);
      await fetchConfigs();
    } catch (error) {
      showError(
        error.response?.data?.message || "Không thể kích hoạt cấu hình",
      );
    }
  };

  const handleDeleteConfig = async (config) => {
    if (config.status === "active") {
      showError("Không thể xóa cấu hình đang hoạt động");
      return;
    }

    const confirmed = await showConfirm(
      `Xóa cấu hình \"${config.name}\"?`,
      "Cấu hình đã được booking sử dụng sẽ không thể xóa. Thao tác này không thể hoàn tác.",
      "Xóa cấu hình",
    );

    if (!confirmed) return;

    try {
      await systemConfigService.deleteConfig(config._id);
      showSuccess(`Đã xóa cấu hình \"${config.name}\"`);
      await fetchConfigs();
    } catch (error) {
      showError(error.response?.data?.message || "Không thể xóa cấu hình");
    }
  };

  return (
    <div style={pageStyle}>
      <Sidebar />

      <main style={mainStyle}>
        <section style={heroStyle}>
          <div>
            <h1 style={pageTitleStyle}>Cấu hình hệ thống</h1>
            <p style={pageDescriptionStyle}>
              Quản lý giá phòng, đơn giá điện và đơn giá nước. Mỗi thời điểm
              chỉ có một cấu hình được kích hoạt.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            style={primaryButtonStyle}
          >
            Thêm cấu hình
          </button>
        </section>

        {activeConfig && (
          <section style={activeConfigCardStyle}>
            <div style={activeHeaderStyle}>
              <div>
                <div style={activeTitleRowStyle}>
                  <h2 style={activeTitleStyle}>Cấu hình đang áp dụng</h2>
                  <StatusBadge status="active" />
                </div>

                <p style={activeNameStyle}>{activeConfig.name}</p>
                <p style={activeDateStyle}>
                  Kích hoạt lúc {formatDateTime(activeConfig.effectiveFrom)}
                </p>
              </div>

              <div style={priceSummaryGridStyle}>
                <PriceSummary
                  label="Giá phòng"
                  value={formatMoney(activeConfig.roomPrice)}
                  description="Mỗi kỳ"
                />
                <PriceSummary
                  label="Đơn giá điện"
                  value={formatMoney(activeConfig.electricityPrice)}
                  description="Mỗi kWh"
                />
                <PriceSummary
                  label="Đơn giá nước"
                  value={formatMoney(activeConfig.waterPrice)}
                  description="Mỗi m³"
                />
              </div>
            </div>
          </section>
        )}

        <section style={contentCardStyle}>
          <div style={sectionHeaderStyle}>
            <div>
              <h2 style={sectionTitleStyle}>Danh sách cấu hình</h2>
              <p style={sectionDescriptionStyle}>
                Cấu hình đang hoạt động không được sửa hoặc xóa. Cấu hình chưa
                hoạt động có thể chỉnh sửa và kích hoạt.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchConfigs}
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
          ) : sortedConfigs.length === 0 ? (
            <EmptyState onCreate={openCreateModal} />
          ) : (
            <div style={configListStyle}>
              {sortedConfigs.map((config) => (
                <ConfigCard
                  key={config._id}
                  config={config}
                  onEdit={openEditModal}
                  onActivate={handleActivateConfig}
                  onDelete={handleDeleteConfig}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      {isCreateModalOpen && (
        <ConfigModal
          title="Thêm cấu hình"
          description="Cấu hình mới sẽ được tạo ở trạng thái chưa hoạt động."
          form={configForm}
          submitting={submitting}
          onChange={handleInputChange}
          onClose={closeCreateModal}
          onSubmit={handleCreateConfig}
          submitText="Tạo cấu hình"
        />
      )}

      {isEditModalOpen && selectedConfig && (
        <ConfigModal
          title="Cập nhật cấu hình"
          description={`Chỉnh sửa cấu hình \"${selectedConfig.name}\".`}
          form={configForm}
          submitting={submitting}
          onChange={handleInputChange}
          onClose={closeEditModal}
          onSubmit={handleUpdateConfig}
          submitText="Lưu thay đổi"
        />
      )}
    </div>
  );
}

function ConfigCard({ config, onEdit, onActivate, onDelete }) {
  const isActive = config.status === "active";

  return (
    <article
      style={{
        ...configCardStyle,
        ...(isActive ? activeBorderStyle : {}),
      }}
    >
      <div style={configHeaderStyle}>
        <div style={configHeadingStyle}>
          <div style={configTitleRowStyle}>
            <h3 style={configTitleStyle}>{config.name}</h3>
            <StatusBadge status={config.status} />
          </div>

          <p style={configCreatedStyle}>
            Tạo lúc {formatDateTime(config.createdAt)}
          </p>
        </div>

        <div style={configActionStyle}>
          <button
            type="button"
            disabled={isActive}
            onClick={() => onEdit(config)}
            style={{
              ...editButtonStyle,
              ...(isActive ? disabledActionStyle : {}),
            }}
          >
            Sửa
          </button>

          <button
            type="button"
            disabled={isActive}
            onClick={() => onActivate(config)}
            style={{
              ...activateButtonStyle,
              ...(isActive ? disabledActionStyle : {}),
            }}
          >
            {isActive ? "Đang sử dụng" : "Kích hoạt"}
          </button>

          <button
            type="button"
            disabled={isActive}
            onClick={() => onDelete(config)}
            title={isActive ? "Không thể xóa cấu hình đang hoạt động" : "Xóa"}
            aria-label="Xóa cấu hình"
            style={{
              ...trashButtonStyle,
              ...(isActive ? disabledActionStyle : {}),
            }}
          >
            🗑
          </button>
        </div>
      </div>

      <div style={priceTableWrapStyle}>
        <table style={priceTableStyle}>
          <thead>
            <tr>
              <th style={thStyle}>Loại chi phí</th>
              <th style={thStyle}>Đơn giá</th>
              <th style={thStyle}>Đơn vị áp dụng</th>
              <th style={thStyle}>Ghi chú</th>
            </tr>
          </thead>

          <tbody>
            <PriceRow
              label="Giá phòng"
              value={config.roomPrice}
              unit="VNĐ / người / kỳ"
              description="Áp dụng khi tạo booking mới"
            />
            <PriceRow
              label="Tiền điện"
              value={config.electricityPrice}
              unit="VNĐ / kWh"
              description="Áp dụng khi tính hóa đơn điện"
            />
            <PriceRow
              label="Tiền nước"
              value={config.waterPrice}
              unit="VNĐ / người / tháng"
              description="Áp dụng khi tính hóa đơn nước"
            />
          </tbody>
        </table>
      </div>
    </article>
  );
}

function PriceRow({ label, value, unit, description }) {
  return (
    <tr>
      <td style={tdStyle}>
        <strong style={priceNameStyle}>{label}</strong>
      </td>
      <td style={tdStyle}>
        <span style={priceValueStyle}>{formatMoney(value)}</span>
      </td>
      <td style={tdStyle}>{unit}</td>
      <td style={tdStyle}>{description}</td>
    </tr>
  );
}

function PriceSummary({ label, value, description }) {
  return (
    <div style={priceSummaryStyle}>
      <span style={priceSummaryLabelStyle}>{label}</span>
      <strong style={priceSummaryValueStyle}>{value}</strong>
      <span style={priceSummaryDescriptionStyle}>{description}</span>
    </div>
  );
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.inactive;

  return (
    <span
      style={{
        ...statusBadgeStyle,
        background: meta.background,
        color: meta.color,
        borderColor: meta.border,
      }}
    >
      {meta.label}
    </span>
  );
}

function ConfigModal({
  title,
  description,
  form,
  submitting,
  onChange,
  onClose,
  onSubmit,
  submitText,
}) {
  return (
    <Modal
      title={title}
      description={description}
      onClose={onClose}
      width={820}
    >
      <form onSubmit={onSubmit} style={formStyle}>
        <div>
          <label style={labelStyle}>Tên cấu hình</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={onChange}
            placeholder="Ví dụ: Bảng giá Fall 2026"
            style={inputStyle}
            required
          />
        </div>

        <div style={priceInputGridStyle}>
          <MoneyInput
            label="Giá phòng"
            name="roomPrice"
            value={form.roomPrice}
            unit="VNĐ / người / kỳ"
            onChange={onChange}
          />

          <MoneyInput
            label="Đơn giá điện"
            name="electricityPrice"
            value={form.electricityPrice}
            unit="VNĐ / kWh"
            onChange={onChange}
          />

          <MoneyInput
            label="Đơn giá nước"
            name="waterPrice"
            value={form.waterPrice}
            unit="VNĐ / người / tháng"
            onChange={onChange}
          />
        </div>

        <div style={noticeStyle}>
          Sau khi kích hoạt, cấu hình này sẽ được dùng cho các booking và hóa
          đơn mới. Dữ liệu cũ vẫn giữ cấu hình đã được tham chiếu trước đó.
        </div>

        <ModalActions
          onCancel={onClose}
          submitText={submitText}
          submitting={submitting}
        />
      </form>
    </Modal>
  );
}

function MoneyInput({ label, name, value, unit, onChange }) {
  return (
    <div style={moneyInputCardStyle}>
      <label style={labelStyle}>{label}</label>

      <input
        type="number"
        name={name}
        min="0"
        step="1"
        value={value}
        onChange={onChange}
        style={moneyInputStyle}
        required
      />

      <div style={moneyMetaStyle}>
        <span style={moneyPreviewStyle}>{formatMoney(value)}</span>
        <span style={moneyUnitStyle}>{unit}</span>
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
      <strong style={stateTitleStyle}>Chưa có cấu hình nào</strong>
      <span style={stateTextStyle}>
        Tạo cấu hình đầu tiên để thiết lập giá phòng, giá điện và giá nước.
      </span>
      <button type="button" onClick={onCreate} style={primaryButtonStyle}>
        Thêm cấu hình
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

const activeConfigCardStyle = {
  marginTop: 16,
  padding: 20,
  borderRadius: 12,
  background: "linear-gradient(135deg, #eff6ff 0%, #f8fbff 100%)",
  border: "1px solid #bfdbfe",
};

const activeHeaderStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 24,
  flexWrap: "wrap",
};

const activeTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const activeTitleStyle = {
  margin: 0,
  color: "#174d87",
  fontSize: 20,
};

const activeNameStyle = {
  margin: "8px 0 0",
  color: "#0f172a",
  fontSize: 15,
  fontWeight: 800,
};

const activeDateStyle = {
  margin: "4px 0 0",
  color: "#64748b",
  fontSize: 12,
};

const priceSummaryGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(150px, 1fr))",
  gap: 10,
};

const priceSummaryStyle = {
  minWidth: 150,
  padding: "12px 14px",
  borderRadius: 12,
  background: "#ffffff",
  border: "1px solid #dbeafe",
};

const priceSummaryLabelStyle = {
  display: "block",
  color: "#64748b",
  fontSize: 11,
  fontWeight: 800,
  textTransform: "uppercase",
};

const priceSummaryValueStyle = {
  display: "block",
  marginTop: 5,
  color: "#0f3f78",
  fontSize: 16,
};

const priceSummaryDescriptionStyle = {
  display: "block",
  marginTop: 3,
  color: "#94a3b8",
  fontSize: 11,
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

const configListStyle = {
  display: "flex",
  flexDirection: "column",
  gap: 14,
};

const configCardStyle = {
  border: "1px solid #e2e8f0",
  borderRadius: 18,
  background: "#ffffff",
  overflow: "hidden",
};

const activeBorderStyle = {
  border: "1px solid #93c5fd",
  boxShadow: "0 8px 26px rgba(37, 99, 235, 0.08)",
};

const configHeaderStyle = {
  padding: "16px 18px",
  display: "flex",
  alignItems: "flex-start",
  justifyContent: "space-between",
  gap: 16,
  background: "#fbfdff",
  borderBottom: "1px solid #e2e8f0",
};

const configHeadingStyle = {
  minWidth: 0,
};

const configTitleRowStyle = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  flexWrap: "wrap",
};

const configTitleStyle = {
  margin: 0,
  color: "#174d87",
  fontSize: 19,
};

const configCreatedStyle = {
  margin: "6px 0 0",
  color: "#64748b",
  fontSize: 12,
  fontWeight: 600,
};

const configActionStyle = {
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  gap: 8,
  flexWrap: "wrap",
};

const priceTableWrapStyle = {
  width: "100%",
  overflowX: "auto",
};

const priceTableStyle = {
  width: "100%",
  minWidth: 760,
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

const priceNameStyle = {
  color: "#0f172a",
  fontSize: 13,
};

const priceValueStyle = {
  color: "#0f3f78",
  fontSize: 14,
  fontWeight: 900,
};

const statusBadgeStyle = {
  display: "inline-flex",
  alignItems: "center",
  border: "1px solid",
  borderRadius: 999,
  padding: "6px 11px",
  fontSize: 12,
  fontWeight: 800,
  whiteSpace: "nowrap",
};

const primaryButtonStyle = {
  minHeight: 42,
  padding: "0 16px",
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
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

const activateButtonStyle = {
  minHeight: 34,
  padding: "0 12px",
  borderRadius: 9,
  border: "1px solid #bbf7d0",
  background: "#f0fdf4",
  color: "#15803d",
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

const priceInputGridStyle = {
  display: "grid",
  gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
  gap: 14,
};

const moneyInputCardStyle = {
  minWidth: 0,
  padding: 14,
  borderRadius: 14,
  border: "1px solid #e2e8f0",
  background: "#f8fafc",
};

const moneyInputStyle = {
  width: "100%",
  height: 44,
  padding: "0 12px",
  boxSizing: "border-box",
  borderRadius: 10,
  border: "1px solid #cbd5e1",
  background: "#ffffff",
  outline: "none",
  color: "#0f172a",
  fontSize: 14,
  fontWeight: 700,
};

const moneyMetaStyle = {
  minWidth: 0,
  marginTop: 8,
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: 8,
  flexWrap: "wrap",
};

const moneyUnitStyle = {
  color: "#64748b",
  fontSize: 11,
  fontWeight: 700,
  whiteSpace: "normal",
  textAlign: "right",
};

const moneyPreviewStyle = {
  color: "#1d4ed8",
  fontSize: 12,
  fontWeight: 900,
  whiteSpace: "nowrap",
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

export default SystemConfigManagement;
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBed,
  FaBell,
  FaCalendarAlt,
  FaCommentAlt,
  FaEnvelope,
  FaHistory,
  FaHome,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSignOutAlt,
  FaStar,
  FaTachometerAlt,
  FaTint,
  FaUserShield,
} from "react-icons/fa";
import "./ParentDashboard.css";

const parentModules = [
  { id: "home", label: "Trang chủ", icon: <FaHome /> },
  { id: "news", label: "Tin tức", icon: <FaBell /> },
  { id: "room", label: "Phòng của con", icon: <FaBed /> },
  { id: "payment-history", label: "Lịch sử thanh toán", icon: <FaHistory /> },
  { id: "utilities", label: "Điện nước tiêu thụ", icon: <FaTint /> },
  { id: "score", label: "Điểm ý thức", icon: <FaStar /> },
  { id: "feedback", label: "Gửi phản hồi", icon: <FaCommentAlt /> },
];

const newsItems = [
  { title: "Thông báo về việc đóng tiền nước sinh hoạt tháng 06/2026", date: "08/06/2026" },
  { title: "Lịch bảo trì điều hòa toàn bộ tòa nhà KTX từ 10/06 đến 15/06", date: "07/06/2026" },
  { title: "Giải bóng đá thường niên Dormitory Cup 2026 chính thức khởi tranh", date: "05/06/2026" },
  { title: "Quy định mới về giờ giấc ra vào cổng KTX áp dụng từ tuần sau", date: "03/06/2026" },
];

function ParentDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("home");

  const activeConfig = parentModules.find((m) => m.id === activeModule);

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="parent-shell">
      <aside className="parent-sidebar">
        <div>
          <div className="parent-brand">
            <div className="parent-brand__mark">
              <FaUserShield />
            </div>
            <div>
              <h1>FPT Dormitory</h1>
              <p>Parent Portal</p>
            </div>
          </div>

          <nav className="parent-nav">
            {parentModules.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`parent-nav__item ${activeModule === item.id ? "is-active" : ""}`}
                onClick={() => setActiveModule(item.id)}
              >
                <span className="parent-nav__icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="parent-profile">
            <div className="parent-profile__avatar">PH</div>
            <div>
              <strong>Nguyễn Văn Phụ</strong>
              <span>PARENT</span>
            </div>
          </div>
          <button className="parent-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="parent-main">
        <header className="parent-topbar">
          <div>
            <span className="parent-kicker">Parent dashboard</span>
            <h2>{activeConfig?.label}</h2>
            <p>
              {activeModule === "home"
                ? "Theo dõi thông tin, phòng và tình trạng của con tại KTX."
                : `Quản lý chức năng ${activeConfig?.label} dành cho phụ huynh.`}
            </p>
          </div>
          <div className="parent-topbar__actions">
            <button type="button" className="parent-icon-button" aria-label="Thông báo">
              <FaBell />
              <span />
            </button>
            <button type="button" className="parent-primary-button">
              <FaCalendarAlt />
              Summer 2026
            </button>
          </div>
        </header>

        {activeModule === "home" && <HomeScreen setActiveModule={setActiveModule} />}

        {activeModule !== "home" && (
          <div className="parent-placeholder">
            <div className="parent-placeholder__icon">{activeConfig?.icon}</div>
            <h3>{activeConfig?.label}</h3>
            <p>Chức năng đang được kết nối với dữ liệu học viên...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function HomeScreen({ setActiveModule }) {
  return (
    <div className="parent-stack">
      <div className="parent-room-banner">
        <div className="parent-room-banner__info">
          <div className="parent-room-banner__icon">
            <FaBed />
          </div>
          <div className="parent-room-banner__text">
            <strong>Phòng của con: 302 – Tòa A1</strong>
            <span>Giường số 2 · Summer 2026 · Đang hoạt động</span>
          </div>
        </div>
        <button
          type="button"
          className="parent-primary-button"
          onClick={() => setActiveModule("room")}
        >
          Xem chi tiết
        </button>
      </div>

      <section className="parent-metrics">
        <MetricCard
          icon={<FaBed />}
          label="Phòng của con"
          value="302 – A1"
          note="Đang lưu trú"
          tone="purple"
        />
        <MetricCard
          icon={<FaTachometerAlt />}
          label="Điện tháng 06"
          value="4.210 kWh"
          note="Cập nhật 08/06/2026"
          tone="amber"
        />
        <MetricCard
          icon={<FaTint />}
          label="Nước tháng 06"
          value="782 m³"
          note="Cập nhật 08/06/2026"
          tone="rose"
        />
        <MetricCard
          icon={<FaStar />}
          label="Điểm ý thức"
          value="96"
          note="CFD Score của con"
          tone="green"
        />
      </section>

      <section className="parent-grid parent-grid--wide">
        <div className="parent-panel">
          <div className="parent-panel__header">
            <div>
              <h3>Tin tức mới nhất</h3>
              <p>Thông báo từ Ban Quản Lý KTX</p>
            </div>
            <button
              type="button"
              className="parent-panel__see-more"
              onClick={() => setActiveModule("news")}
            >
              Xem thêm
            </button>
          </div>
          <div className="parent-news-list">
            {newsItems.map((item, idx) => (
              <div key={idx} className="parent-news-item">
                <span className="parent-news-item__dot" />
                <span className="parent-news-item__text">{item.title}</span>
                <span className="parent-news-item__date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="parent-panel">
          <div className="parent-panel__header">
            <div>
              <h3>Liên hệ hỗ trợ</h3>
              <p>Ban Quản Lý KTX Đại Học FPT</p>
            </div>
          </div>
          <div className="parent-contact-list">
            <div className="parent-contact-item">
              <div className="parent-contact-item__icon">
                <FaPhoneAlt />
              </div>
              <div>
                <div className="parent-contact-item__label">Hotline hỗ trợ</div>
                <div className="parent-contact-item__value">024.7300.5588</div>
              </div>
            </div>
            <div className="parent-contact-item">
              <div className="parent-contact-item__icon">
                <FaEnvelope />
              </div>
              <div>
                <div className="parent-contact-item__label">Email liên hệ</div>
                <div className="parent-contact-item__value">ktx@fpt.edu.vn</div>
              </div>
            </div>
            <div className="parent-contact-item">
              <div className="parent-contact-item__icon">
                <FaMapMarkerAlt />
              </div>
              <div>
                <div className="parent-contact-item__label">Văn phòng</div>
                <div className="parent-contact-item__value">Phòng 102 – Tòa KTX A1</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, note, tone }) {
  return (
    <div className={`parent-metric-card parent-metric-card--${tone}`}>
      <div className="parent-metric-card__icon">{icon}</div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <p className="metric-note">{note}</p>
    </div>
  );
}

export default ParentDashboard;
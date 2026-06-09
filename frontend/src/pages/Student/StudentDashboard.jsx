import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaBed,
  FaBell,
  FaBookOpen,
  FaBolt,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaDoorOpen,
  FaEnvelope,
  FaHome,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaSignOutAlt,
  FaStar,
  FaToggleOff,
  FaToggleOn,
  FaWater,
} from "react-icons/fa";
import "./StudentDashboard.css";

const studentModules = [
  { id: "home", label: "Trang chủ", icon: <FaHome /> },
  { id: "news", label: "Tin tức", icon: <FaBookOpen /> },
  { id: "room-history", label: "Lịch sử phòng", icon: <FaClipboardList /> },
  { id: "booking", label: "Đặt phòng", icon: <FaBed /> },
  { id: "payment-history", label: "Lịch sử thanh toán", icon: <FaCalendarAlt /> },
  { id: "utilities", label: "Điện nước tiêu thụ", icon: <FaBolt /> },
  { id: "score", label: "Điểm ý thức", icon: <FaStar /> },
  { id: "request", label: "Gửi yêu cầu", icon: <FaEnvelope /> },
];

const newsItems = [
  { title: "Thông báo về việc đóng tiền nước sinh hoạt tháng 06/2026", date: "08/06/2026" },
  { title: "Lịch bảo trì điều hòa toàn bộ tòa nhà KTX từ 10/06 đến 15/06", date: "07/06/2026" },
  { title: "Giải bóng đá thường niên Dormitory Cup 2026 chính thức khởi tranh", date: "05/06/2026" },
  { title: "Quy định mới về giờ giấc ra vào cổng KTX áp dụng từ tuần sau", date: "03/06/2026" },
];

function StudentDashboard() {
  const navigate = useNavigate();
  const [activeModule, setActiveModule] = useState("home");
  const [hasBooked, setHasBooked] = useState(false);

  const activeConfig = studentModules.find((m) => m.id === activeModule);

  const handleLogout = () => {
    navigate("/login");
  };

  return (
    <div className="student-shell">
      <aside className="student-sidebar">
        <div>
          <div className="student-brand">
            <div className="student-brand__mark">
              <FaBed />
            </div>
            <div>
              <h1>FPT Dormitory</h1>
              <p>Student Portal</p>
            </div>
          </div>

          <nav className="student-nav">
            {studentModules.map((item) => (
              <button
                type="button"
                key={item.id}
                className={`student-nav__item ${activeModule === item.id ? "is-active" : ""}`}
                onClick={() => setActiveModule(item.id)}
              >
                <span className="student-nav__icon">{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div className="student-profile">
            <div className="student-profile__avatar">SV</div>
            <div>
              <strong>Nguyễn Văn A</strong>
              <span>STUDENT</span>
            </div>
          </div>
          <button className="student-logout-btn" onClick={handleLogout}>
            <FaSignOutAlt />
            Đăng xuất
          </button>
        </div>
      </aside>

      <main className="student-main">
        <header className="student-topbar">
          <div>
            <span className="student-kicker">Student dashboard</span>
            <h2>{activeConfig?.label}</h2>
            <p>
              {activeModule === "home"
                ? hasBooked
                  ? "Chào mừng bạn quay lại! Theo dõi phòng, tiện ích và điểm ý thức."
                  : "Chào mừng! Bạn chưa đặt phòng – hãy tìm và đặt phòng phù hợp."
                : `Quản lý chức năng ${activeConfig?.label} của sinh viên.`}
            </p>
          </div>
          <div className="student-topbar__actions">
            {activeModule === "home" && (
              <button
                type="button"
                className="student-toggle-btn"
                onClick={() => setHasBooked((v) => !v)}
                title="Demo: chuyển trạng thái đặt phòng"
              >
                {hasBooked ? <FaToggleOn /> : <FaToggleOff />}
                {hasBooked ? "Đã đặt phòng" : "Chưa đặt phòng"}
              </button>
            )}
            <button type="button" className="student-icon-button" aria-label="Thông báo">
              <FaBell />
              <span />
            </button>
            <button type="button" className="student-primary-button">
              <FaCalendarAlt />
              Summer 2026
            </button>
          </div>
        </header>

        {activeModule === "home" && !hasBooked && (
          <UnbookedHomeScreen setActiveModule={setActiveModule} />
        )}

        {activeModule === "home" && hasBooked && (
          <BookedHomeScreen setActiveModule={setActiveModule} />
        )}

        {activeModule !== "home" && (
          <div className="student-placeholder">
            <div className="student-placeholder__icon">{activeConfig?.icon}</div>
            <h3>{activeConfig?.label}</h3>
            <p>Chức năng đang được kết nối với dữ liệu sinh viên...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function UnbookedHomeScreen({ setActiveModule }) {
  return (
    <div className="student-stack">
      <div className="student-cta-banner">
        <div className="student-cta-banner__left">
          <div className="student-cta-banner__icon">
            <FaDoorOpen />
          </div>
          <div>
            <strong>Bạn chưa có phòng ở kỳ Summer 2026</strong>
            <span>Hiện còn <b>300 phòng</b> đang trống – đặt sớm để có lựa chọn tốt nhất!</span>
          </div>
        </div>
        <button
          type="button"
          className="student-primary-button"
          onClick={() => setActiveModule("booking")}
        >
          <FaBed /> Đặt phòng ngay
        </button>
      </div>

      <section className="student-metrics">
        <MetricCard icon={<FaBed />} label="Phòng còn trống" value="300" note="Kỳ Summer 2026" tone="blue" />
        <MetricCard icon={<FaCheckCircle />} label="Phòng 4 giường" value="120" note="Giá từ 950.000đ/tháng" tone="green" />
        <MetricCard icon={<FaCheckCircle />} label="Phòng 6 giường" value="132" note="Giá từ 750.000đ/tháng" tone="amber" />
        <MetricCard icon={<FaStar />} label="Điểm ý thức" value="96" note="CFD Score hiện tại" tone="purple" />
      </section>

      <section className="student-grid student-grid--wide">
        <div className="student-panel">
          <div className="student-panel__header">
            <div>
              <h3>Tin tức mới nhất</h3>
              <p>Thông báo từ Ban Quản Lý KTX</p>
            </div>
            <button
              type="button"
              className="student-panel__see-more"
              onClick={() => setActiveModule("news")}
            >
              Xem thêm
            </button>
          </div>
          <div className="student-news-list">
            {newsItems.map((item, idx) => (
              <div key={idx} className="student-news-item">
                <span className="student-news-item__dot" />
                <span className="student-news-item__text">{item.title}</span>
                <span className="student-news-item__date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="student-panel">
          <div className="student-panel__header">
            <div>
              <h3>Liên hệ hỗ trợ</h3>
              <p>Ban Quản Lý KTX Đại Học FPT</p>
            </div>
          </div>
          <ContactList />
        </div>
      </section>
    </div>
  );
}

function BookedHomeScreen({ setActiveModule }) {
  return (
    <div className="student-stack">
      <div className="student-room-banner">
        <div className="student-room-banner__info">
          <div className="student-room-banner__icon">
            <FaBed />
          </div>
          <div className="student-room-banner__text">
            <strong>Phòng đang ở: A-203 – Tòa Dorm A</strong>
            <span>Giường số 3 · Summer 2026 · Đang hoạt động</span>
          </div>
        </div>
        <button
          type="button"
          className="student-primary-button"
          onClick={() => setActiveModule("room-history")}
        >
          Xem chi tiết
        </button>
      </div>

      <section className="student-metrics">
        <MetricCard icon={<FaBolt />} label="Điện tháng 06" value="4.210 kWh" note="Cập nhật 08/06/2026" tone="amber" />
        <MetricCard icon={<FaWater />} label="Nước tháng 06" value="782 m³" note="Cập nhật 08/06/2026" tone="blue" />
        <MetricCard icon={<FaStar />} label="Điểm ý thức" value="96" note="CFD Score hiện tại" tone="green" />
        <MetricCard icon={<FaCalendarAlt />} label="Hóa đơn tháng 06" value="1.200.000đ" note="Hạn: 15/06/2026" tone="purple" />
      </section>

      <section className="student-grid student-grid--wide">
        <div className="student-panel">
          <div className="student-panel__header">
            <div>
              <h3>Tin tức mới nhất</h3>
              <p>Thông báo từ Ban Quản Lý KTX</p>
            </div>
            <button
              type="button"
              className="student-panel__see-more"
              onClick={() => setActiveModule("news")}
            >
              Xem thêm
            </button>
          </div>
          <div className="student-news-list">
            {newsItems.map((item, idx) => (
              <div key={idx} className="student-news-item">
                <span className="student-news-item__dot" />
                <span className="student-news-item__text">{item.title}</span>
                <span className="student-news-item__date">{item.date}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="student-panel">
          <div className="student-panel__header">
            <div>
              <h3>Liên hệ hỗ trợ</h3>
              <p>Ban Quản Lý KTX Đại Học FPT</p>
            </div>
          </div>
          <ContactList />
        </div>
      </section>
    </div>
  );
}

function ContactList() {
  return (
    <div className="student-contact-list">
      <div className="student-contact-item">
        <div className="student-contact-item__icon"><FaPhoneAlt /></div>
        <div>
          <div className="student-contact-item__label">Hotline hỗ trợ</div>
          <div className="student-contact-item__value">024.7300.5588</div>
        </div>
      </div>
      <div className="student-contact-item">
        <div className="student-contact-item__icon"><FaEnvelope /></div>
        <div>
          <div className="student-contact-item__label">Email liên hệ</div>
          <div className="student-contact-item__value">ktx@fpt.edu.vn</div>
        </div>
      </div>
      <div className="student-contact-item">
        <div className="student-contact-item__icon"><FaMapMarkerAlt /></div>
        <div>
          <div className="student-contact-item__label">Văn phòng</div>
          <div className="student-contact-item__value">Phòng 102 – Tòa KTX A1</div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, note, tone }) {
  return (
    <div className={`student-metric-card student-metric-card--${tone}`}>
      <div className="student-metric-card__icon">{icon}</div>
      <span className="metric-label">{label}</span>
      <strong className="metric-value">{value}</strong>
      <p className="metric-note">{note}</p>
    </div>
  );
}

export default StudentDashboard;

import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaBed,
  FaDoorOpen,
  FaCheckCircle,
  FaStar,
  FaBolt,
  FaWater,
  FaCalendarAlt,
  FaChartPie,
} from "react-icons/fa";

import "./StudentDashboard.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import NewsWidget from "./NewsWidget";
import NewsPage from "./NewsPage";

const studentModules = [
  { id: "home", title: "Trang chủ", label: "Trang chủ", icon: <FaChartPie /> },
  { id: "booking", title: "Đặt phòng ký túc xá", label: "Đặt phòng", icon: <FaBed /> },
  { id: "room-history", title: "Lịch sử ở phòng", label: "Lịch sử phòng", icon: <FaBed /> },
  { id: "news", title: "Tin tức mới nhất", label: "Tin tức", icon: <FaCalendarAlt /> },
];

function StudentDashboard() {
  const navigate = useNavigate();
  const toastTimerRef = useRef(null);
  const [activeModule, setActiveModule] = useState("home");
  const [hasBooked] = useState(false);

  const activeConfig = studentModules.find(
    (item) => item.id === activeModule,
  ) || {
    label: "Chức năng",
    icon: <FaBed />,
  };

  return (
    <div className="student-shell">
      <Sidebar />

      <main className="student-main">
        <Header />

        {activeModule === "home" &&
          (hasBooked ? (
            <BookedHomeScreen setActiveModule={setActiveModule} />
          ) : (
            <UnbookedHomeScreen setActiveModule={setActiveModule} />
          ))}

        {activeModule === "news" && <NewsPage />}

        {activeModule !== "home" && activeModule !== "news" && (
          <PlaceholderScreen activeConfig={activeConfig} />
        )}
      </main>
    </div>
  );
}

function PlaceholderScreen({ activeConfig }) {
  return (
    <div className="student-placeholder">
      <div className="student-placeholder__icon">{activeConfig.icon}</div>

      <h3>Giao diện chức năng: {activeConfig.label}</h3>

      <p>
        Hệ thống đang tải dữ liệu cho chức năng{" "}
        <strong>{activeConfig.label}</strong> dành cho sinh viên...
      </p>
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
            <span>
              Hiện còn <b>300 phòng</b> đang trống – đặt sớm để có lựa chọn tốt
              nhất!
            </span>
          </div>
        </div>

       
      </div>

      <section className="student-metrics">
        <MetricCard
          icon={<FaBed />}
          label="Phòng còn trống"
          value="300"
          note="Kỳ Summer 2026"
          tone="blue"
        />

        <MetricCard
          icon={<FaCheckCircle />}
          label="Phòng 4 giường"
          value="120"
          note="Giá từ 950.000đ/tháng"
          tone="green"
        />

        <MetricCard
          icon={<FaCheckCircle />}
          label="Phòng 6 giường"
          value="132"
          note="Giá từ 750.000đ/tháng"
          tone="amber"
        />

        <MetricCard
          icon={<FaStar />}
          label="Điểm ý thức"
          value="96"
          note="CFD Score hiện tại"
          tone="purple"
        />
      </section>

      <HomeInfoGrid setActiveModule={setActiveModule} />
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
        <MetricCard
          icon={<FaBolt />}
          label="Điện tháng 06"
          value="4.210 kWh"
          note="Cập nhật 08/06/2026"
          tone="amber"
        />

        <MetricCard
          icon={<FaWater />}
          label="Nước tháng 06"
          value="782 m³"
          note="Cập nhật 08/06/2026"
          tone="blue"
        />

        <MetricCard
          icon={<FaStar />}
          label="Điểm ý thức"
          value="96"
          note="CFD Score hiện tại"
          tone="green"
        />

        <MetricCard
          icon={<FaCalendarAlt />}
          label="Hóa đơn tháng 06"
          value="1.200.000đ"
          note="Hạn: 15/06/2026"
          tone="purple"
        />
      </section>

      <HomeInfoGrid setActiveModule={setActiveModule} />
    </div>
  );
}

function HomeInfoGrid({ setActiveModule }) {
  return (
    <section className="student-grid student-grid--wide">
      <NewsWidget onViewMore={() => setActiveModule("news")} />

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
  );
}

function ContactList() {
  return (
    <div className="student-contact-list">
      <div className="student-contact-item">
        <div className="student-contact-item__icon">
          <FaPhoneAlt />
        </div>

        <div>
          <div className="student-contact-item__label">Hotline hỗ trợ</div>
          <div className="student-contact-item__value">024.7300.5588</div>
        </div>
      </div>

      <div className="student-contact-item">
        <div className="student-contact-item__icon">
          <FaEnvelope />
        </div>

        <div>
          <div className="student-contact-item__label">Email liên hệ</div>
          <div className="student-contact-item__value">ktx@fpt.edu.vn</div>
        </div>
      </div>

      <div className="student-contact-item">
        <div className="student-contact-item__icon">
          <FaMapMarkerAlt />
        </div>

        <div>
          <div className="student-contact-item__label">Văn phòng</div>
          <div className="student-contact-item__value">
            Phòng 102 – Tòa KTX A1
          </div>
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

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
  FaArrowRight,
  FaBullhorn,
  FaHeadset,
  FaComments,
  FaArrowUp
} from "react-icons/fa";

import "./StudentDashboard.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";

const newsItems = [
  {
    type: "THÔNG BÁO",
    title: "Thông báo về việc đăng ký ở KTX kỳ Summer 2026 đợt 1",
    desc: "Sinh viên lưu ý thời gian đăng ký và nộp lệ phí đúng hạn để đảm bảo suất ở trong học kỳ tới...",
    date: "24/05/2026",
  },
  {
    type: "SỰ KIỆN",
    title: "Ngày hội văn hóa KTX - Dorm Festival 2026",
    desc: "Chuỗi hoạt động giao lưu văn nghệ, thể thao và ẩm thực dành riêng cho sinh viên nội trú...",
    date: "22/05/2026",
  },
  {
    type: "BẢO TRÌ",
    title: "Lịch bảo trì hệ thống điện nước khu nhà A và B",
    desc: "Thời gian bảo trì dự kiến từ 08:00 đến 12:00 ngày 26/05. Rất mong sinh viên thông cảm...",
    date: "20/05/2026",
  },
];

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
            <BookedHomeScreen setActiveModule={setActiveModule} navigate={navigate} />
          ) : (
            <UnbookedHomeScreen setActiveModule={setActiveModule} navigate={navigate} />
          ))}

        {activeModule !== "home" && (
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

function UnbookedHomeScreen({ setActiveModule, navigate }) {
  return (
    <>
      <section className="mb-stack-lg">
        <div className="hero-banner group">
          <div className="hero-pattern"></div>
          <div className="hero-content text-on-primary">
            <h2 className="font-display-lg">Bạn chưa có phòng ở kỳ Summer 2026.</h2>
            <div className="hero-actions">
              <p className="font-body-lg font-medium" style={{ opacity: 0.9 }}>
                Hiện đang có <span style={{ fontWeight: 700, textDecoration: 'underline' }}>300 phòng trống</span> sẵn sàng đón sinh viên.
              </p>
              <button className="hero-btn" onClick={() => setActiveModule("booking")}>
                <span>Đặt phòng ngay!</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
          <div className="hero-icon-bg">
            <FaBed style={{ fontSize: '120px' }} />
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard
          icon={<FaDoorOpen />}
          tagLabel="REAL-TIME"
          label="Phòng còn trống"
          value="300"
          bottomIcon={<FaArrowUp />}
          bottomText="Cập nhật 5 phút trước"
        />

        <MetricCard
          icon={<FaBed />}
          tagLabel="STANDARD"
          label="Phòng 4 giường"
          value="120"
          isProgress={true}
          progressPercent="40%"
        />

        <MetricCard
          icon={<FaStar />}
          tagLabel="STUDENT"
          label="Điểm ý thức"
          value="96%"
          bottomIcon={<FaCheckCircle />}
          bottomText="Xếp loại: Tốt"
        />
      </section>

      <HomeInfoGrid setActiveModule={setActiveModule} navigate={navigate} />
    </>
  );
}

function BookedHomeScreen({ setActiveModule, navigate }) {
  return (
    <>
      <section className="mb-stack-lg">
        <div className="hero-banner group">
          <div className="hero-pattern"></div>
          <div className="hero-content text-on-primary">
            <h2 className="font-display-lg">Phòng đang ở: A-203 – Tòa Dorm A</h2>
            <div className="hero-actions">
              <p className="font-body-lg font-medium" style={{ opacity: 0.9 }}>
                Giường số 3 · Summer 2026 · Đang hoạt động
              </p>
              <button className="hero-btn" onClick={() => setActiveModule("room-history")}>
                <span>Xem chi tiết</span>
                <FaArrowRight />
              </button>
            </div>
          </div>
          <div className="hero-icon-bg">
            <FaBed style={{ fontSize: '120px' }} />
          </div>
        </div>
      </section>

      <section className="metrics-grid">
        <MetricCard
          icon={<FaBolt />}
          tagLabel="UTILITY"
          label="Điện tháng 06"
          value="4.210 kWh"
          bottomIcon={<FaCheckCircle />}
          bottomText="Cập nhật 08/06/2026"
        />

        <MetricCard
          icon={<FaWater />}
          tagLabel="UTILITY"
          label="Nước tháng 06"
          value="782 m³"
          bottomIcon={<FaCheckCircle />}
          bottomText="Cập nhật 08/06/2026"
        />

        <MetricCard
          icon={<FaStar />}
          tagLabel="STUDENT"
          label="Điểm ý thức"
          value="96%"
          bottomIcon={<FaCheckCircle />}
          bottomText="Xếp loại: Tốt"
        />
      </section>

      <HomeInfoGrid setActiveModule={setActiveModule} navigate={navigate} />
    </>
  );
}

function HomeInfoGrid({ setActiveModule, navigate }) {
  return (
    <section className="bottom-grid">
      <div className="sharp-border bg-[#F6FAF5] news-panel">
        <div className="panel-header data-table-header">
          <h4 className="font-headline-sm text-on-surface">
            <FaBullhorn className="text-primary" style={{ marginRight: '8px' }} />
            Tin tức mới nhất
          </h4>
          <button
            className="text-primary font-bold font-label-sm"
            onClick={() => setActiveModule("news")}
          >
            XEM TẤT CẢ
          </button>
        </div>

        <div className="news-list">
          {newsItems.map((item, idx) => (
            <div key={idx} className="news-item group">
              <div className="news-item-meta">
                <span className={`news-tag ${item.type === 'SỰ KIỆN' ? 'tag-event' :
                  item.type === 'BẢO TRÌ' ? 'tag-maintenance' : 'tag-notice'
                  }`}>
                  {item.type}
                </span>
                <span className="font-label-sm text-secondary">{item.date}</span>
              </div>
              <h5 className="font-body-lg font-bold text-on-surface">{item.title}</h5>
              <p className="text-secondary font-body-md">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="sharp-border bg-[#F6FAF5] support-panel">
        <div className="panel-header data-table-header">
          <h4 className="font-headline-sm text-on-surface">
            <FaHeadset className="text-primary" style={{ marginRight: '8px' }} />
            Liên hệ hỗ trợ
          </h4>
        </div>

        <div className="support-content">

          <ContactList />
          <button className="support-btn" onClick={() => navigate('/student/support/request')} >
            <FaComments />
            <span>Gửi yêu cầu hỗ trợ</span>
          </button>
        </div>
      </div>
    </section>
  );
}

function ContactList() {
  return (
    <div className="contact-list">
      <div className="contact-item">
        <div className="contact-icon">
          <FaPhoneAlt />
        </div>
        <div>
          <p className="font-label-sm text-secondary uppercase font-bold" style={{ marginBottom: '2px' }}>Hotline</p>
          <p className="font-body-lg font-bold text-on-surface">1900 1234 (Ext: 101)</p>
        </div>
      </div>

      <div className="contact-item">
        <div className="contact-icon">
          <FaEnvelope />
        </div>
        <div>
          <p className="font-label-sm text-secondary uppercase font-bold" style={{ marginBottom: '2px' }}>Email</p>
          <p className="font-body-lg font-bold text-on-surface">ktx@university.edu.vn</p>
        </div>
      </div>

      <div className="contact-item">
        <div className="contact-icon">
          <FaMapMarkerAlt />
        </div>
        <div>
          <p className="font-label-sm text-secondary uppercase font-bold" style={{ marginBottom: '2px' }}>Văn phòng</p>
          <p className="font-body-lg font-bold text-on-surface">Tầng 1, KTX Nhà A1</p>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, tagLabel, label, value, bottomIcon, bottomText, isProgress, progressPercent }) {
  return (
    <div className="sharp-border metric-card">
      <div className="metric-header">
        <span className="text-primary metric-icon" style={{ fontSize: '20px' }}>{icon}</span>
        <span className="font-label-sm text-secondary metric-tag">{tagLabel}</span>
      </div>
      <p className="text-secondary font-body-md font-medium">{label}</p>
      <h3 className="font-display-lg text-on-surface">{value}</h3>

      {isProgress ? (
        <div className="metric-progress-track">
          <div className="metric-progress-bar" style={{ width: progressPercent }}></div>
        </div>
      ) : (
        <div className="metric-bottom-info text-primary font-label-sm">
          <span style={{ fontSize: '14px', marginRight: '4px' }}>{bottomIcon}</span>
          <span>{bottomText}</span>
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;
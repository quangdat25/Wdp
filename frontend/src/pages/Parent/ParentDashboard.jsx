import { useState, useEffect } from "react";
import { getMyChildRoom, getStudentInvoices, getStudentInfo } from "../../api/parentService";
import {
  FaBed,
  FaCalendarAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaStar,
  FaTachometerAlt,
  FaTint,
  FaFileInvoiceDollar,
} from "react-icons/fa";
import systemConfigService from "../../api/systemConfigService";

import "./ParentDashboard.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import ParentNewsPage from "./ParentNewsPage";
import { useNews } from "../../hooks/useNews";
import { formatRelativeTime } from "../../utils/date";
import NewsDetailModal from "../../components/NewsDetailModal";

const parentModules = [
  {
    id: "room",
    label: "Thông tin phòng",
    icon: <FaBed />,
  },
  {
    id: "payment",
    label: "Thanh toán",
    icon: <FaFileInvoiceDollar />,
  },
  {
    id: "news",
    label: "Tin tức",
    icon: <FaCalendarAlt />,
  },
];

function ParentDashboard() {
  const [activeModule, setActiveModule] = useState("home");
  const [childData, setChildData] = useState(null);
  const [studentInfo, setStudentInfo] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [systemConfig, setSystemConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomData, invoiceData, configData, studentData] = await Promise.all([
          getMyChildRoom().catch(() => null),
          getStudentInvoices().catch(() => null),
          systemConfigService.getActiveConfig().catch(() => null),
          getStudentInfo().catch(() => null)
        ]);
        if (roomData && roomData.success) {
          setChildData(roomData.data);
        }
        if (invoiceData && invoiceData.success) {
          setInvoices(invoiceData.data);
        }
        if (configData) {
          setSystemConfig(configData?.data || configData);
        }
        if (studentData && studentData.success) {
          setStudentInfo(studentData.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const activeConfig =
    parentModules.find((item) => item.id === activeModule) || {
      label: "Chức năng",
      icon: <FaBed />,
    };

  return (
    <div className="parent-shell">
      <Sidebar />
      <main className="parent-main">
        <Header avatarText="P" />

        {activeModule === "home" && (
          <HomeScreen setActiveModule={setActiveModule} childData={childData} studentInfo={studentInfo} invoices={invoices} systemConfig={systemConfig} loading={loading} />
        )}

        {activeModule === "news" && <ParentNewsPage />}

        {activeModule !== "home" && activeModule !== "news" && (
          <div className="parent-placeholder">
            <div className="parent-placeholder__icon">{activeConfig.icon}</div>
            <h3>{activeConfig.label}</h3>
            <p>Chức năng đang được kết nối với dữ liệu học viên...</p>
          </div>
        )}
      </main>
    </div>
  );
}

function HomeScreen({ setActiveModule, childData, studentInfo, invoices, systemConfig, loading }) {
  const { news, loading: newsLoading } = useNews();
  const [selectedNews, setSelectedNews] = useState(null);

  if (loading) {
    return (
      <div className="parent-stack">
        <div className="parent-placeholder" style={{ backgroundColor: "var(--bg-card)", padding: "2rem", borderRadius: "12px", border: "1px solid var(--border-color)" }}>
          <h3>Đang tải dữ liệu của con...</h3>
        </div>
      </div>
    );
  }

  const roomText = childData
    ? `${childData.room.roomNumber} – ${childData.building.name}`
    : "Chưa có phòng";
  const bedText = childData
    ? `Giường số ${childData.bedNumber} · Đang hoạt động`
    : "";

  let electricityValue = "0 đ";
  let waterValue = "0 đ";
  let utilityNote = "Chưa có hóa đơn";
  let utilityStatus = "";

  if (childData?.previousUtility) {
    const { month, electricityAmount, waterAmount, status } = childData.previousUtility;

    electricityValue = `${electricityAmount.toLocaleString("vi-VN")} đ`;
    waterValue = `${waterAmount.toLocaleString("vi-VN")} đ`;

    utilityNote = `Tháng ${month < 10 ? '0' + month : month}`;
    utilityStatus = status === "unpaid" ? "Chưa thanh toán" : status === "paid" ? "Đã thanh toán" : "";
  }

  const elecPrice = systemConfig?.electricityPrice ? `(${systemConfig.electricityPrice.toLocaleString("vi-VN")}đ/kWh)` : "";
  const waterPrice = systemConfig?.waterPrice ? `(${systemConfig.waterPrice.toLocaleString("vi-VN")}đ/tháng)` : "";

  const elecNote = utilityStatus ? `${utilityStatus} ${elecPrice}` : elecPrice;
  const waterNote = utilityStatus ? `${utilityStatus} ${waterPrice}` : waterPrice;

  return (
    <div className="parent-stack">
      <div className="parent-room-banner">
        <div className="parent-room-banner__info">
          <div className="parent-room-banner__icon">
            <FaBed />
          </div>

          <div className="parent-room-banner__text">
            <strong>Phòng của con: {roomText}</strong>
            <span>{bedText}</span>
          </div>
        </div>
        {/* 
        <button
          type="button"
          className="parent-primary-button"
          onClick={() => setActiveModule("room")}
        >
          Xem chi tiết
        </button> */}
      </div>

      <section className="parent-metrics">
        <MetricCard
          icon={<FaBed />}
          label="Phòng của con"
          value={childData ? `${childData.room.roomNumber} – ${childData.building.name}` : "Chưa có phòng"}
          note={childData ? "Đang lưu trú" : ""}
          tone="purple"
        />

        <MetricCard
          icon={<FaTachometerAlt />}
          label={`Tiền điện ${utilityNote}`}
          value={electricityValue}
          note={elecNote}
          tone="amber"
        />

        <MetricCard
          icon={<FaTint />}
          label={`Tiền nước ${utilityNote}`}
          value={waterValue}
          note={waterNote}
          tone="rose"
        />

        <MetricCard
          icon={<FaStar />}
          label="Điểm ý thức"
          value={studentInfo ? studentInfo.CFDScore : "N/A"}
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

          {newsLoading ? (
            <div className="parent-news-list">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 12,
                    padding: 12,
                    borderRadius: 8,
                    background: "#f0faf4",
                  }}
                >
                  <div
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      background: "#bbf7d0",
                      flexShrink: 0,
                    }}
                  />
                  <div
                    style={{
                      flex: 1,
                      height: 14,
                      background: "#bbf7d0",
                      borderRadius: 4,
                    }}
                  />
                </div>
              ))}
            </div>
          ) : news.length === 0 ? (
            <div
              style={{
                padding: "32px 16px",
                textAlign: "center",
                color: "#6b9e7e",
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 8 }}>📰</div>
              <span style={{ fontSize: 14, fontWeight: 600 }}>
                Chưa có bản tin nào.
              </span>
            </div>
          ) : (
            <div className="parent-news-list">
              {news.slice(0, 5).map((item) => (
                <div key={item._id} className="parent-news-item" onClick={() => setSelectedNews(item)}>
                  <span className="parent-news-item__dot" style={{ background: item.isPinned ? "#dc2626" : "#16a34a" }} />
                  <span className="parent-news-item__text">
                    {item.isPinned && "📌 "}
                    {item.title}
                  </span>
                  <span className="parent-news-item__date">{formatRelativeTime(item.createdAt)}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="parent-panel">
          <div className="parent-panel__header">
            <div>
              <h3>Liên hệ hỗ trợ</h3>
              <p>Ban Quản Lý KTX Đại Học FPT</p>
            </div>
          </div>

          <ContactList />
        </div>
      </section>

      {selectedNews && (
        <NewsDetailModal news={selectedNews} onClose={() => setSelectedNews(null)} />
      )}
    </div>
  );
}

function ContactList() {
  return (
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
          <div className="parent-contact-item__value">
            Phòng 102 – Tòa KTX A1
          </div>
        </div>
      </div>
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
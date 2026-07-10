/* eslint-disable react/prop-types */

import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import gsap from "gsap";
import {
  FaBed,
  FaDoorOpen,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUsers,
  FaArrowUp,
  FaArrowDown,
  FaBuilding,
  FaCalendarAlt,
  FaPlus,
  FaHome,
  FaUserPlus,
  FaCheck,
  FaEye,
  FaChevronLeft,
  FaChevronRight,
  FaFilter,
  FaInfo,
  FaExclamationCircle,
  FaSpinner,
  FaWrench,
  FaShieldAlt,
  FaClock,
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import getAdminDashboard from "../../api/dashboardService";

// Format Currency
function formatCurrency(amount) {
  if (!amount) return "$0";
  if (amount >= 1_000_000) return "$" + (amount / 1_000_000).toFixed(1) + "M";
  if (amount >= 1_000) return "$" + (amount / 1_000).toFixed(1) + "k";
  return "$" + amount.toString();
}

// Current Date Formatter
function getCurrentDateFormatted() {
  const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
  return new Date().toLocaleDateString('en-US', options);
}

// Mock Data for Revenue Line Chart
const REVENUE_DATA = [40, 45, 42, 55, 60, 58, 70, 75, 85, 80, 95, 100]; // percentages
// Mock Data for Sparklines
const SPARK_UP = "M0,20 Q5,15 10,18 T20,10 T30,5 T40,2";
const SPARK_DOWN = "M0,2 Q5,8 10,6 T20,12 T30,15 T40,18";

function AdminDashboard() {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const heroRef = useRef(null);
  const cardsRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdminDashboard();
        if (res.success) setData(res.data);
        else setError("Không thể tải dữ liệu");
      } catch (err) {
        setError("Lỗi kết nối máy chủ");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (loading || !data) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(heroRef.current, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
      gsap.fromTo(cardsRef.current?.children, { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.5, stagger: 0.1, ease: "power2.out", delay: 0.2 });
      gsap.fromTo(chartRef.current?.querySelectorAll("[data-anim]"), { scaleY: 0, opacity: 0, transformOrigin: "bottom" }, { scaleY: 1, opacity: 1, duration: 0.6, stagger: 0.05, ease: "power2.out", delay: 0.4 });
    });
    return () => ctx.revert();
  }, [loading, data]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: "#F6FAF7", display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 240, padding: "24px 40px" }}>
          <Header />
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "50vh", color: "#22C55E", gap: 12, fontSize: 16, fontWeight: 600 }}>
            <FaSpinner className="animate-spin" style={{ fontSize: 24 }} /> Loading...
            <style>{`@keyframes spin { to { transform: rotate(360deg) } } .animate-spin { animation: spin 1s linear infinite; }`}</style>
          </div>
        </main>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ minHeight: "100vh", background: "#F6FAF7", display: "flex" }}>
        <Sidebar />
        <main style={{ flex: 1, marginLeft: 240, padding: "24px 40px" }}>
          <Header />
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "50vh", color: "#dc2626", gap: 16 }}>
            <FaExclamationTriangle size={32} />
            <span style={{ fontWeight: 600, fontSize: 16 }}>{error || "Không có dữ liệu"}</span>
            <button onClick={() => navigate(0)} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Thử lại</button>
          </div>
        </main>
      </div>
    );
  }

  const { students, occupancy, pendingTickets, monthlyRevenue, occupancySeries, buildings, alerts, bookingRequests, recentActivities } = data;

  const totalRooms = occupancy.totalRooms || 1;
  const donutData = [
    { label: "Đang sử dụng", value: occupancy.occupiedRooms, color: "#22C55E" },
    { label: "Còn trống", value: occupancy.availableRooms, color: "#DCFCE7" },
    { label: "Bảo trì", value: occupancy.maintenanceRooms, color: "#F59E0B" },
    { label: "Đã đặt", value: alerts.pendingBookings, color: "#3B82F6" },
  ];
  let currentAngle = 0;

  return (
    <div style={{ minHeight: "100vh", background: "#F6FAF7", display: "flex", fontFamily: "'Inter', sans-serif" }}>
      <Sidebar />
      <main style={{ flex: 1, marginLeft: 240, padding: "24px 32px", boxSizing: "border-box", maxWidth: "calc(100vw - 240px)" }}>
        <Header />

        {/* HERO CARD */}
        <section ref={heroRef} style={{ marginBottom: 24, borderRadius: 20, padding: 32, background: "linear-gradient(135deg, #16A34A 0%, #22C55E 100%)", color: "#fff", boxShadow: "0 10px 30px rgba(34,197,94,0.2)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -50, right: -50, width: 300, height: 300, background: "radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)", borderRadius: "50%" }} />

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", position: "relative", zIndex: 1 }}>
            <div>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", background: "rgba(255,255,255,0.2)", borderRadius: 999, fontSize: 12, fontWeight: 600, marginBottom: 16 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#fff", boxShadow: "0 0 10px #fff" }} />
                Hệ thống trực tuyến • {getCurrentDateFormatted()}
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 600, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Quản trị viên</h1>
              <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>Tổng quan ký túc xá & Chỉ số thời gian thực</p>
            </div>

            <div style={{ display: "flex", gap: 32, background: "rgba(255,255,255,0.1)", padding: "20px 32px", borderRadius: 16, backdropFilter: "blur(10px)" }}>
              <HeroMetric label="Tỷ lệ lấp đầy" value={`${occupancy.rate}%`} />
              <HeroMetric label="Phòng trống" value={occupancy.availableRooms} />
              <HeroMetric label="Yêu cầu chờ duyệt" value={pendingTickets} />
              <HeroMetric label="Doanh thu tháng" value={formatCurrency(monthlyRevenue.total)} />
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section ref={cardsRef} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 24 }}>
          <KpiCard title="Tổng sinh viên" value={students.total.toLocaleString()} icon={<FaUsers />} color="#22C55E" trend="+2.4%" sparkline={SPARK_UP} />
          <KpiCard title="Phòng đang ở" value={occupancy.occupiedRooms.toLocaleString()} icon={<FaBed />} color="#3B82F6" trend="+1.2%" sparkline={SPARK_UP} />
          <KpiCard title="Phòng trống" value={occupancy.availableRooms.toLocaleString()} icon={<FaDoorOpen />} color="#F59E0B" trend="-0.5%" sparkline={SPARK_DOWN} isNegative />
          <KpiCard title="Tổng tòa nhà" value={buildings.length} icon={<FaBuilding />} color="#8B5CF6" trend="Đang HĐ" sparkline={SPARK_UP} />
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }} ref={chartRef}>
          {/* CHARTS SECTION */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* OCCUPANCY & REVENUE CHARTS (2 Cols) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Occupancy Trend Bar Chart */}
              <Card title="Xu hướng lấp đầy" subtitle="Tỷ lệ lấp đầy 12 tháng qua">
                <div style={{ height: 200, display: "flex", alignItems: "flex-end", justifyContent: "space-between", paddingTop: 20 }}>
                  {occupancySeries.map((item, i) => (
                    <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8, flex: 1 }}>
                      <div style={{ width: "100%", maxWidth: 24, height: 140, background: "#F6FAF7", borderRadius: 4, position: "relative" }}>
                        <div data-anim style={{ position: "absolute", bottom: 0, left: 0, width: "100%", height: `${Math.max(5, item.value)}%`, background: "#22C55E", borderRadius: 4 }} />
                      </div>
                      <span style={{ fontSize: 11, color: "#9CA3AF" }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Revenue Line Chart */}
              <Card title="Biểu đồ doanh thu" subtitle="Hiệu suất doanh thu hàng tháng">
                <div style={{ height: 200, position: "relative", paddingTop: 20 }}>
                  <svg width="100%" height="160" viewBox="0 0 400 160" preserveAspectRatio="none">
                    <path d="M0,160 L0,100 C50,80 80,120 120,90 C160,60 200,110 240,70 C280,30 320,60 360,20 L400,40 L400,160 Z" fill="url(#grad)" opacity="0.5" />
                    <path data-anim d="M0,100 C50,80 80,120 120,90 C160,60 200,110 240,70 C280,30 320,60 360,20 L400,40" fill="none" stroke="#22C55E" strokeWidth="4" strokeLinecap="round" />
                    <defs>
                      <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#22C55E" stopOpacity="0" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                    {['Th.1', 'Th.3', 'Th.5', 'Th.7', 'Th.9', 'Th.11'].map(m => <span key={m} style={{ fontSize: 11, color: "#9CA3AF" }}>{m}</span>)}
                  </div>
                </div>
              </Card>
            </div>

            {/* BUILDING COMPARISON & DONUT */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Building Progress Bars */}
              <Card title="Công suất tòa nhà" subtitle="Mức độ sử dụng theo từng tòa nhà">
                <div style={{ display: "flex", flexDirection: "column", gap: 24, marginTop: 16 }}>
                  {buildings.map((b) => (
                    <div key={b.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                        <div>
                          <span style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{b.name}</span>
                          <span style={{ marginLeft: 8, fontSize: 12, color: "#6B7280" }}>{b.occupied} / {b.total} Giường</span>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ fontSize: 14, fontWeight: 700, color: b.rate >= 90 ? "#EF4444" : "#22C55E" }}>{b.rate}%</span>
                        </div>
                      </div>
                      <div style={{ width: "100%", height: 8, background: "#E7EFEA", borderRadius: 4, overflow: "hidden", position: "relative" }}>
                        <div data-anim style={{ width: `${b.rate}%`, height: "100%", background: b.rate >= 90 ? "#EF4444" : "#22C55E", borderRadius: 4, transition: "width 1s ease-out" }} />
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, fontSize: 12 }}>
                        <span style={{ color: "#6B7280" }}>{b.total - b.occupied} Giường trống</span>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ color: "#9CA3AF" }}>Trạng thái:</span>
                          <span style={{ display: "inline-block", background: b.rate >= 90 ? "#FEE2E2" : "#DCFCE7", color: b.rate >= 90 ? "#DC2626" : "#16A34A", padding: "2px 8px", borderRadius: 12, fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>{b.rate >= 90 ? "Đã đầy" : "Bình thường"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Room Distribution Donut */}
              <Card title="Phân bổ phòng" subtitle="Tổng quan trạng thái các phòng">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 180, marginTop: 16 }}>
                  <div style={{ position: "relative", width: 140, height: 140 }}>
                    <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                      {donutData.map((d, i) => {
                        const dashArray = `${(d.value / totalRooms) * 100} 100`;
                        const offset = -currentAngle;
                        currentAngle += (d.value / totalRooms) * 100;
                        return (
                          <circle 
                            key={i} 
                            cx="18" 
                            cy="18" 
                            r="16" 
                            fill="none" 
                            stroke={d.color} 
                            strokeWidth="4" 
                            strokeDasharray={dashArray} 
                            strokeDashoffset={offset}
                            style={{ animation: "drawDonut 1s ease-out forwards", opacity: 0 }}
                          >
                            <title>{d.label}: {d.value} phòng ({((d.value / (totalRooms || 1)) * 100).toFixed(1)}%)</title>
                          </circle>
                        );
                      })}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{totalRooms}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>Tổng</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", flex: 1, paddingLeft: 32 }}>
                    {donutData.map((d, i) => {
                      const pct = ((d.value / (totalRooms || 1)) * 100).toFixed(1);
                      return (
                        <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 13, marginBottom: 10 }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                            <span style={{ color: "#4B5563", fontWeight: 500 }}>{d.label}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <span style={{ fontWeight: 700, color: "#111827", minWidth: 24, textAlign: "right" }}>{d.value}</span>
                            <span style={{ color: "#9CA3AF", fontSize: 11, minWidth: 32, textAlign: "right" }}>{pct}%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* SIDEBAR WIDGETS (Right 1/3) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Quick Actions */}
            <Card title="Thao tác nhanh">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <Button primary icon={<FaBuilding />} label="Thêm tòa nhà" onClick={() => navigate("/admin/buildings")} />
                <Button primary icon={<FaHome />} label="Thêm phòng" onClick={() => navigate("/admin/rooms")} />
                <Button icon={<FaCalendarAlt />} label="Kỳ học" onClick={() => navigate("/admin/semesters")} />
                <Button icon={<FaUserPlus />} label="Tài khoản" onClick={() => navigate("/admin/personnel")} />
              </div>
            </Card>

            {/* Priority Alerts */}
            <Card title="Cảnh báo ưu tiên">
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                {(() => {
                  const activeAlerts = [];
                  if (alerts.maintenanceRooms > 0) {
                    activeAlerts.push({ type: "error", icon: <FaWrench />, badge: "Nghiêm trọng", title: "Cần bảo trì", text: `${alerts.maintenanceRooms} phòng cần bảo trì ngay`, time: "Vừa xong" });
                  }
                  if (alerts.pendingBookings > 0) {
                    activeAlerts.push({ type: "warning", icon: <FaExclamationCircle />, badge: "Cảnh báo", title: "Chờ duyệt", text: `${alerts.pendingBookings} yêu cầu đặt phòng đang chờ duyệt`, time: "2 giờ trước" });
                  }
                  
                  if (activeAlerts.length === 0) {
                    return (
                      <div style={{ textAlign: "center", padding: "24px 0", color: "#6B7280" }}>
                        <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.5 }}>✓</div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 500, color: "#374151" }}>Không có cảnh báo</p>
                        <p style={{ margin: "4px 0 0", fontSize: 12 }}>Mọi thứ đang hoạt động ổn định.</p>
                      </div>
                    );
                  }

                  return activeAlerts.map((act, i) => <Alert key={i} item={act} />);
                })()}
              </div>
            </Card>

            {/* Recent Activities */}
            <Card title="Hoạt động gần đây">
              <div style={{ display: "flex", flexDirection: "column", minHeight: 250, marginTop: 16 }}>
                {recentActivities && recentActivities.length > 0 ? (
                  <div style={{ position: "relative", paddingLeft: 24, borderLeft: "2px solid #E7EFEA", display: "flex", flexDirection: "column", gap: 24 }}>
                    {recentActivities.slice(0, 4).map((act, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -31, top: 0, width: 16, height: 16, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", border: "2px solid #fff", fontSize: 8 }}>
                          <FaCheck />
                        </div>
                        <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#111827" }}>{act.title}</p>
                        {act.description && <p style={{ margin: "0 0 6px", fontSize: 12, color: "#6B7280" }}>{act.description}</p>}
                        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9CA3AF", fontWeight: 500 }}>
                          <FaClock size={10} /> {act.time}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", color: "#6B7280" }}>
                    <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📭</div>
                    <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#374151" }}>Chưa có hoạt động</p>
                    <p style={{ margin: "4px 0 0", fontSize: 12, maxWidth: 200, lineHeight: 1.4 }}>Các hoạt động hệ thống sẽ xuất hiện tại đây khi người dùng tương tác.</p>
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>

        {/* RECENT ROOM REQUESTS TABLE */}
        <Card title="Giao dịch đặt phòng gần đây" noPadding>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #E7EFEA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#6B7280" }}>Các giao dịch thanh toán và đặt phòng mới nhất</span>
            <button onClick={() => alert("Tính năng lọc giao dịch đang được phát triển.")} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: "1px solid #E7EFEA", borderRadius: 8, fontSize: 13, fontWeight: 500, background: "#fff", color: "#374151", cursor: "pointer" }}>
              <FaFilter size={12} /> Lọc
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E7EFEA", color: "#6B7280", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Sinh viên</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Phòng / Khu</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Kỳ học</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Ngày yêu cầu</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Trạng thái</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {bookingRequests && bookingRequests.length > 0 ? bookingRequests.map((b, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid #E7EFEA", transition: "background 0.2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F6FAF7"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "16px 24px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#DCFCE7", color: "#16A34A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700 }}>
                          {b.initials}
                        </div>
                        <div>
                          <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{b.name}</p>
                          <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>{b.code}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: "16px 24px" }}>
                      <p style={{ margin: 0, fontWeight: 500, color: "#111827" }}>{b.room}</p>
                      <p style={{ margin: 0, fontSize: 12, color: "#6B7280" }}>{b.building}</p>
                    </td>
                    <td style={{ padding: "16px 24px", color: "#374151" }}>{b.semester}</td>
                    <td style={{ padding: "16px 24px", color: "#6B7280" }}>{b.date}</td>
                    <td style={{ padding: "16px 24px" }}>
                      <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: b.statusColor?.bg || "#DCFCE7", color: b.statusColor?.color || "#16A34A" }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button onClick={() => alert("Tính năng xem chi tiết biên lai đang được phát triển.")} style={{ padding: 6, border: "none", background: "transparent", color: "#3B82F6", cursor: "pointer", marginRight: 8 }}><FaEye size={16} /></button>
                      {b.status === "Chờ thanh toán" && (
                        <button onClick={() => alert("Tính năng duyệt đơn thủ công đang được phát triển.")} style={{ padding: 6, border: "none", background: "transparent", color: "#22C55E", cursor: "pointer" }}><FaCheck size={16} /></button>
                      )}
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" style={{ padding: "48px 24px", textAlign: "center" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#6B7280" }}>
                        <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.5 }}>📂</div>
                        <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#374151" }}>Chưa có giao dịch</p>
                        <p style={{ margin: "4px 0 0", fontSize: 12, maxWidth: 250, lineHeight: 1.4 }}>Các giao dịch đặt phòng mới sẽ xuất hiện tại đây.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>

      <style>{`
        @keyframes drawDonut {
          from { opacity: 0; stroke-dashoffset: 100; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}

/* UI COMPONENTS */

function HeroMetric({ label, value }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 12, opacity: 0.8, textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 500 }}>{label}</span>
      <span style={{ fontSize: 28, fontWeight: 700, lineHeight: 1 }}>{value}</span>
    </div>
  );
}

function Card({ title, subtitle, children, noPadding }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, border: "1px solid #E7EFEA", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", padding: noPadding ? 0 : 24, display: "flex", flexDirection: "column" }}>
      {(title || subtitle) && !noPadding && (
        <div style={{ marginBottom: children ? 16 : 0 }}>
          {title && <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>{title}</h3>}
          {subtitle && <p style={{ margin: "4px 0 0", fontSize: 13, color: "#6B7280" }}>{subtitle}</p>}
        </div>
      )}
      {noPadding && title && (
        <div style={{ padding: "24px 24px 0" }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: "#111827" }}>{title}</h3>
        </div>
      )}
      {children}
    </div>
  );
}

function KpiCard({ title, value, icon, color, trend, sparkline, isNegative }) {
  return (
    <div style={{ background: "#fff", borderRadius: 20, padding: 24, border: "1px solid #E7EFEA", boxShadow: "0 4px 20px rgba(0,0,0,0.03)", display: "flex", flexDirection: "column", position: "relative", overflow: "hidden", transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateY(-4px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}15`, color: color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
          {icon}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 600, color: isNegative ? "#EF4444" : "#22C55E", background: isNegative ? "#FEE2E2" : "#DCFCE7", padding: "4px 8px", borderRadius: 999 }}>
          {isNegative ? <FaArrowDown size={10} /> : <FaArrowUp size={10} />} {trend}
        </div>
      </div>
      <p style={{ margin: 0, fontSize: 13, fontWeight: 500, color: "#6B7280", marginBottom: 4 }}>{title}</p>
      <p style={{ margin: 0, fontSize: 32, fontWeight: 700, color: "#111827" }}>{value}</p>
      <svg style={{ position: "absolute", bottom: -5, left: 0, width: "100%", height: 40 }} viewBox="0 0 40 20" preserveAspectRatio="none">
        <path d={sparkline} fill="none" stroke={color} strokeWidth="2" opacity="0.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

function Button({ icon, label, primary, onClick }) {
  return (
    <button onClick={onClick} style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "16px 8px", gap: 8, borderRadius: 12, border: primary ? "none" : "1px solid #E7EFEA", background: primary ? "#22C55E" : "#fff", color: primary ? "#fff" : "#374151", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "scale(1.02)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <span style={{ fontSize: 12, fontWeight: 600 }}>{label}</span>
    </button>
  );
}

function Alert({ item }) {
  const colors = {
    error: { bg: "#FEF2F2", text: "#EF4444", badgeBg: "#EF4444", badgeText: "#fff" },
    warning: { bg: "#FFFBEB", text: "#F59E0B", badgeBg: "#F59E0B", badgeText: "#fff" },
    info: { bg: "#EFF6FF", text: "#3B82F6", badgeBg: "#3B82F6", badgeText: "#fff" },
  }[item.type];

  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 16, background: colors.bg, borderRadius: 12, transition: "transform 0.2s" }} onMouseEnter={e => e.currentTarget.style.transform = "translateX(4px)"} onMouseLeave={e => e.currentTarget.style.transform = "none"}>
      <div style={{ color: colors.text, marginTop: 2, fontSize: 16 }}>{item.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: colors.badgeBg, color: colors.badgeText, padding: "2px 8px", borderRadius: 4 }}>{item.badge}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{item.title}</span>
          </div>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{item.time}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#4B5563", lineHeight: 1.4 }}>{item.text}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;

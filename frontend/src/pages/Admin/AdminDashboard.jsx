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
            <span style={{ fontWeight: 600, fontSize: 16 }}>{error || "No data available"}</span>
            <button onClick={() => navigate(0)} style={{ padding: "10px 24px", borderRadius: 8, border: "none", background: "#22C55E", color: "#fff", fontWeight: 600, cursor: "pointer" }}>Retry</button>
          </div>
        </main>
      </div>
    );
  }

  const { students, occupancy, pendingTickets, monthlyRevenue, occupancySeries, buildings, alerts, bookingRequests, recentActivities } = data;

  const totalRooms = occupancy.totalRooms || 1;
  const donutData = [
    { label: "Occupied", value: occupancy.occupiedRooms, color: "#22C55E" },
    { label: "Available", value: occupancy.availableRooms, color: "#DCFCE7" },
    { label: "Maintenance", value: occupancy.maintenanceRooms, color: "#F59E0B" },
    { label: "Reserved", value: alerts.pendingBookings, color: "#3B82F6" },
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
                System Online • {getCurrentDateFormatted()}
              </div>
              <h1 style={{ fontSize: 32, fontWeight: 600, margin: "0 0 8px", letterSpacing: "-0.5px" }}>Admin</h1>
              <p style={{ margin: 0, fontSize: 16, opacity: 0.9 }}>Dormitory Overview & Real-time Metrics</p>
            </div>

            <div style={{ display: "flex", gap: 32, background: "rgba(255,255,255,0.1)", padding: "20px 32px", borderRadius: 16, backdropFilter: "blur(10px)" }}>
              <HeroMetric label="Occupancy Rate" value={`${occupancy.rate}%`} />
              <HeroMetric label="Available Rooms" value={occupancy.availableRooms} />
              <HeroMetric label="Pending Requests" value={pendingTickets} />
              <HeroMetric label="Monthly Revenue" value={formatCurrency(monthlyRevenue.total)} />
            </div>
          </div>
        </section>

        {/* KPI CARDS */}
        <section ref={cardsRef} style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 24, marginBottom: 24 }}>
          <KpiCard title="Total Students" value={students.total.toLocaleString()} icon={<FaUsers />} color="#22C55E" trend="+2.4%" sparkline={SPARK_UP} />
          <KpiCard title="Occupied Rooms" value={occupancy.occupiedRooms.toLocaleString()} icon={<FaBed />} color="#3B82F6" trend="+1.2%" sparkline={SPARK_UP} />
          <KpiCard title="Available Rooms" value={occupancy.availableRooms.toLocaleString()} icon={<FaDoorOpen />} color="#F59E0B" trend="-0.5%" sparkline={SPARK_DOWN} isNegative />
          <KpiCard title="Total Buildings" value={buildings.length} icon={<FaBuilding />} color="#8B5CF6" trend="Active" sparkline={SPARK_UP} />
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 24 }} ref={chartRef}>
          {/* CHARTS SECTION */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>

            {/* OCCUPANCY & REVENUE CHARTS (2 Cols) */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Occupancy Trend Bar Chart */}
              <Card title="Occupancy Trend" subtitle="12-month trailing occupancy">
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
              <Card title="Revenue Trend" subtitle="Monthly revenue performance">
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
                    {['Jan', 'Mar', 'May', 'Jul', 'Sep', 'Nov'].map(m => <span key={m} style={{ fontSize: 11, color: "#9CA3AF" }}>{m}</span>)}
                  </div>
                </div>
              </Card>
            </div>

            {/* BUILDING COMPARISON & DONUT */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              {/* Building Progress Bars */}
              <Card title="Building Occupancy" subtitle="Capacity utilization by building">
                <div style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 16 }}>
                  {buildings.map((b) => (
                    <div key={b.name}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6, fontSize: 13, fontWeight: 500 }}>
                        <span style={{ color: "#374151" }}>{b.name}</span>
                        <span style={{ color: "#22C55E", fontWeight: 600 }}>{b.rate}% <span style={{ color: "#9CA3AF", fontWeight: 400, fontSize: 12 }}>({b.occupied}/{b.total})</span></span>
                      </div>
                      <div style={{ width: "100%", height: 8, background: "#F6FAF7", borderRadius: 4, overflow: "hidden" }}>
                        <div data-anim style={{ width: `${b.rate}%`, height: "100%", background: "#22C55E", borderRadius: 4 }} />
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Room Distribution Donut */}
              <Card title="Room Distribution" subtitle="Overall status overview">
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 180, marginTop: 16 }}>
                  <div style={{ position: "relative", width: 140, height: 140 }}>
                    <svg viewBox="0 0 36 36" style={{ width: "100%", height: "100%", transform: "rotate(-90deg)" }}>
                      {donutData.map((d, i) => {
                        const dashArray = `${(d.value / totalRooms) * 100} 100`;
                        const offset = -currentAngle;
                        currentAngle += (d.value / totalRooms) * 100;
                        return (
                          <circle key={i} data-anim cx="18" cy="18" r="16" fill="none" stroke={d.color} strokeWidth="4" strokeDasharray={dashArray} strokeDashoffset={offset} />
                        );
                      })}
                    </svg>
                    <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: 24, fontWeight: 700, color: "#111827", lineHeight: 1 }}>{totalRooms}</span>
                      <span style={{ fontSize: 10, color: "#9CA3AF" }}>Total</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, paddingLeft: 24 }}>
                    {donutData.map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", fontSize: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 10, height: 10, borderRadius: "50%", background: d.color }} />
                          <span style={{ color: "#4B5563" }}>{d.label}</span>
                        </div>
                        <span style={{ fontWeight: 600, color: "#111827" }}>{d.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* SIDEBAR WIDGETS (Right 1/3) */}
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {/* Quick Actions */}
            <Card title="Quick Actions">
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 }}>
                <Button primary icon={<FaBuilding />} label="Add Building" onClick={() => navigate("/admin/buildings")} />
                <Button primary icon={<FaHome />} label="Add Room" onClick={() => navigate("/admin/rooms")} />
                <Button icon={<FaCalendarAlt />} label="Semester" onClick={() => navigate("/admin/semesters")} />
                <Button icon={<FaUserPlus />} label="Account" onClick={() => navigate("/admin/personnel")} />
              </div>
            </Card>

            {/* Priority Alerts */}
            <Card title="Priority Alerts">
              <div style={{ display: "flex", flexDirection: "column", gap: 12, marginTop: 16 }}>
                <Alert item={{ type: "error", icon: <FaWrench />, badge: "Critical", text: `${alerts.maintenanceRooms} rooms require maintenance`, time: "Just now" }} />
                <Alert item={{ type: "warning", icon: <FaExclamationCircle />, badge: "Warning", text: `${alerts.pendingBookings} bookings pending`, time: "2h ago" }} />
                <Alert item={{ type: "info", icon: <FaShieldAlt />, badge: "Info", text: `${alerts.activePersonnel}/${alerts.totalPersonnel} staff on duty`, time: "4h ago" }} />
              </div>
            </Card>

            {/* Recent Activities */}
            <Card title="Recent Activities">
              <div style={{ position: "relative", paddingLeft: 16, marginTop: 16, borderLeft: "2px solid #E7EFEA", display: "flex", flexDirection: "column", gap: 20 }}>
                {recentActivities && recentActivities.slice(0, 4).map((act, i) => (
                  <div key={i} style={{ position: "relative" }}>
                    <div style={{ position: "absolute", left: -21, top: 4, width: 10, height: 10, borderRadius: "50%", background: "#22C55E", border: "2px solid #fff" }} />
                    <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 500, color: "#374151" }}>{act.title}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "#9CA3AF" }}>
                      <FaClock size={10} /> {act.time}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* RECENT ROOM REQUESTS TABLE */}
        <Card title="Recent Room Requests" noPadding>
          <div style={{ padding: "16px 24px", borderBottom: "1px solid #E7EFEA", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 14, color: "#6B7280" }}>Latest pending and approved booking requests</span>
            <button style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", border: "1px solid #E7EFEA", borderRadius: 8, fontSize: 13, fontWeight: 500, background: "#fff", color: "#374151", cursor: "pointer" }}>
              <FaFilter size={12} /> Filter
            </button>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14, textAlign: "left" }}>
              <thead>
                <tr style={{ background: "#F9FAFB", borderBottom: "1px solid #E7EFEA", color: "#6B7280", fontSize: 12, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Student</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Room / Bldg</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Semester</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Request Date</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "16px 24px", fontWeight: 600, textAlign: "right" }}>Action</th>
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
                      <span style={{ display: "inline-flex", padding: "4px 10px", borderRadius: 999, fontSize: 11, fontWeight: 600, background: b.status === "Pending" ? "#FEF3C7" : "#DCFCE7", color: b.status === "Pending" ? "#D97706" : "#16A34A" }}>
                        {b.status}
                      </span>
                    </td>
                    <td style={{ padding: "16px 24px", textAlign: "right" }}>
                      <button style={{ padding: 6, border: "none", background: "transparent", color: "#3B82F6", cursor: "pointer", marginRight: 8 }}><FaEye size={16} /></button>
                      <button style={{ padding: 6, border: "none", background: "transparent", color: b.status === "Pending" ? "#22C55E" : "#9CA3AF", cursor: "pointer" }}><FaCheck size={16} /></button>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="6" style={{ padding: "32px", textAlign: "center", color: "#6B7280" }}>No pending requests</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </main>
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
    <div style={{ display: "flex", alignItems: "flex-start", gap: 12, padding: 12, background: colors.bg, borderRadius: 12 }}>
      <div style={{ color: colors.text, marginTop: 2 }}>{item.icon}</div>
      <div style={{ flex: 1 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
          <span style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase", background: colors.badgeBg, color: colors.badgeText, padding: "2px 6px", borderRadius: 4 }}>{item.badge}</span>
          <span style={{ fontSize: 11, color: "#9CA3AF" }}>{item.time}</span>
        </div>
        <p style={{ margin: 0, fontSize: 13, color: "#374151", lineHeight: 1.4 }}>{item.text}</p>
      </div>
    </div>
  );
}

export default AdminDashboard;

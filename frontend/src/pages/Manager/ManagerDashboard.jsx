import { useMemo, useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import gsap from "gsap";
import { createNews, getAllNews } from "../../api/newsService";
import getAdminDashboard from "../../api/dashboardService";
import { showSuccess, showError } from "../../components/Alert";
import { formatDateTime } from "../../utils/date";
import {
  FaBell,
  FaBed,
  FaBuilding,
  FaCalendarAlt,
  FaChartPie,
  FaClipboardCheck,
  FaDoorOpen,
  FaExclamationTriangle,
  FaFileInvoiceDollar,
  FaHome,
  FaSearch,
  FaSlidersH,
  FaTools,
  FaUserCheck,
  FaUsersCog,
  FaSpinner,
} from "react-icons/fa";
import "./ManagerDashboard.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";
import HeroCard from "./components/Overview/HeroCard";
import KPISection from "./components/Overview/KPISection";
import BuildingOverview from "./components/Overview/BuildingOverview";
import MaintenanceChart from "./components/Overview/MaintenanceChart";
import RecentRequestsTable from "./components/Overview/RecentRequestsTable";
import { 
  QuickActions,
  RecentActivitiesList
} from "./components/Overview/RightPanelComponents";

const rooms = [
  { room: "A-101", building: "Dorm A", floor: 1, type: "4 beds", gender: "Nam", occupied: 4, price: "1.200.000", status: "FULL" },
  { room: "A-203", building: "Dorm A", floor: 2, type: "6 beds", gender: "Nam", occupied: 5, price: "950.000", status: "AVAILABLE" },
  { room: "B-305", building: "Dorm B", floor: 3, type: "4 beds", gender: "Nữ", occupied: 3, price: "1.200.000", status: "AVAILABLE" },
  { room: "C-402", building: "Dorm C", floor: 4, type: "3 beds", gender: "Nam", occupied: 0, price: "1.500.000", status: "MAINTENANCE" },
];

const bookings = [
  { id: "BR-1028", student: "Trần Hoàng Nam", code: "SE182001", semester: "Summer 2026", bed: "A-203-06", score: 96, status: "PENDING" },
  { id: "BR-1027", student: "Lê Phương Anh", code: "GD181422", semester: "Summer 2026", bed: "B-305-04", score: 88, status: "PENDING" },
  { id: "BR-1026", student: "Phạm Đức Huy", code: "AI180714", semester: "Summer 2026", bed: "A-101-02", score: 74, status: "APPROVED" },
  { id: "BR-1025", student: "Ngô Gia Bảo", code: "SE181513", semester: "Summer 2026", bed: "C-402-01", score: 61, status: "REJECTED" },
];

const residencies = [
  { student: "Phạm Đức Huy", room: "A-101", bed: "02", checkIn: "02/06/2026", checkOut: "-", status: "ACTIVE" },
  { student: "Mai Thảo Vy", room: "B-305", bed: "01", checkIn: "01/06/2026", checkOut: "-", status: "ACTIVE" },
  { student: "Hoàng Nhật Linh", room: "A-203", bed: "03", checkIn: "30/05/2026", checkOut: "08/08/2026", status: "ACTIVE" },
  { student: "Đặng Quang Minh", room: "C-201", bed: "04", checkIn: "05/01/2026", checkOut: "28/05/2026", status: "COMPLETED" },
];

const invoices = [
  { id: "INV-2210", student: "Trần Hoàng Nam", type: "ROOM_FEE", amount: "1.200.000", due: "15/06/2026", status: "UNPAID" },
  { id: "INV-2209", student: "Lê Phương Anh", type: "UTILITY", amount: "286.000", due: "12/06/2026", status: "UNPAID" },
  { id: "INV-2208", student: "Phạm Đức Huy", type: "FINE", amount: "150.000", due: "10/06/2026", status: "PAID" },
];

const utilities = [
  { room: "A-101", month: "06/2026", electricity: 4210, water: 782, cost: "714.000" },
  { room: "A-203", month: "06/2026", electricity: 2388, water: 441, cost: "386.000" },
  { room: "B-305", month: "06/2026", electricity: 3190, water: 528, cost: "512.000" },
];

const tickets = [
  { id: "TK-341", room: "C-402", type: "MAINTENANCE", assigned: "Lê Văn Tùng", status: "IN_PROGRESS", created: "08/06/2026" },
  { id: "TK-340", room: "A-203", type: "CLEANING", assigned: "Nguyễn Thị Hoa", status: "OPEN", created: "07/06/2026" },
  { id: "TK-339", room: "B-305", type: "MAINTENANCE", assigned: "Phạm Thanh Bình", status: "RESOLVED", created: "06/06/2026" },
];

const violations = [
  { student: "Ngô Gia Bảo", room: "A-203", description: "Về muộn sau giờ quy định", deduction: 5, fine: "0", created: "08/06/2026" },
  { student: "Trần Hoàng Nam", room: "A-101", description: "Làm hỏng thiết bị phòng", deduction: 10, fine: "150.000", created: "07/06/2026" },
  { student: "Mai Thảo Vy", room: "B-305", description: "Chưa hoàn tất vệ sinh khu vực chung", deduction: 3, fine: "0", created: "05/06/2026" },
];

const staffs = [
  { name: "Lê Văn Tùng", type: "MAINTENANCE", area: "Dorm A, C", openTasks: 3, status: "Đang trực" },
  { name: "Nguyễn Thị Hoa", type: "CLEANER", area: "Dorm A", openTasks: 2, status: "Đang trực" },
  { name: "Phạm Thanh Bình", type: "SECURITY", area: "Cổng chính", openTasks: 1, status: "Ca tối" },
];

const notifications = [
  { title: "Mở đơn đăng ký Summer 2026", target: "STUDENT", date: "08/06/2026", status: "Đã gửi" },
  { title: "Nhắc thanh toán hóa đơn tháng 06", target: "STUDENT, PARENT", date: "07/06/2026", status: "Đã gửi" },
  { title: "Lịch bảo trì nước Dorm C", target: "STAFF, STUDENT", date: "06/06/2026", status: "Nháp" },
];

const settings = [
  { key: "electricity_price", value: "3.500 VND/kWh" },
  { key: "water_price", value: "12.000 VND/m3" },
  { key: "active_semester", value: "Summer 2026" },
];

function ManagerDashboard() {
  const location = useLocation();
  const [activeModule, setActiveModule] = useState("overview");
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (location.pathname === "/manager/notifications") {
      setActiveModule("settings");
    } else {
      setActiveModule("overview");
    }
  }, [location.pathname]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getAdminDashboard();
        if (res.success) setDashboardData(res.data);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [query, setQuery] = useState("");

  const roomMatches = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rooms;
    return rooms.filter((room) => Object.values(room).join(" ").toLowerCase().includes(keyword));
  }, [query]);

  return (
    <div className="manager-shell">
      <Sidebar />

      <main className="manager-main">
        <Header />

        {activeModule === "overview" && (
          <OverviewScreen data={dashboardData} loading={loading} />
        )}

        {activeModule === "infrastructure" && (
          <InfrastructureScreen query={query} setQuery={setQuery} roomMatches={roomMatches} />
        )}

        {activeModule === "bookings" && <BookingScreen />}
        {activeModule === "residencies" && <ResidencyScreen />}
        {activeModule === "billing" && <BillingScreen />}
        {activeModule === "operations" && <OperationsScreen />}
        {activeModule === "violations" && <ViolationsScreen />}
        {activeModule === "staffs" && <StaffScreen />}
        {activeModule === "settings" && <SettingsScreen />}
      </main>
    </div>
  );
}

function OverviewScreen({ data, loading }) {
  if (loading) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "40vh", color: "#66736d", fontSize: 16, fontWeight: 700, gap: 12 }}>
        <FaSpinner style={{ animation: "spin 0.8s linear infinite" }} />
        Đang tải dữ liệu...
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "40vh", color: "#b42318", gap: 12 }}>
        <FaExclamationTriangle size={28} />
        <span style={{ fontWeight: 700 }}>Không thể tải dữ liệu dashboard</span>
      </div>
    );
  }

  const { students, occupancy, pendingTickets, alerts, buildings, bookingRequests, recentActivities, maintenanceStats } = data;
  
  const kpiData = {
    totalStudents: students?.total || 0,
    occupiedBeds: occupancy?.occupiedRooms ? occupancy.occupiedRooms * 4 : 0,
    pendingRequests: alerts?.pendingBookings || 0,
    maintenanceRooms: occupancy?.maintenanceRooms || alerts?.maintenanceRooms || 0
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <HeroCard 
        occupancyRate={occupancy?.rate} 
        pendingRequests={alerts?.pendingBookings || 0}
        pendingTickets={pendingTickets || 0}
      />
      
      <KPISection data={kpiData} />
      
      <div style={{ display: "grid", gridTemplateColumns: "7fr 3fr", gap: 24 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <BuildingOverview buildings={buildings} />
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 24 }}>
            <MaintenanceChart data={maintenanceStats} />
          </div>
          
          <RecentRequestsTable bookingRequests={bookingRequests} />
        </div>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <QuickActions />
          <RecentActivitiesList recentActivities={recentActivities} />
        </div>
      </div>
    </div>
  );
}

function InfrastructureScreen({ query, setQuery, roomMatches }) {
  return (
    <div className="manager-stack">
      <section className="manager-toolbar">
        <div className="manager-search">
          <FaSearch />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm phòng, tòa, giới tính, trạng thái..." />
        </div>
        <button type="button" className="manager-secondary-button">Thêm phòng mock</button>
      </section>

      <section className="manager-grid manager-grid--three">
        {rooms.filter((r, i, arr) => arr.findIndex(x => x.building === r.building) === i).map((b) => {
          const buildingRooms = rooms.filter((r) => r.building === b.building);
          const totalBeds = buildingRooms.reduce((s, r) => s + (r.type === "4 beds" ? 4 : r.type === "6 beds" ? 6 : 3), 0);
          return (
            <article className="building-card" key={b.building}>
              <div className="building-card__top">
                <span><FaBuilding /></span>
                <b>{b.building}</b>
              </div>
              <dl>
                <div><dt>Tầng</dt><dd>{Math.max(...buildingRooms.map(r => r.floor))}</dd></div>
                <div><dt>Phòng</dt><dd>{buildingRooms.length}</dd></div>
                <div><dt>Giường</dt><dd>{totalBeds}</dd></div>
              </dl>
              <div className="building-card__foot">
                <span>Quản lý: --</span>
                <strong>{Math.round(buildingRooms.filter(r => r.occupied > 0).length / buildingRooms.length * 100)}% đầy</strong>
              </div>
            </article>
          );
        })}
      </section>

      <DataPanel
        title="Danh sách phòng và giường"
        subtitle="Danh sách phòng."
        columns={["Phòng", "Tòa", "Tầng", "Loại", "Giới tính", "Đã ở", "Giá", "Trạng thái"]}
        rows={roomMatches.map((room) => [
          room.room,
          room.building,
          room.floor,
          room.type,
          room.gender,
          room.occupied,
          `${room.price} VND`,
          <StatusBadge key={room.room} status={room.status} />,
        ])}
      />
    </div>
  );
}

function BookingScreen() {
  return (
    <DataPanel
      title="Yêu cầu đặt phòng"
      subtitle="Danh sách yêu cầu đặt phòng của sinh viên."
      columns={["Mã đơn", "Sinh viên", "Mã SV", "Học kỳ", "Giường", "CFD", "Trạng thái", "Thao tác"]}
      rows={bookings.map((item) => [
        item.id,
        item.student,
        item.code,
        item.semester,
        item.bed,
        item.score,
        <StatusBadge key={`${item.id}-status`} status={item.status} />,
        <ActionGroup key={`${item.id}-actions`} primary="Duyệt" secondary="Từ chối" />,
      ])}
    />
  );
}

function ResidencyScreen() {
  return (
    <DataPanel
      title="Danh sách lưu trú"
      subtitle="Danh sách sinh viên đang ở."
      columns={["Sinh viên", "Phòng", "Giường", "Check-in", "Check-out", "Trạng thái"]}
      rows={residencies.map((item) => [
        item.student,
        item.room,
        item.bed,
        item.checkIn,
        item.checkOut,
        <StatusBadge key={`${item.student}-residency`} status={item.status} />,
      ])}
    />
  );
}

function BillingScreen() {
  return (
    <div className="manager-stack">
      <section className="manager-grid manager-grid--wide">
        <DataPanel
          title="Hóa đơn sinh viên"
          subtitle="Danh sách hóa đơn."
          columns={["Mã", "Sinh viên", "Loại", "Số tiền", "Hạn trả", "Trạng thái"]}
          rows={invoices.map((item) => [
            item.id,
            item.student,
            item.type,
            `${item.amount} VND`,
            item.due,
            <StatusBadge key={`${item.id}-invoice`} status={item.status} />,
          ])}
        />
        <DataPanel
          title="Chỉ số điện nước"
          subtitle="Dùng để sinh hóa đơn tiện ích."
          columns={["Phòng", "Tháng", "Điện", "Nước", "Tạm tính"]}
          rows={utilities.map((item) => [
            item.room,
            item.month,
            item.electricity,
            item.water,
            `${item.cost} VND`,
          ])}
        />
      </section>
    </div>
  );
}

function OperationsScreen() {
  return (
    <DataPanel
      title="Ticket vận hành"
      subtitle="Danh sách ticket."
      columns={["Mã", "Phòng", "Loại", "Phân công", "Trạng thái", "Ngày tạo", "Thao tác"]}
      rows={tickets.map((item) => [
        item.id,
        item.room,
        item.type,
        item.assigned,
        <StatusBadge key={`${item.id}-ticket`} status={item.status} />,
        item.created,
        <ActionGroup key={`${item.id}-actions`} primary="Cập nhật" secondary="Ghi chú" />,
      ])}
    />
  );
}

function ViolationsScreen() {
  return (
    <DataPanel
      title="Ghi nhận vi phạm"
      subtitle="Danh sách vi phạm."
      columns={["Sinh viên", "Phòng", "Mô tả", "Trừ CFD", "Phạt", "Ngày tạo"]}
      rows={violations.map((item) => [
        item.student,
        item.room,
        item.description,
        item.deduction,
        `${item.fine} VND`,
        item.created,
      ])}
    />
  );
}

function StaffScreen() {
  return (
    <DataPanel
      title="Nhân sự vận hành"
      subtitle="Danh sách nhân sự."
      columns={["Nhân sự", "Loại", "Khu phụ trách", "Task mở", "Trạng thái"]}
      rows={staffs.map((item) => [
        item.name,
        item.type,
        item.area,
        item.openTasks,
        item.status,
      ])}
    />
  );
}

function SettingsScreen() {
  const [newsList, setNewsList] = useState([]);
  const [loadingNews, setLoadingNews] = useState(true);
  const [newsForm, setNewsForm] = useState({ title: "", content: "", isPinned: false });
  const [sending, setSending] = useState(false);

  const fetchNews = async () => {
    try {
      setLoadingNews(true);
      const res = await getAllNews();
      if (res.success) {
        setNewsList(res.data || []);
      }
    } catch (err) {
      console.error(err);
      showError("Không thể tải danh sách bản tin");
    } finally {
      setLoadingNews(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  const handlePostNews = async (e) => {
    e.preventDefault();
    if (!newsForm.title.trim() || !newsForm.content.trim()) {
      showError("Vui lòng điền đầy đủ tiêu đề và nội dung.");
      return;
    }

    try {
      setSending(true);
      const res = await createNews({
        title: newsForm.title.trim(),
        content: newsForm.content.trim(),
        status: "published",
        isPinned: newsForm.isPinned,
      });
      if (res.success) {
        showSuccess("Đăng bản tin thành công!");
        setNewsForm({ title: "", content: "", isPinned: false });
        fetchNews();
      } else {
        showError(res.message || "Lỗi khi đăng bản tin");
      }
    } catch (err) {
      console.error(err);
      showError(err.response?.data?.message || "Lỗi kết nối server");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="manager-stack">
      <section className="manager-grid manager-grid--wide">
        <div className="manager-panel">
          <div className="manager-panel__header">
            <h3>Đăng bản tin mới</h3>
            <p>Đăng tin tức/thông báo cho toàn bộ Sinh viên KTX</p>
          </div>
          <form onSubmit={handlePostNews} style={{ padding: "16px 20px", display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>Tiêu đề bản tin</label>
              <input
                type="text"
                placeholder="Nhập tiêu đề thông báo..."
                value={newsForm.title}
                onChange={(e) => setNewsForm(prev => ({ ...prev, title: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, boxSizing: "border-box" }}
                disabled={sending}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: "#64748B", marginBottom: 6 }}>Nội dung chi tiết</label>
              <textarea
                placeholder="Nhập nội dung chi tiết bản tin..."
                rows={5}
                value={newsForm.content}
                onChange={(e) => setNewsForm(prev => ({ ...prev, content: e.target.value }))}
                style={{ width: "100%", padding: "10px 12px", borderRadius: 6, border: "1px solid #CBD5E1", fontSize: 14, boxSizing: "border-box", fontFamily: "inherit", resize: "vertical" }}
                disabled={sending}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "4px 0" }}>
              <input type="checkbox" id="isPinned" checked={newsForm.isPinned} onChange={(e) => setNewsForm(prev => ({ ...prev, isPinned: e.target.checked }))} style={{ width: 16, height: 16, cursor: "pointer" }} disabled={sending} />
              <label htmlFor="isPinned" style={{ fontSize: 13, fontWeight: 700, color: "#64748B", cursor: "pointer", userSelect: "none" }}>Ghim bài viết này lên đầu bảng tin 📌</label>
            </div>
            <div>
              <button type="submit" disabled={sending} style={{ padding: "10px 24px", background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer", fontSize: 14 }}>
                {sending ? "Đang gửi..." : "Đăng tin"}
              </button>
            </div>
          </form>
        </div>

        <DataPanel
          title="Bản tin đã đăng"
          subtitle="Danh sách các thông báo đã gửi cho Sinh viên"
          columns={["Tiêu đề", "Người đăng", "Ngày", "Trạng thái"]}
          rows={
            loadingNews
              ? [[<span key="loading" style={{ color: "#64748B" }}>Đang tải bản tin...</span>, "", "", ""]]
              : newsList.length === 0
              ? [[<span key="empty" style={{ color: "#64748B" }}>Chưa có bản tin nào được đăng.</span>, "", "", ""]]
              : newsList.map((item) => [
                  item.title,
                  item.authorId?.fullName || "Quản trị viên",
                  formatDateTime(item.createdAt),
                  <StatusBadge key={item._id} status={item.status === "published" ? "Đã gửi" : "Nháp"} />,
                ])
          }
        />
        <DataPanel
          title="Cài đặt hệ thống"
          subtitle="Các setting."
          columns={["Key", "Value"]}
          rows={settings.map((item) => [item.key, item.value])}
        />
      </section>
    </div>
  );
}

function MetricCard({ icon, label, value, note, tone }) {
  return (
    <article className={`metric-card metric-card--${tone}`}>
      <div className="metric-card__icon">{icon}</div>
      <span>{label}</span>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
  );
}

function Panel({ title, subtitle, children }) {
  return (
    <section className="manager-panel">
      <div className="manager-panel__header">
        <h3>{title}</h3>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function DataPanel({ title, subtitle, columns, rows }) {
  return (
    <Panel title={title} subtitle={subtitle}>
      <div className="manager-table-wrap">
        <table className="manager-table">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={column}>{column}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => (
              <tr key={`${title}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <td key={`${title}-${rowIndex}-${cellIndex}`}>{cell}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-badge--${status.toLowerCase()}`}>{status}</span>;
}

function ActionGroup({ primary, secondary }) {
  return (
    <div className="action-group">
      <button type="button">{primary}</button>
      <button type="button">{secondary}</button>
    </div>
  );
}

export default ManagerDashboard;

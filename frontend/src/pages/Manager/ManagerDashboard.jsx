import { useMemo, useState } from "react";
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
} from "react-icons/fa";
import "./ManagerDashboard.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";


const buildings = [
  { name: "Dorm A", manager: "Ngô Quý Quang", floors: 6, rooms: 48, beds: 192, occupancy: 84, gender: "Nam" },
  { name: "Dorm B", manager: "Ngô Quý Quang", floors: 5, rooms: 40, beds: 160, occupancy: 78, gender: "Nữ" },
  { name: "Dorm C", manager: "Ngô Quý Quang", floors: 4, rooms: 32, beds: 128, occupancy: 64, gender: "Nam/Nữ" },
];

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
  const [activeModule, setActiveModule] = useState("overview");
  const [query, setQuery] = useState("");

  const totalBeds = buildings.reduce((sum, building) => sum + building.beds, 0);
  const occupiedBeds = Math.round(
    buildings.reduce((sum, building) => sum + (building.beds * building.occupancy) / 100, 0)
  );
  const pendingBookings = bookings.filter((item) => item.status === "PENDING").length;
  const openTickets = tickets.filter((item) => item.status !== "RESOLVED").length;

  const roomMatches = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return rooms;
    return rooms.filter((room) => Object.values(room).join(" ").toLowerCase().includes(keyword));
  }, [query]);

  return (
    <div className="manager-shell">
      <Sidebar/>

      <main className="manager-main">
        <Header/>

        {activeModule === "overview" && (
          <OverviewScreen
            totalBeds={totalBeds}
            occupiedBeds={occupiedBeds}
            pendingBookings={pendingBookings}
            openTickets={openTickets}
          />
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

function OverviewScreen({ totalBeds, occupiedBeds, pendingBookings, openTickets }) {
  return (
    <div className="manager-stack">
      <section className="manager-metrics">
        <MetricCard icon={<FaBed />} label="Giường đã sử dụng" value={`${occupiedBeds}/${totalBeds}`} note="Theo bảng beds và residencies" tone="green" />
        <MetricCard icon={<FaClipboardCheck />} label="Đơn chờ duyệt" value={pendingBookings} note="booking_requests PENDING" tone="amber" />
        <MetricCard icon={<FaTools />} label="Ticket đang xử lý" value={openTickets} note="OPEN và IN_PROGRESS" tone="blue" />
        <MetricCard icon={<FaUserCheck />} label="CFD trung bình" value="91" note="Theo students.cfd_score" tone="red" />
      </section>

      <section className="manager-grid manager-grid--wide">
        <Panel title="Tình trạng tòa nhà" subtitle="Nên có trong main screen tổng quan để manager nhìn occupancy ngay.">
          <div className="building-list">
            {buildings.map((building) => (
              <div className="building-row" key={building.name}>
                <div>
                  <strong>{building.name}</strong>
                  <span>{building.rooms} phòng, {building.beds} giường, khu {building.gender}</span>
                </div>
                <div className="building-row__meter" aria-label={`${building.occupancy}%`}>
                  <span style={{ width: `${building.occupancy}%` }} />
                </div>
                <b>{building.occupancy}%</b>
              </div>
            ))}
          </div>
        </Panel>

        <Panel title="Việc cần xử lý hôm nay" subtitle="Tập trung vào duyệt đơn, phân công ticket và nhắc thanh toán.">
          <div className="task-list">
            <TaskItem label="Duyệt 2 đơn đặt phòng Summer 2026" status="Ưu tiên" />
            <TaskItem label="Phân công vệ sinh phòng A-203" status="Mở" />
            <TaskItem label="Kiểm tra chỉ số điện nước Dorm B" status="Hôm nay" />
            <TaskItem label="Gửi thông báo bảo trì nước Dorm C" status="Nháp" />
          </div>
        </Panel>
      </section>
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
        {buildings.map((building) => (
          <article className="building-card" key={building.name}>
            <div className="building-card__top">
              <span><FaBuilding /></span>
              <b>{building.name}</b>
            </div>
            <dl>
              <div><dt>Tầng</dt><dd>{building.floors}</dd></div>
              <div><dt>Phòng</dt><dd>{building.rooms}</dd></div>
              <div><dt>Giường</dt><dd>{building.beds}</dd></div>
            </dl>
            <div className="building-card__foot">
              <span>Quản lý: {building.manager}</span>
              <strong>{building.occupancy}% đầy</strong>
            </div>
          </article>
        ))}
      </section>

      <DataPanel
        title="Danh sách phòng và giường"
        subtitle="Main screen nên có bộ lọc tòa, tầng, giới tính, loại phòng và status bed."
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
      subtitle="Màn này nên có thao tác approve, reject, xem điểm CFD và kiểm tra bed còn trống."
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
      subtitle="Main screen nên hỗ trợ check-in, check-out và lọc theo semester/status."
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
          subtitle="Theo invoices và vnpay_transactions."
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
          subtitle="Theo utility_readings, dùng để sinh hóa đơn tiện ích."
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
      subtitle="Màn này nên có kanban OPEN, IN_PROGRESS, RESOLVED và form ghi ticket_notes."
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
      subtitle="Manager cần nhìn điểm CFD bị trừ, fine_amount và người báo cáo."
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
      subtitle="Nên có phân ca, khu phụ trách, task đang mở và loại staff."
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
  return (
    <div className="manager-stack">
      <section className="manager-grid manager-grid--wide">
        <DataPanel
          title="Thông báo"
          subtitle="Gửi theo user role: STUDENT, PARENT, STAFF."
          columns={["Tiêu đề", "Đối tượng", "Ngày", "Trạng thái"]}
          rows={notifications.map((item) => [item.title, item.target, item.date, item.status])}
        />
        <DataPanel
          title="Cài đặt hệ thống"
          subtitle="Các setting nên nằm trong system_settings và semesters."
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

function TaskItem({ label, status }) {
  return (
    <div className="task-item">
      <span>{label}</span>
      <b>{status}</b>
    </div>
  );
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

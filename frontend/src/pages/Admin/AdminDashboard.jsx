/* eslint-disable react/prop-types */

import {
  FaArrowDown,
  FaArrowUp,
  FaBed,
  FaBell,
  FaChartLine,
  FaClipboardList,
  FaExclamationTriangle,
  FaMapMarkerAlt,
  FaMoneyBillWave,
  FaUserCheck,
  FaUsers,
} from "react-icons/fa";
import Header from "../../components/Headers";
import Sidebar from "../../components/Sidebar";
import "./AdminDashboard.css";

const overviewCards = [
  {
    title: "Tổng sinh viên",
    value: "1,248",
    change: "+8.2%",
    direction: "up",
    tone: "blue",
    icon: FaUsers,
  },
  {
    title: "Tỷ lệ lấp đầy",
    value: "92%",
    change: "+4.1%",
    direction: "up",
    tone: "green",
    icon: FaBed,
  },
  {
    title: "Yêu cầu chờ xử lý",
    value: "18",
    change: "-6.5%",
    direction: "down",
    tone: "amber",
    icon: FaClipboardList,
  },
  {
    title: "Doanh thu tháng",
    value: "248.6M",
    change: "+11.3%",
    direction: "up",
    tone: "teal",
    icon: FaMoneyBillWave,
  },
];

const occupancySeries = [
  { label: "T1", value: 72 },
  { label: "T2", value: 78 },
  { label: "T3", value: 83 },
  { label: "T4", value: 81 },
  { label: "T5", value: 88 },
  { label: "T6", value: 90 },
  { label: "T7", value: 92 },
  { label: "T8", value: 95 },
  { label: "T9", value: 94 },
  { label: "T10", value: 96 },
  { label: "T11", value: 97 },
  { label: "T12", value: 92 },
];

const blocks = [
  { name: "Khu A", occupied: 96, total: 120, tone: "green" },
  { name: "Khu B", occupied: 88, total: 100, tone: "blue" },
  { name: "Khu C", occupied: 74, total: 90, tone: "amber" },
  { name: "Khu D", occupied: 65, total: 80, tone: "teal" },
];

const alerts = [
  {
    title: "Phòng chờ xác nhận",
    detail: "12 đơn đăng ký mới đang chờ phân phòng.",
    icon: FaBell,
    tone: "blue",
  },
  {
    title: "Phòng bảo trì",
    detail: "7 phòng cần xử lý trong 24 giờ tới.",
    icon: FaExclamationTriangle,
    tone: "amber",
  },
  {
    title: "Nhân sự trực ca",
    detail: "Đủ 18/18 người đang làm việc theo lịch hôm nay.",
    icon: FaUserCheck,
    tone: "green",
  },
];

const recentActivities = [
  {
    title: "Sinh viên vào ký túc xá",
    time: "08:45",
    note: "23 sinh viên làm thủ tục nhận phòng sáng nay.",
  },
  {
    title: "Cập nhật bảo trì phòng",
    time: "10:10",
    note: "Bộ phận kỹ thuật hoàn tất sửa chữa dãy B2.",
  },
  {
    title: "Thông báo quy định mới",
    time: "13:20",
    note: "Đã gửi thông báo lịch sinh hoạt tuần tới đến toàn bộ sinh viên.",
  },
  {
    title: "Đối soát thanh toán",
    time: "15:05",
    note: "Còn 14 hóa đơn cần xác nhận trước cuối ngày.",
  },
];

const maintenanceQueue = [
  { room: "A-302", issue: "Điều hòa yếu", status: "Đang xử lý" },
  { room: "B-114", issue: "Đèn hành lang", status: "Chờ kiểm tra" },
  { room: "C-208", issue: "Khóa cửa", status: "Ưu tiên cao" },
  { room: "D-506", issue: "Nước nóng", status: "Đã lên lịch" },
];

const recentBookings = [
  {
    room: "A-101",
    student: "Nguyễn Văn An",
    date: "24/05/2024",
    type: "Phòng đơn",
    status: "Đã duyệt",
    statusTone: "approved",
  },
  {
    room: "C-405",
    student: "Trần Thị Bình",
    date: "26/05/2024",
    type: "Phòng đôi",
    status: "Chờ xử lý",
    statusTone: "pending",
  },
  {
    room: "B-202",
    student: "Lê Hoàng Nam",
    date: "25/05/2024",
    type: "Phòng 4 người",
    status: "Đã duyệt",
    statusTone: "approved",
  },
];

function AdminDashboard() {
  return (
    <div className="admin-dashboard">
      <Sidebar />

      <main className="admin-main">
        <Header
          avatarText="A"
          bgGradient="#ffffff"
          borderColor="#bccac0"
          shadowColor="rgba(0, 105, 72, 0.06)"
        />

        <section className="admin-hero">
          <div className="admin-hero-copy">
            <p className="admin-eyebrow">Admin dashboard</p>
            <h1>Bảng điều khiển quản trị</h1>
            <p>
              Hệ thống quản lý ký túc xá tập trung. Theo dõi tỷ lệ lấp đầy,
              quản lý yêu cầu của sinh viên và phân tích dữ liệu vận hành theo
              thời gian thực.
            </p>

            <div className="admin-meta-row">
              <MetaPill icon={FaChartLine} label="Tổng quan realtime" />
              <MetaPill icon={FaMapMarkerAlt} label="FPT Dormitory" />
            </div>
          </div>

          <div className="admin-occupancy-panel">
            <div className="admin-panel-header">
              <span>Tỷ lệ lấp đầy</span>
              <strong>92%</strong>
            </div>
            <div className="admin-progress-track">
              <span className="admin-progress-fill tone-green w-92" />
            </div>
            <div className="admin-mini-stats">
              <div>
                <span>Phòng trống</span>
                <strong>114</strong>
              </div>
              <div>
                <span>Đang sửa chữa</span>
                <strong>12</strong>
              </div>
            </div>
          </div>
        </section>

        <section className="admin-card-grid">
          {overviewCards.map((card) => (
            <OverviewCard key={card.title} card={card} />
          ))}
        </section>

        <section className="admin-content-grid">
          <div className="admin-main-column">
            <div className="admin-surface admin-chart-card">
              <div className="admin-section-header">
                <div>
                  <p className="admin-eyebrow">Xu hướng vận hành</p>
                  <h2>Xu hướng lấp đầy phòng</h2>
                </div>
                <div className="admin-legend">
                  <span className="admin-legend-item">
                    <i className="tone-green" /> Thực tế
                  </span>
                  <span className="admin-legend-item">
                    <i className="tone-muted" /> Mục tiêu
                  </span>
                </div>
              </div>

              <div className="admin-chart">
                {occupancySeries.map((item) => (
                  <div className="admin-bar-group" key={item.label}>
                    <div className="admin-bar-track">
                      <span
                        className="admin-bar-fill"
                        style={{ height: `${item.value}%` }}
                      />
                    </div>
                    <span>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <section className="admin-surface admin-table-card admin-booking-card">
              <div className="admin-table-heading">
                <h2>Danh sách phòng mới đặt</h2>
                <button type="button">Xem tất cả</button>
              </div>

              <div className="admin-table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Mã phòng</th>
                      <th>Sinh viên</th>
                      <th>Ngày nhận</th>
                      <th>Loại phòng</th>
                      <th>Trạng thái</th>
                      <th className="align-right">Thao tác</th>
                    </tr>
                  </thead>

                  <tbody>
                    {recentBookings.map((booking) => (
                      <tr key={`${booking.room}-${booking.student}`}>
                        <td className="strong-cell">{booking.room}</td>
                        <td>{booking.student}</td>
                        <td>{booking.date}</td>
                        <td>{booking.type}</td>
                        <td>
                          <span className={`admin-status ${booking.statusTone}`}>
                            {booking.status}
                          </span>
                        </td>
                        <td className="align-right">
                          <button className="admin-more-button" type="button">
                            ...
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="admin-side-column">
            <div className="admin-surface">
              <div className="admin-section-header compact">
                <div>
                  <p className="admin-eyebrow">Cảnh báo nhanh</p>
                  <h2>Việc cần chú ý</h2>
                </div>
              </div>

              <div className="admin-list">
                {alerts.map((alert) => (
                  <AlertRow alert={alert} key={alert.title} />
                ))}
              </div>
            </div>

            <div className="admin-surface">
              <div className="admin-section-header compact">
                <div>
                  <p className="admin-eyebrow">Nhân sự vận hành</p>
                  <h2>Trạng thái khu vực</h2>
                </div>
              </div>

              <div className="admin-list">
                {blocks.map((block) => (
                  <BlockRow block={block} key={block.name} />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* <section className="admin-surface admin-table-card">
          <div className="admin-table-heading">
            <h2>Danh sách phòng mới đặt</h2>
            <button type="button">Xem tất cả</button>
          </div>
          <div className="admin-table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Mã phòng</th>
                  <th>Sinh vien</th>
                  <th>Ngày nhận</th>
                  <th>Loại phòng</th>
                  <th>Trạng thái</th>
                  <th className="align-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {recentBookings.map((booking) => (
                  <tr key={`${booking.room}-${booking.student}`}>
                    <td className="strong-cell">{booking.room}</td>
                    <td>{booking.student}</td>
                    <td>{booking.date}</td>
                    <td>{booking.type}</td>
                    <td>
                      <span className={`admin-status ${booking.statusTone}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="align-right">
                      <button className="admin-more-button" type="button">
                        ...
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section> */}

        <section className="admin-bottom-grid">
          <div className="admin-surface">
            <div className="admin-section-header compact">
              <div>
                <p className="admin-eyebrow">Nhật ký trong ngày</p>
                <h2>Hoạt động gần đây</h2>
              </div>
            </div>
            <div className="admin-list">
              {recentActivities.map((activity) => (
                <ActivityItem activity={activity} key={activity.time} />
              ))}
            </div>
          </div>

          <div className="admin-surface">
            <div className="admin-section-header compact">
              <div>
                <p className="admin-eyebrow">Hàng đợi kỹ thuật</p>
                <h2>Bảo trì đang xử lý</h2>
              </div>
            </div>
            <div className="admin-list">
              {maintenanceQueue.map((item) => (
                <QueueItem item={item} key={item.room} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function OverviewCard({ card }) {
  const Icon = card.icon;
  const TrendIcon = card.direction === "up" ? FaArrowUp : FaArrowDown;

  return (
    <article className="admin-overview-card">
      <div className={`admin-icon-box tone-${card.tone}`}>
        <Icon />
      </div>
      <div>
        <p>{card.title}</p>
        <div className="admin-value-row">
          <strong>{card.value}</strong>
          <span className={`admin-trend ${card.direction}`}>
            <TrendIcon />
            {card.change}
          </span>
        </div>
      </div>
    </article>
  );
}

function MetaPill({ icon: Icon, label }) {
  return (
    <span className="admin-meta-pill">
      <Icon />
      {label}
    </span>
  );
}

function AlertRow({ alert }) {
  const Icon = alert.icon;

  return (
    <div className="admin-alert-row">
      <span className={`admin-icon-box small tone-${alert.tone}`}>
        <Icon />
      </span>
      <div>
        <strong>{alert.title}</strong>
        <p>{alert.detail}</p>
      </div>
    </div>
  );
}

function BlockRow({ block }) {
  const occupancy = Math.round((block.occupied / block.total) * 100);

  return (
    <div className="admin-block-row">
      <div className="admin-block-top">
        <div>
          <strong>{block.name}</strong>
          <p>
            {block.occupied}/{block.total} phòng đang sử dụng
          </p>
        </div>
        <span className={`admin-block-badge tone-${block.tone}`}>
          {occupancy}%
        </span>
      </div>
      <div className="admin-progress-track slim">
        <span
          className={`admin-progress-fill tone-${block.tone}`}
          style={{ width: `${occupancy}%` }}
        />
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  return (
    <div className="admin-activity-row">
      <time>{activity.time}</time>
      <div>
        <strong>{activity.title}</strong>
        <p>{activity.note}</p>
      </div>
    </div>
  );
}

function QueueItem({ item }) {
  return (
    <div className="admin-queue-row">
      <div>
        <strong>{item.room}</strong>
        <p>{item.issue}</p>
      </div>
      <span>{item.status}</span>
    </div>
  );
}

export default AdminDashboard;

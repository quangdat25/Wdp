/* eslint-disable react/prop-types */

import {
  FaBed,
  FaClipboardList,
  FaChartLine,
  FaExclamationTriangle,
  FaMoneyBillWave,
  FaUsers,
  FaUserCheck,
  FaBell,
  FaArrowUp,
  FaArrowDown,
  FaClock,
  FaMapMarkerAlt,
} from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import { useEffect } from "react";
import { showSuccess } from "../../components/Alert";
const overviewCards = [
  {
    title: "Tổng sinh viên",
    value: "1,248",
    change: "+8.2%",
    direction: "up",
    accent: "#2563eb",
    icon: FaUsers,
  },
  {
    title: "Tỷ lệ lấp đầy",
    value: "92%",
    change: "+4.1%",
    direction: "up",
    accent: "#16a34a",
    icon: FaBed,
  },
  {
    title: "Yêu cầu chờ xử lý",
    value: "18",
    change: "-6.5%",
    direction: "down",
    accent: "#f59e0b",
    icon: FaClipboardList,
  },
  {
    title: "Doanh thu tháng",
    value: "248.6M",
    change: "+11.3%",
    direction: "up",
    accent: "#0f766e",
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
  { name: "Khu A", occupied: 96, total: 120, tone: "#2563eb" },
  { name: "Khu B", occupied: 88, total: 100, tone: "#16a34a" },
  { name: "Khu C", occupied: 74, total: 90, tone: "#f59e0b" },
  { name: "Khu D", occupied: 65, total: 80, tone: "#0f766e" },
];

const alerts = [
  {
    title: "Phòng chờ xác nhận",
    detail: "12 đơn đăng ký mới đang chờ phân phòng.",
    icon: FaBell,
    tone: "#2563eb",
  },
  {
    title: "Phòng bảo trì",
    detail: "7 phòng cần xử lý trong 24 giờ tới.",
    icon: FaExclamationTriangle,
    tone: "#f59e0b",
  },
  {
    title: "Nhân sự trực ca",
    detail: "Đủ 18/18 người đang làm việc theo lịch hôm nay.",
    icon: FaUserCheck,
    tone: "#16a34a",
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

function AdminDashboard() { 
  return (
    <div style={styles.pageShell}>
      <AdminSidebar />

      <main style={styles.main}>
        <section style={styles.heroCard}>
          <div style={styles.heroCopy}>
            <p style={styles.eyebrow}>Admin dashboard</p>
            <h1 style={styles.heroTitle}>Bảng điều khiển quản trị</h1>
            <p style={styles.heroText}>
              Tổng quan tức thì về sinh viên, phòng ở, doanh thu và các công
              việc đang chờ xử lý trong hệ thống ký túc xá.
            </p>

            <div style={styles.heroMetaRow}>
              <MetaPill icon={FaChartLine} label="Tổng quan realtime" />
              <MetaPill icon={FaClock} label="Cập nhật theo dữ liệu mẫu" />
              <MetaPill icon={FaMapMarkerAlt} label="FPT Dormitory" />
            </div>
          </div>

          <div style={styles.heroStatsPanel}>
            <div style={styles.heroStatsHeader}>
              <span style={styles.heroStatsLabel}>Tình trạng hôm nay</span>
              <span style={styles.heroStatsDate}>09/06/2026</span>
            </div>

            <div style={styles.heroStatsValue}>92%</div>
            <div style={styles.heroStatsNote}>
              Tỷ lệ lấp đầy ổn định, còn 102 phòng trống trên toàn hệ thống.
            </div>

            <div style={styles.heroStatsBars}>
              <div
                style={{
                  ...styles.heroStatsBar,
                  width: "92%",
                  background: "linear-gradient(90deg, #16a34a, #22c55e)",
                }}
              />
              <div
                style={{
                  ...styles.heroStatsBar,
                  width: "78%",
                  background: "linear-gradient(90deg, #2563eb, #60a5fa)",
                }}
              />
              <div
                style={{
                  ...styles.heroStatsBar,
                  width: "64%",
                  background: "linear-gradient(90deg, #f59e0b, #fb923c)",
                }}
              />
            </div>
          </div>
        </section>

        <section style={styles.cardGrid}>
          {overviewCards.map((card) => (
            <OverviewCard key={card.title} card={card} />
          ))}
        </section>

        <section style={styles.contentGrid}>
          <div style={styles.chartCard}>
            <div style={styles.sectionHeader}>
              <div>
                <p style={styles.sectionEyebrow}>Xu hướng vận hành</p>
                <h2 style={styles.sectionTitle}>Tỷ lệ lấp đầy 12 tháng</h2>
              </div>

              <div style={styles.legendPill}>
                <span aria-hidden="true" style={styles.legendDot} /> Dữ liệu mô
                phỏng
              </div>
            </div>

            <div style={styles.chartWrap}>
              <div style={styles.chartAxis}>
                <span>100%</span>
                <span>75%</span>
                <span>50%</span>
                <span>25%</span>
                <span>0%</span>
              </div>

              <div style={styles.barArea}>
                {occupancySeries.map((item) => (
                  <div key={item.label} style={styles.barGroup}>
                    <div style={styles.barTrack}>
                      <div
                        style={{
                          ...styles.barFill,
                          height: `${item.value}%`,
                        }}
                      />
                    </div>
                    <span style={styles.barLabel}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div style={styles.sidebarColumn}>
            <div style={styles.panelCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <p style={styles.sectionEyebrow}>Cảnh báo nhanh</p>
                  <h2 style={styles.sectionTitle}>Việc cần chú ý</h2>
                </div>
              </div>

              <div style={styles.alertList}>
                {alerts.map((alert) => (
                  <AlertRow key={alert.title} alert={alert} />
                ))}
              </div>
            </div>

            <div style={styles.panelCard}>
              <div style={styles.sectionHeader}>
                <div>
                  <p style={styles.sectionEyebrow}>Nhân sự vận hành</p>
                  <h2 style={styles.sectionTitle}>Trạng thái khu vực</h2>
                </div>
              </div>

              <div style={styles.blockList}>
                {blocks.map((block) => (
                  <BlockRow key={block.name} block={block} />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function OverviewCard({ card }) {
  const Icon = card.icon;
  const trendColor = card.direction === "up" ? "#16a34a" : "#dc2626";
  const TrendIcon = card.direction === "up" ? FaArrowUp : FaArrowDown;

  return (
    <article style={styles.overviewCard}>
      <div
        style={{
          ...styles.overviewIcon,
          background: `${card.accent}16`,
          color: card.accent,
        }}
      >
        <Icon />
      </div>

      <div style={styles.overviewBody}>
        <p style={styles.overviewTitle}>{card.title}</p>
        <div style={styles.overviewValueRow}>
          <strong style={styles.overviewValue}>{card.value}</strong>
          <span
            style={{
              ...styles.trendPill,
              color: trendColor,
              background: `${trendColor}14`,
            }}
          >
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
    <span style={styles.metaPill}>
      <Icon />
      {label}
    </span>
  );
}

function AlertRow({ alert }) {
  const Icon = alert.icon;

  return (
    <div style={styles.alertRow}>
      <div
        style={{
          ...styles.alertIcon,
          color: alert.tone,
          background: `${alert.tone}14`,
        }}
      >
        <Icon />
      </div>

      <div style={{ flex: 1 }}>
        <div style={styles.alertTitle}>{alert.title}</div>
        <div style={styles.alertDetail}>{alert.detail}</div>
      </div>
    </div>
  );
}

function BlockRow({ block }) {
  const occupancy = Math.round((block.occupied / block.total) * 100);

  return (
    <div style={styles.blockRow}>
      <div style={styles.blockTopRow}>
        <div>
          <div style={styles.blockName}>{block.name}</div>
          <div style={styles.blockSubText}>
            {block.occupied}/{block.total} phòng đang sử dụng
          </div>
        </div>
        <div
          style={{
            ...styles.blockBadge,
            color: block.tone,
            background: `${block.tone}14`,
          }}
        >
          {occupancy}%
        </div>
      </div>

      <div style={styles.progressTrack}>
        <div
          style={{
            ...styles.progressFill,
            width: `${occupancy}%`,
            background: block.tone,
          }}
        />
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  return (
    <div style={styles.activityRow}>
      <div style={styles.activityTime}>{activity.time}</div>
      <div>
        <div style={styles.activityTitle}>{activity.title}</div>
        <div style={styles.activityNote}>{activity.note}</div>
      </div>
    </div>
  );
}

function QueueItem({ item }) {
  return (
    <div style={styles.queueRow}>
      <div>
        <div style={styles.queueRoom}>{item.room}</div>
        <div style={styles.queueIssue}>{item.issue}</div>
      </div>
      <span style={styles.queueStatus}>{item.status}</span>
    </div>
  );
}

const styles = {
  pageShell: {
    minHeight: "100vh",
    background:
      "radial-gradient(circle at top left, rgba(37, 99, 235, 0.14), transparent 36%), radial-gradient(circle at top right, rgba(22, 163, 74, 0.16), transparent 32%), linear-gradient(180deg, #f6fbff 0%, #f4faf6 100%)",
  },
  main: {
    marginLeft: 270,
    width: "calc(100% - 270px)",
    padding: "24px 28px 32px",
    minHeight: "100vh",
  },
  heroCard: {
    display: "grid",
    gridTemplateColumns: "1.45fr 0.9fr",
    gap: 20,
    alignItems: "stretch",
    marginBottom: 22,
  },
  heroCopy: {
    background:
      "linear-gradient(135deg, rgba(255,255,255,0.94) 0%, rgba(243, 250, 244, 0.92) 100%)",
    border: "1px solid rgba(148, 163, 184, 0.16)",
    borderRadius: 28,
    padding: 28,
    boxShadow: "0 18px 52px rgba(15, 23, 42, 0.08)",
  },
  eyebrow: {
    margin: 0,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    fontWeight: 800,
    fontSize: 12,
    color: "#16a34a",
  },
  heroTitle: {
    margin: "10px 0 0",
    fontSize: 40,
    lineHeight: 1.05,
    color: "#0f172a",
  },
  heroText: {
    margin: "14px 0 0",
    maxWidth: 760,
    color: "#475569",
    fontSize: 15,
  },
  heroMetaRow: {
    marginTop: 22,
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
  },
  metaPill: {
    minHeight: 40,
    padding: "0 14px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    background: "#fff",
    border: "1px solid rgba(148, 163, 184, 0.18)",
    color: "#334155",
    fontSize: 13,
    fontWeight: 700,
  },
  heroStatsPanel: {
    background:
      "linear-gradient(160deg, rgba(15, 118, 110, 0.96) 0%, rgba(37, 99, 235, 0.96) 100%)",
    borderRadius: 28,
    padding: 24,
    color: "#fff",
    boxShadow: "0 18px 52px rgba(15, 23, 42, 0.16)",
    position: "relative",
    overflow: "hidden",
  },
  heroStatsHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
  },
  heroStatsLabel: {
    fontSize: 13,
    fontWeight: 700,
    opacity: 0.9,
  },
  heroStatsDate: {
    fontSize: 13,
    fontWeight: 700,
    opacity: 0.8,
  },
  heroStatsValue: {
    marginTop: 18,
    fontSize: 64,
    lineHeight: 1,
    fontWeight: 900,
    letterSpacing: -2,
  },
  heroStatsNote: {
    marginTop: 12,
    fontSize: 14,
    lineHeight: 1.6,
    maxWidth: 360,
    opacity: 0.92,
  },
  heroStatsBars: {
    marginTop: 20,
    display: "grid",
    gap: 10,
  },
  heroStatsBar: {
    height: 10,
    borderRadius: 999,
  },
  cardGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 22,
  },
  overviewCard: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    borderRadius: 24,
    padding: 20,
    boxShadow: "0 14px 40px rgba(15, 23, 42, 0.06)",
    display: "flex",
    gap: 14,
    alignItems: "center",
  },
  overviewIcon: {
    width: 52,
    height: 52,
    borderRadius: 18,
    display: "grid",
    placeItems: "center",
    fontSize: 20,
    flexShrink: 0,
  },
  overviewBody: {
    minWidth: 0,
    flex: 1,
  },
  overviewTitle: {
    margin: 0,
    color: "#64748b",
    fontSize: 13,
    fontWeight: 700,
  },
  overviewValueRow: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  overviewValue: {
    color: "#0f172a",
    fontSize: 28,
    lineHeight: 1,
  },
  trendPill: {
    minHeight: 30,
    padding: "0 10px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    fontWeight: 800,
    whiteSpace: "nowrap",
  },
  contentGrid: {
    display: "grid",
    gridTemplateColumns: "1.35fr 0.85fr",
    gap: 16,
    marginBottom: 16,
  },
  chartCard: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    borderRadius: 26,
    padding: 22,
    boxShadow: "0 14px 40px rgba(15, 23, 42, 0.06)",
  },
  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    marginBottom: 18,
  },
  sectionEyebrow: {
    margin: 0,
    color: "#16a34a",
    fontSize: 12,
    fontWeight: 800,
    textTransform: "uppercase",
    letterSpacing: 1.1,
  },
  sectionTitle: {
    margin: "6px 0 0",
    color: "#0f172a",
    fontSize: 22,
  },
  legendPill: {
    minHeight: 36,
    padding: "0 12px",
    borderRadius: 999,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    color: "#334155",
    display: "inline-flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    fontWeight: 700,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    background: "linear-gradient(135deg, #2563eb, #16a34a)",
  },
  chartWrap: {
    display: "grid",
    gridTemplateColumns: "48px 1fr",
    gap: 12,
    alignItems: "stretch",
    minHeight: 340,
  },
  chartAxis: {
    display: "flex",
    flexDirection: "column",
    justifyContent: "space-between",
    color: "#94a3b8",
    fontSize: 12,
    fontWeight: 700,
    paddingBottom: 28,
  },
  barArea: {
    display: "grid",
    gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
    gap: 10,
    alignItems: "end",
    padding: "10px 2px 0",
    borderLeft: "1px solid #e2e8f0",
    borderBottom: "1px solid #e2e8f0",
    position: "relative",
  },
  barGroup: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "flex-end",
    minHeight: 300,
    gap: 10,
  },
  barTrack: {
    width: "100%",
    maxWidth: 42,
    height: 260,
    borderRadius: 16,
    background: "linear-gradient(180deg, #eff6ff 0%, #f8fafc 100%)",
    display: "flex",
    alignItems: "flex-end",
    overflow: "hidden",
    boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
  },
  barFill: {
    width: "100%",
    borderRadius: 16,
    background: "linear-gradient(180deg, #2563eb 0%, #22c55e 100%)",
    minHeight: 22,
  },
  barLabel: {
    color: "#64748b",
    fontSize: 12,
    fontWeight: 700,
  },
  sidebarColumn: {
    display: "grid",
    gap: 16,
  },
  panelCard: {
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(148, 163, 184, 0.14)",
    borderRadius: 26,
    padding: 22,
    boxShadow: "0 14px 40px rgba(15, 23, 42, 0.06)",
  },
  alertList: {
    display: "grid",
    gap: 14,
  },
  alertRow: {
    display: "flex",
    gap: 12,
    alignItems: "flex-start",
    padding: 14,
    borderRadius: 18,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  alertIcon: {
    width: 40,
    height: 40,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    fontSize: 16,
    flexShrink: 0,
  },
  alertTitle: {
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 14,
  },
  alertDetail: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.6,
  },
  blockList: {
    display: "grid",
    gap: 14,
  },
  blockRow: {
    padding: 14,
    borderRadius: 18,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  blockTopRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
    alignItems: "center",
    marginBottom: 12,
  },
  blockName: {
    color: "#0f172a",
    fontWeight: 800,
  },
  blockSubText: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
  },
  blockBadge: {
    minHeight: 30,
    padding: "0 10px",
    borderRadius: 999,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 12,
    fontWeight: 800,
  },
  progressTrack: {
    width: "100%",
    height: 10,
    borderRadius: 999,
    background: "#e2e8f0",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
  },
  bottomGrid: {
    display: "grid",
    gridTemplateColumns: "1.15fr 0.85fr",
    gap: 16,
  },
  activityList: {
    display: "grid",
    gap: 12,
  },
  activityRow: {
    display: "grid",
    gridTemplateColumns: "64px 1fr",
    gap: 12,
    alignItems: "start",
    padding: 14,
    borderRadius: 18,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  activityTime: {
    minHeight: 34,
    borderRadius: 999,
    background: "#fff",
    border: "1px solid #dbe4ee",
    display: "grid",
    placeItems: "center",
    color: "#2563eb",
    fontWeight: 800,
    fontSize: 13,
  },
  activityTitle: {
    color: "#0f172a",
    fontWeight: 800,
    fontSize: 14,
  },
  activityNote: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
    lineHeight: 1.6,
  },
  queueList: {
    display: "grid",
    gap: 12,
  },
  queueRow: {
    display: "flex",
    justifyContent: "space-between",
    gap: 12,
    alignItems: "center",
    padding: 14,
    borderRadius: 18,
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
  },
  queueRoom: {
    color: "#0f172a",
    fontWeight: 900,
    fontSize: 14,
  },
  queueIssue: {
    marginTop: 4,
    color: "#64748b",
    fontSize: 13,
  },
  queueStatus: {
    minHeight: 32,
    padding: "0 10px",
    borderRadius: 999,
    background: "#fff",
    border: "1px solid #dbe4ee",
    color: "#334155",
    display: "inline-flex",
    alignItems: "center",
    fontWeight: 700,
    fontSize: 12,
    whiteSpace: "nowrap",
  },
  "@media (max-width: 1280px)": {
    heroCard: {
      gridTemplateColumns: "1fr",
    },
    cardGrid: {
      gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
    },
    contentGrid: {
      gridTemplateColumns: "1fr",
    },
    bottomGrid: {
      gridTemplateColumns: "1fr",
    },
  },
  "@media (max-width: 900px)": {
    main: {
      marginLeft: 0,
      width: "100%",
      padding: "16px",
    },
    cardGrid: {
      gridTemplateColumns: "1fr",
    },
    heroTitle: {
      fontSize: 32,
    },
    chartWrap: {
      gridTemplateColumns: "1fr",
    },
    chartAxis: {
      display: "none",
    },
    barArea: {
      gridTemplateColumns: "repeat(6, minmax(0, 1fr))",
    },
  },
};

export default AdminDashboard;

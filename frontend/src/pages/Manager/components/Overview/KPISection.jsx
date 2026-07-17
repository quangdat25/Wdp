import React from 'react';
import { KpiCard } from '../../../../components/DashboardWidgets';
import { FaUser, FaBed, FaExclamationCircle, FaTools } from 'react-icons/fa';

export default function KPISection({ data }) {
  const { totalStudents, occupiedBeds, pendingRequests, maintenanceRooms } = data;

  const SPARK_UP = "M0,20 Q5,15 10,18 T20,10 T30,5 T40,2";
  const SPARK_DOWN = "M0,2 Q5,8 10,6 T20,12 T30,15 T40,18";
  const SPARK_FLAT = "M0,10 Q10,12 20,10 T40,10";

  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
      <KpiCard
        title="Sinh viên đang ở"
        value={totalStudents}
        icon={<FaUser />}
        color="#22C55E"
        trend="+2%"
        sparkline={SPARK_UP}
      />
      <KpiCard
        title="Giường có người"
        value={occupiedBeds}
        icon={<FaBed />}
        color="#16A34A"
        trend="Ổn định"
        sparkline={SPARK_FLAT}
      />
      <KpiCard
        title="Đơn chờ duyệt"
        value={pendingRequests}
        icon={<FaExclamationCircle />}
        color="#F59E0B"
        trend="+8%"
        sparkline={SPARK_UP}
        isNegative={true}
      />
      <KpiCard
        title="Phòng đang bảo trì"
        value={maintenanceRooms}
        icon={<FaTools />}
        color="#EF4444"
        trend="-5%"
        sparkline={SPARK_DOWN}
      />
    </section>
  );
}

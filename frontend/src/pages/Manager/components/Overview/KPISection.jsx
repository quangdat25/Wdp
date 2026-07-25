import React from 'react';
import { KpiCard } from '../../../../components/DashboardWidgets';
import { FaUser, FaBed, FaTools } from 'react-icons/fa';

export default function KPISection({ data }) {
  const { totalStudents, occupiedBeds, maintenanceRooms } = data;

  return (
    <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
      <KpiCard
        title="Tổng sinh viên"
        value={totalStudents}
        icon={<FaUser />}
        color="#22C55E"
      />
      <KpiCard
        title="Giường có người"
        value={occupiedBeds}
        icon={<FaBed />}
        color="#16A34A"
      />
      <KpiCard
        title="Phòng đang bảo trì"
        value={maintenanceRooms}
        icon={<FaTools />}
        color="#EF4444"
      />
    </section>
  );
}
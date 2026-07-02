import { useState, useEffect } from "react";
import { getMyChildRoom } from "../../api/parentService";
import { FaBed } from "react-icons/fa";

import "./ParentDashboard.css";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Headers";

const newsItems = [
  {
    title: "Thông báo về việc đóng tiền nước sinh hoạt tháng 06/2026",
    date: "08/06/2026",
  },
  {
    title: "Lịch bảo trì điều hòa toàn bộ tòa nhà KTX từ 10/06 đến 15/06",
    date: "07/06/2026",
  },
  {
    title: "Giải bóng đá thường niên Dormitory Cup 2026 chính thức khởi tranh",
    date: "05/06/2026",
  },
  {
    title: "Quy định mới về giờ giấc ra vào cổng KTX áp dụng từ tuần sau",
    date: "03/06/2026",
  },
];

function ParentDashboard() {
  const [activeModule, setActiveModule] = useState("home");
  const [childData, setChildData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChildData = async () => {
      try {
        const data = await getMyChildRoom();
        if (data && data.success) {
          setChildData(data.data);
        }
      } catch (error) {
        console.error("Lỗi khi tải thông tin:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchChildData();
  }, []);

  return (
    <div className="flex bg-white min-h-screen font-sans text-[#0b1c30]">
      <Sidebar />
      <main className="ml-[270px] flex-1">
        <Header avatarText="P" />

        {activeModule === "home" ? (
          <HomeScreen setActiveModule={setActiveModule} childData={childData} loading={loading} />
        ) : (
          <div className="flex flex-col items-center justify-center p-12 text-gray-500 h-[60vh]">
            <FaBed className="text-4xl mb-4 opacity-30" />
            <h3 className="text-xl text-gray-800 font-bold">Thông tin phòng</h3>
            <p className="mt-2">Chức năng đang được kết nối với dữ liệu học viên...</p>
            <button
              className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
              onClick={() => setActiveModule("home")}
            >
              Quay lại Bảng điều khiển
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

function HomeScreen({ setActiveModule, childData, loading }) {
  if (loading) {
    return (
      <div className="p-8">
        <div className="bg-[#F6FAF5] p-8 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-700">Đang tải dữ liệu của con...</h3>
        </div>
      </div>
    );
  }

  const roomText = childData
    ? `Phòng ${childData.room.roomNumber} – Tòa ${childData.building.name}`
    : "Chưa xếp phòng";
  const bedText = childData
    ? `Giường số ${childData.bedNumber}`
    : "Vui lòng liên hệ BQL";

  return (
    <div className="p-6 max-w-[1400px] mx-auto">
      {/* Hero Banner */}
      <section className="relative bg-[#006948] text-white p-10 mb-6 overflow-hidden flex flex-col md:flex-row justify-between items-center rounded-lg shadow-sm">
        <div className="absolute inset-0 pd-hero-pattern opacity-20"></div>
        <div className="relative z-10 space-y-2">
          <h1 className="text-2xl font-bold">Xin chào, Phụ huynh sinh viên</h1>
          <p className="text-lg opacity-90">Phòng của con: <span className="font-bold">{roomText} ({bedText})</span></p>
          <div className="flex gap-4 mt-6">
            <button
              onClick={() => setActiveModule("room")}
              className="bg-white text-[#006948] px-6 py-2.5 rounded font-bold hover:bg-opacity-90 transition-all flex items-center gap-2"
            >
              Xem chi tiết <span className="material-symbols-outlined text-sm">visibility</span>
            </button>
          </div>
        </div>
        <div className="relative z-10 mt-8 md:mt-0 opacity-20 transform translate-x-12 translate-y-8 pointer-events-none">
          <span className="material-symbols-outlined text-[160px]" style={{ fontVariationSettings: "'FILL' 1" }}>apartment</span>
        </div>
      </section>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <MetricCard
          icon="meeting_room"
          badgeText="Đang lưu trú"
          badgeColor="purple"
          label="Phòng của con"
          value={childData ? `${childData.room.roomNumber} - ${childData.building.name}` : "N/A"}
        />
        <MetricCard
          icon="bolt"
          badgeText="Dự kiến"
          badgeColor="amber"
          label="Điện tháng 06"
          value="4.210 kWh"
        />
        <MetricCard
          icon="water_drop"
          badgeText="Thực tế"
          badgeColor="rose"
          label="Nước tháng 06"
          value="782 m³"
        />
        <MetricCard
          icon="verified_user"
          badgeText="Xếp hạng A"
          badgeColor="emerald"
          label="Điểm ý thức"
          value={childData ? childData.student.CFDScore : "N/A"}
          suffix="CFD Score của con"
        />
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Panel: Latest News */}
        <div className="lg:col-span-8 bg-[#F6FAF5] pd-sharp-border transition-transform duration-200 hover:-translate-y-0.5">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Tin tức mới nhất</h3>
            <button className="text-[#006948] font-bold text-sm flex items-center gap-1 hover:underline">
              Xem tất cả <span className="material-symbols-outlined text-sm">open_in_new</span>
            </button>
          </div>
          <div className="divide-y divide-gray-200">
            {newsItems.map((item, idx) => (
              <div key={idx} className="p-6 hover:bg-gray-50 transition-colors cursor-pointer group">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-[11px] font-bold text-[#006948] py-0.5 px-2 bg-[#00855d] bg-opacity-10 rounded">TIN TỨC</span>
                      <span className="font-mono text-xs text-gray-500">{item.date}</span>
                    </div>
                    <h4 className="text-[15px] font-bold group-hover:text-[#006948] transition-colors">{item.title}</h4>
                  </div>
                  <span className="material-symbols-outlined text-gray-400 group-hover:translate-x-1 transition-transform">chevron_right</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Support Contact */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#F6FAF5] pd-sharp-border overflow-hidden transition-transform duration-200 hover:-translate-y-0.5">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-xl font-bold text-gray-900">Liên hệ hỗ trợ</h3>
            </div>
            <div className="p-6 space-y-6">
              <ContactItem icon="call" label="Hotline Phụ Huynh" value="024.7300.5588" />
              <ContactItem icon="mail" label="Email Hỗ Trợ" value="ktx@fpt.edu.vn" />
              <ContactItem icon="location_on" label="Văn phòng quản lý" value="Phòng 102 – Tòa KTX A1" />
            </div>
          </div>

          {/* Extra context card */}
          <div className="bg-[#dce9ff] pd-sharp-border p-6 relative overflow-hidden group transition-transform duration-200 hover:-translate-y-0.5">
            <div className="relative z-10">
              <h4 className="text-[15px] font-bold mb-2 text-gray-900">Thanh toán hóa đơn</h4>
              <p className="text-sm text-gray-700 mb-4">Nhắc nhở sinh viên thanh toán hóa đơn cho tháng 6</p>
            </div>
            <span className="material-symbols-outlined absolute -right-2 -bottom-2 text-[#006948] opacity-5 text-8xl group-hover:rotate-12 transition-transform duration-500">payments</span>
          </div>
        </div>
      </div>

      {/* Fine Print Footer */}
      <footer className="w-full py-6 mt-10 border-t border-gray-200">
        <div className="flex flex-col md:flex-row justify-between items-center opacity-60">
          <p className="text-xs font-mono">© 2026 DormManage University Housing System. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a className="text-xs font-mono hover:text-[#006948] transition-colors" href="#">Chính sách bảo mật</a>
            <a className="text-xs font-mono hover:text-[#006948] transition-colors" href="#">Điều khoản dịch vụ</a>
            <a className="text-xs font-mono hover:text-[#006948] transition-colors" href="#">Hệ thống FPT Edu</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function MetricCard({ icon, badgeText, badgeColor, label, value, suffix }) {
  const badgeClasses = {
    purple: "bg-purple-50 text-purple-700",
    amber: "bg-amber-50 text-amber-700",
    rose: "bg-rose-50 text-rose-700",
    emerald: "bg-emerald-50 text-emerald-700"
  };
  const iconClasses = {
    purple: "bg-purple-50 text-purple-600",
    amber: "bg-amber-50 text-amber-600",
    rose: "bg-rose-50 text-rose-600",
    emerald: "bg-emerald-50 text-emerald-600"
  };

  return (
    <div className="bg-[#F6FAF5] pd-sharp-border p-6 flex flex-col gap-4 transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex justify-between items-start">
        <div className={`w-12 h-12 flex items-center justify-center rounded ${iconClasses[badgeColor]}`}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>
        </div>
        <span className={`font-mono text-[10px] uppercase font-bold px-2 py-1 rounded ${badgeClasses[badgeColor]}`}>{badgeText}</span>
      </div>
      <div>
        <p className="font-mono text-xs text-gray-500 uppercase tracking-wider mb-1">{label}</p>
        <div className="flex items-end gap-2">
          <h3 className="text-2xl font-extrabold text-gray-900">{value}</h3>
          {suffix && <p className="font-mono text-xs text-gray-500 pb-1">{suffix}</p>}
        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, label, value }) {
  return (
    <div className="flex items-start gap-4">
      <div className="w-10 h-10 rounded bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
        <span className="material-symbols-outlined">{icon}</span>
      </div>
      <div>
        <p className="font-mono text-[10px] text-gray-500 uppercase font-bold mb-1">{label}</p>
        <p className="text-[15px] font-bold text-gray-900">{value}</p>
      </div>
    </div>
  );
}

export default ParentDashboard;
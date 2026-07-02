import React from "react";

function OverviewTab({ gateLogs, students, navigate }) {
  return (
    <div className="flex flex-col gap-6">
    {/* Quick alert */}
    <div className="bg-[#FFEEC2] rounded-xl p-6 flex justify-between items-center border border-[#FFD085]">
      <span className="text-base text-[#9E5700] font-bold">
        Cảnh báo an ninh: Phát hiện {gateLogs.filter(l => l.status === 'LATE').length} trường hợp ký túc vào muộn quá 23h hôm nay.
      </span>
      <button
        onClick={() => navigate("/staff/dashboard/security/history")}
        className="bg-[#D84315] hover:bg-[#b53710] text-white border-none rounded-lg px-5 py-2.5 text-sm font-bold cursor-pointer transition-colors"
      >
        Xem ngay
      </button>
    </div>

    {/* Quick Stats Grid */}
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-[#F6FAF5] p-6 rounded-xl border border-gray-200 shadow-sm transition-transform hover:-translate-y-1">
        <span className="text-xs font-bold text-gray-500 tracking-wider">TỔNG SỐ XE RA VÀO / NGÀY</span>
        <h3 className="text-3xl font-extrabold m-0 mt-2 text-[#0A4E9B]">8,421</h3>
      </div>
      <div className="bg-[#F6FAF5] p-6 rounded-xl border border-gray-200 shadow-sm transition-transform hover:-translate-y-1">
        <span className="text-xs font-bold text-gray-500 tracking-wider">SINH VIÊN ĐÃ ĐIỂM DANH</span>
        <h3 className="text-3xl font-extrabold m-0 mt-2 text-[#10B981]">98.2%</h3>
      </div>
      <div className="bg-[#F6FAF5] p-6 rounded-xl border border-gray-200 shadow-sm transition-transform hover:-translate-y-1">
        <span className="text-xs font-bold text-gray-500 tracking-wider">VI PHẠM GHI NHẬN HÔM NAY</span>
        <h3 className="text-3xl font-extrabold m-0 mt-2 text-[#EF4444]">{students.reduce((acc, curr) => acc + curr.violations.length, 0)}</h3>
      </div>
    </div>

    {/* Recent violations card logs */}
    <div className="bg-[#F6FAF5] rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="bg-[#0A4E9B] px-6 py-4 text-white text-lg font-bold">
        Nhật Ký Vi Phạm An Ninh Mới Nhất
      </div>
      <div className="max-h-[300px] overflow-y-auto">
        {students.flatMap(s => s.violations.map(v => ({ ...v, studentName: s.name, studentId: s.id, room: s.room, dom: s.dom }))).map((violation, index) => (
          <div
            key={index}
            className={`p-5 flex justify-between items-center border-b border-gray-200 ${index % 2 === 0 ? "bg-white" : "bg-[#F6FAF5]"}`}
          >
            <div>
              <strong className="text-red-500">[{violation.type}]</strong> - {violation.studentName} ({violation.studentId})
              <p className="m-0 mt-1 text-xs text-gray-500">
                Phòng {violation.room} - Tòa {violation.dom} • Lý do: {violation.description}
              </p>
            </div>
            <div className="font-bold text-red-600 text-sm">
              -{violation.pointsDeducted} điểm CFD
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
  );
}

export default OverviewTab;

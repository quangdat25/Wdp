import React, { useState } from "react";
import { FaSearch, FaPlusCircle } from "react-icons/fa";

function GateHistoryTab({ gateLogs, setGateLogs, students, setSelectedStudent, navigate }) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredLogs = gateLogs.filter(log => 
    log.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    log.studentId.toLowerCase().includes(searchQuery.toLowerCase()) || 
    log.room.includes(searchQuery)
  );

  return (
    <div className="bg-[#F6FAF5] rounded-2xl p-6 shadow-sm border border-gray-200">
      <div className="flex justify-between items-center mb-5">
        <div className="relative w-[300px]">
          <input
            type="text"
            placeholder="Lọc sinh viên/Số phòng..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-2 pl-9 pr-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#006948]"
          />
          <FaSearch className="absolute left-3 top-3 text-gray-400" />
        </div>
        
        <button
          onClick={() => {
            const newLog = {
              id: "G" + (gateLogs.length + 101),
              studentId: "SV001",
              studentName: "Nguyễn Hoàng Nam",
              room: "302",
              dom: "A",
              time: new Date().toISOString().replace('T', ' ').substring(0, 19),
              direction: "IN",
              status: "NORMAL"
            };
            setGateLogs([newLog, ...gateLogs]);
          }}
          className="bg-[#10B981] hover:bg-[#059669] text-white border-none rounded-lg px-4 py-2 text-sm font-bold cursor-pointer transition-colors flex items-center gap-2"
        >
          <FaPlusCircle /> Quét thẻ ảo (Simulate Tap)
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b-2 border-gray-200 bg-white">
              <th className="p-3 text-sm text-gray-500 font-bold">Sinh viên</th>
              <th className="p-3 text-sm text-gray-500 font-bold">MSSV</th>
              <th className="p-3 text-sm text-gray-500 font-bold">Phòng/Hệ</th>
              <th className="p-3 text-sm text-gray-500 font-bold">Thời gian</th>
              <th className="p-3 text-sm text-gray-500 font-bold">Hướng</th>
              <th className="p-3 text-sm text-gray-500 font-bold">Trạng thái</th>
              <th className="p-3 text-sm text-gray-500 font-bold text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredLogs.map(log => (
              <tr key={log.id} className="border-b border-gray-200 hover:bg-gray-50 transition-colors">
                <td className="p-3 font-semibold text-gray-800">{log.studentName}</td>
                <td className="p-3 font-mono text-sm">{log.studentId}</td>
                <td className="p-3 text-sm">Phòng {log.room} - Tòa {log.dom}</td>
                <td className="p-3 text-sm text-gray-600">{log.time}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.direction === "IN" ? "bg-emerald-100 text-emerald-800" : "bg-blue-100 text-blue-800"}`}>
                    {log.direction}
                  </span>
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${log.status === "LATE" ? "bg-red-100 text-red-800" : "bg-gray-100 text-gray-600"}`}>
                    {log.status === "LATE" ? "Vào trễ" : "Bình thường"}
                  </span>
                </td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => {
                      const studentObj = students.find(s => s.id === log.studentId);
                      setSelectedStudent(studentObj);
                      navigate("/staff/dashboard/security/search");
                    }}
                    className="bg-gray-200 hover:bg-gray-300 text-gray-700 border-none px-3 py-1.5 rounded-md text-xs font-semibold cursor-pointer transition-colors"
                  >
                    Thông tin SV
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default GateHistoryTab;

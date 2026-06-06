import React, { useState, useMemo } from 'react';
import StudentDetailsModal from './StudentDetailsModal';
import AddViolationModal from './AddViolationModal';

const GateAccessManager = ({
  gateAccesses,
  students,
  onViewStudentDetails,
  selectedStudent,
  onCloseStudentDetails,
  onAddViolation
}) => {
  const [searchText, setSearchText] = useState("");
  const [selectedBuilding, setSelectedBuilding] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");
  const [violationTargetStudent, setViolationTargetStudent] = useState(null);

  // Filter logs based on search criteria
  const filteredAccessLogs = useMemo(() => {
    return gateAccesses.filter((log) => {
      const matchSearch = 
        log.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
        log.studentRoll.toLowerCase().includes(searchText.toLowerCase()) ||
        (log.room && log.room.toLowerCase().includes(searchText.toLowerCase()));
      
      const matchBuilding = selectedBuilding === "All" || log.building === selectedBuilding;
      const matchStatus = 
        selectedStatus === "All" || 
        (selectedStatus === "LATE" && log.status === "LATE") ||
        (selectedStatus === "NORMAL" && log.status !== "LATE");

      return matchSearch && matchBuilding && matchStatus;
    });
  }, [gateAccesses, searchText, selectedBuilding, selectedStatus]);

  const handleOpenViolationModal = (studentId) => {
    // Find the student object in the students list
    const found = students.find((s) => s.id === studentId || s.rollNumber === studentId);
    if (found) {
      setViolationTargetStudent(found);
    } else {
      alert("Không tìm thấy thông tin sinh viên!");
    }
  };

  const handleOpenViolationFromDetails = (student) => {
    onCloseStudentDetails();
    setViolationTargetStudent(student);
  };

  return (
    <div className="gate-access-coordinator" id="gate-access-coordinator">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 m-0">Giám Sát Vào Ra & Cổng Từ</h2>
          <p className="text-slate-400 text-xs mt-1">Lịch sử quẹt thẻ thông tin ra vào cổng kí túc xá thời gian thực.</p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-wrap gap-3 mb-6 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl" id="gate-access-filter-panel">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Tìm sinh viên, mã số, số phòng..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 placeholder:text-slate-400"
          />
        </div>

        <div className="w-[140px]">
          <select
            value={selectedBuilding}
            onChange={(e) => setSelectedBuilding(e.target.value)}
            className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer"
          >
            <option value="All">Tất cả Tòa</option>
            <option value="Dom A">Dom A</option>
            <option value="Dom B">Dom B</option>
            <option value="Dom C">Dom C</option>
            <option value="Dom D">Dom D</option>
          </select>
        </div>

        <div className="w-[160px]">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer"
          >
            <option value="All">Mọi trạng thái</option>
            <option value="LATE">Vi phạm curfew (Muộn)</option>
            <option value="NORMAL">Vào ra hợp lệ</option>
          </select>
        </div>
      </div>

      {/* Access Logs Table */}
      <div className="overflow-x-auto border border-slate-100 rounded-2xl bg-white">
        <table className="w-full border-collapse text-left text-sm" id="gate-access-table">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100 text-slate-500 font-bold">
              <th className="p-4">Thời gian</th>
              <th className="p-4">Tên Sinh Viên</th>
              <th className="p-4">Mã Số SV</th>
              <th className="p-4">Địa điểm</th>
              <th className="p-4">Lượt</th>
              <th className="p-4">Trạng thái</th>
              <th className="p-4 text-center">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {filteredAccessLogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="p-8 text-center text-slate-400 font-medium">
                  Không tìm thấy lịch sử ra vào phù hợp
                </td>
              </tr>
            ) : (
              filteredAccessLogs.map((log) => (
                <tr key={log.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 text-slate-500 font-medium">{log.timestamp}</td>
                  <td className="p-4 font-bold text-slate-700">{log.studentName}</td>
                  <td className="p-4 font-semibold text-slate-400 uppercase">{log.studentRoll}</td>
                  <td className="p-4 font-semibold text-slate-600">{log.building} - {log.room}</td>
                  <td className="p-4">
                    <span className={`inline-flex items-center gap-1 font-bold text-xs uppercase px-2 py-0.5 rounded-full ${log.direction === 'IN' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                      <span className="material-symbols-outlined text-[10px]">
                        {log.direction === 'IN' ? 'login' : 'logout'}
                      </span>
                      {log.direction === 'IN' ? 'Vào' : 'Ra'}
                    </span>
                  </td>
                  <td className="p-4">
                    {log.status === 'LATE' ? (
                      <span className="inline-flex items-center gap-1 font-extrabold text-[10px] uppercase px-2 py-1 rounded bg-rose-50 text-rose-700 border border-rose-200">
                        <span className="material-symbols-outlined text-[12px] animate-pulse">new_releases</span>
                        Quá Giờ (Curfew)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 font-semibold text-[10px] uppercase px-2 py-1 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                        Hợp lệ
                      </span>
                    )}
                  </td>
                  <td className="p-4 text-center">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => onViewStudentDetails(log.studentId)}
                        className="h-8 px-3 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">visibility</span>
                        Xem hồ sơ
                      </button>
                      <button
                        onClick={() => handleOpenViolationModal(log.studentId)}
                        className="h-8 px-3 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1"
                      >
                        <span className="material-symbols-outlined text-xs">warning</span>
                        Lập biên bản
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Student Details Overlay Portal */}
      {selectedStudent && (
        <StudentDetailsModal
          student={selectedStudent}
          onClose={onCloseStudentDetails}
          onOpenAddViolation={handleOpenViolationFromDetails}
        />
      )}

      {/* Disciplinary Citation Form Modal */}
      {violationTargetStudent && (
        <AddViolationModal
          student={violationTargetStudent}
          onClose={() => setViolationTargetStudent(null)}
          onSubmit={onAddViolation}
        />
      )}
    </div>
  );
};

export default GateAccessManager;

import React, { useState, useMemo } from 'react';
import ReportDamageModal from './ReportDamageModal';

const RoomCleanManager = ({ cleanTasks, onMarkReady, onReportDamage }) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [activeDamageTask, setActiveDamageTask] = useState(null);

  // Filter clean tasks based on filter inputs
  const filteredCleanTasks = useMemo(() => {
    return cleanTasks.filter((task) => {
      const matchSearch = 
        task.room.toLowerCase().includes(searchText.toLowerCase()) ||
        task.dom.toLowerCase().includes(searchText.toLowerCase());
      
      const matchStatus = statusFilter === "All" || task.status === statusFilter;

      return matchSearch && matchStatus;
    });
  }, [cleanTasks, searchText, statusFilter]);

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-slate-100 text-slate-600 border-slate-200';
      case 'IN_PROGRESS':
        return 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse';
      case 'READY':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-150';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ vệ sinh';
      case 'IN_PROGRESS': return 'Đang thực hiện';
      case 'READY': return 'Ghé sẵn sàng';
      default: return status;
    }
  };

  return (
    <div className="room-clean-coordinator" id="room-clean-coordinator">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 m-0">Quản Lý Dọn Dẹp Phòng & Vệ Sinh</h2>
          <p className="text-slate-400 text-xs mt-1">Chuẩn bị phòng sẵn sàng đón sinh viên mới, kiểm tra và dọn dẹp các phòng trống sau khi checkout.</p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-wrap gap-3 mb-6 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl" id="clean-filter-panel">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Tìm số phòng, khu nhà (VD: Dom A)..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="w-[160px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer"
          >
            <option value="All">Tất cả Trạng thái</option>
            <option value="PENDING">Chờ vệ sinh</option>
            <option value="IN_PROGRESS">Đang dọn dẹp</option>
            <option value="READY">Sẵn sàng (Đã xong)</option>
          </select>
        </div>
      </div>

      {/* Room Cleaning Grid */}
      <div className="dashboard-grid" id="clean-tasks-grid">
        {filteredCleanTasks.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            Không tìm thấy phòng ở đang dọn dẹp nào
          </div>
        ) : (
          filteredCleanTasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              id={`clean-card-${task.id}`}
            >
              <div>
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-sm font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl">
                    {task.dom} - Phòng {task.room}
                  </span>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 border rounded-lg uppercase ${getStatusBadgeClass(task.status)}`}>
                    {getStatusLabel(task.status)}
                  </span>
                </div>

                <h4 className="font-extrabold text-md text-slate-800 mb-2 mt-1 leading-snug">Vệ sinh định kỳ và buồng phòng</h4>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">
                  Dọn dẹp bụi bẩn, thay ga giường, quét nhà, lau chùi phòng tắm, gom rác thải, kiểm tra thiết bị hoạt động trước khi sinh viên check-in.
                </p>

                {/* Indication of Damage Reported */}
                {task.damageReported && (
                  <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl flex gap-2 text-xs text-rose-800 mb-4 animate-in fade-in duration-200">
                    <span className="material-symbols-outlined text-sm text-rose-600">report_problem</span>
                    <div>
                      <span className="font-bold block">Đã báo hỏng vật tư</span>
                      <span className="text-slate-600 text-[10px] block mt-[1px]">{task.damageReported.description}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                {task.status !== 'READY' ? (
                  <>
                    <button
                      onClick={() => setActiveDamageTask(task)}
                      className="flex-1 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-bold text-slate-700 transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">report_problem</span>
                      Khai báo Hỏng
                    </button>
                    <button
                      onClick={() => onMarkReady(task.id)}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm shadow-emerald-50"
                    >
                      <span className="material-symbols-outlined text-xs">clean_hands</span>
                      Xong Vệ Sinh
                    </button>
                  </>
                ) : (
                  <button
                    disabled
                    className="w-full py-2.5 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs text-emerald-500">check_circle</span>
                    Phòng Đã Sẵn Sàng Đón Nhận Sinh Viên
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Report Damage Modal */}
      {activeDamageTask && (
        <ReportDamageModal
          task={activeDamageTask}
          onClose={() => setActiveDamageTask(null)}
          onSubmit={onReportDamage}
        />
      )}
    </div>
  );
};

export default RoomCleanManager;

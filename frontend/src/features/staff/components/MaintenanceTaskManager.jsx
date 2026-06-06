import React, { useState, useMemo } from 'react';
import AddRepairNotesModal from './AddRepairNotesModal';

const MaintenanceTaskManager = ({ tasks, onUpdateStatus, onAddNote }) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [severityFilter, setSeverityFilter] = useState("All");
  const [activeNoteTask, setActiveNoteTask] = useState(null);

  // Filter tasks based on settings
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchSearch = 
        task.room.toLowerCase().includes(searchText.toLowerCase()) ||
        task.title.toLowerCase().includes(searchText.toLowerCase()) ||
        task.description.toLowerCase().includes(searchText.toLowerCase());
      
      const matchStatus = statusFilter === "All" || task.status === statusFilter;
      const matchSeverity = severityFilter === "All" || task.severity === severityFilter;

      return matchSearch && matchStatus && matchSeverity;
    });
  }, [tasks, searchText, statusFilter, severityFilter]);

  const getSeverityBadgeClass = (severity) => {
    switch (severity) {
      case 'HIGH':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'MEDIUM':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'LOW':
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getSeverityLabel = (severity) => {
    switch (severity) {
      case 'HIGH': return 'Khẩn cấp';
      case 'MEDIUM': return 'Trung bình';
      case 'LOW': return 'Bình thường';
      default: return severity;
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'bg-rose-50 text-rose-700 border-rose-100';
      case 'IN_PROGRESS':
        return 'bg-sky-50 text-sky-700 border-sky-200 animate-pulse';
      case 'COMPLETED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      default:
        return 'bg-slate-50 text-slate-500 border-slate-100';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'PENDING': return 'Chờ xử lý';
      case 'IN_PROGRESS': return 'Đang xử lý';
      case 'COMPLETED': return 'Đã hoàn thành';
      default: return status;
    }
  };

  return (
    <div className="maintenance-task-coordinator" id="maintenance-task-coordinator">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-extrabold text-slate-800 m-0">Quản Lý Yêu Cầu Sửa Chữa & Bảo Trì</h2>
          <p className="text-slate-400 text-xs mt-1">Tiếp nhận và khắc phục các sự cố về trang thiết bị vật tư tại các phòng ở.</p>
        </div>
      </div>

      {/* Filter and Search Panel */}
      <div className="flex flex-wrap gap-3 mb-6 bg-slate-50 p-4 border border-slate-200/60 rounded-2xl" id="maintenance-filter-panel">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Tìm theo phòng, sự cố, nội dung..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full h-11 pl-4 pr-10 border border-slate-200 rounded-xl text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <div className="w-[140px]">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer"
          >
            <option value="All">Tất cả Trạng thái</option>
            <option value="PENDING">Chờ xử lý</option>
            <option value="IN_PROGRESS">Đang xử lý</option>
            <option value="COMPLETED">Đã hoàn thành</option>
          </select>
        </div>

        <div className="w-[140px]">
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="w-full h-11 px-3 border border-slate-200 rounded-xl text-sm bg-white cursor-pointer"
          >
            <option value="All">Mức độ khẩn</option>
            <option value="HIGH">Khẩn cấp</option>
            <option value="MEDIUM">Trung bình</option>
            <option value="LOW">Bình thường</option>
          </select>
        </div>
      </div>

      {/* Tasks Grid */}
      <div className="dashboard-grid" id="maintenance-tasks-grid">
        {filteredTasks.length === 0 ? (
          <div className="col-span-full p-12 text-center text-slate-400 border-2 border-dashed border-slate-100 rounded-2xl">
            Không tìm thấy sự cố kỹ thuật nào
          </div>
        ) : (
          filteredTasks.map((task) => (
            <div 
              key={task.id} 
              className="bg-white border border-slate-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              id={`maintenance-card-${task.id}`}
            >
              <div>
                {/* Meta Row: Building / Room and badges */}
                <div className="flex justify-between items-start gap-2 mb-3">
                  <span className="text-sm font-extrabold text-slate-800 bg-slate-100 px-3 py-1 rounded-xl">
                    {task.dom} - Phòng {task.room}
                  </span>
                  <div className="flex gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 border rounded-lg uppercase ${getSeverityBadgeClass(task.severity)}`}>
                      {getSeverityLabel(task.severity)}
                    </span>
                    <span className={`text-[10px] font-extrabold px-2 py-0.5 border rounded-lg uppercase ${getStatusBadgeClass(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </span>
                  </div>
                </div>

                <h4 className="font-extrabold text-base text-slate-800 mb-2 mt-1 leading-snug">{task.title}</h4>
                <p className="text-slate-500 text-xs leading-relaxed mb-4">{task.description}</p>
                <div className="text-[10px] text-slate-400 mb-4 font-semibold">
                  <span>Người báo: {task.reportedBy}</span>
                  <span className="mx-2">•</span>
                  <span>Ngày tạo: {task.createdDate}</span>
                </div>

                {/* Diagnostics Notes Sub-list */}
                {task.notes && task.notes.length > 0 && (
                  <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 mt-2 mb-4">
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wide block mb-2">Ghi nhận tiến trình ({task.notes.length})</span>
                    <div className="flex flex-col gap-2 max-h-[120px] overflow-y-auto pr-1">
                      {task.notes.map((n, idx) => (
                        <div key={idx} className="text-xs border-l-2 border-slate-200 pl-2 py-0.5">
                          <span className="font-semibold text-slate-700 block">{n.content}</span>
                          <span className="text-[9px] text-slate-400 block mt-0.5">{n.date}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons Footer */}
              <div className="flex gap-2 mt-4 pt-3 border-t border-slate-50">
                {task.status === 'PENDING' && (
                  <button
                    onClick={() => onUpdateStatus(task.id, 'IN_PROGRESS')}
                    className="w-full py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm shadow-sky-50"
                  >
                    <span className="material-symbols-outlined text-xs">play_arrow</span>
                    Tiếp Nhận Sửa Chữa
                  </button>
                )}

                {task.status === 'IN_PROGRESS' && (
                  <>
                    <button
                      onClick={() => setActiveNoteTask(task)}
                      className="flex-1 py-2 bg-slate-100 hover:bg-slate-250 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    >
                      <span className="material-symbols-outlined text-xs">edit_note</span>
                      Kê khai
                    </button>
                    <button
                      onClick={() => onUpdateStatus(task.id, 'COMPLETED')}
                      className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-1 shadow-sm shadow-emerald-50"
                    >
                      <span className="material-symbols-outlined text-xs">check</span>
                      Hoàn thành
                    </button>
                  </>
                )}

                {task.status === 'COMPLETED' && (
                  <button
                    disabled
                    className="w-full py-2 bg-slate-50 text-slate-400 border border-slate-100 rounded-xl text-xs font-bold cursor-not-allowed flex items-center justify-center gap-1"
                  >
                    <span className="material-symbols-outlined text-xs text-emerald-500">task_alt</span>
                    Kỹ thuật đã khắc phục xong
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add Repair Notes Modal */}
      {activeNoteTask && (
        <AddRepairNotesModal
          task={activeNoteTask}
          onClose={() => setActiveNoteTask(null)}
          onSubmit={onAddNote}
        />
      )}
    </div>
  );
};

export default MaintenanceTaskManager;

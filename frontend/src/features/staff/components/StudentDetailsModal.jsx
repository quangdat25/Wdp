import React from 'react';

const StudentDetailsModal = ({ student, onClose, onOpenAddViolation }) => {
  if (!student) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="student-details-modal-overlay">
      <div 
        className="modal-content max-w-[600px] w-full bg-white rounded-3xl p-6 shadow-2xl relative animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
        id="student-details-modal-content"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-slate-100"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-4 mb-6 border-b border-slate-100 pb-4">
          <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[32px]">account_box</span>
          </div>
          <div>
            <h3 className="font-extrabold text-[20px] text-slate-800 m-0">{student.fullName}</h3>
            <span className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{student.rollNumber}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-6" id="student-detail-info-grid">
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-bold uppercase mb-1">Chuyên ngành</div>
            <div className="text-sm font-bold text-slate-700">{student.major || "Chưa có"}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-bold uppercase mb-1">Phòng ở</div>
            <div className="text-sm font-bold text-slate-700">{student.dom} - Phòng {student.room}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-bold uppercase mb-1">Email liên hệ</div>
            <div className="text-sm font-bold text-slate-700 break-all">{student.email}</div>
          </div>
          <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
            <div className="text-[11px] text-slate-400 font-bold uppercase mb-1">Số điện thoại</div>
            <div className="text-sm font-bold text-slate-700">{student.phone || "Chưa cập nhật"}</div>
          </div>
        </div>

        {/* Parent Information Section */}
        {student.parent && (
          <div className="mb-6 bg-slate-50 border border-slate-100 rounded-2xl p-4" id="parent-info-section">
            <h4 className="text-[13px] font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">group</span>
              Thông tin Phụ huynh
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="text-slate-500 font-medium">Họ và Tên:</div>
              <div className="text-slate-700 font-bold text-right">{student.parent.fullName}</div>
              <div className="text-slate-500 font-medium">Quan hệ:</div>
              <div className="text-slate-700 font-bold text-right">{student.parent.relationship || "Bố/Mẹ"}</div>
              <div className="text-slate-500 font-medium">Số điện thoại:</div>
              <div className="text-slate-700 font-bold text-right text-blue-600">{student.parent.phone}</div>
            </div>
          </div>
        )}

        {/* CFD Score Widget */}
        <div className="mb-6 flex items-center justify-between p-4 bg-amber-50 rounded-2xl border border-amber-200">
          <div>
            <div className="text-xs font-bold text-amber-800 mb-[2px]">Điểm Tin Cậy Sinh Viên (CFD Score)</div>
            <div className="text-slate-500 text-[11px]">Bắt đầu từ 100, trừ điểm dựa trên các biên bản vi phạm kỷ luật khu ký túc xá.</div>
          </div>
          <div className="text-[28px] font-extrabold text-amber-700 bg-white border border-amber-200 w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm">
            {student.cfdScore}
          </div>
        </div>

        {/* Violations List */}
        <div className="mb-6">
          <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center justify-between">
            <span>Lịch sử Vi phạm ({student.violations?.length || 0})</span>
            <button 
              onClick={() => onOpenAddViolation(student)}
              className="text-xs bg-red-50 text-red-700 border border-red-200 px-3 py-1-5 rounded-lg font-bold flex items-center gap-1 hover:bg-red-100 transition-colors"
            >
              <span className="material-symbols-outlined text-xs">report</span>
              Tạo biên bản vi phạm
            </button>
          </h4>

          <div className="max-h-[160px] overflow-y-auto pr-1 flex flex-col gap-2" id="violations-history-list">
            {!student.violations || student.violations.length === 0 ? (
              <div className="text-slate-400 text-xs py-4 text-center border-2 border-dashed border-slate-100 rounded-xl">
                Không có lịch sử vi phạm kỷ luật
              </div>
            ) : (
              student.violations.map((v) => (
                <div key={v.id} className="p-3 bg-rose-50/50 border border-rose-100 rounded-xl flex gap-3 text-xs justify-between items-start">
                  <div>
                    <span className="font-bold text-rose-800 block">{v.type}</span>
                    <span className="text-slate-600 block mt-[2px]">{v.description}</span>
                    <span className="text-[10px] text-slate-400 block mt-1">{v.date}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-full select-none text-[10px] whitespace-nowrap">
                      -{v.deduction} CFD
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="flex gap-3 justify-end mt-4">
          <button 
            type="button" 
            onClick={onClose} 
            className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold transition-all hover:brightness-110 active:scale-[0.98]"
          >
            Đóng bảng hồ sơ
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetailsModal;

import React, { useState } from 'react';

const ReportDamageModal = ({ task, onClose, onSubmit }) => {
  const [description, setDescription] = useState("");
  const [severity, setSeverity] = useState("MEDIUM");

  const presets = [
    { text: "Hỏng vòi rỉ nước", severity: "HIGH" },
    { text: "Hỏng ổ khóa cửa phòng", severity: "HIGH" },
    { text: "Bóng đèn nhấp nháy / hỏng bóng", severity: "MEDIUM" },
    { text: "Chân giường lung lay / gãy nan", severity: "MEDIUM" },
    { text: "Điều hòa rỉ nước / kém lạnh", severity: "LOW" },
    { text: "Mất mạng internet LAN phòng", severity: "LOW" }
  ];

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!description.trim()) {
      alert("Vui lòng mô tả chi tiết linh kiện hoặc vật tư bị hỏng hóc!");
      return;
    }

    onSubmit(task.id, task.room, task.dom, description.trim(), severity);
    onClose();
  };

  if (!task) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="report-damage-modal-overlay">
      <div 
        className="modal-content max-w-[480px] w-full bg-white rounded-3xl p-6 shadow-2xl relative animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
        id="report-damage-modal-content"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-slate-100"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">notification_important</span>
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 m-0">Lập Phiếu Báo Hỏng Vật Tư</h3>
            <span className="text-slate-400 text-xs font-semibold">Hiện trạng phòng: {task.dom} - Phòng {task.room}</span>
          </div>
        </div>

        {/* Quick presets tags */}
        <div className="mb-4">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide block mb-2">Gợi ý lỗi phổ biến</span>
          <div className="flex flex-wrap gap-2">
            {presets.map((p, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setDescription(p.text);
                  setSeverity(p.severity);
                }}
                className="px-2.5 py-1 bg-slate-50 hover:bg-slate-100 border border-slate-200/60 rounded-lg text-xs text-slate-600 font-semibold transition-colors"
              >
                {p.text}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label htmlFor="defect-desc-area">Mô tả sự cố hỏng hóc chi tiết</label>
            <textarea
              id="defect-desc-area"
              rows="3"
              placeholder="Ghi nhận lỗi hỏng, nứt, vỡ, mất điện nước cụ thể..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
              className="form-input resize-none py-2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="defect-severity-select">Bộ phận nhận xử lý & Mức độ khẩn</label>
            <select
              id="defect-severity-select"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
              className="form-input bg-white cursor-pointer"
            >
              <option value="HIGH">Đội kỹ thuật khẩn cấp (Hỏng van nước, mất điện nguồn)</option>
              <option value="MEDIUM">Lên lịch bảo trì thường kì (Hỏng nan giường, bóng đèn tuýp)</option>
              <option value="LOW">Khảo sát / Dọn dẹp bổ sung (Chắp vá mép tường, điều hòa chảy nước nhẹ)</option>
            </select>
          </div>

          <div className="flex gap-3 mt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
              Quay lại dọn phòng
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-md shadow-rose-100 active:scale-[0.98]"
            >
              Chuyển Tổ Bảo Trì
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReportDamageModal;

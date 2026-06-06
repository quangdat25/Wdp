import React, { useState } from 'react';

const AddViolationModal = ({ student, onClose, onSubmit }) => {
  const [violationPreset, setViolationPreset] = useState("Vào muộn");
  const [description, setDescription] = useState("");
  const [deduction, setDeduction] = useState(5);
  const [customType, setCustomType] = useState("");

  const presets = [
    { type: "Vào muộn", label: "Vào muộn sau giờ nghiêm quân (22h00)", defaultDeduction: 5 },
    { type: "Nấu ăn trong phòng", label: "Nấu ăn trong phòng (Trái phép)", defaultDeduction: 20 },
    { type: "Gây ồn ào", label: "Gây ồn mất trật tự sau 23h00", defaultDeduction: 10 },
    { type: "Vệ sinh bẩn", label: "Không giữ vệ sinh phòng ở", defaultDeduction: 10 },
    { type: "Phá hoại tài sản", label: "Phá hoại hoặc tác động làm hỏng thiết bị chung", defaultDeduction: 25 },
    { type: "Khác", label: "Hành vi vi phạm quy tắc khác...", defaultDeduction: 10 }
  ];

  const handlePresetChange = (e) => {
    const selected = e.target.value;
    setViolationPreset(selected);
    const presetObj = presets.find(p => p.type === selected);
    if (presetObj) {
      setDeduction(presetObj.defaultDeduction);
    }
  };

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    const finalType = violationPreset === "Khác" ? (customType || "Vi phạm quy chế") : violationPreset;
    const finalDesc = description.trim() || `Ghi nhận vi phạm ${finalType} tại phòng sinh hoạt nội trú`;
    
    onSubmit(student.id, finalType, finalDesc, parseInt(deduction) || 0);
    onClose();
  };

  if (!student) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="add-violation-modal-overlay">
      <div 
        className="modal-content max-w-[480px] w-full bg-white rounded-3xl p-6 shadow-2xl relative animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
        id="add-violation-modal-content"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-slate-100"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">gavel</span>
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 m-0">Lập Biên Bản Vi Phạm ký túc</h3>
            <span className="text-slate-400 text-xs font-semibold">Sinh viên: {student.fullName} ({student.rollNumber})</span>
          </div>
        </div>

        <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label htmlFor="violation-preset-select">Loại hình vi phạm</label>
            <select
              id="violation-preset-select"
              value={violationPreset}
              onChange={handlePresetChange}
              className="form-input bg-white cursor-pointer"
            >
              {presets.map(p => (
                <option key={p.type} value={p.type}>{p.label}</option>
              ))}
            </select>
          </div>

          {violationPreset === "Khác" && (
            <div className="form-group animate-in slide-in-from-top duration-200">
              <label htmlFor="custom-violation-input">Mô tả loại vi phạm cụ thể</label>
              <input
                id="custom-violation-input"
                type="text"
                placeholder="Nhập tên vi phạm..."
                value={customType}
                onChange={(e) => setCustomType(e.target.value)}
                required
                className="form-input"
              />
            </div>
          )}

          <div className="form-group">
            <label htmlFor="violation-deduction-input">Số điểm trừ CFD Score</label>
            <input
              id="violation-deduction-input"
              type="number"
              min="0"
              max="100"
              value={deduction}
              onChange={(e) => setDeduction(e.target.value)}
              required
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="violation-desc-area">Ý kiến ghi chú lỗi chi tiết</label>
            <textarea
              id="violation-desc-area"
              rows="3"
              placeholder="Nhập ghi nhận chi tiết về biên bản phát hiện..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="form-input resize-none py-2"
            />
          </div>

          <div className="flex gap-3 mt-2">
            <button 
              type="button" 
              onClick={onClose} 
              className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition-all"
            >
              Hủy bỏ
            </button>
            <button 
              type="submit" 
              className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold transition-all shadow-md shadow-red-100 active:scale-[0.98]"
            >
              Lập biên bản (-{deduction}đ)
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddViolationModal;

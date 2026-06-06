import React, { useState } from 'react';

const AddRepairNotesModal = ({ task, onClose, onSubmit }) => {
  const [noteContent, setNoteContent] = useState("");
  const [materialCost, setMaterialCost] = useState("");
  const [materialNames, setMaterialNames] = useState("");

  const handleConfirmSubmit = (e) => {
    e.preventDefault();
    if (!noteContent.trim()) {
      alert("Vui lòng nhập nội dung ghi chú sửa chữa!");
      return;
    }

    let finalContent = noteContent.trim();
    if (materialNames.trim() || materialCost.trim()) {
      finalContent += `\n[Vật tư sử dụng: ${materialNames.trim() || 'Không kê'}; Chi phí ước tính: ${materialCost.trim() || '0'} VNĐ]`;
    }

    onSubmit(task.id, finalContent);
    onClose();
  };

  if (!task) return null;

  return (
    <div className="modal-overlay" onClick={onClose} id="add-repair-notes-modal-overlay">
      <div 
        className="modal-content max-w-[480px] w-full bg-white rounded-3xl p-6 shadow-2xl relative animate-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
        id="add-repair-notes-modal-content"
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors w-8 h-8 rounded-full flex items-center justify-center bg-slate-100"
        >
          <span className="material-symbols-outlined text-[20px]">close</span>
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
            <span className="material-symbols-outlined text-[28px]">handyman</span>
          </div>
          <div>
            <h3 className="font-extrabold text-lg text-slate-800 m-0">Kê Khai Sửa Chữa</h3>
            <span className="text-slate-400 text-xs font-semibold">Sự cố: {task.title} (Phòng {task.room})</span>
          </div>
        </div>

        <form onSubmit={handleConfirmSubmit} className="flex flex-col gap-4">
          <div className="form-group">
            <label htmlFor="note-content-area">Ghi nhận tình trạng kỹ thuật & Xử lý</label>
            <textarea
              id="note-content-area"
              rows="3"
              placeholder="Mô tả nguyên nhân hư hỏng và phương án đã khắc phục..."
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              required
              className="form-input resize-none py-2"
            />
          </div>

          <div className="form-group">
            <label htmlFor="material-names-input">Kê khai linh kiện / Vật tư thay thế (nếu có)</label>
            <input
              id="material-names-input"
              type="text"
              placeholder="VD: Van nước đồng phi 21, Bóng đèn LED Rạng Đông..."
              value={materialNames}
              onChange={(e) => setMaterialNames(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="material-cost-input">Tổng chi phí vật tư dự tính (VNĐ)</label>
            <input
              id="material-cost-input"
              type="text"
              placeholder="VD: 120000"
              value={materialCost}
              onChange={(e) => setMaterialCost(e.target.value)}
              className="form-input"
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
              className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-100 active:scale-[0.98]"
            >
              Lưu Ghi Chú
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRepairNotesModal;

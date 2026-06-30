import React from "react";

function SearchStudentTab({ students, selectedStudent, setSelectedStudent }) {
  return (
    <div className="flex flex-col gap-5">
      <div className="bg-[#F6FAF5] p-6 rounded-2xl shadow-sm border border-gray-200">
        <h4 className="m-0 mb-3 text-gray-500 font-bold">Tra cứu học vụ & chỉ số uy tín (CFD Profile)</h4>
        <div className="flex gap-3">
          <select
            value={selectedStudent ? selectedStudent.id : ""}
            onChange={(e) => {
              const studentObj = students.find(s => s.id === e.target.value);
              setSelectedStudent(studentObj);
            }}
            className="flex-1 p-3 rounded-lg border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#006948]"
          >
            <option value="">-- Chọn sinh viên để xem lý lịch chi tiết --</option>
            {students.map(s => (
              <option key={s.id} value={s.id}>{s.name} ({s.id}) - Phòng {s.room}</option>
            ))}
          </select>
        </div>
      </div>

      {selectedStudent ? (
        <div className="bg-[#F6FAF5] p-7 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-6">
          <div className="flex justify-between items-start border-b border-gray-200 pb-4">
            <div>
              <h2 className="m-0 text-gray-900 font-bold text-2xl">{selectedStudent.name}</h2>
              <span className="text-sm text-gray-500">Mã sinh viên: <strong className="text-gray-700">{selectedStudent.id}</strong> | Phòng: {selectedStudent.room} - Tòa {selectedStudent.dom}</span>
            </div>
            <div className="text-right">
              <div className="text-xs font-bold text-gray-500 tracking-wider">ĐIỂM CFD UY TÍN</div>
              <div className={`text-4xl font-black ${selectedStudent.cfdScore >= 80 ? "text-emerald-500" : selectedStudent.cfdScore >= 50 ? "text-amber-500" : "text-red-500"}`}>
                {selectedStudent.cfdScore} / 100
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="m-0 mb-3 text-[#0A4E9B] font-bold">Thông tin liên hệ</h4>
              <p className="m-0 my-1.5 text-sm text-gray-700">Số điện thoại: <strong>{selectedStudent.phone}</strong></p>
              <p className="m-0 my-1.5 text-sm text-gray-700">Email: <strong>{selectedStudent.email}</strong></p>
            </div>
            <div>
              <h4 className="m-0 mb-3 text-[#0A4E9B] font-bold">Người bảo hộ / Phụ huynh</h4>
              <p className="m-0 my-1.5 text-sm text-gray-700">Họ tên: <strong>{selectedStudent.parentName}</strong></p>
              <p className="m-0 my-1.5 text-sm text-gray-700">SĐT liên hệ: <strong>{selectedStudent.parentPhone}</strong></p>
            </div>
          </div>

          <div>
            <h4 className="m-0 mb-3 text-[#0A4E9B] font-bold">Tiền án vi phạm nội quy ({selectedStudent.violations.length})</h4>
            {selectedStudent.violations.length > 0 ? (
              <div className="flex flex-col gap-2">
                {selectedStudent.violations.map((violation) => (
                  <div key={violation.id} className="border border-gray-200 p-3 rounded-lg bg-white flex justify-between items-center">
                    <div>
                      <strong className="text-sm text-red-500">[{violation.type}]</strong> - Ngày: {violation.date}
                      <p className="m-0 mt-1 text-xs text-gray-500">{violation.description}</p>
                    </div>
                    <span className="text-xs font-bold text-red-600">-{violation.pointsDeducted} CFD</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-emerald-500 font-bold italic text-sm">Không có tiền lệ vi phạm. Sinh viên gương mẫu!</div>
            )}
          </div>
        </div>
      ) : (
        <div className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center text-gray-500">
          Vui lòng chọn thông tin sinh viên từ danh mục thả bên trên để hiển thị lịch sử nghiệp vụ.
        </div>
      )}
    </div>
  );
}

export default SearchStudentTab;

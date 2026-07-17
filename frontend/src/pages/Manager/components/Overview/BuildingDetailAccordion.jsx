import React, { useEffect, useState, useRef, useCallback } from "react";
import gsap from "gsap";
import {
  getRoomsByBuilding,
  getRoomDetail,
  assignStudentToRoom,
  removeStudentFromRoom,
  getAvailableStudents,
} from "../../../../api/roomService";
import {
  FaLayerGroup,
  FaDoorOpen,
  FaUserGraduate,
  FaTimes,
  FaSearch,
  FaUserPlus,
  FaUserMinus,
} from "react-icons/fa";
import { Modal } from "antd";

const statusConfig = {
  available: { label: "Trống", dot: "#34d399", cardBg: "rgba(52, 211, 153, 0.10)", cardBorder: "rgba(52, 211, 153, 0.25)", bg: "linear-gradient(135deg, #34d399 0%, #10b981 100%)", color: "#fff" },
  occupied: { label: "Đang ở", dot: "#3b82f6", cardBg: "rgba(59, 130, 246, 0.10)", cardBorder: "rgba(59, 130, 246, 0.25)", bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)", color: "#fff" },
  maintenance: { label: "Bảo trì", dot: "#f59e0b", cardBg: "rgba(245, 158, 11, 0.10)", cardBorder: "rgba(245, 158, 11, 0.25)", bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)", color: "#fff" },
};

export default function BuildingDetailAccordion({ buildingId, buildingName }) {
  const containerRef = useRef(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  // Student modal states
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);

  const { confirm } = Modal;

  useEffect(() => {
    // Entrance animation
    if (containerRef.current) {
      gsap.fromTo(
        containerRef.current,
        { height: 0, opacity: 0, overflow: "hidden" },
        { height: "auto", opacity: 1, duration: 0.5, ease: "power3.out" }
      );
    }
  }, [buildingId]);

  const fetchRooms = useCallback(async () => {
    if (!buildingId) return;
    try {
      setLoadingRooms(true);
      const res = await getRoomsByBuilding(buildingId, selectedFloor);
      setRooms(res.data || []);
    } catch (error) {
      console.error("Lỗi lấy phòng:", error);
    } finally {
      setLoadingRooms(false);
    }
  }, [buildingId, selectedFloor]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const openRoomDetail = async (room) => {
    try {
      const res = await getRoomDetail(room._id);
      setSelectedRoom(res.data);
      setShowAddStudent(false);
      setStudentSearch("");
      setAvailableStudents([]);
    } catch (error) {
      setSelectedRoom(room);
    }
  };

  const searchAvailableStudents = async (keyword) => {
    try {
      setLoadingStudents(true);
      const res = await getAvailableStudents(keyword);
      setAvailableStudents(res.data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoadingStudents(false);
    }
  };

  const toggleAddStudent = () => {
    if (!showAddStudent) searchAvailableStudents("");
    setShowAddStudent(!showAddStudent);
    setStudentSearch("");
  };

  const handleAssignStudent = async (studentId) => {
    if (!selectedRoom) return;
    try {
      setAssigning(true);
      const res = await assignStudentToRoom(selectedRoom._id, studentId);
      setSelectedRoom(res.data);
      searchAvailableStudents(studentSearch);
      await fetchRooms();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi thêm sinh viên");
    } finally {
      setAssigning(false);
    }
  };

  const handleRemoveStudent = (studentId) => {
    if (!selectedRoom) return;
    confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa sinh viên khỏi phòng này không?",
      okText: "Xóa",
      cancelText: "Hủy",
      okType: "danger",
      async onOk() {
        try {
          setRemoving(true);
          const res = await removeStudentFromRoom(selectedRoom._id, studentId);
          setSelectedRoom(res.data);
          await fetchRooms();
        } catch (error) {
          alert(error.response?.data?.message || "Lỗi xóa sinh viên");
        } finally {
          setRemoving(false);
        }
      },
    });
  };

  return (
    <div ref={containerRef} style={{ background: "#F9FAFB", borderTop: "1px solid #E5E7EB", padding: "24px", gridColumn: "1 / -1" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h4 style={{ fontSize: 18, fontWeight: 700, color: "#1E293B", margin: 0 }}>
          <FaLayerGroup style={{ marginRight: 8, color: "#3B82F6" }} />
          Chi tiết Tòa {buildingName}
        </h4>
        <div style={{ display: "flex", gap: 8 }}>
          {[1, 2, 3, 4, 5].map((floor) => (
            <button
              key={floor}
              onClick={() => setSelectedFloor(floor)}
              style={{
                padding: "6px 16px",
                borderRadius: 8,
                border: selectedFloor === floor ? "none" : "1px solid #E2E8F0",
                background: selectedFloor === floor ? "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)" : "#FFF",
                color: selectedFloor === floor ? "#FFF" : "#475569",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              Tầng {floor}
            </button>
          ))}
        </div>
      </div>

      {loadingRooms ? (
        <div style={{ padding: 20, textAlign: "center", color: "#64748B" }}>Đang tải danh sách phòng...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 12 }}>
          {rooms.map((room) => {
            const cfg = statusConfig[room.status] || statusConfig.available;
            const studentNames = (room.students || []).map((s) => s.fullName || "?").slice(0, 2);
            return (
              <button
                key={room._id}
                onClick={() => openRoomDetail(room)}
                style={{
                  position: "relative",
                  border: `1px solid ${cfg.cardBorder}`,
                  borderRadius: 12,
                  padding: "12px 8px",
                  background: cfg.cardBg,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 4,
                  transition: "all 0.2s",
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-2px)"; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
              >
                <span style={{ position: "absolute", top: 8, right: 8, width: 8, height: 8, borderRadius: 999, background: cfg.dot }} />
                <div style={{ width: 32, height: 32, borderRadius: 8, background: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", color: cfg.color, fontSize: 14 }}>
                  <FaDoorOpen />
                </div>
                <div style={{ fontSize: 14, fontWeight: 800, color: "#1E293B" }}>{room.roomNumber}</div>
                <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>
                  <FaUserGraduate style={{ marginRight: 4 }} />
                  {room.currentOccupants || (room.students || []).length}/{room.capacity}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Student Modal (Pop-up inside or overlay) */}
      {selectedRoom && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(15, 23, 42, 0.4)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 9999 }}>
          <div style={{ background: "#FFF", borderRadius: 20, width: "100%", maxWidth: 600, padding: 24, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", maxHeight: "90vh", overflowY: "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
              <h3 style={{ margin: 0, fontSize: 20, color: "#1E293B" }}>Chi tiết Phòng {selectedRoom.roomNumber}</h3>
              <button onClick={() => setSelectedRoom(null)} style={{ background: "none", border: "none", fontSize: 18, cursor: "pointer", color: "#64748B" }}>
                <FaTimes />
              </button>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <h4 style={{ margin: 0, fontSize: 14, color: "#1E293B" }}>Sinh viên trong phòng ({(selectedRoom.students || []).length}/{selectedRoom.capacity})</h4>
              {(selectedRoom.students || []).length < selectedRoom.capacity && (
                <button onClick={toggleAddStudent} style={{ padding: "6px 12px", borderRadius: 8, border: "none", background: showAddStudent ? "#F1F5F9" : "#16A34A", color: showAddStudent ? "#475569" : "#FFF", fontSize: 12, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                  {showAddStudent ? <><FaTimes /> Đóng</> : <><FaUserPlus /> Thêm SV</>}
                </button>
              )}
            </div>

            {showAddStudent && (
              <div style={{ background: "#F0FDF4", borderRadius: 12, padding: 12, marginBottom: 16, border: "1px solid #BBF7D0" }}>
                <input value={studentSearch} onChange={e => { setStudentSearch(e.target.value); searchAvailableStudents(e.target.value); }} placeholder="Tìm theo tên, mã SV..." style={{ width: "100%", padding: "8px 12px", borderRadius: 8, border: "1px solid #86EFAC", outline: "none", marginBottom: 8 }} autoFocus />
                <div style={{ maxHeight: 150, overflowY: "auto" }}>
                  {loadingStudents ? <div style={{ textAlign: "center", fontSize: 12, color: "#64748B" }}>Đang tìm...</div> : availableStudents.map(st => (
                    <div key={st._id} style={{ display: "flex", justifyContent: "space-between", padding: "8px", background: "#FFF", borderRadius: 8, marginBottom: 4, border: "1px solid #E2E8F0" }}>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600 }}>{st.fullName}</div>
                        <div style={{ fontSize: 11, color: "#64748B" }}>{st.studentCode}</div>
                      </div>
                      <button onClick={() => handleAssignStudent(st._id)} disabled={assigning} style={{ background: "#16A34A", color: "#FFF", border: "none", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: assigning ? "not-allowed" : "pointer" }}>Thêm</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ border: "1px solid #E2E8F0", borderRadius: 12, overflow: "hidden" }}>
              {(selectedRoom.students || []).length > 0 ? (
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                  <thead>
                    <tr style={{ background: "#F8FAFC", fontSize: 12, color: "#64748B" }}>
                      <th style={{ padding: "10px 12px" }}>Sinh viên</th>
                      <th style={{ padding: "10px 12px" }}>Giường</th>
                      <th style={{ padding: "10px 12px", textAlign: "center" }}>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedRoom.students || []).map((st, i) => (
                      <tr key={st._id || i} style={{ borderTop: "1px solid #E2E8F0" }}>
                        <td style={{ padding: "10px 12px" }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1E293B" }}>{st.fullName || "N/A"}</div>
                          <div style={{ fontSize: 11, color: "#64748B" }}>{st.studentCode || "N/A"}</div>
                        </td>
                        <td style={{ padding: "10px 12px", fontSize: 12 }}>Giường {st.bedNumber}</td>
                        <td style={{ padding: "10px 12px", textAlign: "center" }}>
                          <button onClick={() => handleRemoveStudent(st._id)} disabled={removing} style={{ background: "#FEE2E2", color: "#EF4444", border: "none", borderRadius: 6, padding: "6px", cursor: removing ? "not-allowed" : "pointer" }}><FaUserMinus /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: 24, textAlign: "center", color: "#94A3B8", fontSize: 13 }}>Phòng trống</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useMemo, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar";
import {
  getAllBuildings,
  createBuilding,
  deleteBuilding,
  seedBuildings,
  getRoomsByBuilding,
  updateRoom,
  getRoomDetail,
  assignStudentToRoom,
  removeStudentFromRoom,
  getAvailableStudents,
} from "../../api/roomService";
import {
  FaBuilding,
  FaPlus,
  FaDoorOpen,
  FaTrashAlt,
  FaSeedling,
  FaTimes,
  FaLayerGroup,
  FaUserGraduate,
  FaSearch,
  FaUserPlus,
  FaUserMinus,
} from "react-icons/fa";
import { Modal } from "antd";
const statusConfig = {
  available: {
    label: "Trống",
    bg: "linear-gradient(135deg, #34d399 0%, #10b981 100%)",
    color: "#fff",
    dot: "#34d399",
    cardBg: "rgba(52, 211, 153, 0.10)",
    cardBorder: "rgba(52, 211, 153, 0.25)",
  },
  occupied: {
    label: "Đang ở",
    bg: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
    color: "#fff",
    dot: "#3b82f6",
    cardBg: "rgba(59, 130, 246, 0.10)",
    cardBorder: "rgba(59, 130, 246, 0.25)",
  },
  maintenance: {
    label: "Bảo trì",
    bg: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    color: "#fff",
    dot: "#f59e0b",
    cardBg: "rgba(245, 158, 11, 0.10)",
    cardBorder: "rgba(245, 158, 11, 0.25)",
  },
};

function RoomManagement() {
  const [buildings, setBuildings] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(1);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBuildingName, setNewBuildingName] = useState("");
  const [newBuildingDesc, setNewBuildingDesc] = useState("");
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [updatingRoom, setUpdatingRoom] = useState(false);
  const [editStatus, setEditStatus] = useState("");
  const [editCapacity, setEditCapacity] = useState(4);

  // Student assignment states
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);
const { confirm } = Modal;
  // Fetch buildings
  const fetchBuildings = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getAllBuildings();
      const data = res.data || [];
      setBuildings(data);
      if (data.length > 0 && !selectedBuilding) {
        setSelectedBuilding(data[0]);
      }
    } catch (error) {
      console.error("Error fetching buildings:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch rooms by building + floor
  const fetchRooms = useCallback(async () => {
    if (!selectedBuilding) return;
    try {
      setLoadingRooms(true);
      const res = await getRoomsByBuilding(selectedBuilding._id, selectedFloor);
      setRooms(res.data || []);
    } catch (error) {
      console.error("Error fetching rooms:", error);
    } finally {
      setLoadingRooms(false);
    }
  }, [selectedBuilding, selectedFloor]);

  useEffect(() => {
    fetchBuildings();
  }, [fetchBuildings]);

  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  // Summary stats
  const totalStats = useMemo(() => {
    const total = buildings.reduce((sum, b) => sum + (b.totalRooms || 0), 0);
    const available = buildings.reduce(
      (sum, b) => sum + (b.availableRooms || 0),
      0
    );
    const occupied = buildings.reduce(
      (sum, b) => sum + (b.occupiedRooms || 0),
      0
    );
    const maintenance = buildings.reduce(
      (sum, b) => sum + (b.maintenanceRooms || 0),
      0
    );
    return { total, available, occupied, maintenance };
  }, [buildings]);

  // Seed buildings
  const handleSeed = async () => {
    try {
      setSeeding(true);
      await seedBuildings();
      await fetchBuildings();
    } catch (error) {
      console.error("Seed error:", error);
      alert(error.response?.data?.message || "Lỗi khởi tạo dữ liệu");
    } finally {
      setSeeding(false);
    }
  };

  // Create building
  const handleCreate = async () => {
    if (!newBuildingName.trim()) return;
    try {
      setCreating(true);
      await createBuilding({
        name: newBuildingName.trim(),
        description: newBuildingDesc.trim(),
      });
      setShowCreateModal(false);
      setNewBuildingName("");
      setNewBuildingDesc("");
      await fetchBuildings();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi tạo tòa nhà");
    } finally {
      setCreating(false);
    }
  };

  // Delete building
  const handleDelete = async (id) => {
    try {
      setDeleting(true);
      await deleteBuilding(id);
      setShowDeleteConfirm(null);
      if (selectedBuilding?._id === id) {
        setSelectedBuilding(null);
        setRooms([]);
      }
      await fetchBuildings();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi xóa tòa nhà");
    } finally {
      setDeleting(false);
    }
  };

  // Update room
  const handleUpdateRoom = async () => {
    if (!selectedRoom) return;
    try {
      setUpdatingRoom(true);
      await updateRoom(selectedRoom._id, {
        status: editStatus,
        capacity: editCapacity,
      });
      setSelectedRoom(null);
      await fetchRooms();
      await fetchBuildings();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi cập nhật phòng");
    } finally {
      setUpdatingRoom(false);
    }
  };

  // Open room detail — fetch full detail with students
  const openRoomDetail = async (room) => {
    try {
      const res = await getRoomDetail(room._id);
      const fullRoom = res.data;
      setSelectedRoom(fullRoom);
      setEditStatus(fullRoom.status);
      setEditCapacity(fullRoom.capacity);
      setShowAddStudent(false);
      setStudentSearch("");
      setAvailableStudents([]);
    } catch (error) {
      console.error("Error fetching room detail:", error);
      // Fallback to basic room data
      setSelectedRoom(room);
      setEditStatus(room.status);
      setEditCapacity(room.capacity);
    }
  };

  // Search available students
  const searchAvailableStudents = async (keyword) => {
    try {
      setLoadingStudents(true);
      const res = await getAvailableStudents(keyword);
      setAvailableStudents(res.data || []);
    } catch (error) {
      console.error("Error searching students:", error);
    } finally {
      setLoadingStudents(false);
    }
  };

  // Toggle add student panel
  const toggleAddStudent = () => {
    if (!showAddStudent) {
      searchAvailableStudents("");
    }
    setShowAddStudent(!showAddStudent);
    setStudentSearch("");
  };

  // Assign student to room
  const handleAssignStudent = async (studentId) => {
    if (!selectedRoom) return;
    try {
      setAssigning(true);
      const res = await assignStudentToRoom(selectedRoom._id, studentId);
      setSelectedRoom(res.data);
      // Refresh available students list
      searchAvailableStudents(studentSearch);
      await fetchRooms();
      await fetchBuildings();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi thêm sinh viên");
    } finally {
      setAssigning(false);
    }
  };

  // Remove student from room
const handleRemoveStudent = (studentId) => {
  if (!selectedRoom) return;

  confirm({
    title: "Xác nhận",
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
        await fetchBuildings();
      } catch (error) {
        alert(error.response?.data?.message || "Lỗi xóa sinh viên");
      } finally {
        setRemoving(false);
      }
    },
  });
};

  // Select building
  const selectBuilding = (building) => {
    setSelectedBuilding(building);
    setSelectedFloor(1);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #f8fbff 0%, #f3f8f6 100%)",
      }}
    >
      <Sidebar />

      <main
        style={{
          marginLeft: 270,
          width: "calc(100% - 270px)",
          padding: "24px 28px 32px",
          minHeight: "100vh",
        }}
      >
        {/* Header */}
        <div
          style={{
            marginBottom: 24,
            background: "rgba(255,255,255,0.72)",
            border: "1px solid rgba(148, 163, 184, 0.16)",
            borderRadius: 24,
            padding: "22px 24px",
            boxShadow: "0 10px 28px rgba(15, 23, 42, 0.05)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 16,
          }}
        >
          <div>
            <h1 style={{ fontSize: 34, color: "#1e4f8f", margin: 0 }}>
              <FaBuilding
                style={{ marginRight: 12, verticalAlign: "middle" }}
              />
              Quản lý phòng ở
            </h1>
            <p style={{ color: "#64748b", marginBottom: 0, marginTop: 6 }}>
              Quản lý tòa nhà, tầng và phòng trong ký túc xá.
            </p>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            {buildings.length === 0 && (
              <button
                onClick={handleSeed}
                disabled={seeding}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  background: seeding
                    ? "#94a3b8"
                    : "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)",
                  color: "#fff",
                  border: "none",
                  borderRadius: 14,
                  padding: "12px 20px",
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: seeding ? "not-allowed" : "pointer",
                  boxShadow: "0 8px 20px rgba(124, 58, 237, 0.22)",
                  transition: "all 0.3s ease",
                }}
              >
                <FaSeedling />
                {seeding ? "Đang khởi tạo..." : "Khởi tạo A, B, C, D"}
              </button>
            )}
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background:
                  "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                color: "#fff",
                border: "none",
                borderRadius: 14,
                padding: "12px 20px",
                fontWeight: 700,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 8px 20px rgba(22, 163, 74, 0.22)",
                transition: "all 0.3s ease",
              }}
            >
              <FaPlus />
              Tạo tòa mới
            </button>
          </div>
        </div>

        {/* Summary Cards */}
        <section
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <SummaryCard
            title="Tổng tòa nhà"
            value={buildings.length}
            icon={<FaBuilding />}
            gradient="linear-gradient(135deg, #6366f1 0%, #818cf8 100%)"
          />
          <SummaryCard
            title="Tổng phòng"
            value={totalStats.total}
            icon={<FaDoorOpen />}
            gradient="linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)"
          />
          <SummaryCard
            title="Phòng trống"
            value={totalStats.available}
            icon={<FaDoorOpen />}
            gradient="linear-gradient(135deg, #22c55e 0%, #4ade80 100%)"
          />
          <SummaryCard
            title="Đang ở"
            value={totalStats.occupied}
            icon={<FaDoorOpen />}
            gradient="linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)"
          />
        </section>

        {/* Main Content */}
        <section
          style={{
            background: "rgba(255,255,255,0.82)",
            borderRadius: 24,
            padding: 24,
            boxShadow: "0 16px 42px rgba(15, 23, 42, 0.07)",
            border: "1px solid rgba(148, 163, 184, 0.15)",
            backdropFilter: "blur(8px)",
          }}
        >
          {loading ? (
            <div
              style={{ padding: 40, textAlign: "center", color: "#64748b" }}
            >
              Đang tải dữ liệu...
            </div>
          ) : buildings.length === 0 ? (
            <div
              style={{
                padding: 60,
                textAlign: "center",
                color: "#94a3b8",
              }}
            >
              <FaBuilding
                style={{ fontSize: 48, marginBottom: 16, opacity: 0.4 }}
              />
              <div style={{ fontSize: 18, fontWeight: 600 }}>
                Chưa có tòa nhà nào
              </div>
              <div style={{ marginTop: 8, fontSize: 14 }}>
                Bấm &quot;Khởi tạo A, B, C, D&quot; hoặc &quot;Tạo tòa
                mới&quot; để bắt đầu.
              </div>
            </div>
          ) : (
            <>
              {/* Building Tabs */}
              <div style={{ marginBottom: 20 }}>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: 700,
                    color: "#94a3b8",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}
                >
                  Chọn tòa nhà
                </div>
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {buildings.map((b) => {
                    const isActive = selectedBuilding?._id === b._id;
                    return (
                      <div
                        key={b._id}
                        style={{
                          position: "relative",
                          display: "flex",
                          alignItems: "center",
                        }}
                      >
                        <button
                          onClick={() => selectBuilding(b)}
                          style={{
                            padding: "12px 28px",
                            borderRadius: 16,
                            border: isActive
                              ? "2px solid #22c55e"
                              : "2px solid rgba(148, 163, 184, 0.2)",
                            background: isActive
                              ? "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)"
                              : "rgba(255,255,255,0.8)",
                            color: isActive ? "#fff" : "#334155",
                            fontWeight: 800,
                            fontSize: 16,
                            cursor: "pointer",
                            transition: "all 0.3s ease",
                            boxShadow: isActive
                              ? "0 8px 24px rgba(34, 197, 94, 0.3)"
                              : "0 2px 8px rgba(15, 23, 42, 0.06)",
                            display: "flex",
                            alignItems: "center",
                            gap: 8,
                          }}
                        >
                          <FaBuilding style={{ fontSize: 14 }} />
                          Tòa {b.name}
                          <span
                            style={{
                              fontSize: 11,
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: isActive
                                ? "rgba(255,255,255,0.25)"
                                : "rgba(34, 197, 94, 0.1)",
                              color: isActive ? "#fff" : "#16a34a",
                              fontWeight: 700,
                            }}
                          >
                            {b.totalRooms || 0}
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDeleteConfirm(b);
                          }}
                          title={`Xóa tòa ${b.name}`}
                          style={{
                            position: "absolute",
                            top: -6,
                            right: -6,
                            width: 22,
                            height: 22,
                            borderRadius: 999,
                            border: "none",
                            background: "#ef4444",
                            color: "#fff",
                            fontSize: 10,
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            boxShadow: "0 2px 6px rgba(239, 68, 68, 0.4)",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <FaTimes />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Floor Tabs */}
              {selectedBuilding && (
                <div style={{ marginBottom: 24 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#94a3b8",
                      textTransform: "uppercase",
                      letterSpacing: 1,
                      marginBottom: 10,
                    }}
                  >
                    <FaLayerGroup
                      style={{ marginRight: 6, verticalAlign: "middle" }}
                    />
                    Chọn tầng — Tòa {selectedBuilding.name}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[1, 2, 3, 4, 5].map((floor) => {
                      const isActive = selectedFloor === floor;
                      return (
                        <button
                          key={floor}
                          onClick={() => setSelectedFloor(floor)}
                          style={{
                            padding: "10px 24px",
                            borderRadius: 12,
                            border: isActive
                              ? "2px solid #3b82f6"
                              : "2px solid rgba(148, 163, 184, 0.18)",
                            background: isActive
                              ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                              : "#fff",
                            color: isActive ? "#fff" : "#475569",
                            fontWeight: 700,
                            fontSize: 14,
                            cursor: "pointer",
                            transition: "all 0.25s ease",
                            boxShadow: isActive
                              ? "0 6px 18px rgba(59, 130, 246, 0.28)"
                              : "0 1px 4px rgba(15, 23, 42, 0.04)",
                          }}
                        >
                          Tầng {floor}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Room Grid */}
              {selectedBuilding && (
                <div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <h3
                      style={{
                        margin: 0,
                        fontSize: 18,
                        color: "#1e293b",
                        fontWeight: 700,
                      }}
                    >
                      Phòng — Tòa {selectedBuilding.name} — Tầng{" "}
                      {selectedFloor}
                    </h3>
                    <div style={{ display: "flex", gap: 16 }}>
                      {Object.entries(statusConfig).map(([key, cfg]) => (
                        <div
                          key={key}
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            fontSize: 13,
                            color: "#64748b",
                            fontWeight: 600,
                          }}
                        >
                          <span
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: 999,
                              background: cfg.dot,
                              display: "inline-block",
                            }}
                          />
                          {cfg.label}
                        </div>
                      ))}
                    </div>
                  </div>

                  {loadingRooms ? (
                    <div
                      style={{
                        padding: 40,
                        textAlign: "center",
                        color: "#94a3b8",
                      }}
                    >
                      Đang tải danh sách phòng...
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(7, 1fr)",
                        gap: 14,
                      }}
                    >
                      {rooms.map((room) => {
                        const cfg =
                          statusConfig[room.status] || statusConfig.available;
                        const studentNames = (room.students || [])
                          .map((s) => s.fullName || s.studentCode || "?")
                          .slice(0, 2);
                        return (
                          <button
                            key={room._id}
                            onClick={() => openRoomDetail(room)}
                            style={{
                              position: "relative",
                              border: `2px solid ${cfg.cardBorder}`,
                              borderRadius: 18,
                              padding: "16px 10px 14px",
                              background: cfg.cardBg,
                              cursor: "pointer",
                              transition:
                                "all 0.3s cubic-bezier(.4,0,.2,1)",
                              display: "flex",
                              flexDirection: "column",
                              alignItems: "center",
                              gap: 6,
                              backdropFilter: "blur(6px)",
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(-4px) scale(1.03)";
                              e.currentTarget.style.boxShadow = `0 12px 28px ${cfg.cardBorder}`;
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.transform =
                                "translateY(0) scale(1)";
                              e.currentTarget.style.boxShadow = "none";
                            }}
                          >
                            {/* Status dot */}
                            <span
                              style={{
                                position: "absolute",
                                top: 10,
                                right: 10,
                                width: 10,
                                height: 10,
                                borderRadius: 999,
                                background: cfg.dot,
                                boxShadow: `0 0 8px ${cfg.dot}`,
                              }}
                            />
                            {/* Room icon */}
                            <div
                              style={{
                                width: 40,
                                height: 40,
                                borderRadius: 12,
                                background: cfg.bg,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                color: cfg.color,
                                fontSize: 18,
                                boxShadow: `0 4px 12px ${cfg.cardBorder}`,
                              }}
                            >
                              <FaDoorOpen />
                            </div>
                            {/* Room number */}
                            <div
                              style={{
                                fontSize: 15,
                                fontWeight: 800,
                                color: "#1e293b",
                              }}
                            >
                              {room.roomNumber}
                            </div>
                            {/* Occupancy */}
                            <div
                              style={{
                                fontSize: 11,
                                color: "#64748b",
                                fontWeight: 600,
                              }}
                            >
                              <FaUserGraduate
                                style={{
                                  fontSize: 10,
                                  marginRight: 3,
                                  verticalAlign: "middle",
                                }}
                              />
                              {room.currentOccupants || (room.students || []).length}/{room.capacity}
                            </div>
                            {/* Student names preview */}
                            {studentNames.length > 0 && (
                              <div
                                style={{
                                  fontSize: 10,
                                  color: "#94a3b8",
                                  textAlign: "center",
                                  lineHeight: 1.4,
                                  maxWidth: "100%",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {studentNames.join(", ")}
                                {(room.students || []).length > 2 && "..."}
                              </div>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* ===== MODALS ===== */}

      {/* Create Building Modal */}
      {showCreateModal && (
        <ModalOverlay onClose={() => !creating && setShowCreateModal(false)}>
          <div style={{ maxWidth: 480, width: "100%" }}>
            <ModalCard>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "start",
                }}
              >
                <div>
                  <h2 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>
                    <FaPlus
                      style={{
                        marginRight: 10,
                        color: "#22c55e",
                        fontSize: 18,
                      }}
                    />
                    Tạo tòa nhà mới
                  </h2>
                  <p
                    style={{
                      margin: "6px 0 0",
                      color: "#64748b",
                      fontSize: 14,
                    }}
                  >
                    Hệ thống sẽ tự động tạo 5 tầng × 14 phòng (70 phòng).
                  </p>
                </div>
                <CloseButton
                  onClick={() => !creating && setShowCreateModal(false)}
                />
              </div>

              <div style={{ marginTop: 20 }}>
                <label style={labelStyle}>Tên tòa nhà *</label>
                <input
                  value={newBuildingName}
                  onChange={(e) => setNewBuildingName(e.target.value)}
                  placeholder="VD: E, F, G..."
                  maxLength={5}
                  style={inputStyle}
                  autoFocus
                />

                <label style={{ ...labelStyle, marginTop: 14 }}>
                  Mô tả (tùy chọn)
                </label>
                <input
                  value={newBuildingDesc}
                  onChange={(e) => setNewBuildingDesc(e.target.value)}
                  placeholder="Mô tả ngắn..."
                  style={inputStyle}
                />
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 12,
                  marginTop: 24,
                }}
              >
                <ActionButton
                  onClick={() => setShowCreateModal(false)}
                  disabled={creating}
                  variant="secondary"
                >
                  Hủy
                </ActionButton>
                <ActionButton
                  onClick={handleCreate}
                  disabled={creating || !newBuildingName.trim()}
                  variant="primary"
                >
                  {creating ? "Đang tạo..." : "Tạo tòa nhà"}
                </ActionButton>
              </div>
            </ModalCard>
          </div>
        </ModalOverlay>
      )}

      {/* Delete Confirm Modal */}
      {showDeleteConfirm && (
        <ModalOverlay
          onClose={() => !deleting && setShowDeleteConfirm(null)}
        >
          <ModalCard style={{ maxWidth: 440 }}>
            <h2
              style={{
                margin: 0,
                fontSize: 22,
                color: "#dc2626",
              }}
            >
              <FaTrashAlt style={{ marginRight: 10, fontSize: 18 }} />
              Xác nhận xóa
            </h2>
            <p style={{ color: "#475569", marginTop: 12, lineHeight: 1.7 }}>
              Bạn có chắc chắn muốn xóa{" "}
              <strong>Tòa {showDeleteConfirm.name}</strong> cùng tất cả{" "}
              <strong>{showDeleteConfirm.totalRooms || 70} phòng</strong> liên
              quan?
            </p>
            <p
              style={{
                color: "#ef4444",
                fontSize: 13,
                fontWeight: 600,
                background: "#fef2f2",
                padding: "10px 14px",
                borderRadius: 12,
                border: "1px solid #fecaca",
              }}
            >
              ⚠️ Hành động này không thể hoàn tác!
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 20,
              }}
            >
              <ActionButton
                onClick={() => setShowDeleteConfirm(null)}
                disabled={deleting}
                variant="secondary"
              >
                Hủy
              </ActionButton>
              <ActionButton
                onClick={() => handleDelete(showDeleteConfirm._id)}
                disabled={deleting}
                variant="danger"
              >
                {deleting ? "Đang xóa..." : "Xóa tòa nhà"}
              </ActionButton>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}

      {/* Room Detail Modal with Students */}
      {selectedRoom && (
        <ModalOverlay
          onClose={() => !updatingRoom && setSelectedRoom(null)}
        >
          <ModalCard style={{ maxWidth: 600 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
              }}
            >
              <div>
                <h2 style={{ margin: 0, fontSize: 22, color: "#0f172a" }}>
                  <FaDoorOpen
                    style={{
                      marginRight: 10,
                      color: "#3b82f6",
                      fontSize: 18,
                    }}
                  />
                  Chi tiết phòng {selectedRoom.roomNumber}
                </h2>
                <p
                  style={{
                    margin: "6px 0 0",
                    color: "#64748b",
                    fontSize: 14,
                  }}
                >
                  {selectedRoom.displayName}
                </p>
              </div>
              <CloseButton
                onClick={() => !updatingRoom && setSelectedRoom(null)}
              />
            </div>

            {/* Room Info */}
            <div
              style={{
                marginTop: 20,
                background: "#f8fafc",
                borderRadius: 16,
                padding: 18,
                border: "1px solid #e2e8f0",
              }}
            >
              <InfoRow
                label="Tòa nhà"
                value={`Tòa ${selectedBuilding?.name || ""}`}
              />
              <InfoRow label="Tầng" value={`Tầng ${selectedRoom.floor}`} />
              <InfoRow label="Số phòng" value={selectedRoom.roomNumber} />
              <InfoRow
                label="Số người hiện tại"
                value={`${(selectedRoom.students || []).length}/${selectedRoom.capacity}`}
              />
            </div>

            {/* ===== STUDENTS IN ROOM ===== */}
            <div style={{ marginTop: 20 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: 16,
                    color: "#1e293b",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <FaUserGraduate style={{ color: "#3b82f6" }} />
                  Sinh viên trong phòng ({(selectedRoom.students || []).length}/
                  {selectedRoom.capacity})
                </h3>
                {(selectedRoom.students || []).length <
                  selectedRoom.capacity && (
                  <button
                    onClick={toggleAddStudent}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      padding: "8px 14px",
                      borderRadius: 10,
                      border: "none",
                      background: showAddStudent
                        ? "#f1f5f9"
                        : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                      color: showAddStudent ? "#475569" : "#fff",
                      fontWeight: 700,
                      fontSize: 12,
                      cursor: "pointer",
                      transition: "all 0.2s ease",
                    }}
                  >
                    {showAddStudent ? (
                      <>
                        <FaTimes /> Đóng
                      </>
                    ) : (
                      <>
                        <FaUserPlus /> Thêm SV
                      </>
                    )}
                  </button>
                )}
              </div>

              {/* Current Students List */}
              {(selectedRoom.students || []).length > 0 ? (
                <div
                  style={{
                    borderRadius: 14,
                    border: "1px solid #e2e8f0",
                    overflow: "hidden",
                  }}
                >
                  <table
                    style={{
                      width: "100%",
                      borderCollapse: "collapse",
                      background: "#fff",
                    }}
                  >
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        <th style={thStyle}>Mã SV</th>
                        <th style={thStyle}>Họ tên</th>
                        <th style={thStyle}>SĐT</th>
                        <th style={{ ...thStyle, textAlign: "center" }}>
                          Thao tác
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {(selectedRoom.students || []).map((student, idx) => (
                        <tr
                          key={student._id || idx}
                          style={{
                            borderBottom:
                              idx < (selectedRoom.students || []).length - 1
                                ? "1px solid #f1f5f9"
                                : "none",
                          }}
                        >
                          <td style={tdStyle}>
                            <span
                              style={{
                                background: "rgba(16, 185, 129, 0.1)",
                                color: "#059669",
                                padding: "3px 8px",
                                borderRadius: 6,
                                fontWeight: 700,
                                fontSize: 12,
                                marginRight: 8,
                              }}
                            >
                              Giường {student.bedNumber}
                            </span>
                            <span
                              style={{
                                background: "rgba(59, 130, 246, 0.1)",
                                color: "#2563eb",
                                padding: "3px 8px",
                                borderRadius: 6,
                                fontWeight: 700,
                                fontSize: 12,
                              }}
                            >
                              {student.studentCode || "N/A"}
                            </span>
                          </td>
                          <td style={tdStyle}>
                            <div style={{ fontWeight: 600, color: "#1e293b" }}>
                              {student.fullName || "N/A"}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                              }}
                            >
                              {student.email || ""}
                            </div>
                          </td>
                          <td style={tdStyle}>
                            {student.phone || "Chưa có"}
                          </td>
                          <td style={{ ...tdStyle, textAlign: "center" }}>
                            <button
                              onClick={() =>
                                handleRemoveStudent(student._id)
                              }
                              disabled={removing}
                              title="Xóa khỏi phòng"
                              style={{
                                width: 32,
                                height: 32,
                                borderRadius: 8,
                                border: "none",
                                background: "rgba(239, 68, 68, 0.1)",
                                color: "#ef4444",
                                cursor: removing
                                  ? "not-allowed"
                                  : "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                justifyContent: "center",
                                transition: "all 0.2s ease",
                              }}
                            >
                              <FaUserMinus style={{ fontSize: 13 }} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div
                  style={{
                    padding: "24px 16px",
                    textAlign: "center",
                    color: "#94a3b8",
                    background: "#f8fafc",
                    borderRadius: 14,
                    border: "1px dashed #e2e8f0",
                  }}
                >
                  <FaUserGraduate
                    style={{
                      fontSize: 24,
                      marginBottom: 8,
                      opacity: 0.4,
                    }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 600 }}>
                    Chưa có sinh viên nào trong phòng
                  </div>
                </div>
              )}

              {/* Add Student Panel */}
              {showAddStudent && (
                <div
                  style={{
                    marginTop: 14,
                    background: "#f0fdf4",
                    borderRadius: 14,
                    padding: 16,
                    border: "1px solid rgba(34, 197, 94, 0.2)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: "#16a34a",
                      marginBottom: 10,
                    }}
                  >
                    <FaSearch
                      style={{ marginRight: 6, verticalAlign: "middle" }}
                    />
                    Tìm sinh viên chưa có phòng
                  </div>
                  <input
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      searchAvailableStudents(e.target.value);
                    }}
                    placeholder="Tìm theo tên, mã SV, email..."
                    style={{
                      ...inputStyle,
                      background: "#fff",
                      border: "1px solid rgba(34, 197, 94, 0.3)",
                    }}
                    autoFocus
                  />

                  <div
                    style={{
                      marginTop: 10,
                      maxHeight: 200,
                      overflowY: "auto",
                      borderRadius: 10,
                    }}
                  >
                    {loadingStudents ? (
                      <div
                        style={{
                          padding: 16,
                          textAlign: "center",
                          color: "#94a3b8",
                          fontSize: 13,
                        }}
                      >
                        Đang tìm kiếm...
                      </div>
                    ) : availableStudents.length === 0 ? (
                      <div
                        style={{
                          padding: 16,
                          textAlign: "center",
                          color: "#94a3b8",
                          fontSize: 13,
                        }}
                      >
                        Không tìm thấy sinh viên phù hợp
                      </div>
                    ) : (
                      availableStudents.map((student) => (
                        <div
                          key={student._id}
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            padding: "10px 12px",
                            background: "#fff",
                            borderRadius: 10,
                            marginBottom: 6,
                            border: "1px solid #e2e8f0",
                            transition: "all 0.2s ease",
                          }}
                        >
                          <div>
                            <div
                              style={{
                                fontWeight: 700,
                                fontSize: 13,
                                color: "#1e293b",
                              }}
                            >
                              {student.fullName}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: "#94a3b8",
                                marginTop: 2,
                              }}
                            >
                              {student.studentCode} •{" "}
                              {student.email}
                            </div>
                          </div>
                          <button
                            onClick={() =>
                              handleAssignStudent(student._id)
                            }
                            disabled={assigning}
                            style={{
                              padding: "6px 12px",
                              borderRadius: 8,
                              border: "none",
                              background:
                                "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                              color: "#fff",
                              fontWeight: 700,
                              fontSize: 11,
                              cursor: assigning
                                ? "not-allowed"
                                : "pointer",
                              display: "flex",
                              alignItems: "center",
                              gap: 4,
                              transition: "all 0.2s ease",
                            }}
                          >
                            <FaPlus style={{ fontSize: 10 }} />
                            Thêm
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Edit Fields */}
            <div style={{ marginTop: 20 }}>
              <label style={labelStyle}>Trạng thái (Hệ thống tự nhận diện Trống/Đang ở)</label>
              <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
                {Object.entries(statusConfig).map(([key, cfg]) => {
                  const hasStudents = (selectedRoom.students || []).length > 0;
                  const isDisabled = key === "maintenance" ? hasStudents : (editStatus === "maintenance" ? false : key !== editStatus);
                  const isSelected = editStatus === key;

                  return (
                    <button
                      key={key}
                      onClick={() => setEditStatus(key)}
                      disabled={isDisabled}
                      title={key === "maintenance" && hasStudents ? "Phòng đang có người, không thể bảo trì" : ""}
                      style={{
                        flex: 1,
                        padding: "10px 12px",
                        borderRadius: 12,
                        border: isSelected ? `2px solid ${cfg.dot}` : "2px solid #e2e8f0",
                        background: isSelected ? cfg.cardBg : isDisabled ? "#f1f5f9" : "#fff",
                        color: isSelected ? cfg.dot : isDisabled ? "#cbd5e1" : "#64748b",
                        fontWeight: 700,
                        fontSize: 13,
                        cursor: isDisabled ? "not-allowed" : "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <span
                        style={{
                          width: 8,
                          height: 8,
                          borderRadius: 999,
                          background: isDisabled && !isSelected ? "#cbd5e1" : cfg.dot,
                        }}
                      />
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 12,
                marginTop: 24,
              }}
            >
              <ActionButton
                onClick={() => setSelectedRoom(null)}
                disabled={updatingRoom}
                variant="secondary"
              >
                Đóng
              </ActionButton>
              <ActionButton
                onClick={handleUpdateRoom}
                disabled={updatingRoom}
                variant="primary"
              >
                {updatingRoom ? "Đang lưu..." : "Lưu thay đổi"}
              </ActionButton>
            </div>
          </ModalCard>
        </ModalOverlay>
      )}
    </div>
  );
}

/* ===== SHARED COMPONENTS ===== */

function SummaryCard({ title, value, icon, gradient }) {
  return (
    <div
      style={{
        background:
          "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.96) 100%)",
        borderRadius: 20,
        padding: "20px 22px",
        boxShadow: "0 10px 30px rgba(15, 23, 42, 0.06)",
        border: "1px solid rgba(148, 163, 184, 0.15)",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 50,
          height: 50,
          borderRadius: 16,
          background: gradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "#fff",
          fontSize: 20,
          flexShrink: 0,
          boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ color: "#64748b", fontWeight: 700, fontSize: 13 }}>
          {title}
        </div>
        <div
          style={{
            marginTop: 4,
            fontSize: 28,
            fontWeight: 800,
            color: "#0f172a",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

function ModalOverlay({ children, onClose }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(15, 23, 42, 0.55)",
        backdropFilter: "blur(4px)",
        display: "grid",
        placeItems: "center",
        zIndex: 1000,
        padding: 20,
        overflowY: "auto",
      }}
    >
      <div onClick={(e) => e.stopPropagation()}>{children}</div>
    </div>
  );
}

function ModalCard({ children, style }) {
  return (
    <div
      style={{
        width: "100%",
        maxWidth: 500,
        background: "#fff",
        borderRadius: 24,
        padding: 28,
        boxShadow: "0 24px 80px rgba(15, 23, 42, 0.28)",
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CloseButton({ onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: 36,
        height: 36,
        borderRadius: 999,
        border: "none",
        background: "#f1f5f9",
        color: "#475569",
        fontSize: 18,
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.2s ease",
        flexShrink: 0,
      }}
    >
      ×
    </button>
  );
}

function ActionButton({ children, onClick, disabled, variant = "primary" }) {
  const styles = {
    primary: {
      background: disabled
        ? "#93c5fd"
        : "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
      color: "#fff",
      border: "none",
      boxShadow: disabled ? "none" : "0 8px 20px rgba(37, 99, 235, 0.2)",
    },
    secondary: {
      background: "#fff",
      color: "#475569",
      border: "1px solid #e2e8f0",
      boxShadow: "none",
    },
    danger: {
      background: disabled
        ? "#fca5a5"
        : "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
      color: "#fff",
      border: "none",
      boxShadow: disabled ? "none" : "0 8px 20px rgba(239, 68, 68, 0.2)",
    },
  };

  const s = styles[variant];

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        minWidth: 110,
        height: 46,
        borderRadius: 14,
        fontWeight: 800,
        fontSize: 14,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 0.25s ease",
        ...s,
      }}
    >
      {children}
    </button>
  );
}

function InfoRow({ label, value }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "10px 0",
        borderBottom: "1px solid #e2e8f0",
        gap: 12,
        alignItems: "center",
      }}
    >
      <span style={{ color: "#64748b", fontWeight: 600, fontSize: 14 }}>
        {label}
      </span>
      <span style={{ color: "#0f172a", fontWeight: 700, fontSize: 14 }}>
        {value}
      </span>
    </div>
  );
}

const labelStyle = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#475569",
  marginBottom: 6,
};

const inputStyle = {
  width: "100%",
  height: 46,
  borderRadius: 14,
  border: "1px solid #d7e0ea",
  padding: "0 16px",
  fontSize: 14,
  background: "#fdfefe",
  outline: "none",
  boxSizing: "border-box",
  boxShadow: "inset 0 1px 2px rgba(15, 23, 42, 0.02)",
};

const thStyle = {
  padding: "10px 12px",
  fontSize: 12,
  fontWeight: 700,
  color: "#64748b",
  textAlign: "left",
  borderBottom: "1px solid #e2e8f0",
};

const tdStyle = {
  padding: "10px 12px",
  fontSize: 13,
  color: "#475569",
  verticalAlign: "middle",
};

export default RoomManagement;

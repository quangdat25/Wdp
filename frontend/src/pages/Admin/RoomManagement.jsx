import { useCallback, useEffect, useMemo, useState } from "react";
import { Modal } from "antd";
import {
  FaBell,
  FaBuilding,
  FaChevronRight,
  FaDoorOpen,
  FaLayerGroup,
  FaPlus,
  FaSearch,
  FaSeedling,
  FaTimes,
  FaTrashAlt,
  FaUserGraduate,
  FaUserMinus,
  FaUserPlus,
  FaUsers,
  FaWrench,
} from "react-icons/fa";
import Sidebar from "../../components/Sidebar";
import {
  assignStudentToRoom,
  createBuilding,
  deleteBuilding,
  getAllBuildings,
  getAvailableStudents,
  getRoomDetail,
  getRoomsByBuilding,
  removeStudentFromRoom,
  seedBuildings,
  updateRoom,
} from "../../api/roomService";
import "./RoomManagement.css";

const statusConfig = {
  available: {
    label: "Trống",
    icon: "○",
    tone: "empty",
  },
  occupied: {
    label: "Đang ở",
    icon: "●",
    tone: "occupied",
  },
  maintenance: {
    label: "Bảo trì",
    icon: "⚙",
    tone: "maintenance",
  },
};

const floors = [1, 2, 3, 4, 5];

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
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [availableStudents, setAvailableStudents] = useState([]);
  const [studentSearch, setStudentSearch] = useState("");
  const [loadingStudents, setLoadingStudents] = useState(false);
  const [assigning, setAssigning] = useState(false);
  const [removing, setRemoving] = useState(false);

  const { confirm } = Modal;

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
      setSelectedRoom(room);
      setEditStatus(room.status);
      setEditCapacity(room.capacity);
    }
  };

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

  const toggleAddStudent = () => {
    if (!showAddStudent) {
      searchAvailableStudents("");
    }
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
      await fetchBuildings();
    } catch (error) {
      alert(error.response?.data?.message || "Lỗi thêm sinh viên");
    } finally {
      setAssigning(false);
    }
  };

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

  const selectBuilding = (building) => {
    setSelectedBuilding(building);
    setSelectedFloor(1);
  };

  return (
    <div className="room-admin-page">
      <Sidebar />

      <main className="room-admin-main">
        <TopBar />

        <div className="room-admin-scroll">
          <section className="room-page-head">
            <div>
              <nav className="room-breadcrumb">
                <span>Trang chủ</span>
                <FaChevronRight />
                <span>Quản lý cơ sở vật chất</span>
                <FaChevronRight />
                <strong>Quản lý phòng ở</strong>
              </nav>
              <div className="room-title-row">
                <span className="room-title-icon">
                  <FaBuilding />
                </span>
                <h1>Quản lý phòng ở</h1>
              </div>
            </div>

            <div className="room-head-actions">
              {buildings.length === 0 && (
                <button
                  className="room-btn room-btn-muted"
                  onClick={handleSeed}
                  disabled={seeding}
                  type="button"
                >
                  <FaSeedling />
                  {seeding ? "Đang khởi tạo..." : "Khởi tạo A, B, C, D"}
                </button>
              )}
              <button
                className="room-btn room-btn-primary"
                onClick={() => setShowCreateModal(true)}
                type="button"
              >
                <FaPlus />
                Tạo tòa mới
              </button>
            </div>
          </section>

          <section className="room-stat-grid">
            <SummaryCard title="Tổng tòa nhà" value={buildings.length} icon={<FaBuilding />} />
            <SummaryCard title="Tổng phòng" value={totalStats.total} icon={<FaDoorOpen />} />
            <SummaryCard title="Phòng trống" value={totalStats.available} icon={<FaDoorOpen />} active />
            <SummaryCard title="Đang ở" value={totalStats.occupied} icon={<FaUsers />} />
          </section>

          <section className="room-filter-card">
            <div className="room-filter-head">
              <h2>Bộ lọc &amp; Phân loại</h2>
              <div className="room-legend">
                <LegendDot tone="occupied" label="Đang ở" />
                <LegendDot tone="maintenance" label="Bảo trì" />
                <LegendDot tone="empty" label="Còn trống" />
              </div>
            </div>

            <div className="room-filter-body">
              {loading ? (
                <EmptyState icon={<FaBuilding />} title="Đang tải dữ liệu..." />
              ) : buildings.length === 0 ? (
                <EmptyState
                  icon={<FaBuilding />}
                  title="Chưa có tòa nhà nào"
                  note='Bấm "Khởi tạo A, B, C, D" hoặc "Tạo tòa mới" để bắt đầu.'
                />
              ) : (
                <>
                  <div className="room-building-tabs">
                    {buildings.map((building) => {
                      const active = selectedBuilding?._id === building._id;
                      return (
                        <div className="room-building-tab-wrap" key={building._id}>
                          <button
                            className={`room-building-tab ${active ? "active" : ""}`}
                            onClick={() => selectBuilding(building)}
                            type="button"
                          >
                            Tòa {building.name}
                          </button>
                          <button
                            className="room-delete-building"
                            onClick={() => setShowDeleteConfirm(building)}
                            title={`Xóa tòa ${building.name}`}
                            type="button"
                          >
                            <FaTimes />
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {selectedBuilding && (
                    <div className="room-floor-row">
                      <span>
                        <FaLayerGroup />
                        Tầng:
                      </span>
                      {floors.map((floor) => (
                        <button
                          className={`room-floor-chip ${
                            selectedFloor === floor ? "active" : ""
                          }`}
                          onClick={() => setSelectedFloor(floor)}
                          type="button"
                          key={floor}
                        >
                          Tầng {floor}
                        </button>
                      ))}
                    </div>
                  )}

                  {loadingRooms ? (
                    <EmptyState icon={<FaDoorOpen />} title="Đang tải phòng..." />
                  ) : rooms.length === 0 ? (
                    <EmptyState
                      icon={<FaDoorOpen />}
                      title="Không có phòng ở tầng này"
                    />
                  ) : (
                    <div className="room-grid">
                      {rooms.map((room) => (
                        <RoomCard
                          key={room._id}
                          room={room}
                          onClick={() => openRoomDetail(room)}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </div>
      </main>

      {showCreateModal && (
        <Dialog onClose={() => setShowCreateModal(false)} title="Tạo tòa nhà mới">
          <label className="room-field">
            <span>Tên tòa nhà</span>
            <input
              value={newBuildingName}
              onChange={(e) => setNewBuildingName(e.target.value)}
              placeholder="Ví dụ: A, B, C..."
              autoFocus
            />
          </label>
          <label className="room-field">
            <span>Mô tả</span>
            <textarea
              value={newBuildingDesc}
              onChange={(e) => setNewBuildingDesc(e.target.value)}
              placeholder="Mô tả ngắn về tòa nhà"
              rows={4}
            />
          </label>
          <div className="room-dialog-actions">
            <button className="room-btn room-btn-ghost" onClick={() => setShowCreateModal(false)} type="button">
              Hủy
            </button>
            <button className="room-btn room-btn-primary" onClick={handleCreate} disabled={creating} type="button">
              {creating ? "Đang tạo..." : "Tạo tòa"}
            </button>
          </div>
        </Dialog>
      )}

      {showDeleteConfirm && (
        <Dialog
          onClose={() => setShowDeleteConfirm(null)}
          title={`Xóa tòa ${showDeleteConfirm.name}`}
          danger
        >
          <p className="room-dialog-text">
            Hành động này sẽ xóa <strong>Tòa {showDeleteConfirm.name}</strong> cùng
            tất cả <strong>{showDeleteConfirm.totalRooms || 70} phòng</strong> liên
            quan. Bạn có chắc chắn muốn tiếp tục?
          </p>
          <div className="room-dialog-actions">
            <button className="room-btn room-btn-ghost" onClick={() => setShowDeleteConfirm(null)} type="button">
              Hủy
            </button>
            <button
              className="room-btn room-btn-danger"
              onClick={() => handleDelete(showDeleteConfirm._id)}
              disabled={deleting}
              type="button"
            >
              <FaTrashAlt />
              {deleting ? "Đang xóa..." : "Xóa tòa"}
            </button>
          </div>
        </Dialog>
      )}

      {selectedRoom && (
        <RoomDrawer
          assigning={assigning}
          availableStudents={availableStudents}
          editCapacity={editCapacity}
          editStatus={editStatus}
          loadingStudents={loadingStudents}
          onAssignStudent={handleAssignStudent}
          onClose={() => setSelectedRoom(null)}
          onRemoveStudent={handleRemoveStudent}
          onSearchStudents={searchAvailableStudents}
          onToggleAddStudent={toggleAddStudent}
          onUpdate={handleUpdateRoom}
          removing={removing}
          selectedBuilding={selectedBuilding}
          selectedRoom={selectedRoom}
          setEditCapacity={setEditCapacity}
          setEditStatus={setEditStatus}
          setStudentSearch={setStudentSearch}
          showAddStudent={showAddStudent}
          studentSearch={studentSearch}
          updatingRoom={updatingRoom}
        />
      )}
    </div>
  );
}

function TopBar() {
  return (
    <header className="room-topbar">
      <div className="room-top-search">
        <FaSearch />
        <input placeholder="Tìm kiếm phòng, sinh viên..." type="text" />
      </div>
      <div className="room-top-actions">
        <button type="button" aria-label="Thông báo">
          <FaBell />
        </button>
        <div className="room-admin-user">
          <div>
            <strong>Admin User</strong>
            <span>Quản trị hệ thống</span>
          </div>
          <div className="room-avatar">A</div>
        </div>
      </div>
    </header>
  );
}

function SummaryCard({ title, value, icon, active = false }) {
  return (
    <article className="room-stat-card">
      <div>
        <p>{title}</p>
        <strong className={active ? "accent" : ""}>
          {String(value).padStart(2, "0")}
        </strong>
      </div>
      <span className={`room-stat-icon ${active ? "active" : ""}`}>{icon}</span>
    </article>
  );
}

function LegendDot({ tone, label }) {
  return (
    <span>
      <i className={`room-dot ${tone}`} />
      {label}
    </span>
  );
}

function RoomCard({ room, onClick }) {
  const students = room.students || [];
  const occupants = room.currentOccupants ?? students.length ?? 0;
  const capacity = room.capacity || 4;
  const percent = Math.min(100, Math.round((occupants / capacity) * 100));
  const cfg = statusConfig[room.status] || statusConfig.available;
  const gender = room.gender || room.genderType || room.typeGender;

  return (
    <button className="room-card" onClick={onClick} type="button">
      <div className="room-card-top">
        <strong>P.{room.roomNumber}</strong>
        <span className={`room-status-symbol ${cfg.tone}`}>{cfg.icon}</span>
      </div>
      <div className="room-capacity">
        <div>
          <span>Sức chứa</span>
          <strong>
            {occupants}/{capacity}
          </strong>
        </div>
        <div className="room-capacity-track">
          <i className={cfg.tone} style={{ width: `${percent}%` }} />
        </div>
      </div>
      <div className="room-card-tags">
        {gender && <span>{String(gender).toUpperCase()}</span>}
        <span>{cfg.label.toUpperCase()}</span>
      </div>
    </button>
  );
}

function RoomDrawer({
  assigning,
  availableStudents,
  editCapacity,
  editStatus,
  loadingStudents,
  onAssignStudent,
  onClose,
  onRemoveStudent,
  onSearchStudents,
  onToggleAddStudent,
  onUpdate,
  removing,
  selectedBuilding,
  selectedRoom,
  setEditCapacity,
  setEditStatus,
  setStudentSearch,
  showAddStudent,
  studentSearch,
  updatingRoom,
}) {
  const students = selectedRoom.students || [];
  const hasStudents = students.length > 0;

  return (
    <div className="room-drawer-layer">
      <button className="room-drawer-backdrop" onClick={onClose} type="button" />
      <aside className="room-drawer">
        <header className="room-drawer-head">
          <div className="room-drawer-title">
            <FaDoorOpen />
            <div>
              <h2>Chi tiết phòng {selectedRoom.roomNumber}</h2>
              <p>
                Tòa {selectedBuilding?.name || selectedRoom.buildingName || "-"} •
                Tầng {selectedRoom.floor} • Loại phòng: {selectedRoom.capacity} người
              </p>
            </div>
          </div>
          <button className="room-icon-btn" onClick={onClose} type="button">
            <FaTimes />
          </button>
        </header>

        <div className="room-drawer-body">
          <section className="room-drawer-section">
            <h3>Cấu hình phòng</h3>
            <div className="room-config-grid">
              <InfoBox label="Tình trạng" value={statusConfig[editStatus]?.label || editStatus} />
              <InfoBox label="Số sinh viên" value={`${students.length}/${selectedRoom.capacity}`} />
              <InfoBox label="Tầng" value={`Tầng ${selectedRoom.floor}`} />
              <InfoBox label="Số phòng" value={selectedRoom.roomNumber} />
            </div>

            <label className="room-field compact">
              <span>Sức chứa</span>
              <input
                min={1}
                max={12}
                type="number"
                value={editCapacity}
                onChange={(e) => setEditCapacity(Number(e.target.value))}
              />
            </label>

            <div className="room-status-editor">
              <span>Trạng thái</span>
              <div>
                {Object.entries(statusConfig).map(([key, cfg]) => {
                  const isDisabled =
                    key === "maintenance" && hasStudents
                      ? true
                      : editStatus === "maintenance"
                        ? false
                        : key !== editStatus;
                  return (
                    <button
                      className={`${cfg.tone} ${editStatus === key ? "active" : ""}`}
                      disabled={isDisabled}
                      key={key}
                      onClick={() => setEditStatus(key)}
                      title={
                        key === "maintenance" && hasStudents
                          ? "Phòng đang có người, không thể bảo trì"
                          : ""
                      }
                      type="button"
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </section>

          <section className="room-drawer-section">
            <div className="room-student-head">
              <h3>
                Danh sách sinh viên ({students.length}/{selectedRoom.capacity})
              </h3>
              {students.length < selectedRoom.capacity && (
                <button className="room-link-btn" onClick={onToggleAddStudent} type="button">
                  {showAddStudent ? (
                    <>
                      <FaTimes /> Đóng
                    </>
                  ) : (
                    <>
                      <FaUserPlus /> Thêm mới
                    </>
                  )}
                </button>
              )}
            </div>

            {students.length > 0 ? (
              <div className="room-student-list">
                {students.map((student, index) => (
                  <div className="room-student-item" key={student._id || index}>
                    <div className="room-student-avatar">
                      {(student.fullName || "S").charAt(0)}
                    </div>
                    <div>
                      <strong>{student.fullName || "N/A"}</strong>
                      <p>
                        Giường {student.bedNumber || "-"} • MSV:{" "}
                        {student.studentCode || "N/A"}
                      </p>
                      {student.email && <small>{student.email}</small>}
                    </div>
                    <button
                      className="room-icon-btn danger"
                      disabled={removing}
                      onClick={() => onRemoveStudent(student._id)}
                      title="Xóa khỏi phòng"
                      type="button"
                    >
                      <FaUserMinus />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<FaUserGraduate />}
                title="Chưa có sinh viên nào trong phòng"
              />
            )}

            {showAddStudent && (
              <div className="room-add-student">
                <label className="room-top-search full">
                  <FaSearch />
                  <input
                    autoFocus
                    value={studentSearch}
                    onChange={(e) => {
                      setStudentSearch(e.target.value);
                      onSearchStudents(e.target.value);
                    }}
                    placeholder="Tìm theo tên, mã SV, email..."
                    type="text"
                  />
                </label>

                <div className="room-available-list">
                  {loadingStudents ? (
                    <p>Đang tìm kiếm...</p>
                  ) : availableStudents.length === 0 ? (
                    <p>Không tìm thấy sinh viên phù hợp</p>
                  ) : (
                    availableStudents.map((student) => (
                      <div className="room-available-item" key={student._id}>
                        <div>
                          <strong>{student.fullName}</strong>
                          <span>
                            {student.studentCode} • {student.email}
                          </span>
                        </div>
                        <button
                          className="room-btn room-btn-primary small"
                          disabled={assigning}
                          onClick={() => onAssignStudent(student._id)}
                          type="button"
                        >
                          <FaPlus />
                          Thêm
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        <footer className="room-drawer-foot">
          <button className="room-btn room-btn-ghost" onClick={onClose} disabled={updatingRoom} type="button">
            Hủy bỏ
          </button>
          <button className="room-btn room-btn-primary" onClick={onUpdate} disabled={updatingRoom} type="button">
            {updatingRoom ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </footer>
      </aside>
    </div>
  );
}

function InfoBox({ label, value }) {
  return (
    <div className="room-info-box">
      <span>{label}</span>
      <strong>{value || "Chưa có"}</strong>
    </div>
  );
}

function EmptyState({ icon, title, note }) {
  return (
    <div className="room-empty">
      <span>{icon}</span>
      <strong>{title}</strong>
      {note && <p>{note}</p>}
    </div>
  );
}

function Dialog({ children, danger = false, onClose, title }) {
  return (
    <div className="room-dialog-layer">
      <button className="room-dialog-backdrop" onClick={onClose} type="button" />
      <div className={`room-dialog ${danger ? "danger" : ""}`}>
        <div className="room-dialog-head">
          <h2>{title}</h2>
          <button className="room-icon-btn" onClick={onClose} type="button">
            <FaTimes />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default RoomManagement;

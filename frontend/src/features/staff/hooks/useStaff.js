import { useState, useEffect, useCallback } from 'react';
import { staffApi } from '../api/staffApi';

export const useStaff = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  // Core Data sets
  const [students, setStudents] = useState([]);
  const [gateAccesses, setGateAccesses] = useState([]);
  const [maintenanceTasks, setMaintenanceTasks] = useState([]);
  const [cleanTasks, setCleanTasks] = useState([]);

  // Selected details
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);

  const showSuccess = (msg) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  // --- Fetching actions ---
  const fetchStudents = useCallback(async () => {
    try {
      const data = await staffApi.getStudents();
      setStudents(data);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải danh sách sinh viên');
    }
  }, []);

  const fetchGateAccessLogs = useCallback(async () => {
    try {
      const data = await staffApi.getGateAccessLogs();
      setGateAccesses(data);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải lịch sử vào ra');
    }
  }, []);

  const fetchMaintenanceTasks = useCallback(async () => {
    try {
      const data = await staffApi.getMaintenanceTasks();
      setMaintenanceTasks(data);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải công việc bảo trì');
    }
  }, []);

  const fetchCleanTasks = useCallback(async () => {
    try {
      const data = await staffApi.getCleanTasks();
      setCleanTasks(data);
    } catch (err) {
      setError(err.message || 'Lỗi khi tải công việc vệ sinh');
    }
  }, []);

  // Fetch all initially
  const loadAllData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([
        fetchStudents(),
        fetchGateAccessLogs(),
        fetchMaintenanceTasks(),
        fetchCleanTasks()
      ]);
    } catch (err) {
      setError('Lỗi khi tải dữ liệu hệ thống');
    } finally {
      setLoading(false);
    }
  }, [fetchStudents, fetchGateAccessLogs, fetchMaintenanceTasks, fetchCleanTasks]);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // --- Security logic ---
  const handleViewStudentDetails = async (rollOrId) => {
    setLoading(true);
    try {
      const student = await staffApi.getStudentById(rollOrId);
      if (student) {
        setSelectedStudent(student);
      } else {
        alert('Không tìm thấy thông tin sinh viên!');
      }
    } catch (err) {
      setError('Lỗi khi tìm thông tin sinh viên');
    } finally {
      setLoading(false);
    }
  };

  const handleAddViolation = async (studentId, violationType, description, deduction) => {
    setLoading(true);
    try {
      await staffApi.addViolation(studentId, violationType, description, deduction);
      showSuccess('Đã thêm biên bản vi phạm thành công!');
      // Refresh students list and current selected student to show new violation card
      await fetchStudents();
      if (selectedStudent && selectedStudent.id === studentId) {
        const updatedStudent = await staffApi.getStudentById(studentId);
        setSelectedStudent(updatedStudent);
      }
      // Refresh gate logs since status could depend on student's cfd score status
      await fetchGateAccessLogs();
    } catch (err) {
      setError(err.message || 'Lỗi khi ghi nhận vi phạm');
    } finally {
      setLoading(false);
    }
  };

  // --- Maintenance logic ---
  const handleUpdateMaintenanceStatus = async (taskId, status) => {
    setLoading(true);
    try {
      const updated = await staffApi.updateMaintenanceTaskStatus(taskId, status);
      showSuccess(`Đã cập nhật trạng thái sự cố sang: ${status}`);
      await fetchMaintenanceTasks();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updated);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi cập nhật trạng thái');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMaintenanceNote = async (taskId, content) => {
    setLoading(true);
    try {
      const updated = await staffApi.addMaintenanceTaskNote(taskId, content);
      showSuccess('Lưu ghi chú sửa chữa thành công!');
      await fetchMaintenanceTasks();
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask(updated);
      }
    } catch (err) {
      setError(err.message || 'Lỗi khi thêm ghi chú bảo trì');
    } finally {
      setLoading(false);
    }
  };

  // --- Cleaner logic ---
  const handleMarkRoomAsReady = async (taskId) => {
    setLoading(true);
    try {
      await staffApi.markCleanRoomAsReady(taskId);
      showSuccess('Phòng đã được dọn sạch và sẵn sàng đón sinh viên!');
      await fetchCleanTasks();
    } catch (err) {
      setError(err.message || 'Lỗi khi đánh dấu phòng sẵn sàng');
    } finally {
      setLoading(false);
    }
  };

  const handleReportRoomDamage = async (taskId, room, dom, description, severity) => {
    setLoading(true);
    try {
      await staffApi.reportRoomDamage(taskId, room, dom, description, severity);
      showSuccess('Đã lập phiếu sự cố hỏng hóc chuyển sang Ban Bảo Trì!');
      await fetchCleanTasks();
      await fetchMaintenanceTasks(); // reload maintenance queue in background
    } catch (err) {
      setError(err.message || 'Lỗi khi báo hỏng phòng');
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    error,
    successMessage,
    students,
    gateAccesses,
    maintenanceTasks,
    cleanTasks,
    selectedStudent,
    setSelectedStudent,
    selectedTask,
    setSelectedTask,
    
    // Actions
    loadAllData,
    viewStudentDetails: handleViewStudentDetails,
    addViolation: handleAddViolation,
    updateMaintenanceStatus: handleUpdateMaintenanceStatus,
    addMaintenanceNote: handleAddMaintenanceNote,
    markRoomAsReady: handleMarkRoomAsReady,
    reportRoomDamage: handleReportRoomDamage
  };
};

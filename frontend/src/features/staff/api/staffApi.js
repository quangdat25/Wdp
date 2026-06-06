import * as initialData from '../data/staffData';

// Helper to initialize localStorage
const initStorage = () => {
  if (!localStorage.getItem('staff_students')) {
    localStorage.setItem('staff_students', JSON.stringify(initialData.mockStudents));
  }
  if (!localStorage.getItem('staff_gate_access')) {
    localStorage.setItem('staff_gate_access', JSON.stringify(initialData.mockGateAccessLogs));
  }
  if (!localStorage.getItem('staff_maintenance_tasks')) {
    localStorage.setItem('staff_maintenance_tasks', JSON.stringify(initialData.mockMaintenanceTasks));
  }
  if (!localStorage.getItem('staff_clean_tasks')) {
    localStorage.setItem('staff_clean_tasks', JSON.stringify(initialData.mockCleanTasks));
  }
};

// Call immediately
initStorage();

const getFromStorage = (key) => JSON.parse(localStorage.getItem(key));
const setToStorage = (key, data) => localStorage.setItem(key, JSON.stringify(data));

// Simulation helper for network delay
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

export const staffApi = {
  // --- STUDENTS ---
  async getStudents() {
    await delay(300);
    return getFromStorage('staff_students');
  },

  async getStudentById(id) {
    await delay(200);
    const students = getFromStorage('staff_students');
    return students.find(s => s.id === id || s.rollNumber === id) || null;
  },

  // --- SECURITY USE CASES ---
  async getGateAccessLogs() {
    await delay(300);
    return getFromStorage('staff_gate_access');
  },

  async addViolation(studentId, violationType, description, deduction) {
    await delay(400);
    const students = getFromStorage('staff_students');
    const studentIdx = students.findIndex(s => s.id === studentId);
    
    if (studentIdx === -1) throw new Error('Không tìm thấy sinh viên');

    const newViolation = {
      id: 'V' + Math.floor(1000 + Math.random() * 9000),
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      type: violationType,
      description: description,
      deduction: parseInt(deduction) || 0
    };

    students[studentIdx].violations.push(newViolation);
    
    // Decrement cfdScore, don't let it go below 0
    students[studentIdx].cfdScore = Math.max(0, students[studentIdx].cfdScore - newViolation.deduction);
    setToStorage('staff_students', students);

    // If there is any gate access log that is late, we also mark it or can keep it
    return newViolation;
  },

  // --- MAINTENANCE USE CASES ---
  async getMaintenanceTasks() {
    await delay(300);
    return getFromStorage('staff_maintenance_tasks');
  },

  async updateMaintenanceTaskStatus(taskId, status) {
    await delay(300);
    const tasks = getFromStorage('staff_maintenance_tasks');
    const taskIdx = tasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) throw new Error('Không tìm thấy công việc bảo trì');
    
    tasks[taskIdx].status = status;
    setToStorage('staff_maintenance_tasks', tasks);
    return tasks[taskIdx];
  },

  async addMaintenanceTaskNote(taskId, content) {
    await delay(300);
    const tasks = getFromStorage('staff_maintenance_tasks');
    const taskIdx = tasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) throw new Error('Không tìm thấy công việc bảo trì');

    const newNote = {
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      content
    };

    tasks[taskIdx].notes.push(newNote);
    setToStorage('staff_maintenance_tasks', tasks);
    return tasks[taskIdx];
  },

  // --- CLEANER USE CASES ---
  async getCleanTasks() {
    await delay(300);
    return getFromStorage('staff_clean_tasks');
  },

  async markCleanRoomAsReady(taskId) {
    await delay(350);
    const cleanTasks = getFromStorage('staff_clean_tasks');
    const taskIdx = cleanTasks.findIndex(t => t.id === taskId);
    if (taskIdx === -1) throw new Error('Không tìm thấy công việc vệ sinh');

    cleanTasks[taskIdx].status = 'READY';
    cleanTasks[taskIdx].isReady = true;
    setToStorage('staff_clean_tasks', cleanTasks);
    return cleanTasks[taskIdx];
  },

  async reportRoomDamage(taskId, room, dom, description, severity) {
    await delay(500);

    // 1. Create a maintenance task
    const maintenanceTasks = getFromStorage('staff_maintenance_tasks');
    const newMaintenanceTask = {
      id: 'T' + Math.floor(1000 + Math.random() * 9000),
      title: `Báo cáo hỏng từ Dọn dẹp phòng ${room}`,
      room,
      dom,
      description,
      severity,
      status: 'PENDING',
      createdDate: new Date().toISOString().replace('T', ' ').substring(0, 16),
      assignedTo: 'Chưa phân công',
      notes: [],
      reportedBy: 'Nhân viên dọn dẹp (Lao công)'
    };
    maintenanceTasks.unshift(newMaintenanceTask);
    setToStorage('staff_maintenance_tasks', maintenanceTasks);

    // 2. Update clean tasks to indicate damage reported
    const cleanTasks = getFromStorage('staff_clean_tasks');
    const cleanTaskIdx = cleanTasks.findIndex(t => t.id === taskId);
    if (cleanTaskIdx !== -1) {
      cleanTasks[cleanTaskIdx].damageReported = {
        maintenanceTaskId: newMaintenanceTask.id,
        description,
        date: newMaintenanceTask.createdDate
      };
      setToStorage('staff_clean_tasks', cleanTasks);
    }

    return newMaintenanceTask;
  }
};

export const mockStudents = [
  {
    id: "S001",
    rollNumber: "SE160123",
    fullName: "Nguyễn Văn A",
    email: "anvse160123@fpt.edu.vn",
    phone: "0912345678",
    gender: "male",
    dateOfBirth: "2002-05-15",
    major: "Kỹ thuật phần mềm",
    dom: "Dom A",
    room: "A101",
    cfdScore: 95,
    violations: [
      { id: "V001", date: "2026-06-01 22:30", type: "Vào muộn", description: "Về muộn sau giờ nghiêm quân 22:00", deduction: 5 }
    ],
    parent: {
      fullName: "Nguyễn Văn Hùng",
      phone: "0987654321",
      relationship: "Bố"
    }
  },
  {
    id: "S002",
    rollNumber: "SE160456",
    fullName: "Trần Thị B",
    email: "betttse160456@fpt.edu.vn",
    phone: "0923456789",
    gender: "female",
    dateOfBirth: "2003-08-20",
    major: "Thiết kế đồ họa",
    dom: "Dom B",
    room: "B204",
    cfdScore: 80,
    violations: [
      { id: "V002", date: "2026-06-02 18:15", type: "Nấu ăn trong phòng", description: "Sử dụng bếp hồng ngoại trái phép", deduction: 20 }
    ],
    parent: {
      fullName: "Phan Thị Lan",
      phone: "0976543210",
      relationship: "Mẹ"
    }
  },
  {
    id: "S003",
    rollNumber: "SE160789",
    fullName: "Lê Hoàng C",
    email: "clhse160789@fpt.edu.vn",
    phone: "0934567890",
    gender: "male",
    dateOfBirth: "2002-12-10",
    major: "An toàn thông tin",
    dom: "Dom A",
    room: "A305",
    cfdScore: 100,
    violations: [],
    parent: {
      fullName: "Lê Hoàng Hải",
      phone: "0965432109",
      relationship: "Bố"
    }
  }
];

export const mockGateAccessLogs = [
  {
    id: "G001",
    studentId: "S001",
    studentName: "Nguyễn Văn A",
    studentRoll: "SE160123",
    building: "Dom A",
    room: "A101",
    timestamp: "2026-06-06 22:45",
    direction: "IN",
    status: "LATE"
  },
  {
    id: "G002",
    studentId: "S003",
    studentName: "Lê Hoàng C",
    studentRoll: "SE160789",
    building: "Dom A",
    room: "A305",
    timestamp: "2026-06-06 19:30",
    direction: "IN",
    status: "NORMAL"
  },
  {
    id: "G003",
    studentId: "S002",
    studentName: "Trần Thị B",
    studentRoll: "SE160456",
    building: "Dom B",
    room: "B204",
    timestamp: "2026-06-06 07:15",
    direction: "OUT",
    status: "NORMAL"
  }
];

export const mockMaintenanceTasks = [
  {
    id: "M001",
    title: "Sửa vòi nước bồn rửa mặt bị rò rỉ",
    room: "A101",
    dom: "Dom A",
    description: "Vòi nước bồn rửa mặt bị nứt van tay xoay, rỉ nước liên tục gây tràn.",
    severity: "HIGH",
    status: "PENDING",
    createdDate: "2026-06-06 10:00",
    assignedTo: "Lưu Huy Hoàng",
    reportedBy: "Sinh viên báo cáo",
    notes: [
      { date: "2026-06-06 10:30", content: "Đã tiếp nhận yêu cầu, đang chuẩn bị linh kiện thay thế." }
    ]
  },
  {
    id: "M002",
    title: "Thay bóng đèn tuýp LED bị nhấp nháy",
    room: "B204",
    dom: "Dom B",
    description: "Bóng đèn tuýp chính giữa phòng nhấp nháy liên tục không sáng rõ.",
    severity: "MEDIUM",
    status: "IN_PROGRESS",
    createdDate: "2026-06-05 14:00",
    assignedTo: "Lưu Huy Hoàng",
    reportedBy: "Vũ Văn Nam (Trực ban)",
    notes: [
      { date: "2026-06-05 15:00", content: "Đã ngắt điện và kiểm tra chấn lưu." }
    ]
  },
  {
    id: "M003",
    title: "Bảo dưỡng điều hòa chảy nước",
    room: "C302",
    dom: "Dom C",
    description: "Điều hòa chảy nước ngược vào phòng khi khởi động được 30 phút.",
    severity: "LOW",
    status: "COMPLETED",
    createdDate: "2026-06-04 09:00",
    assignedTo: "Nguyễn Công Lý",
    reportedBy: "Dọn dẹp phòng báo cáo",
    notes: [
      { date: "2026-06-04 11:00", content: "Đã thông ống thoát nước và vệ sinh lưới lọc dàn lạnh. Thiết bị chạy ổn định." }
    ]
  }
];

export const mockCleanTasks = [
  {
    id: "C001",
    room: "A101",
    dom: "Dom A",
    status: "PENDING",
    isReady: false,
    damageReported: null
  },
  {
    id: "C002",
    room: "B305",
    dom: "Dom B",
    status: "IN_PROGRESS",
    isReady: false,
    damageReported: null
  },
  {
    id: "C003",
    room: "C202",
    dom: "Dom C",
    status: "READY",
    isReady: true,
    damageReported: null
  }
];

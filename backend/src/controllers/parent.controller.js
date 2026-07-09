const User = require("../models/user.model");
const Room = require("../models/room.models");

const getMyChildRoom = async (req, res) => {
    try {
        const student = await User.findById(req.user);

        if (!student || student.role !== "student") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy sinh viên",
            });
        }

        const room = await Room.findOne({
            "students.student": student._id,
        }).populate("building", "name");

        if (!room) {
            return res.status(404).json({
                success: false,
                message: "Sinh viên chưa được xếp phòng",
            });
        }

        const studentInRoom = room.students.find(
            (s) => s.student.toString() === student._id.toString()
        );

        const Invoice = require("../models/invoice.model");
        const today = new Date();
        let previousMonth = today.getMonth();
        let previousMonthYear = today.getFullYear();
        if (previousMonth === 0) {
            previousMonth = 12;
            previousMonthYear -= 1;
        }

        const utilityInvoice = await Invoice.findOne({
            studentId: student._id,
            type: "utility",
            billingMonth: previousMonth
        }).sort({ createdAt: -1 });

        let electricityAmount = 0;
        let waterAmount = 0;

        if (utilityInvoice && utilityInvoice.items) {
            const electricityItem = utilityInvoice.items.find(item => item.name === "electricity");
            const waterItem = utilityInvoice.items.find(item => item.name === "water");
            if (electricityItem) electricityAmount = electricityItem.amount;
            if (waterItem) waterAmount = waterItem.amount;
        }

        return res.json({
            success: true,
            data: {
                student: {
                    id: student._id,
                    fullName: student.fullName,
                    studentCode: student.studentCode,
                    CFDScore: student.CFDScore,
                },
                building: {
                    id: room.building._id,
                    name: room.building.name,
                },
                room: {
                    id: room._id,
                    roomNumber: room.roomNumber,
                    displayName: room.displayName,
                    floor: room.floor,
                },
                bedNumber: studentInRoom.bedNumber,
                previousUtility: {
                    month: previousMonth,
                    year: previousMonthYear,
                    electricityAmount: electricityAmount,
                    waterAmount: waterAmount,
                }
            },
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getStudentInfo = async (req, res) => {
    try {
        const student = await User.findById(req.user)
            .select("-password -parent.password")
            .populate("buildingId", "name")
            .populate("roomId", "roomNumber");

        if (!student || student.role !== "student") {
            return res.status(404).json({
                success: false,
                message: "Không tìm thấy thông tin sinh viên",
            });
        }

        return res.json({
            success: true,
            data: student,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

const getStudentInvoices = async (req, res) => {
    try {
        const Invoice = require("../models/invoice.model");
        
        const invoices = await Invoice.find({ studentId: req.user._id }).sort({ createdAt: -1 });

        return res.json({
            success: true,
            data: invoices,
        });
    } catch (error) {
        console.error("Lỗi khi lấy hóa đơn:", error);
        res.status(500).json({
            success: false,
            message: "Lỗi máy chủ khi lấy dữ liệu hóa đơn",
        });
    }
};

module.exports = {
    getMyChildRoom,
    getStudentInfo,
    getStudentInvoices
};

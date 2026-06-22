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
        const student = await User.findById(req.user).select("-password -parent.password");
        
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

module.exports = {
    getMyChildRoom,
    getStudentInfo
};

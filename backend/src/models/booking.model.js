const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
    {
        studentId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Student",
            required: true,
        },

        roomId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Room",
            required: true,
        },

        bedNumber: {
            type: Number,
            required: true,
        },

        semester: {
            type: String,
            required: true,
            trim: true,
        },

        startDate: {
            type: Date,
            required: true,
        },

        endDate: {
            type: Date,
            required: true,
        },

        status: {
            type: String,
            enum: [
                "pending",      // chờ duyệt
                "confirmed",    // đã xác nhận
                "checked_in",   // đã nhận phòng
                "checked_out",  // đã trả phòng
                "cancelled",    // hủy
            ],
            default: "pending",
        },

        renewedFrom: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Booking",
            default: null,
        },

        checkInDate: {
            type: Date,
            default: null,
        },

        checkOutDate: {
            type: Date,
            default: null,
        },

        note: {
            type: String,
            default: "",
            trim: true,
        },

        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Staff",
            default: null,
        },

        approvedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Booking", bookingSchema);

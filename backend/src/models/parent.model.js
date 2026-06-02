const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const parentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    gender: {
      type: String,
      enum: ["Nam", "Nữ"],
      default: null,
    },
    address: {
      type: String,
      default: null,
      trim: true,
    },
    relationship: {
      type: String,
      enum: ["Cha", "Mẹ", "Người giám hộ"],
      default: "Người giám hộ",
    },
    studentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Parent", parentSchema);

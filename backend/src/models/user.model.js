const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    username: {
      type: String,
      unique: true,
      sparse: true, // allows multiple nulls (for students who don't use username)
      trim: true,
      default: null,
    },
    password: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    authMethod: {
      type: String,
      enum: ["google", "local"],
      required: true,
    },
    role: {
      type: String,
      enum: [
        "student",
        "parent",
        "admin",
        "dorm_manager",
        "security_staff",
        "cleaning_staff",
        "maintenance_staff",
      ],
      required: true,
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    phoneNumber: {
      type: String,
      default: null,
      trim: true,
    },
    avatar: {
      type: String,
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// --- Indexes ---
userSchema.index({ role: 1 });
userSchema.index({ isActive: 1 });

// --- Pre-save hook: hash password ---
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});

// --- Instance method: compare password ---
userSchema.methods.comparePassword = async function (candidatePassword) {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

// --- Remove password from JSON output ---
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model("User", userSchema);

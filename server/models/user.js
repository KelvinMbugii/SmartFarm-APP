const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const weeklyAvailabilitySchema = new mongoose.Schema(
  {
    dayOfWeek: {
      type: Number,
      min: 0,
      max: 6,
      required: true,
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    startTime: {
      type: String,
      default: "08:00",
    },
    endTime: {
      type: String,
      default: "17:00",
    },
    slotDurationMinutes: {
      type: Number,
      enum: [15, 30, 45, 60],
      default: 30,
    },
  },
  { _id: false },
);

const availabilityExceptionSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    isAvailable: { type: Boolean, default: true },
    startTime: String,
    endTime: String,
    note: String,
  },
  { _id: false },
);

const defaultWeeklyAvailability = Array.from({ length: 7 }, (_, dayOfWeek) => ({
  dayOfWeek,
  enabled: false,
  startTime: "08:00",
  endTime: "17:00",
  slotDurationMinutes: 30,
}));

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["farmer", "agripreneur", "officer", "admin"],
      default: "farmer",
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    Phone: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: "",
    },
    publicKey: {
      type: String,
      default: "",
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    deactivatedAt: {
      type: Date,
      default: null,
    },
    LastSeen: {
      type: Date,
      default: Date.now,
    },
    farmDetails: {
      farmSize: String,
      crops: [String],
      equipment: [String],
    },
    availability: {
      timezone: {
        type: String,
        default: "Africa/Nairobi",
      },
      weekly: {
        type: [weeklyAvailabilitySchema],
        default: defaultWeeklyAvailability,
      },
      exceptions: {
        type: [availabilityExceptionSchema],
        default: [],
      },
    },
    bookingBufferMinutes: {
      type: Number,
      default: 0,
      min: 0,
      max: 180,
    },
    maxDailyBookings: {
      type: Number,
      default: 8,
      min: 1,
      max: 50,
    },
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    mpesaPhone: { type: String, trim: true },
  },
  {
    timestamps: true,
  },
);

// Hash the password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare the passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.models.User || mongoose.model("User", userSchema);

if (!mongoose.models.user) {
  mongoose.model("user", userSchema);
}

module.exports = User;

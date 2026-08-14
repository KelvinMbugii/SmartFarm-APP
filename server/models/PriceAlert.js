const mongoose = require("mongoose");

const priceAlertSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    commodity: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    targetPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    condition: {
      type: String,
      enum: ["above", "below"],
      default: "above",
      required: true,
    },
    notifyEmail: {
      type: String,
      default: "",
      trim: true,
      lowercase: true,
    },
    notifyBySms: {
      type: Boolean,
      default: false,
    },
    phoneNumber: {
      type: String,
      default: "",
      trim: true,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastNotifiedPrice: {
      type: Number,
      default: null,
    },
    lastNotifiedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("PriceAlert", priceAlertSchema);

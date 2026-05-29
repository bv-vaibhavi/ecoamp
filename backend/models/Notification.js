const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  type:    { type: String, enum: ["high_usage", "budget_warning", "appliance_on", "weekly_summary"], required: true },
  title:   { type: String, required: true },
  message: { type: String, required: true },
  read:    { type: Boolean, default: false },
  icon:    { type: String, default: "bell" }, // bell | zap | alert | chart
}, { timestamps: true });

module.exports = mongoose.model("Notification", notificationSchema);

const mongoose = require("mongoose");

const applianceSchema = new mongoose.Schema({
  user:  { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
  name:  { type: String, required: true, trim: true },
  watts: { type: Number, required: true, min: 1 },
  room:  { type: String, default: "Living Room" },
  icon:  { type: String, default: "Zap" },
  isOn:  { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model("Appliance", applianceSchema);

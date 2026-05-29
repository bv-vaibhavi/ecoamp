const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name:           { type: String, required: true, trim: true },
  email:          { type: String, required: true, unique: true, lowercase: true, trim: true },
  password:       { type: String, required: true, minlength: 6 },
  homeName:       { type: String, default: "My Home" },
  unitRate:       { type: Number, default: 7.38 },   // ₹ per kWh (AP default)
  currency:       { type: String, default: "INR" },
  dailyBudget:    { type: Number, default: 100 },
  // Tariff selection
  stateCode:    { type: String, default: "AP" },
  utilityCode:  { type: String, default: "APSPDCL" },
  categoryCode: { type: String, default: "domestic" },
  // Actual bill data for comparison
  lastBillUnits:  { type: Number, default: null },
  lastBillAmount: { type: Number, default: null },
  // Password reset
  resetToken:       { type: String, default: null },
  resetTokenExpiry: { type: Date,   default: null },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.matchPassword = function (entered) {
  return bcrypt.compare(entered, this.password);
};

module.exports = mongoose.model("User", userSchema);

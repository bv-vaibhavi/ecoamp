const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

// GET /api/user/profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/user/profile
router.patch("/profile", auth, async (req, res) => {
  try {
    const allowed = ["name", "homeName", "unitRate", "currency", "dailyBudget", "lastBillUnits", "lastBillAmount", "stateCode", "utilityCode", "categoryCode"];
    const updates = {};
    allowed.forEach(k => { if (req.body[k] !== undefined) updates[k] = req.body[k]; });
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true }).select("-password");
    res.json(user);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

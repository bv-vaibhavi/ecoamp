const router       = require("express").Router();
const auth         = require("../middleware/auth");
const Notification = require("../models/Notification");
const Appliance    = require("../models/Appliance");
const User         = require("../models/User");

router.use(auth);

// ── Auto-generate notifications based on current data ──────────────────────
async function generateNotifications(userId) {
  const user       = await User.findById(userId);
  const appliances = await Appliance.find({ user: userId });
  const toCreate   = [];

  if (!appliances.length) return;

  const totalWatts   = appliances.filter(a => a.isOn).reduce((s, a) => s + a.watts, 0);
  const dailyKwh     = (totalWatts * 24) / 1000;
  const dailyCost    = dailyKwh * (user.unitRate || 7.38);
  const activeCount  = appliances.filter(a => a.isOn).length;

  // 1. Budget warning — daily cost > 80% of daily budget
  if (user.dailyBudget && dailyCost >= user.dailyBudget * 0.8) {
    const exists = await Notification.findOne({
      user: userId, type: "budget_warning",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    if (!exists) {
      toCreate.push({
        user: userId,
        type: "budget_warning",
        title: "Budget Warning",
        message: `You've used ₹${dailyCost.toFixed(0)} today — ${Math.round((dailyCost / user.dailyBudget) * 100)}% of your ₹${user.dailyBudget} daily budget.`,
        icon: "alert",
      });
    }
  }

  // 2. High usage — daily kWh > 30
  if (dailyKwh > 30) {
    const exists = await Notification.findOne({
      user: userId, type: "high_usage",
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });
    if (!exists) {
      toCreate.push({
        user: userId,
        type: "high_usage",
        title: "High Usage Detected",
        message: `Your current usage is ${dailyKwh.toFixed(1)} kWh/day which is above average. Consider turning off unused appliances.`,
        icon: "zap",
      });
    }
  }

  // 3. Appliance on too long — any appliance marked ON for > 8 hours
  for (const a of appliances.filter(a => a.isOn)) {
    const hoursSinceUpdate = (Date.now() - new Date(a.updatedAt).getTime()) / (1000 * 60 * 60);
    if (hoursSinceUpdate >= 8) {
      const exists = await Notification.findOne({
        user: userId, type: "appliance_on",
        message: { $regex: a.name },
        createdAt: { $gte: new Date(Date.now() - 8 * 60 * 60 * 1000) },
      });
      if (!exists) {
        toCreate.push({
          user: userId,
          type: "appliance_on",
          title: "Appliance Still On",
          message: `${a.name} has been ON for ${Math.round(hoursSinceUpdate)} hours. It's consuming ${((a.watts * hoursSinceUpdate) / 1000).toFixed(2)} kWh — did you forget to turn it off?`,
          icon: "bell",
        });
      }
    }
  }

  // 4. Weekly summary — Mondays only, once per week
  const now = new Date();
  if (now.getDay() === 1) { // Monday
    const exists = await Notification.findOne({
      user: userId, type: "weekly_summary",
      createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
    });
    if (!exists) {
      const weeklyKwh  = dailyKwh * 7;
      const weeklyCost = (weeklyKwh * (user.unitRate || 7.38)).toFixed(0);
      toCreate.push({
        user: userId,
        type: "weekly_summary",
        title: "Weekly Summary",
        message: `This week you consumed an estimated ${weeklyKwh.toFixed(1)} kWh across ${appliances.length} appliances, costing ₹${weeklyCost}.`,
        icon: "chart",
      });
    }
  }

  if (toCreate.length) await Notification.insertMany(toCreate);
}

// GET /api/notifications — fetch all + auto-generate
router.get("/", async (req, res) => {
  try {
    await generateNotifications(req.user._id);
    const notifications = await Notification.find({ user: req.user._id })
      .sort({ createdAt: -1 }).limit(20);
    const unreadCount = await Notification.countDocuments({ user: req.user._id, read: false });
    res.json({ notifications, unreadCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/notifications/:id/read — mark one as read
router.patch("/:id/read", async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user._id },
      { read: true }
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// PATCH /api/notifications/read-all — mark all as read
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany({ user: req.user._id, read: false }, { read: true });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/notifications/clear — clear all
router.delete("/clear", async (req, res) => {
  try {
    await Notification.deleteMany({ user: req.user._id });
    res.json({ success: true });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

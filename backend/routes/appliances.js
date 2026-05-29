const router = require("express").Router();
const auth = require("../middleware/auth");
const Appliance = require("../models/Appliance");

// All routes require authentication
router.use(auth);

// GET /api/appliances — get all for logged-in user
router.get("/", async (req, res) => {
  try {
    const appliances = await Appliance.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(appliances);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/appliances — add new
router.post("/", async (req, res) => {
  try {
    const { name, watts, room, icon, isOn } = req.body;
    if (!name || !watts) return res.status(400).json({ message: "Name and watts are required" });
    const appliance = await Appliance.create({ user: req.user._id, name, watts, room, icon, isOn });
    res.status(201).json(appliance);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /api/appliances/:id — update
router.put("/:id", async (req, res) => {
  try {
    const appliance = await Appliance.findOne({ _id: req.params.id, user: req.user._id });
    if (!appliance) return res.status(404).json({ message: "Not found" });
    const { name, watts, room, icon, isOn } = req.body;
    if (name  !== undefined) appliance.name  = name;
    if (watts !== undefined) appliance.watts = watts;
    if (room  !== undefined) appliance.room  = room;
    if (icon  !== undefined) appliance.icon  = icon;
    if (isOn  !== undefined) appliance.isOn  = isOn;
    await appliance.save();
    res.json(appliance);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// DELETE /api/appliances/:id
router.delete("/:id", async (req, res) => {
  try {
    const result = await Appliance.deleteOne({ _id: req.params.id, user: req.user._id });
    if (!result.deletedCount) return res.status(404).json({ message: "Not found" });
    res.json({ message: "Deleted" });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

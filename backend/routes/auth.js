const router  = require("express").Router();
const jwt     = require("jsonwebtoken");
const crypto  = require("crypto");
const User    = require("../models/User");
const { sendResetEmail } = require("../utils/sendEmail");

const sign = (user) =>
  jwt.sign(
    { id: user._id, name: user.name, email: user.email, homeName: user.homeName },
    process.env.JWT_SECRET,
    { expiresIn: "30d" }
  );

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const { name, email, password, homeName } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (await User.findOne({ email }))
      return res.status(400).json({ message: "Email already registered" });
    const user = await User.create({ name, email, password, homeName });
    res.status(201).json({ token: sign(user) });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: "Invalid email or password" });
    res.json({ token: sign(user) });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    // Always respond with success to prevent email enumeration attacks
    if (!user)
      return res.json({ message: "If that email exists, a reset link has been sent." });

    // Generate secure token
    const token   = crypto.randomBytes(32).toString("hex");
    const hashed  = crypto.createHash("sha256").update(token).digest("hex");
    const expiry  = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetToken       = hashed;
    user.resetTokenExpiry = expiry;
    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/reset-password/${token}`;

    await sendResetEmail(user.email, resetUrl, user.name);

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error("Forgot password error:", err.message);
    res.status(500).json({ message: "Could not send email. Please try again." });
  }
});

// POST /api/auth/reset-password/:token
router.post("/reset-password/:token", async (req, res) => {
  try {
    const hashed = crypto.createHash("sha256").update(req.params.token).digest("hex");
    const user   = await User.findOne({
      resetToken:       hashed,
      resetTokenExpiry: { $gt: Date.now() },
    });

    if (!user)
      return res.status(400).json({ message: "Reset link is invalid or has expired." });

    const { password } = req.body;
    if (!password || password.length < 6)
      return res.status(400).json({ message: "Password must be at least 6 characters." });

    user.password         = password;
    user.resetToken       = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully. You can now log in." });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;

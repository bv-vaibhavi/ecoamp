require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5179",
    "https://ecoamp.vercel.app",
    /\.vercel\.app$/,
  ],
  credentials: true,
}));
app.use(express.json());

app.use("/api/auth",       require("./routes/auth"));
app.use("/api/appliances", require("./routes/appliances"));
app.use("/api/user",          require("./routes/user"));
app.use("/api/notifications", require("./routes/notifications"));

app.get("/", (req, res) => res.json({ status: "ECOAMP API running" }));

const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB connected");
    app.listen(PORT, () => console.log(`✅ Server running on http://localhost:${PORT}`));
  })
  .catch((err) => {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  });

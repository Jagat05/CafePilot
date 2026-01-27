import express from "express";
import "dotenv/config";
import ConnectDB from "./database/db.js";
import router from "./routes/authRoutes.js";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());

// DB
ConnectDB();

// Routes
app.use("/api/auth", router);

app.get("/", (req, res) => {
  res.send("Cafe Pilot API running ☕");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

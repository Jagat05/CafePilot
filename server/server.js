import express from "express";
import "dotenv/config";
import ConnectDB from "./database/db.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware
app.use(express.json());
app.use(cookieParser());

// DB
ConnectDB();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  }),
);

// Routes
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);

app.get("/", (req, res) => {
  res.send("Cafe Pilot API running ☕");
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

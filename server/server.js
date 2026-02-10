import express from "express";
import "dotenv/config";
import ConnectDB from "./database/db.js";
import userRouter from "./routes/userRoutes.js";
import adminRouter from "./routes/adminRoutes.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import tableRouter from "./routes/tableRoutes.js";
import orderRouter from "./routes/orderRoutes.js";
import menuRouter from "./routes/menuRoutes.js";
import staffRouter from "./routes/staffRoutes.js";
import { Server } from "socket.io";
import { createServer } from "http";
import aiRoutes from "./routes/aiRoutes.js";

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  },
});

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

// Socket.io
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);
  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Pass io to request
app.use((req, res, next) => {
  req.io = io;
  next();
});

// Routes
app.use("/api/users", userRouter);
app.use("/api/admin", adminRouter);
app.use("/api/tables", tableRouter);
app.use("/api/orders", orderRouter);
app.use("/api/menu", menuRouter);
app.use("/api/staff", staffRouter);
app.use("/api/ai", aiRoutes);

app.get("/", (req, res) => {
  res.send("Cafe Pilot API running ☕");
});

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { io };

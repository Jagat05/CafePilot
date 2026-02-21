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
import planRouter from "./routes/planRoutes.js";
import paymentRouter from "./routes/paymentRoutes.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);

// Serve static files from uploads folder
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Allow localhost and LAN origins (e.g. http://192.168.1.80:3000) for mobile testing
const allowedOrigin = (origin) => {
  if (!origin) return true;
  if (origin === "http://localhost:3000" || origin === "http://127.0.0.1:3000") return true;
  if (/^http:\/\/192\.168\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) return true;
  if (/^http:\/\/10\.\d{1,3}\.\d{1,3}\.\d{1,3}(:\d+)?$/.test(origin)) return true;
  return false;
};

const io = new Server(server, {
  cors: {
    origin: (origin, cb) => (allowedOrigin(origin) ? cb(null, true) : cb(new Error("Not allowed"))),
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
    origin: (origin, cb) => (allowedOrigin(origin) ? cb(null, true) : cb(new Error("Not allowed"))),
    credentials: true,
  }),
);

// Socket.io
// io.on("connection", (socket) => {
//   console.log("A user connected:", socket.id);
//   socket.on("disconnect", () => {
//     console.log("User disconnected:", socket.id);
//   });
// });

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
app.use("/api/plans", planRouter);
app.use("/api/payments", paymentRouter);

app.get("/", (req, res) => {
  res.send("Cafe Pilot API running ☕");
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
});

export { io };

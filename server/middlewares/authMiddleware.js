import jwt from "jsonwebtoken";
import User from "../model/UserSchema.js";
import Settings from "../model/SettingsSchema.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded.id).select("-password");
    if (!user || user.status !== "approved") {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // CHECK MAINTENANCE MODE
    const settings = await Settings.findOne();
    if (settings?.maintenanceMode && user.role !== "admin") {
      return res.status(503).json({
        success: false,
        message: "System is under maintenance. Please try again later.",
      });
    }

    req.user = user;
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;

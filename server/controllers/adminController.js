import User from "../model/UserSchema.js";
import Settings from "../model/SettingsSchema.js";
import Subscription from "../model/SubscriptionSchema.js";
import bcrypt from "bcryptjs";

/* =====================
   CREATE OWNER
   ===================== */
export const createOwner = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields required",
      });
    }

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const owner = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "owner",
      status: "approved",
    });

    owner.password = undefined;

    res.status(201).json({
      success: true,
      message: "Owner created successfully",
      owner,
    });
  } catch {
    res.status(500).json({
      success: false,
      message: "Owner creation failed",
    });
  }
};

/* =====================
   VIEW PENDING OWNERS
   ===================== */
export const getPendingOwners = async (req, res) => {
  const owners = await User.find({
    role: "owner",
    status: "pending",
  }).select("-password");

  res.json({ success: true, owners });
};

/* =====================
   VIEW APPROVED OWNERS
   ===================== */
export const getApprovedOwners = async (req, res) => {
  const owners = await User.find({
    role: "owner",
    status: { $in: ["approved", "suspended"] },
  }).select("-password");

  res.json({ success: true, owners });
};

/* =====================
   APPROVE OWNER
   ===================== */
export const approveOwner = async (req, res) => {
  const owner = await User.findByIdAndUpdate(
    req.params.id,
    { status: "approved" },
    { new: true },
  ).select("-password");

  if (!owner) {
    return res.status(404).json({
      success: false,
      message: "Owner not found",
    });
  }

  // Create 7-day Trial Subscription
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + 7);

  await Subscription.findOneAndUpdate(
    { user: owner._id },
    {
      planName: "Trial",
      startDate: new Date(),
      expiryDate: expiryDate,
      status: "active",
      isTrial: true,
    },
    { upsert: true, new: true }
  );

  res.json({
    success: true,
    message: "Owner approved and 7-day trial activated",
    owner,
  });
};

/* =====================
   GLOBAL SETTINGS
   ===================== */
export const getGlobalSettings = async (req, res) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = await Settings.create({});
    }
    res.json({ success: true, settings });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch settings" });
  }
};

export const updateGlobalSettings = async (req, res) => {
  try {
    const { announcement, maintenanceMode } = req.body;
    let settings = await Settings.findOne();

    if (!settings) {
      settings = new Settings();
    }

    if (announcement !== undefined) settings.announcement = announcement;

    // Check if maintenance mode is being toggled
    const maintenanceToggledOn = maintenanceMode === true && settings.maintenanceMode === false;

    if (maintenanceMode !== undefined) {
      settings.maintenanceMode = maintenanceMode;
    }

    await settings.save();

    // Broadcast updates via Socket.io
    if (req.io) {
      if (announcement !== undefined) {
        req.io.emit("new-announcement", settings.announcement);
      }

      if (maintenanceMode !== undefined) {
        req.io.emit("maintenance-mode", {
          active: settings.maintenanceMode,
          forceLogout: maintenanceToggledOn
        });
      }
    }

    res.json({
      success: true,
      message: "Settings updated successfully",
      settings,
    });
  } catch (error) {
    console.error("Update settings error:", error);
    res.status(500).json({ success: false, message: "Failed to update settings" });
  }
};

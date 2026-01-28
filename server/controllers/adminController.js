import User from "../model/UserSchema.js";
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

  res.json({
    success: true,
    message: "Owner approved",
    owner,
  });
};

import User from "../model/UserSchema.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/* =====================
   OWNER REGISTRATION
   ===================== */
export const registerOwner = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    email = email.toLowerCase();

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: username,
      email,
      password: hashedPassword,
      role: "owner",
      status: "pending", // admin approval needed
    });

    user.password = undefined;

    res.status(201).json({
      success: true,
      message: "Registration successful. Awaiting admin approval.",
      user,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  }
};

/* =====================
   LOGIN (ADMIN & OWNER)
   ===================== */
export const loginUser = async (req, res) => {
  try {
    let { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password required",
      });
    }

    email = email.toLowerCase();

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    if (user.status !== "approved") {
      return res.status(403).json({
        success: false,
        message: "Account not approved by admin",
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    user.password = undefined;

    // res.status(200).json({
    //   success: true,
    //   token,
    //   user,
    // });
    res.cookie("token", token, {
      httpOnly: true, // JS can't access (XSS safe)
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict", // CSRF protection
      // maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

/* =====================
   LOGOUT (ADMIN & OWNER)
   ===================== */
export const logout = (req, res) => {
  res.clearCookie("token", {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
  });

  return res.status(200).json({ message: "Logged out successfully" });
};

/* =====================
   GET PROFILE (ME)
   ===================== */
export const getProfile = (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

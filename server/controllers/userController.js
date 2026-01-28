import User from "../model/UserSchema.js";
import bcrypt from "bcryptjs";

export const registerOwner = async (req, res) => {
  try {
    let { username, email, password } = req.body;

    // Validate required fields
    if (!username || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    //  Normalize email
    email = email.toLowerCase();

    //  Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    const salt = 10;
    const hashPassword = await bcrypt.hashSync(password, salt);

    //  Create user
    const user = await User.create({
      name: username,
      email,
      password: hashPassword,
    });
    //Remove the password from this object before sending it.
    user.password = undefined;
    // Success response
    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Error while registration",
    });
  }
};

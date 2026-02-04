import express from "express";
import {
  registerOwner,
  logout,
  loginUser,
  getProfile,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerOwner);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logout);
userRouter.get("/profile", authMiddleware, getProfile);

export default userRouter;

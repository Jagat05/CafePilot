import express from "express";
import {
  registerOwner,
  logout,
  loginUser,
  getProfile,
  checkApprovalStatus,
} from "../controllers/userController.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const userRouter = express.Router();

userRouter.post("/register", registerOwner);
userRouter.post("/login", loginUser);
userRouter.post("/logout", logout);
userRouter.post("/check-status", checkApprovalStatus);
userRouter.get("/profile", authMiddleware, getProfile);

export default userRouter;

import express from "express";
import { registerOwner, loginUser } from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/register", registerOwner);
userRouter.post("/login", loginUser);

export default userRouter;

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { isOwner } from "../middlewares/roleMiddleware.js";
import {
  getStaff,
  createStaff,
  updateStaff,
  deleteStaff,
  toggleStaffStatus,
} from "../controllers/staffController.js";

const staffRouter = express.Router();

staffRouter.get("/", authMiddleware, isOwner, getStaff);
staffRouter.post("/create", authMiddleware, isOwner, createStaff);
staffRouter.put("/update/:id", authMiddleware, isOwner, updateStaff);
staffRouter.patch("/toggle-status/:id", authMiddleware, isOwner, toggleStaffStatus);
staffRouter.delete("/delete/:id", authMiddleware, isOwner, deleteStaff);

export default staffRouter;

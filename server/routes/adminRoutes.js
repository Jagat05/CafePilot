import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import {
  createOwner,
  getPendingOwners,
  getApprovedOwners,
  approveOwner,
} from "../controllers/adminController.js";

const adminRouter = express.Router();

adminRouter.use(authMiddleware, isAdmin);

adminRouter.post("/create-owner", createOwner);
adminRouter.get("/pending-owners", getPendingOwners);
adminRouter.get("/approved-owners", getApprovedOwners);
adminRouter.put("/approve-owner/:id", approveOwner);

export default adminRouter;

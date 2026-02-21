import express from "express";
import { askAI } from "../controllers/aiController.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import { isOwner } from "../middlewares/roleMiddleware.js";
import checkSubscription from "../middlewares/subscriptionMiddleware.js";

const aiRoutes = express.Router();

aiRoutes.post("/ask", authMiddleware, isOwner, checkSubscription, askAI);

export default aiRoutes;

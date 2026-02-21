import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import {
    getPlans,
    createPlan,
    updatePlan,
    deletePlan,
} from "../controllers/planController.js";

const planRouter = express.Router();

// Public route to fetch active plans
planRouter.get("/", getPlans);

// Admin only routes
planRouter.use(authMiddleware, isAdmin);

planRouter.post("/", createPlan);
planRouter.put("/:id", updatePlan);
planRouter.delete("/:id", deletePlan);

export default planRouter;

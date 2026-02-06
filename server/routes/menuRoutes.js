import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { isOwner } from "../middlewares/roleMiddleware.js";
import {
    getMenuItems,
    createMenuItem,
    updateMenuItem,
    deleteMenuItem,
} from "../controllers/menuController.js";

const menuRouter = express.Router();

menuRouter.get("/items", authMiddleware, isOwner, getMenuItems);
menuRouter.post("/create", authMiddleware, isOwner, createMenuItem);
menuRouter.put("/update/:id", authMiddleware, isOwner, updateMenuItem);
menuRouter.delete("/delete/:id", authMiddleware, isOwner, deleteMenuItem);

export default menuRouter;

import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import {
  createOrder,
  getActiveOrder,
  updateOrder,
  completeOrder,
  cancelOrder,
  getAllOrders,
} from "../controllers/orderController.js";
import { isOwner } from "../middlewares/roleMiddleware.js";

const orderRouter = express.Router();

orderRouter.get("/all", authMiddleware, isOwner, getAllOrders);
orderRouter.get("/active/:tableId", authMiddleware, isOwner, getActiveOrder);
orderRouter.post("/create", authMiddleware, isOwner, createOrder);
orderRouter.put("/update/:id", authMiddleware, isOwner, updateOrder);
orderRouter.put("/complete/:id", authMiddleware, isOwner, completeOrder);
orderRouter.put("/cancel/:id", authMiddleware, isOwner, cancelOrder);

export default orderRouter;

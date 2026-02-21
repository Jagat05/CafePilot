import express from "express";
import authMiddleware from "../middlewares/authMiddleware.js";
import { isAdmin } from "../middlewares/roleMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";
import {
    submitPayment,
    getPendingPayments,
    updatePaymentStatus,
    getBillingStatus,
    getAllPayments,
    updatePayment,
    deletePayment,
} from "../controllers/paymentController.js";

const paymentRouter = express.Router();

paymentRouter.use(authMiddleware);

// User routes
paymentRouter.get("/status", getBillingStatus);
paymentRouter.post("/submit", upload.single("screenshot"), submitPayment);

// Admin routes
paymentRouter.get("/pending", isAdmin, getPendingPayments);
paymentRouter.get("/all", isAdmin, getAllPayments);
paymentRouter.put("/status/:id", isAdmin, updatePaymentStatus);
paymentRouter.put("/update/:id", isAdmin, updatePayment);
paymentRouter.delete("/:id", isAdmin, deletePayment);

export default paymentRouter;

import Payment from "../model/PaymentSchema.js";
import Subscription from "../model/SubscriptionSchema.js";
import SubscriptionPlan from "../model/SubscriptionPlanSchema.js";

/* =====================
   SUBMIT PAYMENT
   ===================== */
export const submitPayment = async (req, res) => {
    try {
        const { planName, amount, method, transactionId, notes } = req.body;
        const userId = req.user._id;

        if (!req.file) {
            return res.status(400).json({ success: false, message: "Payment proof screenshot is required" });
        }

        const payment = await Payment.create({
            user: userId,
            planName,
            amount,
            method,
            transactionId,
            notes,
            screenshot: `/uploads/payments/${req.file.filename}`,
        });

        res.status(201).json({
            success: true,
            message: "Payment submitted successfully. Waiting for admin approval.",
            payment,
        });
    } catch (error) {
        console.error("Submit payment error:", error);
        res.status(500).json({ success: false, message: "Failed to submit payment" });
    }
};

/* =====================
   GET PENDING PAYMENTS (Admin)
   ===================== */
export const getPendingPayments = async (req, res) => {
    try {
        const payments = await Payment.find({ status: "pending" }).populate("user", "name email");
        res.json({ success: true, payments });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch pending payments" });
    }
};

/* =====================
   APPROVE/REJECT PAYMENT (Admin)
   ===================== */
export const updatePaymentStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, rejectionReason } = req.body;

        const payment = await Payment.findById(id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment record not found" });
        }

        payment.status = status;
        if (status === "rejected") {
            payment.rejectionReason = rejectionReason;
        }
        await payment.save();

        if (status === "approved") {
            // Find the plan to get duration
            const plan = await SubscriptionPlan.findOne({ name: payment.planName });
            const durationDays = plan ? plan.durationInDays : 30; // default to 30 if plan not found

            // Check for existing subscription
            const existingSub = await Subscription.findOne({ user: payment.user });

            let startDate = new Date();
            let expiryDate = new Date();

            if (existingSub && existingSub.status === "active" && new Date(existingSub.expiryDate) > new Date()) {
                // If already active and not expired, start from current expiry
                startDate = new Date(existingSub.startDate); // keep original start if extending? Or update to now? User usually expects "added to remaining"
                expiryDate = new Date(existingSub.expiryDate);
                expiryDate.setDate(expiryDate.getDate() + durationDays);
            } else {
                // If no sub or expired, start from now
                expiryDate.setDate(expiryDate.getDate() + durationDays);
            }

            await Subscription.findOneAndUpdate(
                { user: payment.user },
                {
                    planName: payment.planName,
                    startDate: startDate,
                    expiryDate: expiryDate,
                    status: "active",
                    isTrial: false,
                },
                { upsert: true, new: true }
            );
        }

        res.json({
            success: true,
            message: `Payment ${status} successfully`,
            payment,
        });
    } catch (error) {
        console.error("Update payment status error:", error);
        res.status(500).json({ success: false, message: "Failed to update payment status" });
    }
};

/* =====================
   GET USER BILLING STATUS
   ===================== */
export const getBillingStatus = async (req, res) => {
    try {
        const userId = req.user._id;
        let subscription = await Subscription.findOne({ user: userId });
        const latestPayment = await Payment.findOne({ user: userId }).sort({ createdAt: -1 });

        // Proactively check for expiration
        if (subscription && subscription.status === "active") {
            if (new Date() > new Date(subscription.expiryDate)) {
                subscription.status = "expired";
                await subscription.save();
            }
        }

        res.json({
            success: true,
            subscription,
            latestPayment,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch billing status" });
    }
};

/* =====================
   GET ALL PAYMENTS (Admin)
   ===================== */
export const getAllPayments = async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate("user", "name email")
            .sort({ createdAt: -1 });

        // Optionally, we could fetch subscriptions to show expiry
        // But let's keep it simple and just return payments for now.
        // We can fetch subscriptions separately or join them if needed.

        const subscriptions = await Subscription.find();

        const paymentsWithExpiry = payments.map(payment => {
            const sub = subscriptions.find(s => s.user.toString() === payment.user._id.toString());
            return {
                ...payment.toObject(),
                expiryDate: sub ? sub.expiryDate : null
            };
        });

        res.json({ success: true, payments: paymentsWithExpiry });
    } catch (error) {
        console.error("Get all payments error:", error);
        res.status(500).json({ success: false, message: "Failed to fetch payment history" });
    }
};

/* =====================
   UPDATE PAYMENT (Admin)
   ===================== */
export const updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const payment = await Payment.findByIdAndUpdate(id, updates, { new: true });
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        res.json({ success: true, message: "Payment updated successfully", payment });
    } catch (error) {
        console.error("Update payment error:", error);
        res.status(500).json({ success: false, message: "Failed to update payment" });
    }
};

/* =====================
   DELETE PAYMENT (Admin)
   ===================== */
export const deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await Payment.findByIdAndDelete(id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        res.json({ success: true, message: "Payment deleted successfully" });
    } catch (error) {
        console.error("Delete payment error:", error);
        res.status(500).json({ success: false, message: "Failed to delete payment" });
    }
};

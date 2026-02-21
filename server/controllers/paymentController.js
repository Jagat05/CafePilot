import Payment from "../model/PaymentSchema.js";
import Subscription from "../model/SubscriptionSchema.js";

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
            // Create or Update Subscription
            const expiryDate = new Date();
            expiryDate.setDate(expiryDate.getDate() + 30); // 30 days subscription

            await Subscription.findOneAndUpdate(
                { user: payment.user },
                {
                    planName: payment.planName,
                    startDate: new Date(),
                    expiryDate: expiryDate,
                    status: "active",
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
        const subscription = await Subscription.findOne({ user: userId });
        const latestPayment = await Payment.findOne({ user: userId }).sort({ createdAt: -1 });

        res.json({
            success: true,
            subscription,
            latestPayment,
        });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch billing status" });
    }
};

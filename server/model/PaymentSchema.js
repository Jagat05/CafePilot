import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        planName: {
            type: String,
            required: true,
        },
        amount: {
            type: Number,
            required: true,
        },
        method: {
            type: String,
            enum: ["eSewa", "Khalti", "Bank Transfer"],
            required: true,
        },
        screenshot: {
            type: String, // URL/Path to the uploaded image
            required: true,
        },
        transactionId: {
            type: String,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending",
        },
        notes: {
            type: String,
        },
        rejectionReason: {
            type: String,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);

import mongoose from "mongoose";

const subscriptionSchema = new mongoose.Schema(
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
        startDate: {
            type: Date,
            required: true,
            default: Date.now,
        },
        expiryDate: {
            type: Date,
            required: true,
        },
        status: {
            type: String,
            enum: ["active", "expired"],
            default: "active",
        },
        isTrial: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Subscription", subscriptionSchema);

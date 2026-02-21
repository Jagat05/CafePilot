import mongoose from "mongoose";

const subscriptionPlanSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        price: {
            type: String,
            required: true,
        },
        description: {
            type: String,
            required: true,
        },
        features: [
            {
                type: String,
            },
        ],
        popular: {
            type: Boolean,
            default: false,
        },
        durationInDays: {
            type: Number,
            required: true,
            default: 30,
        },
        status: {
            type: String,
            enum: ["active", "hidden"],
            default: "active",
        },
    },
    { timestamps: true }
);

export default mongoose.model("SubscriptionPlan", subscriptionPlanSchema);

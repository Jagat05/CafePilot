import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ConnectDB from "../database/db.js";
import SubscriptionPlan from "../model/SubscriptionPlanSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const plans = [
    {
        name: "Monthly",
        price: "NRs 1150",
        description: "Standard monthly subscription for full access.",
        features: ["Unlimited Staff", "Full Analytics", "Standard Support"],
        popular: false,
    },
    {
        name: "Quarterly",
        price: "NRs 6000",
        description: "Save more with our 3-month billing cycle.",
        features: ["Unlimited Staff", "Full Analytics", "Priority Support", "Inventory Management"],
        popular: true,
    },
    {
        name: "Yearly",
        price: "NRs 10000",
        description: "Best value for long-term commitment.",
        features: ["Everything in Quarterly", "Custom API Access", "Dedicated Support", "Multi-location Support"],
        popular: false,
    },
];

const seedPlans = async () => {
    try {
        await ConnectDB();

        // Clear existing plans
        await SubscriptionPlan.deleteMany({});

        // Insert new plans
        await SubscriptionPlan.insertMany(plans);

        console.log("✅ Subscription plans seeded successfully!");
        process.exit();
    } catch (error) {
        console.error("❌ Seeding plans failed:", error);
        process.exit(1);
    }
};

seedPlans();

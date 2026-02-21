import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import ConnectDB from "../database/db.js";
import Subscription from "../model/SubscriptionSchema.js";
import User from "../model/UserSchema.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

const testExpiration = async () => {
    try {
        await ConnectDB();

        // Get any user or a specific one
        const user = await User.findOne({ role: "owner" });
        if (!user) {
            console.log("No owner user found to test.");
            process.exit(0);
        }

        console.log(`Setting subscription for ${user.email} to EXPIRED...`);

        // Create a past expiry date
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - 5); // 5 days ago

        await Subscription.findOneAndUpdate(
            { user: user._id },
            {
                planName: "Test Expired Plan",
                startDate: new Date(pastDate.getTime() - 30 * 24 * 60 * 60 * 1000),
                expiryDate: pastDate,
                status: "active", // We set it to active but with past date to test the "auto-check" logic
            },
            { upsert: true, new: true }
        );

        console.log("✅ Subscription set to past date. Now refresh your dashboard.");
        console.log("The server should detect this and block access.");
        process.exit();
    } catch (error) {
        console.error("❌ Test script failed:", error);
        process.exit(1);
    }
};

testExpiration();

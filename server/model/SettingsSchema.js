import mongoose from "mongoose";

const settingsSchema = new mongoose.Schema(
    {
        announcement: {
            type: String,
            default: "",
        },
        maintenanceMode: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true },
);

export default mongoose.model("Settings", settingsSchema);

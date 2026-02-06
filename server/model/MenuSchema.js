import mongoose from "mongoose";

const menuSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            enum: ["coffee", "tea", "pastry", "sandwich", "dessert", "beverage"],
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        description: {
            type: String,
            default: "",
        },
        available: {
            type: Boolean,
            default: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    },
    { timestamps: true }
);

export default mongoose.model("Menu", menuSchema);

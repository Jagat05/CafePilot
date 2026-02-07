import mongoose from "mongoose";

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    phone: {
      type: String,
      default: "",
    },
    role: {
      type: String,
      enum: ["admin", "manager", "barista", "cashier", "cook", "helper"],
      default: "barista",
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    hireDate: {
      type: Date,
      default: Date.now,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Staff", staffSchema);

import SubscriptionPlan from "../model/SubscriptionPlanSchema.js";

/* =====================
   GET ALL PLANS
   ===================== */
export const getPlans = async (req, res) => {
    try {
        const plans = await SubscriptionPlan.find({ status: "active" });
        res.json({ success: true, plans });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to fetch plans" });
    }
};

/* =====================
   CREATE PLAN (Admin)
   ===================== */
export const createPlan = async (req, res) => {
    try {
        const { name, price, description, features, popular } = req.body;

        if (!name || !price || !description) {
            return res.status(400).json({ success: false, message: "Required fields missing" });
        }

        const plan = await SubscriptionPlan.create({
            name,
            price,
            description,
            features,
            popular,
        });

        res.status(201).json({ success: true, message: "Plan created successfully", plan });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to create plan" });
    }
};

/* =====================
   UPDATE PLAN (Admin)
   ===================== */
export const updatePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const plan = await SubscriptionPlan.findByIdAndUpdate(id, updates, { new: true });

        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }

        res.json({ success: true, message: "Plan updated successfully", plan });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to update plan" });
    }
};

/* =====================
   DELETE PLAN (Admin)
   ===================== */
export const deletePlan = async (req, res) => {
    try {
        const { id } = req.params;
        const plan = await SubscriptionPlan.findByIdAndDelete(id);

        if (!plan) {
            return res.status(404).json({ success: false, message: "Plan not found" });
        }

        res.json({ success: true, message: "Plan deleted successfully" });
    } catch (error) {
        res.status(500).json({ success: false, message: "Failed to delete plan" });
    }
};

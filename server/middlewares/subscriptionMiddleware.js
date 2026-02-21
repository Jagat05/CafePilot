import Subscription from "../model/SubscriptionSchema.js";

const checkSubscription = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const subscription = await Subscription.findOne({ user: userId });

        if (!subscription || subscription.status !== "active") {
            return res.status(403).json({
                success: false,
                message: "Active subscription required to access this feature.",
                subscriptionRequired: true,
            });
        }

        // Check if expired
        if (new Date() > new Date(subscription.expiryDate)) {
            subscription.status = "expired";
            await subscription.save();
            return res.status(403).json({
                success: false,
                message: "Your subscription has expired. Please renew to continue.",
                subscriptionRequired: true,
            });
        }

        next();
    } catch (error) {
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export default checkSubscription;

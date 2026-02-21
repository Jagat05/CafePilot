"use client";

import { useEffect, useRef } from "react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useToast } from "@/hooks/use-toast";

export function SubscriptionAlert() {
    const { status, expiryDate, loading, planName } = useSubscription();
    const { toast } = useToast();
    const alertedRef = useRef(false);

    useEffect(() => {
        if (!loading && status === "active" && expiryDate && !alertedRef.current) {
            const expiry = new Date(expiryDate);
            const now = new Date();
            const diffInTime = expiry.getTime() - now.getTime();
            const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));

            if (diffInDays <= 10 && diffInDays > 0) {
                toast({
                    title: "Subscription Expiry Alert",
                    description: `Your Subscription will finish in around ${diffInDays} days so please buy subscription.`,
                    variant: "destructive",
                    duration: 1000000, // Stay visible until manually closed
                });
                alertedRef.current = true;
            }
        }

        // Reset alert flag if subscription status changes (e.g. after renewal)
        if (status === "active" && expiryDate) {
            const expiry = new Date(expiryDate);
            const now = new Date();
            const diffInTime = expiry.getTime() - now.getTime();
            const diffInDays = Math.ceil(diffInTime / (1000 * 3600 * 24));
            if (diffInDays > 10) {
                alertedRef.current = false;
            }
        }
    }, [loading, status, expiryDate, planName, toast]);

    return null;
}

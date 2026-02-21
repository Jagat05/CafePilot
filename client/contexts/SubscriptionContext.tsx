"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";

interface SubscriptionContextType {
    status: "active" | "expired" | "none" | "pending";
    expiryDate: string | null;
    planName: string | null;
    loading: boolean;
    refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: React.ReactNode }) {
    const [status, setStatus] = useState<"active" | "expired" | "none" | "pending">("none");
    const [expiryDate, setExpiryDate] = useState<string | null>(null);
    const [planName, setPlanName] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const refreshSubscription = async () => {
        try {
            const res = await axiosInstance.get("/payments/status");
            if (res.data.success) {
                const sub = res.data.subscription;
                const payment = res.data.latestPayment;

                if (sub && sub.status === "active") {
                    setStatus("active");
                    setExpiryDate(sub.expiryDate);
                    setPlanName(sub.planName);
                } else if (sub && sub.status === "expired") {
                    setStatus("expired");
                    setExpiryDate(sub.expiryDate);
                    setPlanName(sub.planName);
                } else if (payment && payment.status === "pending") {
                    setStatus("pending");
                    setPlanName(payment.planName);
                } else {
                    setStatus("none");
                }
            }
        } catch (error) {
            console.error("Subscription fetch error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        refreshSubscription();
    }, []);

    return (
        <SubscriptionContext.Provider
            value={{ status, expiryDate, planName, loading, refreshSubscription }}
        >
            {children}
        </SubscriptionContext.Provider>
    );
}

export function useSubscription() {
    const context = useContext(SubscriptionContext);
    if (context === undefined) {
        throw new Error("useSubscription must be used within a SubscriptionProvider");
    }
    return context;
}

"use client";

import React from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle, CreditCard } from "lucide-react";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useRouter, usePathname } from "next/navigation";

export function SubscriptionShield({ children }: { children: React.ReactNode }) {
    const { status, loading } = useSubscription();
    const router = useRouter();
    const pathname = usePathname();

    // Don't block the billing page itself or the login/register pages
    const isExcludedPage =
        pathname.includes("/billings") ||
        pathname.includes("/login") ||
        pathname.includes("/register") ||
        pathname === "/";

    const isBlocked = !loading && (status === "none" || status === "expired") && !isExcludedPage;

    return (
        <>
            <Dialog open={isBlocked} onOpenChange={() => { }}>
                <DialogContent className="sm:max-w-[425px] [&>button]:hidden">
                    <DialogHeader className="flex flex-col items-center gap-2">
                        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-xl text-center">Subscription Required</DialogTitle>
                        <DialogDescription className="text-center">
                            Please choose a subscription plan and complete the payment to continue using Cafe Pilot features.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 border-t border-b border-gray-100 italic text-sm text-center text-muted-foreground">
                        "Unlock full access to dashboard, menu management, and AI features."
                    </div>
                    <DialogFooter className="flex-col sm:flex-col gap-2">
                        <Button
                            className="w-full h-11 bg-primary hover:bg-primary/90"
                            onClick={() => router.push("/cafedashboard/billings")}
                        >
                            <CreditCard className="mr-2 h-4 w-4" /> Choose Subscription
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            onClick={() => router.push("/login")}
                        >
                            Cancel & Logout
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* If blocked, we still render children but they are hidden behind the modal */}
            {/* Alternatively, we can blur them */}
            <div className={isBlocked ? "blur-sm pointer-events-none select-none" : ""}>
                {children}
            </div>
        </>
    );
}

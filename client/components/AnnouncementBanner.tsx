"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, ShieldAlert, X } from "lucide-react";
import { usePathname } from "next/navigation";
import { useBanner } from "@/contexts/BannerContext";

export default function AnnouncementBanner() {
    const { announcement, maintenanceMode, showAnnouncement, setShowAnnouncement } = useBanner();
    const pathname = usePathname();

    const isLandingPage = pathname === "/";
    const isDashboard = pathname.startsWith("/cafedashboard");

    const showMaintenanceBanner = maintenanceMode && isLandingPage;
    const showAnnouncementBanner = announcement && showAnnouncement && isDashboard;

    const activeBanner = showMaintenanceBanner ? "maintenance" : (showAnnouncementBanner ? "announcement" : null);

    if (!activeBanner) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className={`fixed top-0 left-0 right-0 z-[100] px-4 py-2 flex items-center justify-between shadow-md ${activeBanner === "maintenance"
                    ? "bg-destructive text-destructive-foreground"
                    : "bg-accent text-accent-foreground"
                    }`}
            >
                <div className="flex items-center gap-2 text-sm font-medium">
                    {activeBanner === "maintenance" ? (
                        <ShieldAlert className="w-4 h-4 animate-pulse" />
                    ) : (
                        <Bell className="w-4 h-4 animate-bounce" />
                    )}
                    <span>
                        {activeBanner === "maintenance"
                            ? "SYSTEM UNDER MAINTENANCE: Platform is restricted to Admins only."
                            : announcement}
                    </span>
                </div>
                {activeBanner === "announcement" && (
                    <button
                        onClick={() => setShowAnnouncement(false)}
                        className="p-1 hover:bg-white/10 rounded-full transition-colors"
                    >
                        <X className="w-4 h-4" />
                    </button>
                )}
            </motion.div>
        </AnimatePresence>
    );
}

"use client";
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { io } from "socket.io-client";
import { usePathname } from "next/navigation";

interface BannerContextType {
    announcement: string;
    maintenanceMode: boolean;
    showAnnouncement: boolean;
    setShowAnnouncement: (show: boolean) => void;
    hasBanner: boolean;
}

const BannerContext = createContext<BannerContextType | undefined>(undefined);

export const BannerProvider = ({ children }: { children: ReactNode }) => {
    const [announcement, setAnnouncement] = useState("");
    const [showAnnouncement, setShowAnnouncement] = useState(true);
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const socket = io("http://localhost:8080", { withCredentials: true });

        const fetchSettings = async () => {
            try {
                const res = await fetch("http://localhost:8080/api/admin/settings", {
                    credentials: "include",
                });
                const data = await res.json();
                if (data.success) {
                    setAnnouncement(data.settings.announcement || "");
                    setMaintenanceMode(data.settings.maintenanceMode || false);

                    if (data.settings.maintenanceMode) {
                        checkAndForceLogout();
                    }
                }
            } catch (e) {
                console.error("Error fetching initial settings:", e);
            }
        };

        fetchSettings();

        socket.on("new-announcement", (msg: string) => {
            setAnnouncement(msg);
            setShowAnnouncement(true);
        });

        socket.on("maintenance-mode", (data: { active: boolean; forceLogout: boolean }) => {
            setMaintenanceMode(data.active);
            if (data.forceLogout) {
                checkAndForceLogout();
            }
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    const checkAndForceLogout = () => {
        const userCookie = document.cookie
            .split("; ")
            .find((row) => row.startsWith("user="));

        if (userCookie) {
            try {
                const userValue = JSON.parse(decodeURIComponent(userCookie.split("=")[1]));
                if (userValue.role !== "admin") {
                    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    document.cookie = "user=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                    window.location.href = "/";
                }
            } catch (e) {
                console.error("Force logout parsing error:", e);
            }
        }
    };

    const isLanding = pathname === "/";
    const isDashboard = pathname.startsWith("/cafedashboard");

    const hasBanner = !!((maintenanceMode && isLanding) || (announcement && showAnnouncement && isDashboard));

    return (
        <BannerContext.Provider value={{ announcement, maintenanceMode, showAnnouncement, setShowAnnouncement, hasBanner }}>
            {children}
        </BannerContext.Provider>
    );
};

export const useBanner = () => {
    const context = useContext(BannerContext);
    if (!context) throw new Error("useBanner must be used within BannerProvider");
    return context;
};

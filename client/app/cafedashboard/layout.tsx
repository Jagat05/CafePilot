"use client";
import { AppSidebar } from "@/components/dashboardSidebar";
import {
  SidebarProvider,
  SidebarTrigger,
  SidebarInset,
} from "@/components/ui/sidebar";
import { usePathname } from "next/navigation";
// import { useAuth } from '@/contexts/AuthContext';
// import { Navigate } from 'react-router-dom';
import { ReactNode } from "react";
import { useBanner } from "@/contexts/BannerContext";

interface DashboardLayoutProps {
  children: ReactNode;
  title?: string;
}

export default function DashboardLayout({
  children,
  title,
}: DashboardLayoutProps) {
  const { hasBanner } = useBanner();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset className="flex-1">
          <header className={`sticky z-10 flex h-16 items-center gap-4 border-b bg-background/95 px-6 backdrop-blur supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ${hasBanner ? "top-10" : "top-0"
            }`}>
            <SidebarTrigger className="-ml-2" />
            {title && (
              <h1 className="text-xl font-semibold text-foreground">{title}</h1>
            )}
            <h1 className="text-xl font-semibold capitalize">
              {usePathname().split("/").pop() || "Dashboard"}
            </h1>
          </header>
          <main className="flex-1 p-6">{children}</main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}

"use client";
import {
  UtensilsCrossed,
  ClipboardList,
  Package,
  Users,
  LayoutDashboard,
  LogOut,
  Table,
  Table2,
  Settings,
  DollarSign,
} from "lucide-react";
// import { NavLink } from '@/components/NavLink';
// import { useAuth } from '@/contexts/AuthContext';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";
import React from "react";
import API from "@/lib/axios";
import Image from "next/image";

const AdminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "ManageCafe", url: "/admin/managecafe", icon: Table2 },
  { title: "Payments", url: "/admin/payments", icon: ClipboardList },
  { title: "Billings", url: "/admin/billings", icon: DollarSign },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const [user, setUser] = React.useState<{ name: string; role: string } | null>(
    null,
  );
  const router = useRouter();
  const pathname = usePathname();

  React.useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await API.get("/users/profile");
        if (data.success) {
          setUser(data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user profile", error);
      }
    };
    fetchUser();
  }, []);

  const collapsed = state === "collapsed";
  const handleLogout = async () => {
    try {
      await API.post("/users/logout");
      router.replace("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  return (
    <Sidebar className="border-r-0" collapsible="icon">
      <SidebarHeader className="h-16 border-b border-sidebar-border px-3">
        <div className="flex items-center justify-center  gap-3 pt-1">
          <div>
            <Image
              src="/cafepilot.png"
              alt="CafePilot Logo"
              width={40}
              height={40}
              className="object-contain"
              priority
            />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-base font-bold text-sidebar-foreground leading-tight">
                CafePilot
              </span>
              <span className="text-[10px] text-sidebar-foreground/60 leading-tight truncate max-w-[100px]">
                Manage Smoothly
              </span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Admin Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {AdminItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    tooltip={item.title}
                    onClick={() => router.push(item.url)}
                    className={`flex items-center gap-2 rounded-lg px-2 py-1.5 transition-colors
        hover:bg-amber-500
        ${pathname === item.url ? "bg-accent text-sidebar-primary font-medium" : "text-sidebar-foreground"}
      `}
                  >
                    <item.icon className="h-4 w-4 shrink-0" />
                    {!collapsed && (
                      <span className="text-sm">{item.title}</span>
                    )}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-xs">
              {user ? user.name.charAt(0).toUpperCase() : "CP"}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-xs font-medium text-sidebar-foreground">
                {user ? user.name : "Loading..."}
              </span>
              <span className="truncate text-[10px] capitalize text-sidebar-foreground/60">
                {user ? user.role : "Guest"}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="h-7 w-7 shrink-0 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

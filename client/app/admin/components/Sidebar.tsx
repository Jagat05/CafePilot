"use client";
import {
  Coffee,
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

const AdminItems = [
  { title: "Dashboard", url: "/admin", icon: LayoutDashboard },
  { title: "ManageCafe", url: "/admin/managecafe", icon: Table2 },
  { title: "Billings", url: "/admin/billings", icon: DollarSign },
  { title: "Settings", url: "/admin/settings", icon: Settings },
];

export function AdminSidebar() {
  const { state } = useSidebar();
  // const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const collapsed = state === "collapsed";

  return (
    <Sidebar className="border-r-0" collapsible="icon">
      <SidebarHeader className="h-16 border-b border-sidebar-border px-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <Coffee className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-sidebar-foreground">
                CafePilot
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Cafe Management
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
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-colors
        hover:bg-amber-500
        ${pathname === item.url ? "bg-accent text-sidebar-primary font-medium" : "text-sidebar-foreground"}
      `}
                  >
                    <item.icon className="h-5 w-5 shrink-0" />
                    {!collapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-4">
        {/* {user && (
          <div className="flex items-center gap-3">
            <Avatar className="h-9 w-9">
              <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
                {user.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="flex flex-1 flex-col overflow-hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  {user.name}
                </span>
                <span className="truncate text-xs capitalize text-sidebar-foreground/60">
                  {user.role}
                </span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={logout}
              className="shrink-0 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        )} */}
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";
import React from "react";
import {
  Coffee,
  UtensilsCrossed,
  ClipboardList,
  Users,
  LayoutDashboard,
  LogOut,
  Table2,
} from "lucide-react";
import API from "@/lib/axios";

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
import Image from "next/image";

const menuItems = [
  {
    title: "Dashboard",
    url: "/cafedashboard/dashboard",
    icon: LayoutDashboard,
  },
  { title: "Table", url: "/cafedashboard/tables", icon: Table2 },
  { title: "Menu", url: "/cafedashboard/menu", icon: UtensilsCrossed },
  { title: "Orders", url: "/cafedashboard/orders", icon: ClipboardList },
  { title: "Staff", url: "/cafedashboard/staff", icon: Users },
];

export function AppSidebar() {
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
      <SidebarHeader className="h-16 border-b border-sidebar-border px-4">
        <div className="flex items-center justify-center gap-3">
          {/* <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent"> */}
          {/* <Coffee className="h-6 w-6 text-sidebar-primary-foreground" /> */}
          <Image
            src="/cafepilot.jpg"
            alt="CafePilot Logo"
            width={50}
            height={40}
          />
          {/* </div> */}
          {/* {!collapsed && (
            <div className="flex flex-col">
              <span className="text-lg font-bold text-sidebar-foreground">
                CafePilot
              </span>
              <span className="text-xs text-sidebar-foreground/60">
                Cafe Management
              </span>
            </div>
          )} */}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">
            Navigation
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
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
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm">
              {user ? user.name.charAt(0).toUpperCase() : "CP"}
            </AvatarFallback>
          </Avatar>

          {!collapsed && (
            <div className="flex flex-1 flex-col overflow-hidden">
              <span className="truncate text-sm font-medium text-sidebar-foreground">
                {user ? user.name : "Loading..."}
              </span>
              <span className="truncate text-xs capitalize text-sidebar-foreground/60">
                {user ? user.role : "Guest"}
              </span>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="shrink-0 text-sidebar-foreground/60 hover:bg-sidebar-accent hover:text-sidebar-foreground"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Coffee,
  ShoppingBag,
  Users,
  TrendingUp,
  BanknoteArrowDown,
  UtensilsCrossed,
} from "lucide-react";
import API from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import AIAssistant from "@/components/ai/AIAssistant";

type OrderStatus = "active" | "completed";

interface OrderItem {
  menuItem?: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  table: { tableNumber: number } | string;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: string;
}

export default function Dashboard() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuCount, setMenuCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        const [ordersRes, menuRes, staffRes, tablesRes] = await Promise.all([
          API.get("/orders/all"),
          API.get("/menu/items"),
          API.get("/staff"),
          API.get("/tables/table"),
        ]);

        if (ordersRes.data?.orders) setOrders(ordersRes.data.orders);
        if (menuRes.data?.menuItems)
          setMenuCount(menuRes.data.menuItems.length);
        if (staffRes.data?.staff)
          setStaffCount(
            staffRes.data.staff.filter(
              (s: { status: string }) => s.status === "active",
            ).length,
          );
        if (tablesRes.data?.tables) setTables(tablesRes.data.tables);
      } catch (err) {
        console.error("Dashboard fetch failed", err);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [toast]);

  const activeOrders = orders.filter((o) => o.status === "active").length;
  const totalRevenue = orders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;

  const recentOrders = orders.slice(0, 5);

  const statsCards = [
    {
      title: "Active Orders",
      value: activeOrders,
      description: "Orders being processed",
      icon: ShoppingBag,
      trend: null as string | null,
      trendUp: true,
    },
    {
      title: "Revenue (completed)",
      value: `NRS. ${totalRevenue.toFixed(2)}`,
      description: "From completed orders",
      icon: BanknoteArrowDown,
      trend: null,
      trendUp: true,
    },
    {
      title: "Menu Items",
      value: menuCount,
      description: "Available products",
      icon: Coffee,
      trend: null,
      trendUp: true,
    },
    {
      title: "Active Staff",
      value: staffCount,
      description: "Team members on duty",
      icon: Users,
      trend: null,
      trendUp: true,
    },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="warm-shadow">
              <CardHeader className="pb-2">
                <div className="h-5 w-32 animate-pulse rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-8 w-24 animate-pulse rounded bg-muted" />
                <div className="mt-2 h-4 w-40 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card className="warm-shadow">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Loading…</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-16 animate-pulse rounded-lg border bg-muted"
                  />
                ))}
              </div>
            </CardContent>
          </Card>
          <Card className="warm-shadow">
            <CardHeader>
              <CardTitle>Table Status</CardTitle>
              <CardDescription>Loading…</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-24 animate-pulse rounded-lg bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="space-y-6 animate-fade-in">
        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {statsCards.map((stat) => (
            <Card key={stat.title} className="warm-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {stat.trend != null && (
                    <span
                      className={
                        stat.trendUp ? "text-success" : "text-destructive"
                      }
                    >
                      <TrendingUp className="mr-1 inline h-3 w-3" />
                      {stat.trend}
                    </span>
                  )}
                  <span>{stat.description}</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Orders */}
          <Card className="warm-shadow">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    No orders yet. Create orders from the Orders page.
                  </div>
                ) : (
                  recentOrders.map((order) => {
                    const tableNum =
                      typeof order.table === "object" &&
                      order.table?.tableNumber != null
                        ? order.table.tableNumber
                        : "—";
                    const itemCount =
                      order.items?.reduce((s, i) => s + (i.quantity || 0), 0) ||
                      0;
                    return (
                      <div
                        key={order._id}
                        className="flex items-center justify-between rounded-lg border p-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">
                            Table {tableNum}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {itemCount} items • NRS.{" "}
                            {(order.totalAmount || 0).toFixed(2)}
                          </p>
                        </div>
                        <Badge
                          variant={
                            order.status === "completed"
                              ? "default"
                              : "secondary"
                          }
                        >
                          {order.status}
                        </Badge>
                      </div>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>

          {/* Table Status */}
          <Card className="warm-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UtensilsCrossed className="h-5 w-5 text-primary" />
                Table Status
              </CardTitle>
              <CardDescription>
                {occupiedTables} of {tables.length} tables occupied
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {tables.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-4 text-center text-sm text-muted-foreground">
                    No tables yet. Add tables from the Tables page.
                  </div>
                ) : (
                  <div className="grid gap-2 sm:grid-cols-2">
                    {tables.map((table) => (
                      <div
                        key={table._id}
                        className={`flex items-center justify-between rounded-lg border p-3 ${
                          table.status === "occupied"
                            ? "border-warning/30 bg-warning/5"
                            : "border-success/30 bg-success/5"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-medium">
                            Table {table.tableNumber}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {table.capacity} seats
                          </p>
                        </div>
                        <Badge
                          variant={
                            table.status === "occupied"
                              ? "secondary"
                              : "outline"
                          }
                          className={
                            table.status === "available"
                              ? "border-success/50 text-success"
                              : ""
                          }
                        >
                          {table.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

         <AIAssistant/>
        </div>
      </div>
    </div>
  );
}

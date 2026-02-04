"use client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  mockOrders,
  mockInventory,
  mockMenuItems,
  mockStaff,
} from "@/data/mockData";
import {
  Coffee,
  DollarSign,
  ShoppingBag,
  AlertTriangle,
  Users,
  TrendingUp,
} from "lucide-react";
import DashboardLayout from "../layout";

export default function Dashboard() {
  const pendingOrders = mockOrders.filter(
    (o) => o.status === "pending" || o.status === "preparing",
  ).length;
  const totalRevenue = mockOrders
    .filter((o) => o.status === "completed")
    .reduce((sum, o) => sum + o.total, 0);
  const lowStockItems = mockInventory.filter(
    (i) => i.quantity <= i.reorderLevel,
  ).length;
  const activeStaff = mockStaff.filter((s) => s.status === "active").length;

  const recentOrders = mockOrders.slice(0, 5);

  const statsCards = [
    {
      title: "Active Orders",
      value: pendingOrders,
      description: "Orders being processed",
      icon: ShoppingBag,
      trend: "+12%",
      trendUp: true,
    },
    {
      title: "Today's Revenue",
      value: `$${totalRevenue.toFixed(2)}`,
      description: "Total sales today",
      icon: DollarSign,
      trend: "+8%",
      trendUp: true,
    },
    {
      title: "Menu Items",
      value: mockMenuItems.length,
      description: "Available products",
      icon: Coffee,
      trend: "0%",
      trendUp: true,
    },
    {
      title: "Active Staff",
      value: activeStaff,
      description: "Team members on duty",
      icon: Users,
      trend: "+2",
      trendUp: true,
    },
  ];

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
                  <span
                    className={
                      stat.trendUp ? "text-success" : "text-destructive"
                    }
                  >
                    <TrendingUp className="mr-1 inline h-3 w-3" />
                    {stat.trend}
                  </span>
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
              <CardDescription>Latest customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between rounded-lg border p-3"
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium">
                        {order.customerName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Table {order.tableNumber} • {order.items.length} items
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm font-semibold">
                        ${order.total.toFixed(2)}
                      </span>
                      <Badge
                        variant={
                          order.status === "ready"
                            ? "default"
                            : order.status === "preparing"
                              ? "secondary"
                              : "outline"
                        }
                      >
                        {order.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Low Stock Alerts */}
          <Card className="warm-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-warning" />
                Inventory Alerts
              </CardTitle>
              <CardDescription>Items that need restocking</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lowStockItems > 0 ? (
                  mockInventory
                    .filter((i) => i.quantity <= i.reorderLevel)
                    .map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between rounded-lg border border-warning/30 bg-warning/5 p-3"
                      >
                        <div className="space-y-1">
                          <p className="text-sm font-medium">{item.name}</p>
                          <p className="text-xs text-muted-foreground">
                            Supplier: {item.supplier}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-warning">
                            {item.quantity} {item.unit}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Reorder at {item.reorderLevel}
                          </p>
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="rounded-lg border border-success/30 bg-success/5 p-4 text-center">
                    <p className="text-sm text-success">
                      All items are well-stocked!
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

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
import { CreateOrderDialog } from "@/components/orders/CreateOrderDialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

type OrderStatus = "active" | "completed";

interface OrderItem {
  menuItem: string;
  name: string;
  price: number;
  quantity: number;
}

interface Order {
  _id: string;
  table: { _id: string; tableNumber: number } | any;
  items: OrderItem[];
  status: OrderStatus;
  totalAmount: number;
  createdAt: string;
}

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied";
}

export default function Dashboard() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [menuCount, setMenuCount] = useState(0);
  const [staffCount, setStaffCount] = useState(0);
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Order management states
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);

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
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, [toast]);

  const handleTableClick = async (table: Table) => {
    setSelectedTable(table);

    try {
      // Check if there's an active order for this table
      const { data } = await API.get(`/orders/active/${table._id}`);

      if (data.order) {
        setActiveOrder(data.order);
      } else {
        setActiveOrder(null);
      }

      setIsCreateOrderOpen(true);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to check order status",
        variant: "destructive",
      });
    }
  };

  const handleCreateOrUpdateOrder = async (orderData: {
    items: {
      menuItemId: string;
      quantity: number;
      name: string;
      price: number;
    }[];
  }) => {
    if (!selectedTable) return;

    try {
      if (activeOrder) {
        const totalAmount = orderData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        await API.put(`/orders/update/${activeOrder._id}`, {
          items: orderData.items.map((i) => ({
            menuItem: i.menuItemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          totalAmount,
        });

        toast({
          title: "Order Updated",
          description: "Order has been updated successfully.",
        });
      } else {
        const { data } = await API.post("/orders/create", {
          tableId: selectedTable._id,
        });

        const totalAmount = orderData.items.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0,
        );
        await API.put(`/orders/update/${data.order._id}`, {
          items: orderData.items.map((i) => ({
            menuItem: i.menuItemId,
            name: i.name,
            price: i.price,
            quantity: i.quantity,
          })),
          totalAmount,
        });

        toast({
          title: "Order Created",
          description: "Order has been created successfully.",
        });
      }

      fetchDashboardData();
      setIsCreateOrderOpen(false);
      setSelectedTable(null);
      setActiveOrder(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to process order",
        variant: "destructive",
      });
    }
  };

  const confirmClearTableOrder = async () => {
    if (!activeOrder) return;

    try {
      await API.put(`/orders/complete/${activeOrder._id}`);
      fetchDashboardData();
      setIsCreateOrderOpen(false);
      setSelectedTable(null);
      setActiveOrder(null);
      toast({
        title: "Table Cleared",
        description: "Order has been marked as completed and table is now available.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to clear table",
        variant: "destructive",
      });
    } finally {
      setConfirmClearOpen(false);
    }
  };

  const confirmCancelOrderAction = async () => {
    if (!activeOrder) return;

    try {
      await API.put(`/orders/cancel/${activeOrder._id}`);
      fetchDashboardData();
      setIsCreateOrderOpen(false);
      setSelectedTable(null);
      setActiveOrder(null);
      toast({
        title: "Order Cancelled",
        description: "The order has been cancelled and table is now available.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to cancel order",
        variant: "destructive",
      });
    } finally {
      setConfirmCancelOpen(false);
    }
  };

  const [showActiveOrdersOnly, setShowActiveOrdersOnly] = useState(false);

  const activeOrdersCount = orders.filter((o) => o.status === "active").length;
  const activeOrders = orders.filter((o) => o.status === "active");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const occupiedTables = tables.filter((t) => t.status === "occupied").length;

  const displayOrders = showActiveOrdersOnly ? activeOrders : orders.slice(0, 5);

  const statsCards = [
    {
      title: "Active Orders",
      value: activeOrdersCount,
      description: "Orders being processed",
      icon: ShoppingBag,
      trend: null,
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
          {statsCards.map((stat) => {
            const isActiveOrdersCard = stat.title === "Active Orders";
            return (
              <Card
                key={stat.title}
                className={`warm-shadow transition-all duration-300 ${isActiveOrdersCard
                  ? `cursor-pointer hover:shadow-md ${showActiveOrdersOnly
                    ? "border-primary ring-1 ring-primary/20 bg-primary/5"
                    : "hover:border-primary/30 hover:bg-muted/20"
                  }`
                  : ""
                  }`}
                onClick={() => {
                  if (isActiveOrdersCard) {
                    setShowActiveOrdersOnly(!showActiveOrdersOnly);
                  }
                }}
              >
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
            );
          })}
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent / Active Orders */}
          <Card className="warm-shadow">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{showActiveOrdersOnly ? "Active Orders" : "Recent Orders"}</CardTitle>
                {showActiveOrdersOnly && (
                  <CardDescription>Currently being processed</CardDescription>
                )}
              </div>
              {showActiveOrdersOnly && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowActiveOrdersOnly(false)}
                >
                  Show Recent
                </Button>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayOrders.length === 0 ? (
                  <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
                    {showActiveOrdersOnly ? "No active orders." : "No orders yet. Create orders from the Orders page."}
                  </div>
                ) : (
                  displayOrders.map((order) => {
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
                        className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => {
                          if (order.status === "active") {
                            const foundTable = tables.find(t => t._id === (typeof order.table === "object" ? order.table._id : order.table));
                            if (foundTable) handleTableClick(foundTable);
                          }
                        }}
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
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              order.status === "completed"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {order.status}
                          </Badge>
                          {order.status === "active" && (
                            <Button variant="ghost" size="sm" className="h-7 text-xs">
                              Manage
                            </Button>
                          )}
                        </div>
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
                        className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all hover:shadow-sm active:scale-[0.98] ${table.status === "occupied"
                          ? "border-warning/30 bg-warning/5"
                          : "border-success/30 bg-success/5"
                          }`}
                        onClick={() => handleTableClick(table)}
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

          <AIAssistant />
        </div>
      </div>

      {/* Create/Edit Order Dialog */}
      <CreateOrderDialog
        open={isCreateOrderOpen}
        onOpenChange={setIsCreateOrderOpen}
        table={
          selectedTable
            ? {
              id: selectedTable._id,
              number: selectedTable.tableNumber,
              seats: selectedTable.capacity,
              status: selectedTable.status,
            }
            : null
        }
        existingOrder={activeOrder}
        onSubmit={handleCreateOrUpdateOrder}
        onClearTable={() => setConfirmClearOpen(true)}
        onCancelOrder={() => setConfirmCancelOpen(true)}
      />

      {/* Clear Table Confirmation */}
      <AlertDialog open={confirmClearOpen} onOpenChange={setConfirmClearOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Clear Table?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to clear this table? The order will be
              marked as completed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmClearTableOrder}>
              Clear Table
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Cancel Order Confirmation */}
      <AlertDialog open={confirmCancelOpen} onOpenChange={setConfirmCancelOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Order?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this order? This action cannot be
              undone and the table will be freed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep it</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancelOrderAction}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Yes, Cancel Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

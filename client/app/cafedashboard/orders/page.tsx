"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, CheckCircle } from "lucide-react";
import API from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

const statusConfig: Record<
  "active" | "completed",
  { label: string; icon: React.ReactNode; color: string }
> = {
  active: {
    label: "Active",
    icon: <Clock className="h-4 w-4" />,
    color: "bg-primary/10 text-primary border-primary/30",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-muted text-muted-foreground border-border",
  },
};

export default function OrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState("active");
  const [isLoading, setIsLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const { data } = await API.get("/orders/all");
      if (data.orders) {
        setOrders(data.orders);
      }
    } catch (err) {
      console.error("Failed to fetch orders", err);
      toast({
        title: "Error",
        description: "Failed to fetch orders. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const activeOrders = orders.filter((o) => o.status === "active");
  const completedOrders = orders.filter((o) => o.status === "completed");

  const updateOrderStatus = async (orderId: string, newStatus: "active" | "completed") => {
    try {
      if (newStatus === "completed") {
        await API.put(`/orders/complete/${orderId}`);
      }
      fetchOrders();
      toast({
        title: "Order Updated",
        description: `Order has been marked as ${newStatus}.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update order",
        variant: "destructive",
      });
    }
  };

  const getNextStatus = (
    currentStatus: "active" | "completed",
  ): "active" | "completed" | null => {
    if (currentStatus === "active") return "completed";
    return null;
  };

  const OrderCard = ({ order }: { order: any }) => {
    const config = statusConfig[order.status as "active" | "completed"];
    const nextStatus = getNextStatus(order.status);
    const tableNumber = order.table?.tableNumber || "N/A";

    return (
      <Card className={`warm-shadow border-l-4 ${config.color}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                Order #{order._id.slice(-6)}
                <Badge variant="outline" className={config.color}>
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                Table {tableNumber}
              </CardDescription>
            </div>
            <span className="text-xl font-bold text-primary">
              ${(order.totalAmount || 0).toFixed(2)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            {order.items && order.items.length > 0 ? (
              order.items.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.name}
                  </span>
                  <span className="text-muted-foreground">
                    ${(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No items</p>
            )}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">
              {new Date(order.createdAt).toLocaleString()}
            </span>

            {order.status === "active" && nextStatus && (
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => updateOrderStatus(order._id, nextStatus)}
                >
                  Mark as {statusConfig[nextStatus].label}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Orders</h1>
      </div>
      <div className="space-y-6 animate-fade-in">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="active" className="gap-2">
              Active Orders
              <Badge variant="secondary" className="ml-1">
                {activeOrders.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="completed" className="gap-2">
              History
              <Badge variant="outline" className="ml-1">
                {completedOrders.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            {activeOrders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {activeOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <CheckCircle className="mx-auto mb-4 h-12 w-12 text-success" />
                <p className="text-lg font-medium">All caught up!</p>
                <p className="text-muted-foreground">
                  No active orders at the moment.
                </p>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="completed" className="mt-6">
            {completedOrders.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedOrders.map((order) => (
                  <OrderCard key={order._id} order={order} />
                ))}
              </div>
            ) : (
              <Card className="p-12 text-center">
                <p className="text-muted-foreground">
                  No completed orders yet.
                </p>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

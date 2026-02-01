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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { mockOrders } from "@/data/mockData";
import { Order } from "@/types";
import { Clock, CheckCircle, XCircle, ChefHat, Timer } from "lucide-react";
import DashboardLayout from "../layout";
// import { useToast } from '@/hooks/use-toast';
// import { formatDistanceToNow } from 'date-fns';

const statusConfig: Record<
  Order["status"],
  { label: string; icon: React.ReactNode; color: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-4 w-4" />,
    color: "bg-warning/10 text-warning border-warning/30",
  },
  preparing: {
    label: "Preparing",
    icon: <ChefHat className="h-4 w-4" />,
    color: "bg-primary/10 text-primary border-primary/30",
  },
  ready: {
    label: "Ready",
    icon: <Timer className="h-4 w-4" />,
    color: "bg-success/10 text-success border-success/30",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle className="h-4 w-4" />,
    color: "bg-muted text-muted-foreground border-border",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-4 w-4" />,
    color: "bg-destructive/10 text-destructive border-destructive/30",
  },
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const storedOrders = localStorage.getItem("orders");
    if (storedOrders) {
      setOrders(JSON.parse(storedOrders));
    } else {
      setOrders(mockOrders);
      localStorage.setItem("orders", JSON.stringify(mockOrders));
    }
  }, []);
  const [activeTab, setActiveTab] = useState("active");
  // const { toast } = useToast();

  const activeOrders = orders.filter((o) =>
    ["pending", "preparing", "ready"].includes(o.status),
  );
  const completedOrders = orders.filter((o) =>
    ["completed", "cancelled"].includes(o.status),
  );

  const updateOrderStatus = (orderId: string, newStatus: Order["status"]) => {
    const updatedOrders = orders.map((order) =>
      order.id === orderId
        ? { ...order, status: newStatus, updatedAt: new Date() }
        : order,
    );
    setOrders(updatedOrders);
    localStorage.setItem("orders", JSON.stringify(updatedOrders));
    // toast({
    //   title: "Order updated",
    //   description: `Order #${orderId} status changed to ${newStatus}.`,
    // });
    alert({
      title: "Order updated",
      description: `Order #${orderId} status changed to ${newStatus}.`,
    });
  };

  const getNextStatus = (
    currentStatus: Order["status"],
  ): Order["status"] | null => {
    const flow: Record<string, Order["status"]> = {
      pending: "preparing",
      preparing: "ready",
      ready: "completed",
    };
    return flow[currentStatus] || null;
  };

  const OrderCard = ({ order }: { order: Order }) => {
    const config = statusConfig[order.status];
    const nextStatus = getNextStatus(order.status);

    return (
      <Card className={`warm-shadow border-l-4 ${config.color}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="flex items-center gap-2 text-lg">
                Order #{order.id}
                <Badge variant="outline" className={config.color}>
                  {config.icon}
                  <span className="ml-1">{config.label}</span>
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {order.customerName} • Table {order.tableNumber}
              </CardDescription>
            </div>
            <span className="text-xl font-bold text-primary">
              ${order.total.toFixed(2)}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4 space-y-2">
            {order.items.map((item, index) => (
              <div key={index} className="flex justify-between text-sm">
                <span>
                  {item.quantity}x {item.name}
                </span>
                <span className="text-muted-foreground">
                  ${(item.price * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-xs text-muted-foreground">
              {/* {formatDistanceToNow(new Date(order.createdAt), {
                addSuffix: true,
              })} */}
            </span>

            {order.status !== "completed" && order.status !== "cancelled" && (
              <div className="flex gap-2">
                {nextStatus && (
                  <Button
                    size="sm"
                    onClick={() => updateOrderStatus(order.id, nextStatus)}
                  >
                    Mark as {statusConfig[nextStatus].label}
                  </Button>
                )}
                {order.status === "pending" && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div title="Order Tracking">
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
                  <OrderCard key={order.id} order={order} />
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
                  <OrderCard key={order.id} order={order} />
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

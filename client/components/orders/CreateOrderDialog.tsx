import { useState, useEffect } from "react";
import { Table, MenuItem } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Minus } from "lucide-react";
import { mockMenuItems } from "@/data/mockData";
import API from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

interface Order {
  _id: string;
  items: Array<{
    menuItem: string;
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface CreateOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  table: Table | null;
  existingOrder?: Order | null;
  onSubmit: (orderData: {
    items: {
      menuItemId: string;
      quantity: number;
      name: string;
      price: number;
    }[];
  }) => void;
  onCheckout?: () => void;
  onCancelOrder?: () => void;
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  table,
  existingOrder,
  onSubmit,
  onCheckout,
  onCancelOrder,
}: CreateOrderDialogProps) {
  const { toast } = useToast();
  const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
  const [items, setItems] = useState<
    { menuItemId: string; quantity: number }[]
  >([]);
  const [selectedItemToAdd, setSelectedItemToAdd] = useState<string>("");

  const handleAddItem = () => {
    if (!selectedItemToAdd) return;

    // Check if item already exists
    const existingIndex = items.findIndex(
      (i) => i.menuItemId === selectedItemToAdd,
    );
    if (existingIndex >= 0) {
      const newItems = [...items];
      newItems[existingIndex].quantity += 1;
      setItems(newItems);
    } else {
      setItems([...items, { menuItemId: selectedItemToAdd, quantity: 1 }]);
    }
    setSelectedItemToAdd("");
  };

  const updateQuantity = (index: number, delta: number) => {
    const newItems = [...items];
    newItems[index].quantity += delta;
    if (newItems[index].quantity <= 0) {
      newItems.splice(index, 1);
    }
    setItems(newItems);
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return sum + (menuItem?.price || 0) * item.quantity;
    }, 0);
  };

  // Fetch menu items from backend
  useEffect(() => {
    const fetchMenuItems = async () => {
      try {
        const { data } = await API.get("/menu/items");
        if (data.menuItems && data.menuItems.length > 0) {
          setMenuItems(
            data.menuItems.map((item: any) => ({
              id: item._id,
              name: item.name,
              category: item.category,
              price: item.price,
              description: item.description,
              available: item.available,
            })),
          );
        }
      } catch (err) {
        // console.error("Failed to fetch menu items, using mock data", err);
        toast({
          title: "Notice",
          description: "Using offline menu data",
        });
      }
    };

    if (open) {
      fetchMenuItems();
    }
  }, [open]);

  // Load existing order items when editing
  useEffect(() => {
    if (existingOrder && existingOrder.items.length > 0) {
      setItems(
        existingOrder.items.map((item) => ({
          menuItemId: item.menuItem,
          quantity: item.quantity,
        })),
      );
    } else {
      setItems([]);
    }
  }, [existingOrder]);

  const handleSubmit = () => {
    if (items.length === 0) return;

    // Include name and price in the submission
    const itemsWithDetails = items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId);
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        name: menuItem?.name || "Unknown",
        price: menuItem?.price || 0,
      };
    });

    onSubmit({ items: itemsWithDetails });
    // Reset
    setItems([]);
  };

  if (!table) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md w-[95vw] h-[90vh] sm:h-auto sm:max-h-[85vh] p-0 flex flex-col overflow-hidden border-none gap-0 shadow-2xl">
        <DialogHeader className="p-4 sm:p-6 border-b shrink-0 bg-background sticky top-0 z-10">
          <DialogTitle className="text-xl font-bold">
            {existingOrder ? "Edit Order" : "New Order"} - Table {table.number}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Add Items</label>
            <div className="flex gap-2">
              <Select
                value={selectedItemToAdd}
                onValueChange={setSelectedItemToAdd}
              >
                <SelectTrigger className="flex-1 h-11 bg-muted/30">
                  <SelectValue placeholder="Select menu item" />
                </SelectTrigger>
                <SelectContent>
                  {menuItems
                    .filter((item) => item.available)
                    .map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - NRS. {item.price.toFixed(2)}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button onClick={handleAddItem} disabled={!selectedItemToAdd} size="icon" className="h-11 w-11 shrink-0">
                <Plus className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <label className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Order Items</label>
            <div className="space-y-2">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 bg-muted/20 rounded-xl border-2 border-dashed">
                  <p className="text-sm text-muted-foreground">No items added yet</p>
                </div>
              ) : (
                <div className="divide-y border rounded-xl overflow-hidden bg-card">
                  {items.map((item, idx) => {
                    const menuItem = menuItems.find(
                      (m) => m.id === item.menuItemId,
                    );
                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-4 bg-background hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex-1 pr-4">
                          <p className="font-semibold text-foreground">
                            {menuItem?.name}
                          </p>
                          <p className="text-sm font-medium text-primary">
                            NRS. {menuItem?.price.toFixed(2)}
                          </p>
                        </div>
                        <div className="flex items-center gap-3 bg-muted/40 p-1.5 rounded-lg border">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-background"
                            onClick={() => updateQuantity(idx, -1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-8 text-center text-sm font-bold">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-md hover:bg-background"
                            onClick={() => updateQuantity(idx, 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-between items-center p-4 rounded-xl bg-primary/5 border border-primary/10">
            <span className="font-semibold text-muted-foreground">Estimated Total</span>
            <span className="font-bold text-2xl text-primary">
              NRS. {calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter className="p-4 sm:p-6 border-t bg-muted/10 shrink-0 sticky bottom-0 z-10 w-full">
          <div className="flex flex-col gap-3 w-full">
            <div className="flex flex-row gap-2 w-full">
              {existingOrder && onCancelOrder && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={onCancelOrder}
                  className="flex-1 border-destructive text-destructive hover:bg-destructive/10 font-semibold"
                >
                  Cancel Order
                </Button>
              )}
              {existingOrder && onCheckout && (
                <Button
                  variant="outline"
                  size="default"
                  onClick={onCheckout}
                  className="flex-1 border-green-500 text-green-600 hover:bg-green-50 font-bold"
                >
                  Check Out
                </Button>
              )}
            </div>

            <div className="flex flex-row gap-2 w-full">
              <Button
                variant="secondary"
                size="default"
                onClick={() => onOpenChange(false)}
                className="flex-1 font-semibold"
              >
                Close
              </Button>
              <Button
                onClick={handleSubmit}
                size="default"
                disabled={(() => {
                  if (items.length === 0) return true;
                  if (!existingOrder) return false;
                  return (
                    items.length === existingOrder.items.length &&
                    items.every((item) => {
                      const originalItem = existingOrder.items.find(
                        (oi) => oi.menuItem === item.menuItemId,
                      );
                      return originalItem && originalItem.quantity === item.quantity;
                    })
                  );
                })()}
                className="flex-[1.5] font-bold shadow-lg shadow-primary/20"
              >
                {existingOrder ? "Update Changes" : "Create Order"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


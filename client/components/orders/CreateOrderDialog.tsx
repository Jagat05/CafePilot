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
  onClearTable?: () => void;
  onCancelOrder?: () => void;
}

export function CreateOrderDialog({
  open,
  onOpenChange,
  table,
  existingOrder,
  onSubmit,
  onClearTable,
  onCancelOrder,
}: CreateOrderDialogProps) {
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
        console.error("Failed to fetch menu items, using mock data", err);
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
      <DialogContent className="sm:max-w-md w-[95vw] max-h-[95vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle>
            {existingOrder ? "Edit Order" : "New Order"} - Table {table.number}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Add Items</label>
            <div className="flex gap-2">
              <Select
                value={selectedItemToAdd}
                onValueChange={setSelectedItemToAdd}
              >
                <SelectTrigger className="flex-1">
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
              <Button onClick={handleAddItem} disabled={!selectedItemToAdd}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2 border rounded-md p-2 max-h-[30vh] sm:max-h-[200px] overflow-y-auto">
            {items.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No items added yet
              </p>
            ) : (
              items.map((item, idx) => {
                const menuItem = menuItems.find(
                  (m) => m.id === item.menuItemId,
                );
                return (
                  <div
                    key={idx}
                    className="flex items-center justify-between text-sm py-1 border-b last:border-0"
                  >
                    <div className="flex-1 pr-2">
                      <p className="font-medium line-clamp-1">
                        {menuItem?.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        NRS. {menuItem?.price.toFixed(2)} x {item.quantity}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-6 sm:w-6"
                        onClick={() => updateQuantity(idx, -1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-xs font-semibold">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7 sm:h-6 sm:w-6"
                        onClick={() => updateQuantity(idx, 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-bold">Total</span>
            <span className="font-bold text-lg">
              NRS. {calculateTotal().toFixed(2)}
            </span>
          </div>
        </div>

        <DialogFooter className="sm:justify-between">
          <div className="flex flex-col sm:flex-row justify-between w-full gap-4 pt-2">
            <div className="flex flex-row gap-2 justify-center sm:justify-start">
              {existingOrder && onCancelOrder && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onCancelOrder}
                  className="border-destructive text-destructive hover:bg-destructive/10 text-xs sm:text-sm"
                >
                  Cancel Order
                </Button>
              )}
              {existingOrder && onClearTable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onClearTable}
                  className="border-green-500 text-green-600 hover:bg-green-50 text-xs sm:text-sm"
                >
                  Clear Table
                </Button>
              )}

            </div>
            <div className="flex flex-row gap-2 justify-center sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
                className="text-xs sm:text-sm flex-1 sm:flex-none"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                size="sm"
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
                className="text-xs sm:text-sm flex-1 sm:flex-none"
              >
                {existingOrder ? "Update Order" : "Create Order"}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

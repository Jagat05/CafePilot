import { useState, useEffect } from "react";
import { Table, MenuItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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
    onSubmit: (orderData: { items: { menuItemId: string; quantity: number; name: string; price: number }[] }) => void;
    onClearTable?: () => void;
}

export function CreateOrderDialog({ open, onOpenChange, table, existingOrder, onSubmit, onClearTable }: CreateOrderDialogProps) {
    const [menuItems, setMenuItems] = useState<MenuItem[]>(mockMenuItems);
    const [items, setItems] = useState<{ menuItemId: string; quantity: number }[]>([]);
    const [selectedItemToAdd, setSelectedItemToAdd] = useState<string>("");

    const handleAddItem = () => {
        if (!selectedItemToAdd) return;

        // Check if item already exists
        const existingIndex = items.findIndex(i => i.menuItemId === selectedItemToAdd);
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
            const menuItem = menuItems.find(m => m.id === item.menuItemId);
            return sum + (menuItem?.price || 0) * item.quantity;
        }, 0);
    };

    // Fetch menu items from backend
    useEffect(() => {
        const fetchMenuItems = async () => {
            try {
                const { data } = await API.get("/menu/items");
                if (data.menuItems && data.menuItems.length > 0) {
                    setMenuItems(data.menuItems.map((item: any) => ({
                        id: item._id,
                        name: item.name,
                        category: item.category,
                        price: item.price,
                        description: item.description,
                        available: item.available,
                    })));
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
            setItems(existingOrder.items.map(item => ({
                menuItemId: item.menuItem,
                quantity: item.quantity,
            })));
        } else {
            setItems([]);
        }
    }, [existingOrder]);

    const handleSubmit = () => {
        if (items.length === 0) return;

        // Include name and price in the submission
        const itemsWithDetails = items.map(item => {
            const menuItem = menuItems.find(m => m.id === item.menuItemId);
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
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        {existingOrder ? "Edit Order" : "New Order"} - Table {table.number}
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Add Items</label>
                        <div className="flex gap-2">
                            <Select value={selectedItemToAdd} onValueChange={setSelectedItemToAdd}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select menu item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {menuItems.filter(item => item.available).map(item => (
                                        <SelectItem key={item.id} value={item.id}>
                                            {item.name} - ${item.price.toFixed(2)}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button onClick={handleAddItem} disabled={!selectedItemToAdd}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2 border rounded-md p-2 max-h-[200px] overflow-y-auto">
                        {items.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-4">No items added yet</p>
                        ) : (
                            items.map((item, idx) => {
                                const menuItem = menuItems.find(m => m.id === item.menuItemId);
                                return (
                                    <div key={idx} className="flex items-center justify-between text-sm">
                                        <div className="flex-1">
                                            <p className="font-medium">{menuItem?.name}</p>
                                            <p className="text-muted-foreground">${menuItem?.price.toFixed(2)} x {item.quantity}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(idx, -1)}>
                                                <Minus className="h-3 w-3" />
                                            </Button>
                                            <span className="w-4 text-center">{item.quantity}</span>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => updateQuantity(idx, 1)}>
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
                        <span className="font-bold text-lg">${calculateTotal().toFixed(2)}</span>
                    </div>
                </div>


                <DialogFooter>
                    <div className="flex justify-between w-full">
                        <div>
                            {existingOrder && onClearTable && (
                                <Button
                                    variant="outline"
                                    onClick={onClearTable}
                                    className="border-green-500 text-green-600 hover:bg-green-50"
                                >
                                    Clear Table
                                </Button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={items.length === 0}>
                                {existingOrder ? "Update Order" : "Create Order"}
                            </Button>
                        </div>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

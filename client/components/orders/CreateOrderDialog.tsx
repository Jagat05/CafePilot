import { useState } from "react";
import { Table, MenuItem } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Plus, Minus, Trash2 } from "lucide-react";
import { mockMenuItems } from "@/data/mockData";

interface CreateOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    table: Table | null;
    onSubmit: (orderData: { items: { menuItemId: string; quantity: number }[]; customerName: string }) => void;
}

export function CreateOrderDialog({ open, onOpenChange, table, onSubmit }: CreateOrderDialogProps) {
    const [customerName, setCustomerName] = useState("");
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
            const menuItem = mockMenuItems.find(m => m.id === item.menuItemId);
            return sum + (menuItem?.price || 0) * item.quantity;
        }, 0);
    };

    const handleSubmit = () => {
        if (!customerName || items.length === 0) return;
        onSubmit({ items, customerName });
        // Reset
        setCustomerName("");
        setItems([]);
        onOpenChange(false);
    };

    if (!table) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>New Order - Table {table.number}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Customer Name</label>
                        <Input
                            placeholder="Enter customer name"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Add Items</label>
                        <div className="flex gap-2">
                            <Select value={selectedItemToAdd} onValueChange={setSelectedItemToAdd}>
                                <SelectTrigger className="flex-1">
                                    <SelectValue placeholder="Select menu item" />
                                </SelectTrigger>
                                <SelectContent>
                                    {mockMenuItems.map(item => (
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
                                const menuItem = mockMenuItems.find(m => m.id === item.menuItemId);
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
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!customerName || items.length === 0}>Create Order</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

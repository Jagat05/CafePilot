"use client";

import { useState, useEffect } from "react";
import API from "@/lib/axios";
import { TableCard } from "@/components/tables/TableCard";
import { CreateOrderDialog } from "@/components/orders/CreateOrderDialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
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

interface Table {
  _id: string;
  tableNumber: number;
  capacity: number;
  status: "available" | "occupied";
}

interface Order {
  _id: string;
  table: string;
  owner: string;
  items: Array<{
    menuItem: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  status: "active" | "completed";
  totalAmount: number;
}

export default function TablesPage() {
  const { toast } = useToast();
  const [tables, setTables] = useState<Table[]>([]);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [newTableData, setNewTableData] = useState({
    number: "",
    capacity: "",
  });

  // AlertDialog states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [confirmCancelOpen, setConfirmCancelOpen] = useState(false);
  const [tableToDelete, setTableToDelete] = useState<string | null>(null);

  const fetchTables = async () => {
    try {
      const { data } = await API.get("/tables/table");
      setTables(data.tables);
    } catch (err) {
      console.error("Failed to fetch tables", err);
    }
  };

  useEffect(() => {
    fetchTables();
  }, []);

  const handleAddTable = async () => {
    const tableNumber = parseInt(newTableData.number);
    const capacity = parseInt(newTableData.capacity);

    if (!tableNumber || !capacity) return;

    try {
      await API.post("/tables/createtable", { tableNumber, capacity });
      fetchTables();
      setNewTableData({ number: "", capacity: "" });
      setIsAddTableOpen(false);
      toast({
        title: "Table Added",
        description: `Table ${tableNumber} has been added successfully.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to add table",
        variant: "destructive",
      });
    }
  };

  const handleTableClick = async (table: Table) => {
    setIsLoading(true);
    setSelectedTable(table);

    try {
      // Check if there's an active order for this table
      const { data } = await API.get(`/orders/active/${table._id}`);

      if (data.order) {
        // Active order exists - open in edit mode
        setActiveOrder(data.order);
      } else {
        // No active order - will create new
        setActiveOrder(null);
      }

      setIsCreateOrderOpen(true);
    } catch (err: any) {
      console.error("Failed to fetch active order", err);
      toast({
        title: "Error",
        description:
          err?.response?.data?.message || "Failed to check order status",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
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
        // Update existing order
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
        // Create new order
        const { data } = await API.post("/orders/create", {
          tableId: selectedTable._id,
        });

        // Add items to the newly created order
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

      // Refresh tables to update status
      fetchTables();
      setIsCreateOrderOpen(false);
      setSelectedTable(null);
      setActiveOrder(null);
    } catch (err: any) {
      console.error("Failed to create/update order", err);
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to process order",
        variant: "destructive",
      });
    }
  };

  const handleDeleteTable = async (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation(); // Prevent opening order dialog
    setTableToDelete(tableId);
    setConfirmDeleteOpen(true);
  };

  const confirmDeleteTable = async () => {
    if (!tableToDelete) return;

    try {
      await API.delete(`/tables/delete/${tableToDelete}`);
      fetchTables();
      toast({
        title: "Table Deleted",
        description: "Table has been deleted successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete table",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteOpen(false);
      setTableToDelete(null);
    }
  };

  const handleClearTable = async () => {
    if (!activeOrder) return;
    setConfirmClearOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!activeOrder) return;
    setConfirmCancelOpen(true);
  };

  const confirmCancelOrderAction = async () => {
    if (!activeOrder) return;

    try {
      await API.put(`/orders/cancel/${activeOrder._id}`);
      fetchTables();
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

  const confirmClearTableOrder = async () => {
    if (!activeOrder) return;

    try {
      await API.put(`/orders/complete/${activeOrder._id}`);
      fetchTables();
      setIsCreateOrderOpen(false);
      setSelectedTable(null);
      setActiveOrder(null);
      toast({
        title: "Table Cleared",
        description:
          "Order has been marked as completed and table is now available.",
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Tables</h1>
          <p className="text-muted-foreground">
            Manage your cafe tables and orders
          </p>
        </div>
        <Button onClick={() => setIsAddTableOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Table
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tables.map((table) => (
          <TableCard
            key={table._id}
            table={table}
            onClick={() => handleTableClick(table)}
            onDelete={(e, id) => handleDeleteTable(e, id)}
          />
        ))}
      </div>

      {/* Add Table Dialog */}
      <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="tableNumber">Table Number</label>
              <Input
                id="tableNumber"
                type="number"
                placeholder="e.g. 1"
                value={newTableData.number}
                onChange={(e) =>
                  setNewTableData({
                    ...newTableData,
                    number: e.target.value,
                  })
                }
              />
            </div>
            <div className="grid gap-2">
              <label htmlFor="capacity">Capacity (Seats)</label>
              <Input
                id="capacity"
                type="number"
                placeholder="e.g. 4"
                value={newTableData.capacity}
                onChange={(e) =>
                  setNewTableData({
                    ...newTableData,
                    capacity: e.target.value,
                  })
                }
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddTableOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddTable}>Add Table</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
        onClearTable={handleClearTable}
        onCancelOrder={handleCancelOrder}
      />

      {/* Delete Table Confirmation */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the
              table.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteTable}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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

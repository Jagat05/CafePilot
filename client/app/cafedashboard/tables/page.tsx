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
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to add table");
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
      alert(err?.response?.data?.message || "Failed to check order status");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateOrUpdateOrder = async (orderData: {
    items: { menuItemId: string; quantity: number; name: string; price: number }[];
  }) => {
    if (!selectedTable) return;

    try {
      if (activeOrder) {
        // Update existing order
        await API.put(`/orders/update/${activeOrder._id}`, {
          items: orderData.items.map((item) => ({
            menuItem: item.menuItemId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
          })),
          totalAmount: orderData.items.reduce(
            (sum, item) => sum + item.price * item.quantity,
            0
          ),
        });
        alert("Order updated successfully!");
      } else {
        // Create new order
        const { data } = await API.post("/orders/create", {
          tableId: selectedTable._id,
        });

        // If items were added, update the order
        if (orderData.items.length > 0) {
          await API.put(`/orders/update/${data.order._id}`, {
            items: orderData.items.map((item) => ({
              menuItem: item.menuItemId,
              name: item.name,
              price: item.price,
              quantity: item.quantity,
            })),
            totalAmount: orderData.items.reduce(
              (sum, item) => sum + item.price * item.quantity,
              0
            ),
          });
        }

        alert("Order created successfully!");
      }

      // Refresh tables to update status
      fetchTables();
      setIsCreateOrderOpen(false);
      setSelectedTable(null);
      setActiveOrder(null);
    } catch (err: any) {
      console.error("Failed to create/update order", err);
      alert(err?.response?.data?.message || "Failed to process order");
    }
  };

  const handleDeleteTable = async (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation(); // Prevent opening order dialog

    if (!confirm("Are you sure you want to delete this table?")) {
      return;
    }

    try {
      await API.delete(`/tables/delete/${tableId}`);
      fetchTables();
      alert("Table deleted successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete table");
    }
  };

  const handleClearTable = async () => {
    if (!activeOrder) return;

    if (!confirm("Are you sure you want to clear this table? The order will be marked as completed.")) {
      return;
    }

    try {
      await API.put(`/orders/complete/${activeOrder._id}`);
      fetchTables();
      setIsCreateOrderOpen(false);
      setSelectedTable(null);
      setActiveOrder(null);
      alert("Table cleared successfully!");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to clear table");
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <Button onClick={() => setIsAddTableOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Add Table
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {tables.map((table) => (
          <div key={table._id} className="relative group">
            <TableCard
              table={{
                id: table._id,
                number: table.tableNumber,
                seats: table.capacity,
                status: table.status,
              }}
              onClick={() => handleTableClick(table)}
            />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDeleteTable(e, table._id)}
            >
              <span className="sr-only">Delete</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3 w-3"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </Button>
          </div>
        ))}
      </div>

      {/* Add Table Dialog */}
      <Dialog open={isAddTableOpen} onOpenChange={setIsAddTableOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Table</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label>Table Number</label>
              <Input
                type="number"
                value={newTableData.number}
                onChange={(e) =>
                  setNewTableData({
                    ...newTableData,
                    number: e.target.value,
                  })
                }
              />
            </div>

            <div className="space-y-2">
              <label>Capacity</label>
              <Input
                type="number"
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
      />
    </div>
  );
}

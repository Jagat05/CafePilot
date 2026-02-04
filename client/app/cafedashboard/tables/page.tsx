"use client";

import { useState, useEffect } from "react";
import { Table, Order } from "@/types";
import { mockTables, mockOrders, mockMenuItems } from "@/data/mockData";
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

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
  const [isCreateOrderOpen, setIsCreateOrderOpen] = useState(false);
  const [selectedTable, setSelectedTable] = useState<Table | null>(null);
  const [newTableData, setNewTableData] = useState({ number: "", seats: "" });

  // Load data from localStorage
  useEffect(() => {
    const storedTables = localStorage.getItem("tables");
    if (storedTables) {
      setTables(JSON.parse(storedTables));
    } else {
      setTables(mockTables);
      localStorage.setItem("tables", JSON.stringify(mockTables));
    }
  }, []);

  const saveTables = (newTables: Table[]) => {
    setTables(newTables);
    localStorage.setItem("tables", JSON.stringify(newTables));
  };

  const handleAddTable = () => {
    const number = parseInt(newTableData.number);
    const seats = parseInt(newTableData.seats);

    if (!number || !seats) return;

    const newTable: Table = {
      id: Date.now().toString(),
      number,
      seats,
      status: "available",
    };

    saveTables([...tables, newTable]);
    setNewTableData({ number: "", seats: "" });
    setIsAddTableOpen(false);
  };

  const handleDeleteTable = (e: React.MouseEvent, tableId: string) => {
    e.stopPropagation(); // Prevent opening order dialog
    if (confirm("Are you sure you want to delete this table?")) {
      saveTables(tables.filter((t) => t.id !== tableId));
    }
  };

  const handleTableClick = (table: Table) => {
    setSelectedTable(table);
    setIsCreateOrderOpen(true);
  };

  const handleCreateOrder = (orderData: {
    items: { menuItemId: string; quantity: number }[];
    customerName: string;
  }) => {
    if (!selectedTable) return;

    const newOrder: Order = {
      id: Date.now().toString(),
      items: orderData.items.map((item) => {
        const menuItem = mockMenuItems.find((m) => m.id === item.menuItemId);
        return {
          menuItemId: item.menuItemId,
          name: menuItem?.name || "Unknown",
          quantity: item.quantity,
          price: menuItem?.price || 0,
        };
      }),
      status: "pending",
      customerName: orderData.customerName,
      tableNumber: selectedTable.number,
      total: orderData.items.reduce((sum, item) => {
        const menuItem = mockMenuItems.find((m) => m.id === item.menuItemId);
        return sum + (menuItem?.price || 0) * item.quantity;
      }, 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Save Order
    const storedOrders = localStorage.getItem("orders");
    const existingOrders = storedOrders ? JSON.parse(storedOrders) : mockOrders;
    const updatedOrders = [newOrder, ...existingOrders];
    localStorage.setItem("orders", JSON.stringify(updatedOrders));

    // Update Table status to occupied
    const updatedTables = tables.map((t) =>
      t.id === selectedTable.id ? { ...t, status: "occupied" as const } : t,
    );
    saveTables(updatedTables);

    setIsCreateOrderOpen(false);
    setSelectedTable(null);
    alert("Order created successfully!");
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
          <div key={table.id} className="relative group">
            <TableCard table={table} onClick={handleTableClick} />
            <Button
              variant="destructive"
              size="icon"
              className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => handleDeleteTable(e, table.id)}
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
                <path d="m6 6 18 18" />
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
                  setNewTableData({ ...newTableData, number: e.target.value })
                }
              />
            </div>
            <div className="space-y-2">
              <label>Seats</label>
              <Input
                type="number"
                value={newTableData.seats}
                onChange={(e) =>
                  setNewTableData({ ...newTableData, seats: e.target.value })
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

      {/* Create Order Dialog */}
      <CreateOrderDialog
        open={isCreateOrderOpen}
        onOpenChange={setIsCreateOrderOpen}
        table={selectedTable}
        onSubmit={handleCreateOrder}
      />
    </div>
  );
}

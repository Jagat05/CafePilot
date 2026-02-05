"use client";

import { useState, useEffect } from "react";
import API from "@/lib/axios";
import { TableCard } from "@/components/tables/TableCard";
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

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isAddTableOpen, setIsAddTableOpen] = useState(false);
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

  const handleTableClick = (table: Table) => {
    // Next step: navigate to order screen
    console.log("Clicked Table:", table);
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
          <TableCard
            key={table._id}
            table={{
              id: table._id,
              number: table.tableNumber,
              seats: table.capacity,
              status: table.status,
            }}
            onClick={() => handleTableClick(table)}
          />
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
    </div>
  );
}

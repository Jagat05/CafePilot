import { Table } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TableCardProps {
  table: any; // Using any for now to handle both backend and frontend types flexibly
  onClick?: (table: any) => void;
  onStatusChange?: (tableId: string, status: any) => void;
  onDelete?: (e: React.MouseEvent, tableId: string) => void;
}

const statusColor = {
  available: "bg-emerald-50 text-emerald-700 border-emerald-200",
  occupied: "bg-amber-50 text-amber-700 border-amber-200",
  reserved: "bg-blue-50 text-blue-700 border-blue-200",
};

export function TableCard({ table, onClick, onDelete }: TableCardProps) {
  const tableNumber = table.number || table.tableNumber;
  const seats = table.seats || table.capacity;
  const tableId = table.id || table._id;
  const status = table.status || "available";

  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md active:scale-[0.98] ${statusColor[status as keyof typeof statusColor]} border-2`}
      onClick={() => onClick?.(table)}
    >
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl font-bold">
              Table {tableNumber}
            </CardTitle>
            <Badge
              variant="outline"
              className="mt-1 capitalize bg-white/50 border-current/20"
            >
              {status}
            </Badge>
          </div>
          {onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(e, tableId);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-2 text-sm opacity-80">
          <Users className="h-4 w-4" />
          <span>{seats} Seats</span>
        </div>
      </CardContent>
    </Card>
  );
}

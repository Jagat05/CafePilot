import { Table } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface TableCardProps {
    table: Table;
    onClick?: (table: Table) => void;
    onStatusChange?: (tableId: string, status: Table["status"]) => void;
    onDelete?: (tableId: string) => void;
}

const statusColor = {
    available: "bg-success/10 text-success border-success/20",
    occupied: "bg-destructive/10 text-destructive border-destructive/20",
    reserved: "bg-warning/10 text-warning border-warning/20",
};

export function TableCard({ table, onClick }: TableCardProps) {
    return (
        <Card
            className={`cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] ${statusColor[table.status]} border-2`}
            onClick={() => onClick?.(table)}
        >
            <CardHeader className="pb-2">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-xl">Table {table.number}</CardTitle>
                    <Badge variant="outline" className="capitalize bg-white/50">
                        {table.status}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent>
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{table.seats} Seats</span>
                </div>
            </CardContent>
        </Card>
    );
}

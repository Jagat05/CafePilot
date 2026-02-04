"use client";
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { MoreHorizontal, Search, Filter, Store, Ban, CheckCircle } from "lucide-react";
import { mockCafes, Cafe } from "@/data/mockData";

export default function ManageCafe() {
  const [searchTerm, setSearchTerm] = useState("");
  const [cafes, setCafes] = useState<Cafe[]>(mockCafes);

  const filteredCafes = cafes.filter(
    (cafe) =>
      cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cafe.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cafe.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleStatusChange = (id: string, newStatus: Cafe["status"]) => {
    setCafes(
      cafes.map((cafe) =>
        cafe.id === id ? { ...cafe, status: newStatus } : cafe
      )
    );
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-muted/10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Cafes</h1>
          <p className="text-muted-foreground">
            View and manage all registered cafes on the platform.
          </p>
        </div>
        <Button className="bg-amber-600 hover:bg-amber-700">
          <Store className="mr-2 h-4 w-4" />
          Add New Cafe
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search cafes..."
            className="pl-8 bg-background"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" size="icon">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      <div className="rounded-md border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cafe Details</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Plan</TableHead>
              <TableHead>Joined Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Revenue</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredCafes.map((cafe) => (
              <TableRow key={cafe.id}>
                <TableCell>
                  <div className="flex flex-col">
                    <span className="font-medium">{cafe.name}</span>
                    <span className="text-xs text-muted-foreground">{cafe.email}</span>
                  </div>
                </TableCell>
                <TableCell>{cafe.ownerName}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="uppercase text-xs font-bold">
                    {cafe.plan}
                  </Badge>
                </TableCell>
                <TableCell>
                  {cafe.joinedDate.toLocaleDateString()}
                </TableCell>
                <TableCell>
                  {cafe.status === "active" && (
                    <Badge className="bg-emerald-500 hover:bg-emerald-600">Active</Badge>
                  )}
                  {cafe.status === "pending" && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 hover:bg-amber-200">
                      Pending
                    </Badge>
                  )}
                  {cafe.status === "suspended" && (
                    <Badge variant="destructive">Suspended</Badge>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {new Intl.NumberFormat("en-US", {
                    style: "currency",
                    currency: "USD",
                  }).format(cafe.revenue)}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuItem onClick={() => navigator.clipboard.writeText(cafe.id)}>
                        Copy ID
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleStatusChange(cafe.id, "active")}>
                        <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                        Activate
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleStatusChange(cafe.id, "suspended")}>
                        <Ban className="mr-2 h-4 w-4 text-destructive" />
                        Suspend
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

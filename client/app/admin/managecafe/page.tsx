"use client";

import React, { useState, useEffect } from "react";
import API from "@/lib/axios";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import { CreateCafeDialog } from "../components/CreateCafeDialog";
import { useToast } from "@/hooks/use-toast";

export default function ManageCafe() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [approvedCafes, setApprovedCafes] = useState<any[]>([]);
  const [pendingCafes, setPendingCafes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCafes = async () => {
    setIsLoading(true);
    try {
      const approvedRes = await API.get("/admin/approved-owners");
      const pendingRes = await API.get("/admin/pending-owners");
      setApprovedCafes(approvedRes.data.owners);
      setPendingCafes(pendingRes.data.owners);
    } catch (error) {
      console.error("Error fetching cafes:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cafes",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCafes();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await API.put(`/admin/approve-owner/${id}`);
      fetchCafes(); // Refresh lists
      toast({
        title: "Success",
        description: "Cafe approved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve cafe",
        variant: "destructive",
      });
    }
  };

  const filteredApproved = approvedCafes.filter(
    (cafe) =>
      cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cafe.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPending = pendingCafes.filter(
    (cafe) =>
      cafe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cafe.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-muted/10">
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Cafes</h1>
          <p className="text-muted-foreground">
            View and manage all registered cafes on the platform.
          </p>
        </div>
        <CreateCafeDialog onCafeCreated={fetchCafes} />
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
      </div>

      <Tabs defaultValue="approved" className="w-full">
        <TabsList>
          <TabsTrigger value="approved">Approved Cafes</TabsTrigger>
          <TabsTrigger value="pending">
            Pending Request
            {pendingCafes.length > 0 && (
              <Badge variant="destructive" className="ml-2 px-1 py-0.5 text-[10px]">
                {pendingCafes.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* ALLOWED TAB */}
        <TabsContent value="approved">
          <div className="rounded-md border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cafe Details</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredApproved.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No approved cafes found.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredApproved.map((cafe) => (
                    <TableRow key={cafe._id}>
                      <TableCell>
                        <span className="font-medium">{cafe.name}</span>
                      </TableCell>
                      <TableCell>{cafe.email}</TableCell>
                      <TableCell>
                        <Badge className="bg-emerald-500 hover:bg-emerald-600 capitalize">
                          {cafe.status}
                        </Badge>
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
                            <DropdownMenuItem
                              onClick={() => navigator.clipboard.writeText(cafe._id)}
                            >
                              Copy ID
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* PENDING TAB */}
        <TabsContent value="pending">
          <div className="rounded-md border bg-card shadow-sm">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cafe Details</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      Loading...
                    </TableCell>
                  </TableRow>
                ) : filteredPending.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8">
                      No pending requests.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPending.map((cafe) => (
                    <TableRow key={cafe._id}>
                      <TableCell>
                        <span className="font-medium">{cafe.name}</span>
                      </TableCell>
                      <TableCell>{cafe.email}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-700 capitalize">
                          {cafe.status}
                        </Badge>
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
                            <DropdownMenuItem onClick={() => handleApprove(cafe._id)}>
                              <CheckCircle className="mr-2 h-4 w-4 text-emerald-500" />
                              Approve
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

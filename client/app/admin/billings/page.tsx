"use client";
import { useEffect, useState } from "react";
import axiosInstance from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { Check, CreditCard, Download, Edit, MoreVertical, Trash } from "lucide-react";

import { EditPlanDialog } from "./components/EditPlanDialog";
import { EditTransactionDialog } from "./components/EditTransactionDialog";

interface Plan {
  _id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
}

interface Transaction {
  _id: string;
  user: {
    name: string;
    email: string;
  };
  planName: string;
  amount: number;
  method: string;
  status: string;
  createdAt: string;
  expiryDate?: string;
}


export default function Billings() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const [isEditTxDialogOpen, setIsEditTxDialogOpen] = useState(false);
  const [isDeleteTxDialogOpen, setIsDeleteTxDialogOpen] = useState(false);
  const [txToDelete, setTxToDelete] = useState<string | null>(null);

  const fetchPlans = async () => {
    try {
      const response = await axiosInstance.get("/plans");
      if (response.data.success) {
        setPlans(response.data.plans);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch subscription plans",
        variant: "destructive",
      });
      // console.error("Fetch plans error:", error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axiosInstance.get("/payments/all");
      if (response.data.success) {
        setTransactions(response.data.payments);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch transaction history",
        variant: "destructive",
      });
    }
  };

  const loadData = async () => {
    setLoading(true);
    await Promise.all([fetchPlans(), fetchTransactions()]);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
      </div>
    );
  }

  const handleEditClick = (plan: Plan) => {
    setSelectedPlan(plan);
    setIsEditDialogOpen(true);
  };

  const handleEditTxClick = (tx: Transaction) => {
    setSelectedTransaction(tx);
    setIsEditTxDialogOpen(true);
  };

  const handleDeleteTxClick = (id: string) => {
    setTxToDelete(id);
    setIsDeleteTxDialogOpen(true);
  };

  const confirmDeleteTx = async () => {
    if (!txToDelete) return;
    try {
      const response = await axiosInstance.delete(`/payments/${txToDelete}`);
      if (response.data.success) {
        toast({
          title: "Success",
          description: "Transaction deleted successfully",
        });
        fetchTransactions();
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to delete transaction",
        variant: "destructive",
      });
    } finally {
      setIsDeleteTxDialogOpen(false);
      setTxToDelete(null);
    }
  };
  return (
    <div className="flex flex-col gap-8 p-6 min-h-screen bg-muted/10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Billings & Subscriptions
        </h1>
        <p className="text-muted-foreground">
          Manage subscription plans and view revenue history.
        </p>
      </div>

      {/* Plans Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card
              key={plan._id}
              className={`flex flex-col ${plan.popular ? "border-amber-500 shadow-md relative" : ""}`}
            >
              {plan.popular && (
                <Badge className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-amber-500 hover:bg-amber-600">
                  Most Popular
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="text-4xl font-bold mb-4">{plan.price}</div>
                <ul className="space-y-2 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center">
                      <Check className="mr-2 h-4 w-4 text-emerald-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => handleEditClick(plan)}
                >
                  Edit Plan
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Transactions Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Button variant="outline" size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download Report
          </Button>
        </div>
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cafe Name</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-10 text-muted-foreground">
                      No transactions found.
                    </TableCell>
                  </TableRow>
                ) : (
                  transactions.map((tx) => (
                    <TableRow key={tx._id}>
                      <TableCell className="font-medium">
                        {tx.user?.name || "N/A"}
                      </TableCell>
                      <TableCell>{tx.planName}</TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            tx.status === "approved"
                              ? "default"
                              : tx.status === "pending"
                                ? "secondary"
                                : "destructive"
                          }
                          className={
                            tx.status === "approved"
                              ? "bg-emerald-500 hover:bg-emerald-600"
                              : tx.status === "pending"
                                ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                                : ""
                          }
                        >
                          {tx.status.charAt(0).toUpperCase() + tx.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>{tx.method}</TableCell>
                      <TableCell>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        {tx.expiryDate
                          ? new Date(tx.expiryDate).toLocaleDateString()
                          : "N/A"}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        NRs {tx.amount}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => handleEditTxClick(tx)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onClick={() => handleDeleteTxClick(tx._id)}
                            >
                              <Trash className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>

      <EditPlanDialog
        plan={selectedPlan}
        isOpen={isEditDialogOpen}
        onClose={() => setIsEditDialogOpen(false)}
        onSuccess={fetchPlans}
      />

      <EditTransactionDialog
        transaction={selectedTransaction}
        isOpen={isEditTxDialogOpen}
        onClose={() => setIsEditTxDialogOpen(false)}
        onSuccess={fetchTransactions}
      />

      <AlertDialog open={isDeleteTxDialogOpen} onOpenChange={setIsDeleteTxDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the transaction
              record from the database.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={confirmDeleteTx}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

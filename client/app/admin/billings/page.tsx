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
import { Check, CreditCard, Download } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { EditPlanDialog } from "./components/EditPlanDialog";

interface Plan {
  _id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
}

const invoices = [
  {
    invoice: "INV-001",
    status: "Paid",
    total: "$250.00",
    date: "2025-01-01",
    method: "Credit Card",
  },
  {
    invoice: "INV-002",
    status: "Pending",
    total: "$150.00",
    date: "2025-02-01",
    method: "PayPal",
  },
  {
    invoice: "INV-003",
    status: "Paid",
    total: "$350.00",
    date: "2025-01-15",
    method: "Bank Transfer",
  },
  {
    invoice: "INV-004",
    status: "Failed",
    total: "$50.00",
    date: "2024-12-25",
    method: "Credit Card",
  },
];

export default function Billings() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
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
                  <TableHead className="w-[100px]">Invoice</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow key={invoice.invoice}>
                    <TableCell className="font-medium">
                      {invoice.invoice}
                    </TableCell>
                    <TableCell>
                      {invoice.status === "Paid" && (
                        <Badge className="bg-emerald-500 hover:bg-emerald-600">
                          Paid
                        </Badge>
                      )}
                      {invoice.status === "Pending" && (
                        <Badge
                          variant="secondary"
                          className="bg-amber-100 text-amber-700"
                        >
                          Pending
                        </Badge>
                      )}
                      {invoice.status === "Failed" && (
                        <Badge variant="destructive">Failed</Badge>
                      )}
                    </TableCell>
                    <TableCell>{invoice.method}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell className="text-right">
                      {invoice.total}
                    </TableCell>
                  </TableRow>
                ))}
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
    </div>
  );
}

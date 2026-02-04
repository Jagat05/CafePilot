"use client";
import React from "react";
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

const plans = [
  {
    name: "Basic",
    price: "$29",
    description: "Essential features for small cafes",
    features: ["Up to 5 Staff", "Basic Reporting", "Email Support"],
    popular: false,
  },
  {
    name: "Pro",
    price: "$59",
    description: "Advanced tools for growing businesses",
    features: ["Unlimited Staff", "Advanced Analytics", "Priority Support", "Inventory Management"],
    popular: true,
  },
  {
    name: "Enterprise",
    price: "$199",
    description: "Custom solutions for chains",
    features: ["Dedicated Account Manager", "Custom API Access", "SLA", "Multi-location Support"],
    popular: false,
  },
];

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
  return (
    <div className="flex flex-col gap-8 p-6 min-h-screen bg-muted/10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Billings & Subscriptions</h1>
        <p className="text-muted-foreground">
          Manage subscription plans and view revenue history.
        </p>
      </div>

      {/* Plans Section */}
      <section>
        <h2 className="text-xl font-semibold mb-4">Subscription Plans</h2>
        <div className="grid gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <Card key={plan.name} className={`flex flex-col ${plan.popular ? 'border-amber-500 shadow-md relative' : ''}`}>
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
                <div className="text-4xl font-bold mb-4">
                  {plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                </div>
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
                <Button className="w-full" variant={plan.popular ? "default" : "outline"}>
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
                    <TableCell className="font-medium">{invoice.invoice}</TableCell>
                    <TableCell>
                      {invoice.status === "Paid" && <Badge className="bg-emerald-500 hover:bg-emerald-600">Paid</Badge>}
                      {invoice.status === "Pending" && <Badge variant="secondary" className="bg-amber-100 text-amber-700">Pending</Badge>}
                      {invoice.status === "Failed" && <Badge variant="destructive">Failed</Badge>}
                    </TableCell>
                    <TableCell>{invoice.method}</TableCell>
                    <TableCell>{invoice.date}</TableCell>
                    <TableCell className="text-right">{invoice.total}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

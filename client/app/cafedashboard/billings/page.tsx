"use client";

import React, { useEffect, useState } from "react";
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
  Check,
  CreditCard,
  Upload,
  Info,
  AlertCircle,
  Clock,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";
import Image from "next/image";

interface Plan {
  _id: string;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular: boolean;
}

interface BillingStatus {
  subscription: {
    planName: string;
    expiryDate: string;
    status: string;
  } | null;
  latestPayment: {
    status: string;
    planName: string;
    createdAt: string;
    rejectionReason?: string;
  } | null;
}

export default function CafeBillingPage() {
  const { toast } = useToast();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [billingStatus, setBillingStatus] = useState<BillingStatus | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<string>("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [transactionId, setTransactionId] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    try {
      const [plansRes, statusRes] = await Promise.all([
        axiosInstance.get("/plans"),
        axiosInstance.get("/payments/status"),
      ]);

      if (plansRes.data.success) setPlans(plansRes.data.plans);
      if (statusRes.data.success) setBillingStatus(statusRes.data);
    } catch (error) {
      console.error("Fetch data error:", error);
      toast({
        title: "Error",
        description: "Failed to load billing information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setProofFile(e.target.files[0]);
    }
  };

  const handleSubmitProof = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlan || !paymentMethod || !proofFile) {
      toast({
        title: "Missing Information",
        description: "Please select a plan, payment method, and upload proof.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();
    formData.append("planName", selectedPlan.name);
    formData.append("amount", selectedPlan.price.replace(/[^0-9]/g, ""));
    formData.append("method", paymentMethod);
    formData.append("screenshot", proofFile);
    formData.append("transactionId", transactionId);
    formData.append("notes", notes);

    try {
      const res = await axiosInstance.post("/payments/submit", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (res.data.success) {
        toast({
          title: "Submitted",
          description: "Payment proof uploaded. Admin will verify shortly.",
        });
        setSelectedPlan(null);
        setProofFile(null);
        setTransactionId("");
        setNotes("");
        fetchData();
      }
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.response?.data?.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeSub = billingStatus?.subscription;
  const latestPayment = billingStatus?.latestPayment;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          Billing & Subscriptions
        </h1>
        <p className="text-muted-foreground">
          Manage your CafePilot subscription and upgrades.
        </p>
      </div>

      {/* Subscription Status Banner */}
      {activeSub ? (
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge
                  variant="default"
                  className="bg-emerald-500 hover:bg-emerald-600 uppercase"
                >
                  {activeSub.status}
                </Badge>
                Current Plan: {activeSub.planName}
              </CardTitle>
              <span className="text-sm font-medium">
                Expires on:{" "}
                {new Date(activeSub.expiryDate).toLocaleDateString()}
              </span>
            </div>
          </CardHeader>
          {new Date(activeSub.expiryDate).getTime() - new Date().getTime() <
            5 * 24 * 60 * 60 * 1000 && (
            <CardContent>
              <div className="flex items-center gap-2 text-amber-600 bg-amber-50 p-3 rounded-lg border border-amber-200">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">
                  Your subscription expires soon. Please renew to avoid service
                  interruption.
                </p>
              </div>
            </CardContent>
          )}
        </Card>
      ) : latestPayment?.status === "pending" ? (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6 flex items-center gap-4">
            <Clock className="h-8 w-8 text-amber-500 animate-pulse" />
            <div>
              <p className="font-semibold text-amber-900">
                Payment Verification Pending
              </p>
              <p className="text-sm text-amber-700">
                You've submitted proof for {latestPayment.planName}. Admin is
                currently verifying it.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-red-50 border-red-200">
          <CardContent className="pt-6 flex items-center gap-4">
            <AlertCircle className="h-8 w-8 text-red-500" />
            <div>
              <p className="font-semibold text-red-900">
                No Active Subscription
              </p>
              <p className="text-sm text-red-700">
                Please choose a plan below to unlock all features.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rejection Notification */}
      {latestPayment?.status === "rejected" && (
        <AlertCircle className="h-4 w-4 inline mr-2 text-red-500" />
      )}

      {/* Pricing Cards */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => (
          <Card
            key={plan._id}
            className={`flex flex-col relative ${plan.popular ? "border-primary shadow-lg scale-105 z-10" : ""}`}
          >
            {plan.popular && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary">
                Most Popular
              </Badge>
            )}
            <CardHeader>
              <CardTitle>{plan.name} Plan</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-4xl font-bold mb-6">{plan.price}</div>
              <ul className="space-y-3 text-sm">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-emerald-500" />
                    {feature}
                  </li>
                ))}
              </ul>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                variant={
                  selectedPlan?._id === plan._id ? "secondary" : "default"
                }
                onClick={() => setSelectedPlan(plan)}
              >
                {selectedPlan?._id === plan._id ? "Selected" : "Choose Plan"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Payment Section - Only visible when a plan is selected */}
      {selectedPlan && (
        <div className="grid gap-8 lg:grid-cols-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Instructions */}
          <Card>
            <CardHeader>
              <CardTitle>Payment Instructions</CardTitle>
              <CardDescription>
                Scan the QR code or use the details below to pay{" "}
                {selectedPlan.price}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="border rounded-xl p-4 flex flex-col items-center gap-3 bg-[#60bb46]/5 border-[#60bb46]/20">
                  <span className="font-bold text-[#60bb46]">eSewa QR</span>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Image
                      src="/Esewa.jpeg"
                      alt="eSewa QR"
                      width={180}
                      height={180}
                    />
                  </div>
                  <p className="text-xs text-center font-medium">
                    Account Name: Jagat Prasad Joshi
                    {/* Account Name: CafePilot Pvt Ltd */}
                  </p>
                </div>
                <div className="border rounded-xl p-4 flex flex-col items-center gap-3 bg-[#4c2d82]/5 border-[#4c2d82]/20">
                  <span className="font-bold text-[#4c2d82]">Khalti QR</span>
                  <div className="bg-white p-2 rounded-lg shadow-sm">
                    <Image
                      src="/Khalti.jpeg"
                      alt="Khalti QR"
                      width={180}
                      height={180}
                    />
                  </div>
                  <p className="text-xs text-center font-medium">
                    {/* Account Name: CafePilot Pvt Ltd */}
                    Account Name: Jagat Prasad Joshi
                  </p>
                </div>
              </div>
              <div className="bg-muted p-4 rounded-xl border border-border">
                <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                  <Info className="h-4 w-4" /> Bank Transfer Details
                </h4>
                <div className="text-sm space-y-1 text-muted-foreground">
                  <p>Bank: Nabil Bank Limited</p>
                  <p>Acc Name: Jagat Prasad Joshi</p>
                  {/* <p>Acc Name: CafePilot Pvt Ltd</p> */}
                  <p>Acc Number: 13110017502388</p>
                  <p>Branch: Ratopul, Dhangadhi</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle>I have paid</CardTitle>
              <CardDescription>
                Upload your payment screenshot and transaction details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitProof} className="space-y-4">
                <div className="space-y-2">
                  <Label>Payment Method</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Method" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="eSewa">eSewa</SelectItem>
                      <SelectItem value="Khalti">Khalti</SelectItem>
                      <SelectItem value="Bank Transfer">
                        Bank Transfer
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="transactionId">
                    Transaction ID (Optional)
                  </Label>
                  <Input
                    id="transactionId"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    placeholder="E.g. 5X9W2Z..."
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="screenshot">
                    Upload Screenshot (Required)
                  </Label>
                  <div className="border-2 border-dashed rounded-lg p-4 hover:bg-muted/50 transition-colors relative">
                    <Input
                      id="screenshot"
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      required
                    />
                    <div className="flex flex-col items-center justify-center py-2 gap-2 text-muted-foreground">
                      <Upload className="h-8 w-8" />
                      <p className="text-xs font-medium">
                        {proofFile
                          ? proofFile.name
                          : "Click to upload payment screenshot"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Anything else we should know?"
                    rows={2}
                  />
                </div>

                <Button
                  className="w-full h-11"
                  type="submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting
                    ? "Submitting Proof..."
                    : "Submit Payment Proof"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

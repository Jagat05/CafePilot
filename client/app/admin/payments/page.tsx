"use client";

import React, { useEffect, useState } from "react";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";
import { getApiBaseUrl } from "@/lib/api-config";
import { Check, X, Eye, Clock } from "lucide-react";
import Image from "next/image";

interface Payment {
    _id: string;
    user: {
        name: string;
        email: string;
    };
    planName: string;
    amount: number;
    method: string;
    screenshot: string;
    transactionId?: string;
    notes?: string;
    status: string;
    createdAt: string;
}

export default function AdminPaymentsPage() {
    const { toast } = useToast();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);
    const [rejectionReason, setRejectionReason] = useState("");
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchPendingPayments = async () => {
        try {
            const res = await axiosInstance.get("/payments/pending");
            if (res.data.success) {
                setPayments(res.data.payments);
            }
        } catch (error) {
            // console.error("Fetch payments error:", error);
            toast({
                title: "Error",
                description: "Failed to fetch pending payments",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const handleUpdateStatus = async (status: "approved" | "rejected") => {
        if (!selectedPayment) return;
        if (status === "rejected" && !rejectionReason) {
            toast({
                title: "Reason Required",
                description: "Please provide a reason for rejection.",
                variant: "destructive",
            });
            return;
        }

        setIsProcessing(true);
        try {
            const res = await axiosInstance.put(`/payments/status/${selectedPayment._id}`, {
                status,
                rejectionReason: status === "rejected" ? rejectionReason : undefined,
            });

            if (res.data.success) {
                toast({
                    title: "Success",
                    description: `Payment ${status} successfully.`,
                });
                setIsDetailOpen(false);
                setSelectedPayment(null);
                setRejectionReason("");
                fetchPendingPayments();
            }
        } catch (error) {
            // console.error("Update status error:", error);
            toast({
                title: "Error",
                description: "Failed to update payment status.",
                variant: "destructive",
            });
        } finally {
            setIsProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="p-6 flex justify-center items-center min-h-[400px]">
                <Clock className="animate-spin h-8 w-8 text-primary" />
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold">Payment Approvals</h1>
                <p className="text-muted-foreground">Verify manual payments and activate subscriptions.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Pending Payments ({payments.length})</CardTitle>
                    <CardDescription>Review proof of payment submitted by cafe owners.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>User / Cafe</TableHead>
                                <TableHead>Plan</TableHead>
                                <TableHead>Amount</TableHead>
                                <TableHead>Method</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead className="text-right">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {payments.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                                        No pending payments to review.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                payments.map((payment) => (
                                    <TableRow key={payment._id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{payment.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{payment.user.email}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{payment.planName}</Badge>
                                        </TableCell>
                                        <TableCell className="font-semibold">NRs {payment.amount}</TableCell>
                                        <TableCell>{payment.method}</TableCell>
                                        <TableCell>{new Date(payment.createdAt).toLocaleDateString()}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                    setSelectedPayment(payment);
                                                    setIsDetailOpen(true);
                                                }}
                                            >
                                                <Eye className="h-4 w-4 mr-2" /> Review
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {/* Detail Dialog */}
            <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
                <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Review Payment Proof</DialogTitle>
                        <DialogDescription>
                            Verify the screenshot and transaction details carefully before approving.
                        </DialogDescription>
                    </DialogHeader>

                    {selectedPayment && (
                        <div className="grid md:grid-cols-2 gap-6 py-4">
                            <div className="space-y-4">
                                <div className="aspect-[4/5] relative border rounded-xl overflow-hidden bg-black/5 flex items-center justify-center">
                                    <img
                                        src={`${getApiBaseUrl()}${selectedPayment.screenshot}`}
                                        alt="Payment Proof"
                                        className="max-w-full max-h-full object-contain"
                                    />
                                </div>
                                <div className="text-xs text-center text-muted-foreground italic">
                                    Screenshot provided by user
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-x-2 gap-y-4 text-sm border-b pb-4">
                                    <div className="text-muted-foreground">Plan:</div>
                                    <div className="font-semibold">{selectedPayment.planName}</div>
                                    <div className="text-muted-foreground">Amount:</div>
                                    <div className="font-semibold">NRs {selectedPayment.amount}</div>
                                    <div className="text-muted-foreground">Method:</div>
                                    <div className="font-semibold">{selectedPayment.method}</div>
                                    <div className="text-muted-foreground">Tx ID:</div>
                                    <div className="font-mono text-xs">{selectedPayment.transactionId || "N/A"}</div>
                                </div>

                                {selectedPayment.notes && (
                                    <div className="p-3 bg-muted rounded-lg text-sm">
                                        <p className="font-medium text-xs text-muted-foreground uppercase mb-1">User Notes:</p>
                                        {selectedPayment.notes}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rejection Reason (only for rejection)</label>
                                    <Textarea
                                        placeholder="E.g. Blurred screenshot, mismatched amount..."
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        rows={3}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="destructive"
                            className="px-6"
                            onClick={() => handleUpdateStatus("rejected")}
                            disabled={isProcessing}
                        >
                            <X className="h-4 w-4 mr-2" /> Reject
                        </Button>
                        <Button
                            className="bg-emerald-600 hover:bg-emerald-700 px-6"
                            onClick={() => handleUpdateStatus("approved")}
                            disabled={isProcessing}
                        >
                            <Check className="h-4 w-4 mr-2" /> Approve & Activate
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

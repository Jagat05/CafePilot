"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";

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
    transactionId?: string;
}

interface EditTransactionDialogProps {
    transaction: Transaction | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditTransactionDialog({
    transaction,
    isOpen,
    onClose,
    onSuccess,
}: EditTransactionDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const { register, handleSubmit, reset, setValue, watch } = useForm({
        defaultValues: {
            planName: "",
            amount: 0,
            method: "",
            status: "",
            transactionId: "",
        },
    });

    useEffect(() => {
        if (transaction) {
            reset({
                planName: transaction.planName,
                amount: transaction.amount,
                method: transaction.method,
                status: transaction.status,
                transactionId: transaction.transactionId || "",
            });
        }
    }, [transaction, reset]);

    const onSubmit = async (data: any) => {
        if (!transaction) return;
        setLoading(true);
        try {
            const response = await axiosInstance.put(
                `/payments/update/${transaction._id}`,
                data
            );
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Transaction updated successfully",
                });
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.response?.data?.message || "Failed to update transaction",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                    <DialogDescription>
                        Update payment details for {transaction?.user?.name}.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="planName">Plan Name</Label>
                        <Input id="planName" {...register("planName")} required />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="amount">Amount (NRs)</Label>
                        <Input
                            id="amount"
                            type="number"
                            {...register("amount", { valueAsNumber: true })}
                            required
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="method">Method</Label>
                        <Select
                            defaultValue={transaction?.method}
                            onValueChange={(val) => setValue("method", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="eSewa">eSewa</SelectItem>
                                <SelectItem value="Khalti">Khalti</SelectItem>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="status">Status</Label>
                        <Select
                            defaultValue={transaction?.status}
                            onValueChange={(val) => setValue("status", val)}
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="transactionId">Transaction ID</Label>
                        <Input id="transactionId" {...register("transactionId")} />
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save Changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

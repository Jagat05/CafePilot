"use client";

import React, { useState } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from "@/lib/axios";

interface Plan {
    _id: string;
    name: string;
    price: string;
    description: string;
    features: string[];
    popular: boolean;
}

interface EditPlanDialogProps {
    plan: Plan | null;
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function EditPlanDialog({ plan, isOpen, onClose, onSuccess }: EditPlanDialogProps) {
    const { toast } = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: plan?.name || "",
        price: plan?.price || "",
        description: plan?.description || "",
        features: plan?.features.join(", ") || "",
        popular: plan?.popular || false,
    });

    React.useEffect(() => {
        if (plan) {
            setFormData({
                name: plan.name,
                price: plan.price,
                description: plan.description,
                features: plan.features.join(", "),
                popular: plan.popular,
            });
        }
    }, [plan]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!plan) return;

        setLoading(true);
        try {
            const payload = {
                ...formData,
                features: formData.features.split(",").map((f) => f.trim()).filter((f) => f !== ""),
            };

            const response = await axiosInstance.put(`/plans/${plan._id}`, payload);
            if (response.data.success) {
                toast({
                    title: "Success",
                    description: "Plan updated successfully",
                });
                onSuccess();
                onClose();
            }
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to update plan",
                variant: "destructive",
            });
            console.error("Update plan error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Subscription Plan</DialogTitle>
                    <DialogDescription>
                        Update the plan details. Click save when you're done.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit}>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="name" className="text-right">
                                Name
                            </Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="price" className="text-right">
                                Price
                            </Label>
                            <Input
                                id="price"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="description" className="text-right">
                                Description
                            </Label>
                            <Textarea
                                id="description"
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="features" className="text-right">
                                Features
                            </Label>
                            <Input
                                id="features"
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                                placeholder="Comma separated features"
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="popular" className="text-right">
                                Popular
                            </Label>
                            <input
                                id="popular"
                                type="checkbox"
                                checked={formData.popular}
                                onChange={(e) => setFormData({ ...formData, popular: e.target.checked })}
                                className="h-4 w-4"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Save changes"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

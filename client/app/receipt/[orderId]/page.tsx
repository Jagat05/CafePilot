"use client";

import { useEffect, useState, use } from "react";
import API from "@/lib/axios";
import { Button } from "@/components/ui/button";
import { Printer, ArrowLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

interface OrderItem {
    name: string;
    price: number;
    quantity: number;
}

interface Order {
    _id: string;
    table: {
        tableNumber: number;
    };
    items: OrderItem[];
    totalAmount: number;
    createdAt: string;
    status: string;
}

export default function ReceiptPage({ params }: { params: Promise<{ orderId: string }> }) {
    const { orderId } = use(params);
    const router = useRouter();
    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchOrder = async () => {
            try {
                const { data } = await API.get(`/orders/${orderId}`);
                setOrder(data.order);
            } catch (err: any) {
                setError(err?.response?.data?.message || "Failed to load receipt");
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    useEffect(() => {
        if (order && !loading) {
            // Small Delay to ensure styles are applied before print dialog opens
            const timer = setTimeout(() => {
                window.print();
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, [order, loading]);

    const handlePrint = () => {
        window.print();
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground">Generating Receipt...</p>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="p-6 text-center">
                <h1 className="text-xl font-bold text-destructive mb-4">Error</h1>
                <p className="mb-6">{error || "Order not found"}</p>
                <Button onClick={() => router.push("/cafedashboard/tables")}>
                    Back to Tables
                </Button>
            </div>
        );
    }

    const date = new Date(order.createdAt).toLocaleString();

    return (
        <div className="min-h-screen bg-gray-100 py-10 px-4 print:bg-white print:py-0 print:px-0">
            <style jsx global>{`
        @media print {
          @page {
            margin: 0;
            size: 80mm auto;
          }
          body {
            background-color: white;
          }
          .no-print, 
          [role="region"][aria-label="Notifications (F8)"], 
          #announcement-banner {
            display: none !important;
          }
        }
      `}</style>

            <div className="max-w-[400px] mx-auto bg-white p-6 shadow-sm print:shadow-none print:max-w-[80mm] print:p-2 border border-gray-100 print:border-none">
                {/* Actions - Hidden during print */}
                <div className="flex justify-between mb-8 no-print">
                    <Button variant="outline" size="sm" onClick={() => router.push("/cafedashboard/tables")} className="gap-2">
                        <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button size="sm" onClick={handlePrint} className="gap-2">
                        <Printer className="h-4 w-4" /> Print
                    </Button>
                </div>

                {/* Receipt Content */}
                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold uppercase tracking-tight">Cafe Pilot</h1>
                    <p className="text-sm text-muted-foreground">Premium Coffee & Snacks</p>
                    <div className="my-2 border-b border-dashed border-gray-300"></div>
                    <p className="text-xs">Order ID: {order._id.slice(-8).toUpperCase()}</p>
                    <p className="text-xs">{date}</p>
                    <p className="text-sm font-semibold mt-1 uppercase">Table {order.table?.tableNumber}</p>
                </div>

                <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-xs font-bold border-b border-dashed pb-1">
                        <span className="flex-[2]">ITEM</span>
                        <span className="flex-1 text-center">QTY</span>
                        <span className="flex-1 text-right">PRICE</span>
                    </div>

                    {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-xs items-start">
                            <span className="flex-[2] pr-1">{item.name}</span>
                            <span className="flex-1 text-center">{item.quantity}</span>
                            <span className="flex-1 text-right">{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}

                    <div className="border-t border-dashed pt-2 mt-4">
                        <div className="flex justify-between text-sm font-bold">
                            <span>TOTAL</span>
                            <span>NRS. {order.totalAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                            <span>Payment Status</span>
                            <span className="uppercase font-semibold text-green-600">{order.status}</span>
                        </div>
                    </div>
                </div>

                <div className="text-center text-[10px] space-y-1 text-muted-foreground">
                    <p className="border-t border-dashed pt-2">Thank you for visiting Cafe Pilot!</p>
                    <p>Please come again soon.</p>
                    <div className="flex justify-center pt-2">
                        <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center opacity-30">
                            <span className="text-[8px]">QR CODE</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

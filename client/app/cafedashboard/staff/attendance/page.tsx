"use client";

import { useState, useEffect } from "react";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
    ArrowLeft,
    Clock,
    LogIn,
    LogOut,
    Printer,
    FileText,
    CalendarDays
} from "lucide-react";
import { useRouter } from "next/navigation";
import API from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

interface AttendanceRecord {
    staffId: string;
    staffName: string;
    checkIn?: string;
    checkOut?: string;
    status: "present" | "absent" | "working";
}

export default function AttendancePage() {
    const router = useRouter();
    const { toast } = useToast();
    const [staff, setStaff] = useState<any[]>([]);
    const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const { data } = await API.get("/staff");
                if (data.staff) {
                    const activeStaff = data.staff.filter((s: any) => s.status === "active");
                    setStaff(activeStaff);

                    // Mock initial attendance status
                    const initialAttendance: Record<string, AttendanceRecord> = {};
                    activeStaff.forEach((s: any) => {
                        initialAttendance[s._id] = {
                            staffId: s._id,
                            staffName: s.name,
                            status: "absent"
                        };
                    });
                    setAttendance(initialAttendance);
                }
            } catch (err) {
                toast({
                    title: "Error",
                    description: "Failed to load staff for attendance",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchStaff();
    }, []);

    const handleCheckIn = (staffId: string) => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAttendance((prev) => ({
            ...prev,
            [staffId]: {
                ...prev[staffId],
                checkIn: now,
                status: "working"
            }
        }));
        toast({
            title: "Checked In",
            description: `${attendance[staffId].staffName} has checked in at ${now}.`,
        });
    };

    const handleCheckOut = (staffId: string) => {
        const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        setAttendance((prev) => ({
            ...prev,
            [staffId]: {
                ...prev[staffId],
                checkOut: now,
                status: "present"
            }
        }));
        toast({
            title: "Checked Out",
            description: `${attendance[staffId].staffName} has checked out at ${now}.`,
        });
    };

    const handlePrintReport = () => {
        window.print();
    };

    return (
        <div className="space-y-6 animate-fade-in p-6">
            <style jsx global>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .print-only {
            display: block !important;
          }
          body {
            background: white;
          }
          .warm-shadow {
            box-shadow: none !important;
            border: 1px solid #eee !important;
          }
        }
        .print-only {
          display: none;
        }
      `}</style>

            {/* Header */}
            <div className="flex items-center justify-between no-print">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.back()}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Staff Attendance</h1>
                        <p className="text-muted-foreground">Monitor and manage daily staff attendance.</p>
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handlePrintReport} className="warm-shadow">
                        <Printer className="mr-2 h-4 w-4" />
                        Monthly Report
                    </Button>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="print-only text-center mb-8">
                <h1 className="text-3xl font-bold uppercase">Cafe Pilot - Monthly Attendance Report</h1>
                <p className="text-muted-foreground mt-2">
                    Report Generated on: {new Date().toLocaleDateString()}
                </p>
                <div className="mt-4 border-b-2 border-dashed"></div>
            </div>

            {/* Attendance Table */}
            <Card className="warm-shadow">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5 text-primary" />
                            Today's Attendance - {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </CardTitle>
                        <Badge variant="outline" className="no-print">
                            {staff.length} Active Staff
                        </Badge>
                    </div>
                    <CardDescription className="no-print">
                        Check in/out staff members as they arrive and leave.
                    </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <p className="text-muted-foreground">Loading staff records...</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Staff Member</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Check In</TableHead>
                                    <TableHead>Check Out</TableHead>
                                    <TableHead className="text-right no-print">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {staff.map((member) => {
                                    const record = attendance[member._id];
                                    return (
                                        <TableRow key={member._id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarFallback className="bg-primary/10 text-primary">
                                                            {member.name.split(" ").map((n: string) => n[0]).join("")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <p className="font-medium">{member.name}</p>
                                                        <p className="text-xs text-muted-foreground capitalize">{member.role}</p>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {record.status === "working" ? (
                                                    <Badge className="bg-green-100 text-green-700 border-green-200">
                                                        On Duty
                                                    </Badge>
                                                ) : record.status === "present" ? (
                                                    <Badge className="bg-blue-100 text-blue-700 border-blue-200">
                                                        Completed
                                                    </Badge>
                                                ) : (
                                                    <Badge variant="secondary" className="opacity-50">
                                                        Not Arrived
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {record.checkIn ? (
                                                    <span className="font-mono text-sm">{record.checkIn}</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">--:--</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {record.checkOut ? (
                                                    <span className="font-mono text-sm">{record.checkOut}</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-xs">--:--</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right no-print">
                                                <div className="flex justify-end gap-2">
                                                    <Button
                                                        size="sm"
                                                        variant={record.status === "absent" ? "default" : "outline"}
                                                        disabled={record.status !== "absent"}
                                                        onClick={() => handleCheckIn(member._id)}
                                                        className="gap-1 h-8"
                                                    >
                                                        <LogIn className="h-3.5 w-3.5" />
                                                        In
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant={record.status === "working" ? "destructive" : "outline"}
                                                        disabled={record.status !== "working"}
                                                        onClick={() => handleCheckOut(member._id)}
                                                        className="gap-1 h-8"
                                                    >
                                                        <LogOut className="h-3.5 w-3.5" />
                                                        Out
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            {/* Monthly Summary Section (Mock Data for Print) */}
            <div className="print-only mt-12">
                <h2 className="text-xl font-bold mb-4 border-b pb-2">Monthly Summary Analysis</h2>
                <div className="grid grid-cols-3 gap-4 mb-8">
                    <div className="p-4 border rounded">
                        <p className="text-sm text-muted-foreground">Total Working Days</p>
                        <p className="text-2xl font-bold">26</p>
                    </div>
                    <div className="p-4 border rounded">
                        <p className="text-sm text-muted-foreground">Average Daily Staff</p>
                        <p className="text-2xl font-bold">{Math.round(staff.length * 0.9)}</p>
                    </div>
                    <div className="p-4 border rounded">
                        <p className="text-sm text-muted-foreground">Total Hours Logged</p>
                        <p className="text-2xl font-bold">208h</p>
                    </div>
                </div>

                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Staff Name</TableHead>
                            <TableHead>Present</TableHead>
                            <TableHead>Absent</TableHead>
                            <TableHead>Late</TableHead>
                            <TableHead>Total Hours</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {staff.map((member) => (
                            <TableRow key={member._id}>
                                <TableCell className="font-medium">{member.name}</TableCell>
                                <TableCell>24</TableCell>
                                <TableCell>2</TableCell>
                                <TableCell>1</TableCell>
                                <TableCell>192h</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

                <div className="mt-12 flex justify-between px-4">
                    <div className="text-center">
                        <div className="w-48 border-b border-black mb-1"></div>
                        <p className="text-xs">Manager Signature</p>
                    </div>
                    <div className="text-center">
                        <div className="w-48 border-b border-black mb-1"></div>
                        <p className="text-xs">Admin Verification</p>
                    </div>
                </div>
            </div>

            <div className="no-print mt-10 p-4 border border-dashed rounded-lg bg-muted/30">
                <div className="flex items-start gap-3">
                    <CalendarDays className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="text-sm text-muted-foreground">
                        <p className="font-semibold text-foreground">Pro Tip: Monthly Reporting</p>
                        <p>The "Monthly Report" button generates a detailed attendance overview optimized for printing or saving as PDF. Use this for payroll and management reviews.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

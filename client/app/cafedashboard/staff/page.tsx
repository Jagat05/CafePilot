"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
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
import { StaffMember } from "@/types";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  UserPlus,
  Shield,
  Coffee,
  CreditCard,
  User2Icon,
  ChefHat,
} from "lucide-react";
import API from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  manager: <Shield className="h-4 w-4" />,
  barista: <Coffee className="h-4 w-4" />,
  cashier: <CreditCard className="h-4 w-4" />,
  cook: <ChefHat className="h-4 w-4" />,
  helper: <User2Icon className="h-4 w-4" />,
};

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/30",
  manager: "bg-success/10 text-success border-success/30",
  barista: "bg-warning/10 text-warning border-warning/30",
  helper: "bg-warning/10 text-warning border-warning/30",
  cook: "bg-warning/10 text-warning border-warning/30",
  cashier: "bg-secondary text-secondary-foreground",
};

function mapApiStaffToMember(item: {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  status: string;
  hireDate?: string;
  isOwner?: boolean;
}): StaffMember {
  return {
    id: item._id,
    name: item.name,
    email: item.email,
    phone: item.phone || "",
    role: item.role as StaffMember["role"],
    status: item.status as "active" | "inactive",
    hireDate: item.hireDate ? new Date(item.hireDate) : new Date(),
    isOwner: item.isOwner ?? false,
  };
}

export default function StaffPage() {
  const { toast } = useToast();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState<StaffMember | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "barista" as StaffMember["role"],
  });

  const fetchStaff = async () => {
    try {
      setIsLoading(true);
      const { data } = await API.get("/staff");
      if (data.staff) {
        setStaff(data.staff.map(mapApiStaffToMember));
      }
    } catch (err) {
      console.error("Failed to fetch staff", err);
      toast({
        title: "Error",
        description: "Failed to load staff",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const filteredStaff = staff.filter((member) => {
    const matchesSearch =
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.email.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "all" || member.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleOpenDialog = (member?: StaffMember) => {
    if (member) {
      setEditingMember(member);
      setFormData({
        name: member.name,
        email: member.email,
        phone: member.phone,
        role: member.role,
      });
    } else {
      setEditingMember(null);
      setFormData({
        name: "",
        email: "",
        phone: "",
        role: "barista",
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingMember) {
        await API.put(`/staff/update/${editingMember.id}`, {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        });
        toast({
          title: "Staff updated",
          description: `${formData.name}'s profile has been updated.`,
        });
      } else {
        await API.post("/staff/create", {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          role: formData.role,
        });
        toast({
          title: "Staff added",
          description: `${formData.name} has been added to the team.`,
        });
      }
      fetchStaff();
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save staff member",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (member: StaffMember) => {
    setMemberToDelete(member);
    setConfirmDeleteOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!memberToDelete) return;
    try {
      await API.delete(`/staff/delete/${memberToDelete.id}`);
      toast({
        title: "Staff removed",
        description: `${memberToDelete.name} has been removed from the team.`,
      });
      fetchStaff();
      setConfirmDeleteOpen(false);
      setMemberToDelete(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to remove staff",
        variant: "destructive",
      });
    }
  };

  const toggleStatus = async (id: string) => {
    try {
      const { data } = await API.patch(`/staff/toggle-status/${id}`);
      if (data.staff) {
        setStaff((prev) =>
          prev.map((m) =>
            m.id === id ? mapApiStaffToMember(data.staff) : m,
          ),
        );
        const member = staff.find((m) => m.id === id);
        toast({
          title: "Status updated",
          description: `${member?.name} is now ${data.staff.status}.`,
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update status",
        variant: "destructive",
      });
    }
  };

  const activeCount = staff.filter((s) => s.status === "active").length;
  const roleBreakdown = {
    admin: staff.filter((s) => s.role === "admin").length,
    manager: staff.filter((s) => s.role === "manager").length,
    barista: staff.filter((s) => s.role === "barista").length,
    cashier: staff.filter((s) => s.role === "cashier").length,
    helper: staff.filter((s) => s.role === "helper").length,
    cook: staff.filter((s) => s.role === "cook").length,
  };

  return (
    <div title="Staff Management">
      <div className="space-y-6 animate-fade-in">
        {/* Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className="warm-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Staff</CardTitle>
              <UserPlus className="h-5 w-5 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{staff.length}</div>
              <p className="text-xs text-muted-foreground">
                {activeCount} active
              </p>
            </CardContent>
          </Card>
          {Object.entries(roleBreakdown).map(([role, count]) => (
            <Card key={role} className="warm-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium capitalize">
                  {role}s
                </CardTitle>
                {roleIcons[role]}
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{count}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search staff..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="manager">Manager</SelectItem>
                <SelectItem value="barista">Barista</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
                <SelectItem value="helper">Helper</SelectItem>
                <SelectItem value="cook">Cook</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* {isAdmin && ( */}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => handleOpenDialog()}>
                <Plus className="mr-2 h-4 w-4" />
                Add Staff
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingMember ? "Edit Staff Member" : "Add Staff Member"}
                </DialogTitle>
                <DialogDescription>
                  {editingMember
                    ? "Update the staff member details."
                    : "Add a new team member."}
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={formData.role}
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          role: value as StaffMember["role"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="admin">Admin</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="barista">Barista</SelectItem>
                        <SelectItem value="cashier">Cashier</SelectItem>
                        <SelectItem value="helper">Helper</SelectItem>
                        <SelectItem value="cook">Cook</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          {/* )// } */}
        </div>

        {/* Staff Table */}
        <Card className="warm-shadow">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-muted-foreground">Loading staff...</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStaff.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-primary/10 text-primary">
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {member.email}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`gap-1 capitalize ${roleColors[member.role]}`}
                        >
                          {roleIcons[member.role]}
                          {member.role}
                        </Badge>
                        {member.isOwner && (
                          <Badge variant="secondary" className="text-xs">
                            You
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.phone || "—"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {member.isOwner ? (
                          <span className="text-sm capitalize text-muted-foreground">
                            {member.status}
                          </span>
                        ) : (
                          <>
                            <Switch
                              checked={member.status === "active"}
                              onCheckedChange={() => toggleStatus(member.id)}
                            />
                            <span className="text-sm capitalize">
                              {member.status}
                            </span>
                          </>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {new Date(member.hireDate).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {member.isOwner ? (
                          <span className="text-xs text-muted-foreground">
                            Logged-in owner
                          </span>
                        ) : (
                          <>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenDialog(member)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteClick(member)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>

        <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Remove staff member?</AlertDialogTitle>
              <AlertDialogDescription>
                This will remove {memberToDelete?.name} from the team. This
                action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setMemberToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Remove
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {filteredStaff.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No staff members found.</p>
          </Card>
        )}

        {/* {!isAdmin && (
          <Card className="border-warning/30 bg-warning/5">
            <CardContent className="flex items-center gap-4 p-4">
              <Shield className="h-5 w-5 text-warning" />
              <p className="text-sm text-muted-foreground">
                Only administrators can add, edit, or remove staff members.
              </p>
            </CardContent>
          </Card>
        )} */}
      </div>
    </div>
  );
}

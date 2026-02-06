"use client";
import { useState } from "react";
// import { DashboardLayout } from '@/components/DashboardLayout';
import {
  Card,
  CardContent,
  CardDescription,
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
import { mockStaff } from "@/data/mockData";
import { StaffMember } from "@/types";
// import { useAuth } from '@/contexts/AuthContext';
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  UserPlus,
  Shield,
  Coffee,
  CreditCard,
} from "lucide-react";
import API from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

const roleIcons: Record<string, React.ReactNode> = {
  admin: <Shield className="h-4 w-4" />,
  manager: <Shield className="h-4 w-4" />,
  barista: <Coffee className="h-4 w-4" />,
  cashier: <CreditCard className="h-4 w-4" />,
};

const roleColors: Record<string, string> = {
  admin: "bg-primary/10 text-primary border-primary/30",
  manager: "bg-success/10 text-success border-success/30",
  barista: "bg-warning/10 text-warning border-warning/30",
  cashier: "bg-secondary text-secondary-foreground",
};

export default function StaffPage() {
  const { toast } = useToast();
  interface StaffMember {
    id: string;
    name: string;
    email: string;
    role: "admin" | "manager" | "barista" | "cashier";
    phone: string;
    status: "active" | "inactive";
    hireDate: Date;
    avatar?: string;
  }
  const [staff, setStaff] = useState<StaffMember[]>(mockStaff);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<StaffMember | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    role: "barista" as StaffMember["role"],
  });

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

  const handleSave = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    if (editingMember) {
      setStaff(
        staff.map((member) =>
          member.id === editingMember.id ? { ...member, ...formData } : member,
        ),
      );
      toast({
        title: "Staff updated",
        description: `${formData.name}'s profile has been updated.`,
      });
    } else {
      const newMember: StaffMember = {
        id: Date.now().toString(),
        ...formData,
        status: "active",
        hireDate: new Date(),
      };
      setStaff([...staff, newMember]);
      toast({
        title: "Staff added",
        description: `${formData.name} has been added to the team.`,
      });
    }

    setIsDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    const member = staff.find((m) => m.id === id);
    setStaff(staff.filter((m) => m.id !== id));
    toast({
      title: "Staff removed",
      description: `${member?.name} has been removed from the team.`,
    });
  };

  const toggleStatus = (id: string) => {
    setStaff(
      staff.map((member) =>
        member.id === id
          ? {
            ...member,
            status: member.status === "active" ? "inactive" : "active",
          }
          : member,
      ),
    );
  };

  const activeCount = staff.filter((s) => s.status === "active").length;
  const roleBreakdown = {
    admin: staff.filter((s) => s.role === "admin").length,
    manager: staff.filter((s) => s.role === "manager").length,
    barista: staff.filter((s) => s.role === "barista").length,
    cashier: staff.filter((s) => s.role === "cashier").length,
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
          ){/* // } */}
        </div>

        {/* Staff Table */}
        <Card className="warm-shadow">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Staff Member</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Hire Date</TableHead>
                  {/* {isAdmin && ( */}
                  <TableHead className="text-right">Actions</TableHead>)
                  {/* } */}
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
                      <Badge
                        variant="outline"
                        className={`gap-1 capitalize ${roleColors[member.role]}`}
                      >
                        {roleIcons[member.role]}
                        {member.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {member.phone}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {/* {isAdmin ? (
                          <>
                            <Switch
                              checked={member.status === "active"}
                              onCheckedChange={() => toggleStatus(member.id)}
                            />
                            <span className="text-sm">
                              {member.status === "active"
                                ? "Active"
                                : "Inactive"}
                            </span>
                          </>
                        ) : (
                          <Badge
                            variant={
                              member.status === "active"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {member.status}
                          </Badge>
                        )
                        } */}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {/* {format(new Date(member.hireDate), "MMM d, yyyy")} */}
                    </TableCell>
                    {/* {isAdmin && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
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
                            onClick={() => handleDelete(member.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    )} */}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

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

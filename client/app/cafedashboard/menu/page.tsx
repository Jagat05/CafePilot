"use client";

import { useState, useEffect } from "react";
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { MenuItem } from "@/types";
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  Coffee,
  Sandwich,
  Cake,
  GlassWater,
} from "lucide-react";
import API from "@/lib/axios";
import { useToast } from "@/hooks/use-toast";

const categoryIcons: Record<string, React.ReactNode> = {
  coffee: <Coffee className="h-4 w-4" />,
  tea: <GlassWater className="h-4 w-4" />,
  pastry: <Cake className="h-4 w-4" />,
  sandwich: <Sandwich className="h-4 w-4" />,
  dessert: <Cake className="h-4 w-4" />,
  beverage: <GlassWater className="h-4 w-4" />,
};

export default function MenuPage() {
  const { toast } = useToast();
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // AlertDialog states
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<MenuItem | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "coffee" as MenuItem["category"],
    price: "",
    description: "",
    available: true,
  });

  const fetchMenuItems = async () => {
    try {
      setIsLoading(true);
      const { data } = await API.get("/menu/items");
      if (data.menuItems) {
        setItems(
          data.menuItems.map((item: any) => ({
            id: item._id,
            name: item.name,
            category: item.category,
            price: item.price,
            description: item.description,
            available: item.available,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch menu items", err);
      toast({
        title: "Error",
        description: "Failed to fetch menu items",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const handleOpenDialog = (item?: MenuItem) => {
    if (item) {
      setEditingItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        price: item.price.toString(),
        description: item.description,
        available: item.available,
      });
    } else {
      setEditingItem(null);
      setFormData({
        name: "",
        category: "coffee",
        price: "",
        description: "",
        available: true,
      });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name || !formData.category || !formData.price) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      if (editingItem) {
        // Update item
        await API.put(`/menu/update/${editingItem.id}`, {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          description: formData.description,
          available: formData.available,
        });
        toast({
          title: "Item Updated",
          description: `${formData.name} has been updated.`,
        });
      } else {
        // Create new item
        await API.post("/menu/create", {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          description: formData.description,
          available: formData.available,
        });
        toast({
          title: "Item Added",
          description: `${formData.name} has been added to the menu.`,
        });
      }

      fetchMenuItems();
      setIsDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to save menu item",
        variant: "destructive",
      });
    }
  };

  const handleDeleteClick = (item: MenuItem) => {
    setItemToDelete(item);
    setConfirmDeleteOpen(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;

    try {
      await API.delete(`/menu/delete/${itemToDelete.id}`);
      fetchMenuItems();
      toast({
        title: "Item Removed",
        description: `${itemToDelete.name} has been removed.`,
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to delete menu item",
        variant: "destructive",
      });
    } finally {
      setConfirmDeleteOpen(false);
      setItemToDelete(null);
    }
  };

  const toggleAvailability = async (id: string) => {
    const item = items.find((i) => i.id === id);
    if (!item) return;

    try {
      await API.put(`/menu/update/${id}`, {
        name: item.name,
        category: item.category,
        price: item.price,
        description: item.description,
        available: !item.available,
      });
      fetchMenuItems();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.response?.data?.message || "Failed to update availability",
        variant: "destructive",
      });
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Header Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search menu items..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="coffee">Coffee</SelectItem>
              <SelectItem value="tea">Tea</SelectItem>
              <SelectItem value="pastry">Pastry</SelectItem>
              <SelectItem value="sandwich">Sandwich</SelectItem>
              <SelectItem value="dessert">Dessert</SelectItem>
              <SelectItem value="beverage">Beverage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingItem ? "Edit Menu Item" : "Add Menu Item"}
              </DialogTitle>
              <DialogDescription>
                {editingItem
                  ? "Update the details below."
                  : "Fill in the details for the new menu item."}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Cappuccino"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(v) =>
                      setFormData({
                        ...formData,
                        category: v as MenuItem["category"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coffee">Coffee</SelectItem>
                      <SelectItem value="tea">Tea</SelectItem>
                      <SelectItem value="pastry">Pastry</SelectItem>
                      <SelectItem value="sandwich">Sandwich</SelectItem>
                      <SelectItem value="dessert">Dessert</SelectItem>
                      <SelectItem value="beverage">Beverage</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="price">Price ($)</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    placeholder="4.50"
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Brief description of the item..."
                />
              </div>
              <div className="flex items-center justify-between">
                <Label htmlFor="available">Available</Label>
                <Switch
                  id="available"
                  checked={formData.available}
                  onCheckedChange={(checked) =>
                    setFormData({ ...formData, available: checked })
                  }
                />
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleSave}>
                {editingItem ? "Update Item" : "Add Item"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Menu Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <CardHeader className="p-4 pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="rounded-full bg-primary/10 p-2 text-primary">
                      {categoryIcons[item.category] || <Coffee className="h-4 w-4" />}
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <CardDescription className="capitalize">
                        {item.category}
                      </CardDescription>
                    </div>
                  </div>
                  <Badge variant={item.available ? "default" : "secondary"}>
                    {item.available ? "Available" : "Sold Out"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="p-4 pt-0">
                <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
                  {item.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold">${item.price.toFixed(2)}</span>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleOpenDialog(item)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                      onClick={() => handleDeleteClick(item)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => toggleAvailability(item.id)}
                      className="ml-2 scale-75"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 text-center">
            <div className="rounded-full bg-muted p-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-medium">No menu items found</h3>
            <p className="mt-2 text-muted-foreground">
              Try adjusting your search or filters, or add a new menu item.
            </p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => {
                setSearchQuery("");
                setCategoryFilter("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Delete Item Confirmation */}
      <AlertDialog open={confirmDeleteOpen} onOpenChange={setConfirmDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{itemToDelete?.name}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

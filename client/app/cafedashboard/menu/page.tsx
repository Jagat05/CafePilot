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
import DashboardLayout from "../layout";
import API from "@/lib/axios";

const categoryIcons: Record<string, React.ReactNode> = {
  coffee: <Coffee className="h-4 w-4" />,
  tea: <GlassWater className="h-4 w-4" />,
  pastry: <Cake className="h-4 w-4" />,
  sandwich: <Sandwich className="h-4 w-4" />,
  dessert: <Cake className="h-4 w-4" />,
  beverage: <GlassWater className="h-4 w-4" />,
};

export default function MenuPage() {
  const [items, setItems] = useState<MenuItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    category: "coffee" as MenuItem["category"],
    price: "",
    description: "",
    available: true,
  });

  // Fetch menu items from backend
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
      alert("Failed to fetch menu items");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

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
    if (!formData.name || !formData.price) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      if (editingItem) {
        // Update existing item
        await API.put(`/menu/update/${editingItem.id}`, {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          description: formData.description,
          available: formData.available,
        });
        alert(`${formData.name} has been updated.`);
      } else {
        // Create new item
        await API.post("/menu/create", {
          name: formData.name,
          category: formData.category,
          price: parseFloat(formData.price),
          description: formData.description,
          available: formData.available,
        });
        alert(`${formData.name} has been added to the menu.`);
      }

      fetchMenuItems();
      setIsDialogOpen(false);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to save menu item");
    }
  };

  const handleDelete = async (id: string) => {
    const item = items.find((i) => i.id === id);

    if (!confirm(`Are you sure you want to delete ${item?.name}?`)) {
      return;
    }

    try {
      await API.delete(`/menu/delete/${id}`);
      fetchMenuItems();
      alert(`${item?.name} has been removed.`);
    } catch (err: any) {
      alert(err?.response?.data?.message || "Failed to delete menu item");
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
      alert(err?.response?.data?.message || "Failed to update availability");
    }
  };

  return (
    <div title="Menu Management">
      <div className="space-y-6 animate-fade-in">
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
                  <Label htmlFor="name">Name *</Label>
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
                      onValueChange={(value) =>
                        setFormData({
                          ...formData,
                          category: value as MenuItem["category"],
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
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
                    <Label htmlFor="price">Price *</Label>
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
                    placeholder="A delicious drink..."
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    id="available"
                    checked={formData.available}
                    onCheckedChange={(checked) =>
                      setFormData({ ...formData, available: checked })
                    }
                  />
                  <Label htmlFor="available">Available for sale</Label>
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
        </div>

        {/* Menu Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => (
            <Card
              key={item.id}
              className={`warm-shadow transition-opacity ${!item.available ? "opacity-60" : ""}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      {categoryIcons[item.category]}
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.name}</CardTitle>
                      <Badge
                        variant="secondary"
                        className="mt-1 text-xs capitalize"
                      >
                        {item.category}
                      </Badge>
                    </div>
                  </div>
                  <span className="text-lg font-bold text-primary">
                    ${item.price.toFixed(2)}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="mb-4 line-clamp-2">
                  {item.description}
                </CardDescription>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={item.available}
                      onCheckedChange={() => toggleAvailability(item.id)}
                      aria-label="Toggle availability"
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.available ? "Available" : "Unavailable"}
                    </span>
                  </div>
                  <div className="flex gap-1">
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
                      onClick={() => handleDelete(item.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <Card className="p-12 text-center">
            <p className="text-muted-foreground">No menu items found.</p>
          </Card>
        )}
      </div>
    </div>
  );
}

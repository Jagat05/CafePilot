export interface MenuItem {
  id: string;
  name: string;
  category: 'coffee' | 'tea' | 'pastry' | 'sandwich' | 'dessert' | 'beverage'| 'chaumin';
  price: number;
  description: string;
  available: boolean;
  image?: string;
}

export interface Order {
  id: string;
  items: { menuItemId: string; name: string; quantity: number; price: number }[];
  status: 'pending' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  customerName: string;
  tableNumber?: number;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: 'beans' | 'dairy' | 'bakery' | 'supplies' | 'packaging';
  quantity: number;
  unit: string;
  reorderLevel: number;
  supplier: string;
  lastRestocked: Date;
}

export interface StaffMember {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'barista' | 'cashier' | 'cook' | 'helper';
  phone: string;
  status: 'active' | 'inactive';
  hireDate: Date;
  avatar?: string;
  /** True when this row is the logged-in cafe owner (shown as admin) */
  isOwner?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'manager' | 'barista' | 'cashier';
}

export interface Table {
  id: string;
  number: number;
  seats: number;
  status: 'available' | 'occupied' | 'reserved';
}

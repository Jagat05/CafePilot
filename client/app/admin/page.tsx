"use client";
import React from "react";
import {
  Users,
  Building2,
  DollarSign,
  TrendingUp,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Search,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mockSaaSStats, mockCafes } from "@/data/mockData";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

// Mock data for charts
const revenueData = [
  { name: "Jan", revenue: 4000 },
  { name: "Feb", revenue: 3000 },
  { name: "Mar", revenue: 2000 },
  { name: "Apr", revenue: 2780 },
  { name: "May", revenue: 1890 },
  { name: "Jun", revenue: 2390 },
  { name: "Jul", revenue: 3490 },
];

const newCafesData = [
  { name: "Mon", cafes: 2 },
  { name: "Tue", cafes: 4 },
  { name: "Wed", cafes: 1 },
  { name: "Thu", cafes: 3 },
  { name: "Fri", cafes: 5 },
  { name: "Sat", cafes: 2 },
  { name: "Sun", cafes: 1 },
];

export default function AdminDashboard() {
  return (
    <div className="flex flex-col gap-6 p-2 lg:p-6 bg-muted/10 min-h-screen">
      {/* Header */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
            Cafe Pilot
          </h1>
          <p className="text-muted-foreground">
            Manage your cafe empire from one place.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="h-9">
            <Activity className="mr-2 h-4 w-4" />
            System Status
          </Button>
          <Button
            size="sm"
            className="h-9 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
          >
            Export Report
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Revenue */}
        <Card className="shadow-lg border-none bg-gradient-to-br from-white to-orange-50/50 dark:from-background dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${mockSaaSStats.totalRevenue.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-500 flex items-center mr-1">
                +20.1% <ArrowUpRight className="h-3 w-3" />
              </span>
              from last month
            </p>
          </CardContent>
        </Card>

        {/* Active Cafes */}
        <Card className="shadow-lg border-none bg-gradient-to-br from-white to-blue-50/50 dark:from-background dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Cafes</CardTitle>
            <Building2 className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSaaSStats.activeCafes}
            </div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-emerald-500 flex items-center mr-1">
                +4 <ArrowUpRight className="h-3 w-3" />
              </span>
              new this week
            </p>
          </CardContent>
        </Card>

        {/* Total Users */}
        <Card className="shadow-lg border-none bg-gradient-to-br from-white to-purple-50/50 dark:from-background dark:to-background">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Staff Users
            </CardTitle>
            <Users className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockSaaSStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="text-amber-500 flex items-center mr-1">
                +12 <TrendingUp className="h-3 w-3" />
              </span>
              since yesterday
            </p>
          </CardContent>
        </Card>

        {/* Pending Requests */}
        <Card className="shadow-lg border-none bg-gradient-to-br from-white to-pink-50/50 dark:from-background dark:to-background ring-1 ring-pink-100 dark:ring-pink-900">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Pending Requests
            </CardTitle>
            <Activity className="h-4 w-4 text-pink-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockSaaSStats.pendingRequests}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Requires attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 shadow-md border-none">
          <CardHeader>
            <CardTitle>Revenue Overview</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient
                      id="colorRevenue"
                      x1="0"
                      y1="0"
                      x2="0"
                      y2="1"
                    >
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${value}`}
                  />
                  <Tooltip />
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#E5E7EB"
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#f97316"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3 shadow-md border-none">
          <CardHeader>
            <CardTitle>New Cafe Signups</CardTitle>
            <CardDescription>Last 7 days registration activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={newCafesData}>
                  <XAxis
                    dataKey="name"
                    stroke="#888888"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip cursor={{ fill: "transparent" }} />
                  <Bar
                    dataKey="cafes"
                    fill="#0ea5e9"
                    radius={[4, 4, 0, 0]}
                    barSize={30}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Cafes List */}
      <Card className="shadow-md border-none">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="grid gap-0.5">
            <CardTitle>Recent Cafes</CardTitle>
            <CardDescription>
              Latest cafes to join the platform.
            </CardDescription>
          </div>
          <Button variant="ghost" size="sm">
            View All
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {mockCafes.map((cafe) => (
              <div key={cafe.id} className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <Avatar className="h-9 w-9 bg-amber-100 flex items-center justify-center">
                    <span className="text-amber-700 font-bold">
                      {cafe.name[0]}
                    </span>
                  </Avatar>
                  <div className="grid gap-1">
                    <p className="text-sm font-medium leading-none">
                      {cafe.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {cafe.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="hidden md:block">
                    {cafe.status === "active" && (
                      <Badge className="bg-emerald-500 hover:bg-emerald-600">
                        Active
                      </Badge>
                    )}
                    {cafe.status === "pending" && (
                      <Badge
                        variant="secondary"
                        className="bg-amber-100 text-amber-700 hover:bg-amber-200"
                      >
                        Pending
                      </Badge>
                    )}
                    {cafe.status === "suspended" && (
                      <Badge variant="destructive">Suspended</Badge>
                    )}
                  </div>
                  <div className="font-medium text-sm">
                    {new Intl.NumberFormat("en-US", {
                      style: "currency",
                      currency: "USD",
                    }).format(cafe.revenue)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

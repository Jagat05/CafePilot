"use client";

import React, { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Save, AlertTriangle, Bell, Lock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function GlobalSettings() {
  const { toast } = useToast();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const handleBroadcast = () => {
    toast({
      title: "Sent",
      description: "Announcement broadcast sent!",
    });
  };

  const handleUpdatePassword = () => {
    toast({
      title: "Updated",
      description: "Master password updated successfully.",
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-muted/10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          CafePilot Settings
        </h1>
        <p className="text-muted-foreground">
          Configure global settings for the entire CafePilot platform.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Global Announcement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Global Announcement
            </CardTitle>
            <CardDescription>
              Send a message to all connected cafe dashboards.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="announcement">Announcement Message</Label>
              <Textarea
                id="announcement"
                placeholder="e.g., Scheduled maintenance tonight at 2 AM..."
                value={announcement}
                onChange={(e) => setAnnouncement(e.target.value)}
                rows={4}
              />
            </div>
            <Button onClick={handleBroadcast}>
              <Save className="mr-2 h-4 w-4" />
              Broadcast Message
            </Button>
          </CardContent>
        </Card>

        {/* Maintenance Mode */}
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" />
              Maintenance Mode
            </CardTitle>
            <CardDescription>
              Restrict access to the platform for updates.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between rounded-lg border p-4 bg-destructive/5">
              <div className="space-y-0.5">
                <Label className="text-base">Enable Maintenance Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Only Admins can access the system.
                </p>
              </div>
              <Switch
                checked={maintenanceMode}
                onCheckedChange={setMaintenanceMode}
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-3 rounded-md">
              <AlertTriangle className="h-4 w-4" />
              Warning: This will disconnect all active cafe sessions
              immediately.
            </div>
          </CardContent>
        </Card>

        {/* Admin Security */}
        <Card>
          <CardHeader>
            <CardTitle>Admin Security</CardTitle>
            <CardDescription>
              Manage your master admin credentials.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Change Master Password</Label>
              <Input type="password" placeholder="Current Password" />
              <Input type="password" placeholder="New Password" />
              <Input type="password" placeholder="Confirm New Password" />
            </div>
            <Button variant="outline" onClick={handleUpdatePassword}>Update Password</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

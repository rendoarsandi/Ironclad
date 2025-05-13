
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth-context";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Mail, Shield } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();

  if (!user) {
    return <p>Loading user settings...</p>;
  }

  const getInitials = (name?: string) => {
    if (!name) return <UserCircle className="h-8 w-8" />;
    const initials = name
      .split(" ")
      .map((n) => n[0])
      .join("");
    return initials.toUpperCase() || <UserCircle className="h-8 w-8" />;
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.avatarUrl} alt={user.name || user.email} data-ai-hint="profile picture" />
              <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
            </Avatar>
            <Button variant="outline" size="sm" disabled>Change Avatar</Button>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" defaultValue={user.name || ""} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" defaultValue={user.email} disabled />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="role">Role</Label>
            <Input id="role" defaultValue={user.role.charAt(0).toUpperCase() + user.role.slice(1)} disabled 
              className="flex items-center"
            />
          </div>
          <Button disabled>Save Changes</Button>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Security</CardTitle>
          <CardDescription>Manage your account security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" disabled>Change Password</Button>
          <p className="text-sm text-muted-foreground">
            Two-Factor Authentication is currently <span className="font-semibold">Disabled</span>. (Feature not available)
          </p>
        </CardContent>
      </Card>
       <Card className="shadow-lg">
        <CardHeader>
          <CardTitle>Notifications</CardTitle>
          <CardDescription>Manage your notification preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Notification settings are not yet configurable. (Feature not available)
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

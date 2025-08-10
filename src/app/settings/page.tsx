
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
    const { theme, setTheme } = useTheme();

    return (
        <ProtectedRoute>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <div className="flex flex-col h-screen bg-muted/20">
                        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                            <div className="flex items-center gap-2">
                                <SidebarTrigger className="md:hidden" />
                                <Button variant="ghost" size="icon" asChild>
                                    <Link href="/">
                                        <ArrowLeft />
                                    </Link>
                                </Button>
                                <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
                            </div>
                        </header>
                        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                            <div className="max-w-xl mx-auto grid gap-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Appearance</CardTitle>
                                        <CardDescription>Customize the look and feel of the application.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="theme">Theme</Label>
                                            <Select value={theme} onValueChange={setTheme}>
                                                <SelectTrigger className="w-[180px]">
                                                    <SelectValue placeholder="Select theme" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="light">Light</SelectItem>
                                                    <SelectItem value="dark">Dark</SelectItem>
                                                    <SelectItem value="system">System</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Notifications</CardTitle>
                                        <CardDescription>Manage how you receive notifications.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="email-notifications">Email Notifications</Label>
                                            <Switch id="email-notifications" />
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="push-notifications">Push Notifications</Label>
                                            <Switch id="push-notifications" disabled />
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}

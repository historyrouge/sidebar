
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ProfilePage() {
    const { user } = useAuth();

    const getInitials = (name?: string | null) => {
        if (!name) return "U";
        const names = name.split(' ');
        if (names.length > 1) {
          return names[0][0] + names[names.length - 1][0];
        }
        return name.substring(0, 2);
    }

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
                                <h1 className="text-xl font-semibold tracking-tight">Profile</h1>
                            </div>
                        </header>
                        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                            <Card className="max-w-2xl mx-auto">
                                <CardHeader>
                                    <CardTitle>Your Profile</CardTitle>
                                    <CardDescription>View and manage your profile information.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="flex items-center gap-6">
                                        <Avatar className="h-24 w-24">
                                            <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                                            <AvatarFallback className="text-3xl">{getInitials(user?.displayName)}</AvatarFallback>
                                        </Avatar>
                                        <div className="space-y-1">
                                            <h2 className="text-2xl font-bold">{user?.displayName || "Anonymous User"}</h2>
                                            <p className="text-muted-foreground">{user?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-end">
                                        <Button variant="outline" disabled>Edit Profile (coming soon)</Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </main>
                    </div>
                </SidebarInset>
            </SidebarProvider>
        </ProtectedRoute>
    );
}

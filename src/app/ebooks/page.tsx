"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, BookOpenCheck } from "lucide-react";
import Link from "next/link";

export default function EbooksPage() {
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
                                <h1 className="text-xl font-semibold tracking-tight">eBooks</h1>
                            </div>
                        </header>
                        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>eBooks Collection</CardTitle>
                                    <CardDescription>Browse and read from your digital library.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed rounded-lg">
                                        <BookOpenCheck className="w-16 h-16 text-muted-foreground" />
                                        <p className="mt-4 text-muted-foreground">eBooks feature coming soon!</p>
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

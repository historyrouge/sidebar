"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function HelpPage() {
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
                                <h1 className="text-xl font-semibold tracking-tight">Help</h1>
                            </div>
                        </header>
                        <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Help & Support</CardTitle>
                                    <CardDescription>Find answers to your questions.</CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                   <div>
                                        <h3 className="font-semibold">How do I analyze content?</h3>
                                        <p className="text-muted-foreground">Paste your study material into the text area on the main page and click "Analyze Content". The AI will identify key concepts and potential questions.</p>
                                   </div>
                                    <div>
                                        <h3 className="font-semibold">How do I generate flashcards or quizzes?</h3>
                                        <p className="text-muted-foreground">After analyzing your content, tabs for "Flashcards" and "Quiz" will appear. Click on the respective tab and then click the "Generate" button.</p>
                                    </div>
                                    <div>
                                        <h3 className="font-semibold">How do I use the AI Tutor?</h3>
                                        <p className="text-muted-foreground">After analyzing content, go to the "Tutor" tab. You can ask questions about the material you provided, and the AI will provide explanations.</p>
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

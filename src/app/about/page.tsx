
"use client";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function AboutPage() {
    return (
        <MainLayout>
            <div className="flex flex-col h-screen bg-muted/20">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="md:hidden" />
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/">
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <h1 className="text-xl font-semibold tracking-tight">About Us</h1>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <Card className="max-w-3xl mx-auto">
                        <CardHeader>
                            <CardTitle>About ScholarSage</CardTitle>
                            <CardDescription>Learn more about our mission and team.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4 text-muted-foreground">
                            <p>ScholarSage is an AI-powered study tool designed to help students learn smarter, not harder. Our mission is to make learning more accessible, engaging, and effective for everyone.</p>
                            <p>Our team is passionate about education and technology, and we believe that by combining the two, we can create a powerful tool that empowers students to achieve their academic goals.</p>
                        </CardContent>
                    </Card>
                </main>
            </div>
        </MainLayout>
    );
}


"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpChatbot } from "./help-chatbot";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";

export function HelpContent() {
    return (
        <div className="flex flex-col h-full">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Help & Support</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl">
                    <Card>
                        <CardHeader>
                            <CardTitle>Help Assistant</CardTitle>
                            <CardDescription>Have questions? Ask our AI assistant for help with using the Easy Learn AI app.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <HelpChatbot />
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
}

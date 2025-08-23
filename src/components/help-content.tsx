
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpChatbot } from "./help-chatbot";
import { BackButton } from "./back-button";

export function HelpContent() {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl">
                 <div className="flex items-center gap-2 mb-4">
                    <BackButton />
                    <h1 className="text-2xl font-semibold tracking-tight">Help & Support</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>Help Assistant</CardTitle>
                        <CardDescription>Have questions? Ask our AI assistant for help with using the LearnSphere app.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <HelpChatbot />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

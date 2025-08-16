
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpChatbot } from "./help-chatbot";

export function HelpContent() {
    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <CardTitle>Help & Support</CardTitle>
                        <CardDescription>Have questions? Ask our AI assistant for help with using the ScholarSage app.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <HelpChatbot />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}

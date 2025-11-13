
"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { ShieldCheck, Mail, FolderKanban, User } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { Badge } from "./ui/badge";

const permissions = [
    {
        name: "View your basic profile info",
        description: "Used to display your name and profile picture in the app.",
        icon: <User className="h-5 w-5 text-muted-foreground" />,
    },
    {
        name: "View your primary Google Account email address",
        description: "Used to associate your account with SearnAI for sign-in purposes.",
        icon: <Mail className="h-5 w-5 text-muted-foreground" />,
    },
    {
        name: "View your emails from Gmail",
        description: "Allows the 'Inbox' feature to display your recent emails. This is read-only access.",
        icon: <Mail className="h-5 w-5 text-muted-foreground" />,
        tag: "Optional"
    },
    {
        name: "View your Google Drive files",
        description: "Allows future features to analyze documents directly from your Drive. This is read-only access.",
        icon: <FolderKanban className="h-5 w-5 text-muted-foreground" />,
        tag: "Optional"
    }
];

export function SettingsPermissionsContent() {
    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">App Permissions</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><ShieldCheck className="w-5 h-5 text-green-500"/> Google Account Permissions</CardTitle>
                            <CardDescription>SearnAI requests the following permissions from your Google Account to enable certain features. Your data is handled securely and is never shared.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {permissions.map((perm, index) => (
                                <div key={index} className="flex items-start gap-4 p-4 rounded-lg border bg-background">
                                    <div className="flex-shrink-0">{perm.icon}</div>
                                    <div className="flex-1">
                                        <div className="flex items-center justify-between">
                                            <p className="font-semibold">{perm.name}</p>
                                            {perm.tag && <Badge variant="outline">{perm.tag}</Badge>}
                                        </div>
                                        <p className="text-sm text-muted-foreground">{perm.description}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}


"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Users, UserX } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";

export function SettingsAccountsContent() {
    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Accounts</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Users className="w-5 h-5"/> Accounts</CardTitle>
                            <CardDescription>Manage connected accounts and services.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                <UserX className="w-12 h-12 mb-4" />
                                <h3 className="text-lg font-semibold text-foreground">No Account Needed</h3>
                                <p className="text-sm">
                                    SearnAI does not require an account to use its core features. All your data is stored locally in your browser.
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

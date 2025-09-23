
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { Brush, Wand2, Loader2 } from "lucide-react";
import { Textarea } from "./ui/textarea";

export function AiEditorContent({ embedded }: { embedded?: boolean }) {
    const [isLoading, setIsLoading] = useState(false);

    const header = !embedded && (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <BackButton />
                <h1 className="text-xl font-semibold tracking-tight">AI Editor</h1>
            </div>
        </header>
    );

    return (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            {header}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                    <div className="text-center p-8">
                        <Brush className="mx-auto h-12 w-12 text-muted-foreground" />
                        <h3 className="mt-4 text-lg font-semibold">AI Editor Coming Soon</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            This space will contain the structured AI editing tools.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}

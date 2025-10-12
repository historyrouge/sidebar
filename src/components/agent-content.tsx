
"use client";

import { useRef, useEffect } from "react";
import WebAgentContent from "@/components/web-agent-content";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";

export function AgentContent() {
    const isElectron = !!(window as any).electronAPI;

    if (!isElectron) {
        return (
             <div className="flex h-full flex-col">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="md:hidden" />
                        <BackButton />
                        <h1 className="text-xl font-semibold tracking-tight">Agent</h1>
                    </div>
                </header>
                <main className="flex flex-1 items-center justify-center p-4">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold">Electron Feature</h2>
                        <p className="text-muted-foreground">This feature is only available when running the app within Electron.</p>
                    </div>
                </main>
            </div>
        )
    }

    return (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                     <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Web Agent</h1>
                </div>
            </header>
            <main className="flex-1 overflow-hidden">
                <WebAgentContent />
            </main>
        </div>
    );
}

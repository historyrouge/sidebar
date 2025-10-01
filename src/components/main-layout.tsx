
"use client";

import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
    // No-auth experience: The app is now public, so we don't need to check for a user.
    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                {children}
            </SidebarInset>
        </SidebarProvider>
    );
}

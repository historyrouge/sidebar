
"use client";

import { useEffect, Suspense } from "react";
import { useRouter } from "next/navigation";
import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { useAuth } from "@/hooks/use-auth";
import { Loader2 } from "lucide-react";
import { ErrorBoundary } from "./error-boundary";

export function MainLayout({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    if (loading || !user) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-muted-foreground">Loading your session...</p>
                </div>
            </div>
        );
    }
    
    return (
        <ErrorBoundary>
            <SidebarProvider>
                <AppSidebar />
                <SidebarInset>
                    <Suspense fallback={
                        <div className="flex h-screen w-full items-center justify-center">
                            <div className="flex flex-col items-center gap-4">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-muted-foreground">Loading content...</p>
                            </div>
                        </div>
                    }>
                        {children}
                    </Suspense>
                </SidebarInset>
            </SidebarProvider>
        </ErrorBoundary>
    );
}

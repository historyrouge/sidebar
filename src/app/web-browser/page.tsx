
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';

const WebBrowserContent = dynamic(() => import('@/components/web-browser-content').then(mod => mod.WebBrowserContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
                <div className="flex-1 mx-4">
                     <Skeleton className="h-10 w-full" />
                </div>
                <Skeleton className="h-8 w-8" />
            </header>
            <main className="flex-1 bg-muted">
                <Skeleton className="w-full h-full" />
            </main>
        </div>
    )
});


export default function WebBrowserPage() {
    return (
        <MainLayout>
           <WebBrowserContent />
        </MainLayout>
    );
}

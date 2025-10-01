"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';

const CanvasBoard = dynamic(() => import('@/components/canvas-board').then(mod => mod.CanvasBoard), {
    ssr: false,
    loading: () => (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-24" />
                </div>
                <Skeleton className="h-8 w-24" />
            </header>
            <main className="flex-1">
                <Skeleton className="w-full h-full" />
            </main>
        </div>
    )
});

export default function CanvasPage() {
    return (
        <MainLayout>
            <CanvasBoard />
        </MainLayout>
    );
}


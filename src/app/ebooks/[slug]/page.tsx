
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';

const EbookReader = dynamic(() => import('@/components/ebook-reader').then(mod => mod.EbookReader), { 
    ssr: false, 
    loading: () => (
        <div className="flex flex-1 flex-col">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <Skeleton className="h-8 w-8" />
                <div className="flex-1 mx-4">
                    <Skeleton className="h-6 w-1/2" />
                </div>
                <Skeleton className="h-8 w-8" />
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="prose dark:prose-invert max-w-3xl mx-auto space-y-4">
                    <Skeleton className="h-10 w-3/4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-5/6" />
                    <Skeleton className="h-6 w-full mt-4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-6 w-full mt-4" />
                    <Skeleton className="h-6 w-full" />
                    <Skeleton className="h-6 w-2/3" />
                </div>
            </main>
        </div>
    )
});


export default function EbookPage({ params: { slug } }: { params: { slug: string } }) {
    return (
        <MainLayout>
           <EbookReader slug={slug} />
        </MainLayout>
    );
}

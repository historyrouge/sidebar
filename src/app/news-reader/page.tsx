
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';

const NewsReaderContent = dynamic(() => import('@/components/news-reader-content').then(mod => mod.NewsReaderContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-12 w-full" />
                <div className="relative w-full aspect-video">
                    <Skeleton className="w-full h-full" />
                </div>
                 <div className="space-y-2">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                </div>

                <div className="border rounded-lg h-96">
                   <div className="p-4 border-b">
                        <Skeleton className="h-6 w-1/4" />
                   </div>
                   <div className="p-4 h-full">
                       <Skeleton className="h-full w-full" />
                   </div>
                </div>
            </div>
        </div>
    )
});


export default function NewsReaderPage() {
    return (
        <MainLayout>
           <NewsReaderContent />
        </MainLayout>
    );
}

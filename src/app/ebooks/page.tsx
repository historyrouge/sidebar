
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';

const EbooksContent = dynamic(() => import('@/components/ebooks-content').then(mod => mod.EbooksContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex flex-1 items-center justify-center bg-muted/40 p-4 md:p-8">
            <div className="text-center">
                <Skeleton className="h-12 w-12 mx-auto rounded-full" />
                <Skeleton className="h-7 w-48 mt-4 mx-auto" />
                <Skeleton className="h-5 w-64 mt-2 mx-auto" />
            </div>
        </div>
    )
});


export default function EbooksPage() {
    return (
        <MainLayout>
            <EbooksContent />
        </MainLayout>
    )
}

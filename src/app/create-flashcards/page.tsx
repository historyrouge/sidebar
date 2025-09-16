
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';

const CreateFlashcardsContent = dynamic(() => import('@/components/create-flashcards-content').then(mod => mod.CreateFlashcardsContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex flex-1 items-center justify-center bg-black p-4 md:p-8">
             <div className="flex h-full w-full min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5">
                <div className="text-center p-8">
                    <Skeleton className="mx-auto h-16 w-16 rounded-full" />
                    <Skeleton className="mt-4 h-7 w-64 mx-auto" />
                    <Skeleton className="mt-2 h-5 w-80 mx-auto" />
                    <Skeleton className="mt-6 h-12 w-48 mx-auto rounded-lg" />
                </div>
            </div>
        </div>
    ) 
});


export default function CreateFlashcardsPage() {
    return (
        <MainLayout>
            <CreateFlashcardsContent />
        </MainLayout>
    )
}

    
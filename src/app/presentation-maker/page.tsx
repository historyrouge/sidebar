
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const PresentationMakerContent = dynamic(() => import('@/components/presentation-maker-content').then(mod => mod.PresentationMakerContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent p-4 sm:p-6 lg:p-8">
             <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="mx-auto max-w-xl w-full">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-2/3" />
                        <Skeleton className="h-5 w-full mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-10 w-full" />
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-10 w-full" />
                        </div>
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-40 mt-2" />
                    </CardContent>
                </Card>
            </div>
        </div>
    ) 
});


export default function PresentationMakerPage() {
    return (
        <MainLayout>
            <PresentationMakerContent />
        </MainLayout>
    )
}

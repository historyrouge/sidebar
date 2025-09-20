
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const AiTrainingContent = dynamic(() => import('@/components/ai-training-content').then(mod => mod.AiTrainingContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">
            <div className="flex flex-col items-center justify-center">
                <Card className="w-full max-w-3xl shadow-lg overflow-hidden border-0 relative">
                    <CardHeader className="p-8 text-center items-center">
                        <Skeleton className="h-12 w-12 mx-auto" />
                        <Skeleton className="h-10 w-3/4 mt-6 mx-auto" />
                        <Skeleton className="h-6 w-1/2 mt-2 mx-auto" />
                    </CardHeader>
                    <CardContent className="px-4 sm:px-8 py-8 bg-background space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-20 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
});


export default function AiTrainingPage() {
    return (
        <MainLayout>
           <AiTrainingContent />
        </MainLayout>
    );
}

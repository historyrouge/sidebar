
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const HelpContent = dynamic(() => import('@/components/help-content').then(mod => mod.HelpContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="mx-auto max-w-2xl">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-8 w-1/3" />
                        <Skeleton className="h-5 w-3/4 mt-2" />
                    </CardHeader>
                    <CardContent>
                       <div className="flex h-[450px] flex-col rounded-lg border bg-background">
                            <div className="flex-1 p-4 space-y-4">
                                <Skeleton className="h-10 w-2/3" />
                                <div className="flex justify-end w-full">
                                    <Skeleton className="h-10 w-1/2" />
                                </div>
                                <Skeleton className="h-12 w-3/4" />
                            </div>
                            <div className="border-t p-4">
                                <Skeleton className="h-10 w-full" />
                            </div>
                       </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
});


export default function HelpPage() {
    return (
        <MainLayout>
            <HelpContent />
        </MainLayout>
    )
}

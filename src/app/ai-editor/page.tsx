
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const AiEditorContent = dynamic(() => import('@/components/ai-editor-content').then(mod => mod.AiEditorContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 flex-1">
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <Skeleton className="h-7 w-2/3" />
                        <Skeleton className="h-5 w-full mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-40 mt-2" />
                    </CardContent>
                </Card>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-1/2" />
                        </CardHeader>
                        <CardContent>
                           <Skeleton className="h-96 w-full" />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    ) 
});


export default function AiEditorPage() {
    return (
        <MainLayout>
            <AiEditorContent />
        </MainLayout>
    )
}

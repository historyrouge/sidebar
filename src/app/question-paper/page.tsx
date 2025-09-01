
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const QuestionPaperContent = dynamic(() => import('@/components/question-paper-content').then(mod => mod.QuestionPaperContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent p-4 sm:p-6 lg:p-8">
             <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-2/3" />
                        <Skeleton className="h-5 w-full mt-1" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-full" />
                        <Skeleton className="h-10 w-40 mt-2" />
                    </CardContent>
                </Card>
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <Skeleton className="h-7 w-1/2" />
                            <Skeleton className="h-5 w-3/4 mt-1" />
                        </CardHeader>
                        <CardContent>
                             <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                                <div className="text-center">
                                    <Skeleton className="h-12 w-12 mx-auto" />
                                    <Skeleton className="h-6 w-48 mt-4 mx-auto" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    ) 
});


export default function QuestionPaperPage() {
    return (
        <MainLayout>
            <QuestionPaperContent />
        </MainLayout>
    )
}

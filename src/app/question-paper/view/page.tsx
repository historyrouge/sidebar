
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const QuestionPaperViewer = dynamic(() => import('@/components/question-paper-viewer').then(mod => mod.QuestionPaperViewer), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-8 w-8" />
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <Card className="max-w-4xl mx-auto">
                    <CardHeader>
                        <Skeleton className="h-8 w-2/3 mx-auto" />
                        <Skeleton className="h-5 w-1/3 mx-auto" />
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <Skeleton className="h-24 w-full" />
                        <Skeleton className="h-32 w-full" />
                        <Skeleton className="h-28 w-full" />
                    </CardContent>
                </Card>
            </main>
        </div>
    ) 
});


export default function QuestionPaperViewPage() {
    return (
        <MainLayout>
            <QuestionPaperViewer />
        </MainLayout>
    )
}


"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const QuizContent = dynamic(() => import('@/components/quiz-content').then(mod => mod.QuizContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-48" />
            </div>
            <Card className="flex flex-col lg:col-span-2 flex-1">
                <CardHeader>
                    <Skeleton className="h-7 w-1/2" />
                    <Skeleton className="h-5 w-3/4" />
                </CardHeader>
                <CardContent className="flex-1">
                    <Skeleton className="h-full min-h-[300px] w-full" />
                </CardContent>
                <CardFooter>
                    <Skeleton className="h-10 w-48" />
                </CardFooter>
            </Card>
        </div>
    )
});


export default function QuizPage() {
    return (
        <MainLayout>
            <QuizContent />
        </MainLayout>
    )
}

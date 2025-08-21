
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const QuizContent = dynamic(() => import('@/components/quiz-content').then(mod => mod.QuizContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-screen flex-col bg-background">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 md:hidden" />
                    <Skeleton className="h-6 w-24" />
                </div>
                <Skeleton className="h-8 w-8" />
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <Card className="flex flex-col lg:col-span-2">
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
            </main>
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

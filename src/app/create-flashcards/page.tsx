
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';

const CreateFlashcardsContent = dynamic(() => import('@/components/create-flashcards-content').then(mod => mod.CreateFlashcardsContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center gap-2">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 flex-1">
                <Card className="flex flex-col">
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
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/2" />
                        <Skeleton className="h-5 w-3/4" />
                    </CardHeader>
                    <CardContent>
                       <div className="grid grid-cols-1 gap-4 pr-4 sm:grid-cols-2">
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                            <Skeleton className="h-48 w-full" />
                        </div>
                    </CardContent>
                </Card>
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

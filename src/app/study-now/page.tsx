
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/main-layout';
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const StudyNowContent = dynamic(() => import('@/components/study-now-content').then(mod => mod.StudyNowContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex h-screen flex-col bg-muted/20 dark:bg-transparent">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <Skeleton className="h-8 w-8 lg:hidden" />
                    <Skeleton className="h-6 w-40" />
                </div>
                <Skeleton className="h-8 w-8" />
            </header>
            <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
                <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-8">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <Skeleton className="h-7 w-1/2" />
                            <Skeleton className="h-5 w-3/4" />
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-full min-h-[300px] w-full" />
                        </CardContent>
                        <CardFooter className="flex flex-col items-stretch gap-2 @sm:flex-row">
                            <Skeleton className="h-10 w-32" />
                            <div className="flex items-stretch gap-2 flex-1">
                                <Skeleton className="h-10 flex-1" />
                                <Skeleton className="h-10 flex-1" />
                            </div>
                        </CardFooter>
                    </Card>
                    <Card className="flex flex-col">
                        <CardHeader>
                            <Skeleton className="h-7 w-1/2" />
                            <Skeleton className="h-5 w-3/4" />
                        </CardHeader>
                        <CardContent className="flex-1">
                           <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                                <div className="text-center p-8">
                                    <Skeleton className="h-12 w-12 mx-auto rounded-full" />
                                    <Skeleton className="h-6 w-48 mt-4 mx-auto" />
                                    <Skeleton className="h-5 w-64 mt-1 mx-auto" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    )
});


export default function StudyNowPage() {
  return (
      <MainLayout>
        <StudyNowContent />
      </MainLayout>
  );
}

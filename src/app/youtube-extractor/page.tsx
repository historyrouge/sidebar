
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/main-layout';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';

const YouTubeExtractorContent = dynamic(() => import('@/components/youtube-extractor-content').then(mod => mod.YouTubeExtractorContent), { 
    ssr: false, 
    loading: () => (
         <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/2" />
                        <Skeleton className="h-5 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full items-center space-x-2">
                           <Skeleton className="h-10 flex-1" />
                           <Skeleton className="h-10 w-24" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/2" />
                        <Skeleton className="h-5 w-3/4" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-64 w-full" />
                    </CardContent>
                    <CardFooter>
                       <Skeleton className="h-10 w-40" />
                    </CardFooter>
                </Card>
            </div>
        </div>
    )
});


export default function YouTubeExtractorPage() {
    return (
        <MainLayout>
            <YouTubeExtractorContent />
        </MainLayout>
    )
}

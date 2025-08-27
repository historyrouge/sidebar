
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const NewsContent = dynamic(() => import('@/components/news-content').then(mod => mod.NewsContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mb-8 text-center">
                <Skeleton className="h-10 w-48 mx-auto" />
                <Skeleton className="h-6 w-64 mx-auto mt-2" />
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                     <Card key={i}>
                        <CardHeader>
                            <Skeleton className="h-40 w-full" />
                        </CardHeader>
                        <CardContent className="space-y-2">
                           <Skeleton className="h-6 w-3/4" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-5/6" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
});


export default function NewsPage() {
    return (
        <MainLayout>
           <NewsContent />
        </MainLayout>
    );
}

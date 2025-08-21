
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const AboutContent = dynamic(() => import('@/components/about-content').then(mod => mod.AboutContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-muted/40 min-h-full">
            <Card className="w-full max-w-3xl shadow-lg overflow-hidden border-0">
                 <CardHeader className="p-8 text-center items-center">
                    <Skeleton className="h-32 w-32 rounded-full" />
                    <Skeleton className="h-10 w-3/4 mt-6" />
                    <Skeleton className="h-6 w-1/2 mt-2" />
                </CardHeader>
                <CardContent className="px-4 sm:px-8 py-8 bg-background">
                    <Skeleton className="h-8 w-1/2 mx-auto" />
                    <div className="space-y-4 mt-6">
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-5/6" />
                        <Skeleton className="h-6 w-full mt-4" />
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                    </div>
                </CardContent>
            </Card>
        </div>
    )
});


export default function AboutPage() {
    return (
        <MainLayout>
           <AboutContent />
        </MainLayout>
    );
}

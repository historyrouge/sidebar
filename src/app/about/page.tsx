
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

const AboutContent = dynamic(() => import('@/components/about-content').then(mod => mod.AboutContent), { 
    ssr: false, 
    loading: () => (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">
            <div className="flex flex-col items-center justify-center">
                <Card className="w-full max-w-3xl shadow-lg overflow-hidden border-0 relative">
                    <div className="p-8 text-center items-center">
                        <Skeleton className="h-32 w-32 rounded-full mx-auto" />
                        <Skeleton className="h-10 w-3/4 mt-6 mx-auto" />
                        <Skeleton className="h-6 w-1/2 mt-2 mx-auto" />
                    </div>
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

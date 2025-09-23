
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const TextToSpeechContent = dynamic(() => import('@/components/text-to-speech-content').then(mod => mod.TextToSpeechContent), { 
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
                        <Skeleton className="h-40 w-full" />
                    </CardContent>
                </Card>
                <Skeleton className="h-10 w-48" />
                 <Card>
                    <CardHeader>
                        <Skeleton className="h-7 w-1/3" />
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-16 w-full" />
                    </CardContent>
                </Card>
            </div>
        </div>
    )
});


export default function TextToSpeechPage() {
    return (
        <MainLayout>
           <TextToSpeechContent />
        </MainLayout>
    );
}

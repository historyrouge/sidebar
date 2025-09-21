"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

const PdfHubContent = dynamic(() => import('@/components/pdf-hub-content').then(mod => mod.PdfHubContent), { 
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
                        <div className="flex h-48 items-center justify-center rounded-lg border-2 border-dashed">
                           <div className="text-center">
                               <Skeleton className="h-12 w-12 mx-auto" />
                               <Skeleton className="h-5 w-48 mt-4 mx-auto" />
                           </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
});


export default function PdfHubPage() {
    return (
        <MainLayout>
            <PdfHubContent />
        </MainLayout>
    )
}

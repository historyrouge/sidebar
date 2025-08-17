
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const MaterialsContent = dynamic(() => import('@/components/materials-content').then(mod => mod.MaterialsContent), { ssr: false, loading: () => <div className="flex h-full w-full items-center justify-center"><p>Loading...</p></div> });


export default function MaterialsPage() {
    return (
        <MainLayout>
            <MaterialsContent />
        </MainLayout>
    )
}

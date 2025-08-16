
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const EbooksContent = dynamic(() => import('@/components/ebooks-content').then(mod => mod.EbooksContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function EbooksPage() {
    return (
        <MainLayout>
            <EbooksContent />
        </MainLayout>
    )
}

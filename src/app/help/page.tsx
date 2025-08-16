
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const HelpContent = dynamic(() => import('@/components/help-content').then(mod => mod.HelpContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function HelpPage() {
    return (
        <MainLayout>
            <HelpContent />
        </MainLayout>
    )
}

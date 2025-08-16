
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const SettingsContent = dynamic(() => import('@/components/settings-content').then(mod => mod.SettingsContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function SettingsPage() {
    return (
        <MainLayout>
            <SettingsContent />
        </MainLayout>
    )
}

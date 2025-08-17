
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const ProfileContent = dynamic(() => import('@/components/profile-content').then(mod => mod.ProfileContent), { ssr: false, loading: () => <div className="flex h-full w-full items-center justify-center"><p>Loading...</p></div> });


export default function ProfilePage() {
    return (
        <MainLayout>
            <ProfileContent />
        </MainLayout>
    )
}

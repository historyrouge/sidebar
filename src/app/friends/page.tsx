
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const FriendsContent = dynamic(() => import('@/components/friends-content').then(mod => mod.FriendsContent), { ssr: false, loading: () => <div className="flex h-full w-full items-center justify-center"><p>Loading...</p></div> });


export default function FriendsPage() {
    return (
        <MainLayout>
            <FriendsContent />
        </MainLayout>
    )
}

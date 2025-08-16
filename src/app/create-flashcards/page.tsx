
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const CreateFlashcardsContent = dynamic(() => import('@/components/create-flashcards-content').then(mod => mod.CreateFlashcardsContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function CreateFlashcardsPage() {
    return (
        <MainLayout>
            <CreateFlashcardsContent />
        </MainLayout>
    )
}

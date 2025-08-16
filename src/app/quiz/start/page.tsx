
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const QuizStartContent = dynamic(() => import('@/components/quiz-start-content').then(mod => mod.QuizStartContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function QuizStartPage() {
    return (
        <MainLayout>
            <QuizStartContent />
        </MainLayout>
    )
}

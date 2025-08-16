
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const QuizContent = dynamic(() => import('@/components/quiz-content').then(mod => mod.QuizContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function QuizPage() {
    return (
        <MainLayout>
            <QuizContent />
        </MainLayout>
    )
}

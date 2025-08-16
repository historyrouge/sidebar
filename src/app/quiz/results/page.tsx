
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const QuizResultsContent = dynamic(() => import('@/components/quiz-results-content').then(mod => mod.QuizResultsContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function QuizResultsPage() {
    return (
        <MainLayout>
            <QuizResultsContent />
        </MainLayout>
    )
}

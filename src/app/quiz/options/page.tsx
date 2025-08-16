
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const QuizOptionsForm = dynamic(() => import('@/components/quiz-options-form').then(mod => mod.QuizOptionsForm), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function QuizOptionsPage() {
    return (
        <MainLayout>
            <QuizOptionsForm />
        </MainLayout>
    )
}

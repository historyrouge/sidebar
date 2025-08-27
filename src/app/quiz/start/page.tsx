
"use client";
import dynamic from 'next/dynamic';

const QuizStartContent = dynamic(() => import('@/components/quiz-start-content').then(mod => mod.QuizStartContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function QuizStartPage() {
    return (
        <QuizStartContent />
    )
}

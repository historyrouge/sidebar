
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/main-layout';

const YouTubeExtractorContent = dynamic(() => import('@/components/youtube-extractor-content').then(mod => mod.YouTubeExtractorContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function YouTubeExtractorPage() {
    return (
        <MainLayout>
            <YouTubeExtractorContent />
        </MainLayout>
    )
}

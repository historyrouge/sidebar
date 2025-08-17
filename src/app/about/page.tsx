
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const AboutContent = dynamic(() => import('@/components/about-content').then(mod => mod.AboutContent), { ssr: false, loading: () => <div className="flex h-full w-full items-center justify-center"><p>Loading...</p></div> });


export default function AboutPage() {
    return (
        <MainLayout>
           <AboutContent />
        </MainLayout>
    );
}

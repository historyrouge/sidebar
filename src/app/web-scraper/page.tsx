"use client";
import { MainLayout } from "@/components/main-layout";
import { WebBrowserContent } from '@/components/web-browser-content';
import { Suspense } from "react";

function WebScraperPageContent() {
    return (
        <MainLayout>
           <WebBrowserContent />
        </MainLayout>
    );
}

export default function WebScraperPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WebScraperPageContent />
        </Suspense>
    )
}

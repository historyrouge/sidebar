
"use client";
import { MainLayout } from "@/components/main-layout";
import { WebBrowserContent } from '@/components/web-browser-content';
import { Suspense } from "react";

function WebBrowserPageContent() {
    return (
        <MainLayout>
           <WebBrowserContent />
        </MainLayout>
    );
}


export default function WebBrowserPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <WebBrowserPageContent />
        </Suspense>
    )
}

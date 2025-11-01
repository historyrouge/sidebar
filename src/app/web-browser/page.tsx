
"use client";
import { MainLayout } from "@/components/main-layout";
import { WebBrowserContent } from '@/components/web-browser-content';
import { Suspense } from "react";

// This page is now a fallback for direct navigation.
// The main browser functionality is integrated into the main dashboard.
export default function WebBrowserPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <MainLayout>
                <WebBrowserContent />
            </MainLayout>
        </Suspense>
    )
}


"use client";
import { MainLayout } from "@/components/main-layout";
import { AiEditorContent } from '@/components/ai-editor-content';

// This page is now a fallback for mobile or direct access
export default function AiEditorPage() {
    return (
        <MainLayout>
            <AiEditorContent />
        </MainLayout>
    )
}

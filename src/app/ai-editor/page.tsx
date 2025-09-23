
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { AiEditorContent } from '@/components/ai-editor-content';

// This page is now a fallback for mobile or direct access
export default function AiEditorPage() {
    return (
        <MainLayout>
            <AiEditorContent />
        </MainLayout>
    )
}

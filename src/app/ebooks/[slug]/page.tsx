
"use client";
import { MainLayout } from "@/components/main-layout";
import { EbookReader } from '@/components/ebook-reader';

export default function EbookPage({ params }: { params: { slug: string } }) {
    return (
        <MainLayout>
           <EbookReader slug={params.slug} />
        </MainLayout>
    );
}

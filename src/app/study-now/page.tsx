
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/main-layout';

const StudyNowContent = dynamic(() => import('@/components/study-now-content').then(mod => mod.StudyNowContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function StudyNowPage() {
  return (
      <MainLayout>
        <StudyNowContent />
      </MainLayout>
  );
}

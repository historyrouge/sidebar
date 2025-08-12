
"use client";
import dynamic from 'next/dynamic';

const StudyNowContent = dynamic(() => import('@/components/study-now-content').then(mod => mod.StudyNowContent), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });


export default function StudyNowPage() {
  return (
      <StudyNowContent />
  );
}

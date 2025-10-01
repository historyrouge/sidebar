"use client";

import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/main-layout';
import { Skeleton } from '@/components/ui/skeleton';

const CanvasContent = dynamic(() => import('@/components/canvas-content').then(m => m.CanvasContent), {
  ssr: false,
  loading: () => (
    <div className="flex-1 overflow-hidden p-3 md:p-4">
      <div className="mx-auto h-full w-full max-w-6xl">
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Skeleton className="h-9 w-48" />
            <div className="flex gap-2">
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
              <Skeleton className="h-9 w-24" />
            </div>
          </div>
          <Skeleton className="h-[70vh] w-full" />
        </div>
      </div>
    </div>
  )
});

export default function CanvasPage() {
  return (
    <MainLayout>
      <CanvasContent />
    </MainLayout>
  );
}


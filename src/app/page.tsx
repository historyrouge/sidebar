
"use client";
import { MainLayout } from "@/components/main-layout";
import { Skeleton } from "@/components/ui/skeleton";
import dynamic from "next/dynamic";

const MainDashboard = dynamic(
  () => import('@/components/main-dashboard').then(mod => mod.MainDashboard),
  { 
    ssr: false, 
    loading: () => (
      <div className="flex h-full flex-col">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-8 lg:hidden" />
                <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex items-center gap-4">
                <Skeleton className="h-8 w-8" />
            </div>
        </header>
        <main className="flex-1 overflow-auto">
             <div className="mx-auto max-w-3xl w-full p-4 space-y-2 pb-24 h-full">
                <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
                    <Skeleton className="w-20 h-20 rounded-full mb-4" />
                    <Skeleton className="h-8 w-72 mt-6" />
                    <Skeleton className="h-5 w-96 mt-2" />
                </div>
            </div>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background/80 to-transparent border-t p-4">
                <Skeleton className="h-12 max-w-3xl mx-auto rounded-lg" />
            </div>
        </main>
      </div>
    ) 
  }
);

export default function Home() {
  return (
    <MainLayout>
      <MainDashboard />
    </MainLayout>
  );
}

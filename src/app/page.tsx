
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from "@/components/main-layout";

const MainDashboard = dynamic(() => import('@/components/main-dashboard').then(mod => mod.MainDashboard), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });

export default function Home() {
  return (
    <MainLayout>
      <MainDashboard />
    </MainLayout>
  );
}


"use client";
import { MainLayout } from "@/components/main-layout";
import dynamic from "next/dynamic";

const MainDashboard = dynamic(
  () => import('@/components/main-dashboard').then(mod => mod.MainDashboard),
  { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center"><p>Loading...</p></div> }
);

export default function Home() {
  return (
    <MainLayout>
      <MainDashboard />
    </MainLayout>
  );
}


"use client";

import { useEffect } from "react";
import NProgress from 'nprogress';
import dynamic from "next/dynamic";

const MainDashboard = dynamic(() => import('@/components/main-dashboard').then(mod => mod.MainDashboard), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });

export default function Home() {
  useEffect(() => {
    NProgress.start();
    NProgress.done();
  }, []);

  return (
      <MainDashboard />
  );
}


"use client";

import { MainDashboard } from "@/components/main-dashboard";
import { useEffect } from "react";
import NProgress from 'nprogress';

export default function Home() {
  useEffect(() => {
    NProgress.start();
    NProgress.done();
  }, []);

  return (
      <MainDashboard />
  );
}

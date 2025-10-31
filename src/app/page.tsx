
"use client";
import { MainLayout } from "@/components/main-layout";
import { MainDashboard } from "@/components/main-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      // This part is now effectively disabled due to the AuthProvider changes
      // but kept for safety in case the provider is reverted.
      router.push('/login');
    }
  }, [user, loading, router]);
  
  if (loading || !user) {
    // This will no longer be shown as loading is always false and user is always set.
    return null; 
  }

  return (
    <MainLayout>
      <MainDashboard />
    </MainLayout>
  );
}

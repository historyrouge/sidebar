
"use client";
import { MainLayout } from "@/components/main-layout";
import { MainDashboard } from "@/components/main-dashboard";

export default function Home() {
  // The onboarding check has been moved to the AuthProvider in hooks/use-auth.tsx
  // to prevent race conditions with Firestore initialization.
  return (
    <MainLayout>
      <MainDashboard />
    </MainLayout>
  );
}

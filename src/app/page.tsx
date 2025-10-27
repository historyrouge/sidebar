

"use client";
import { MainLayout } from "@/components/main-layout";
import { MainDashboard } from "@/components/main-dashboard";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";


export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      const checkOnboarding = async () => {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (!userDoc.exists()) {
          router.push('/onboarding');
        }
      };
      checkOnboarding();
    }
  }, [user, loading, router]);
  
  return (
    <MainLayout>
      <MainDashboard />
    </MainLayout>
  );
}


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
      const checkOnboarding = async (retries = 3, delay = 500) => {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (!userDoc.exists()) {
            router.push('/onboarding');
          }
        } catch (error: any) {
          if (error.code === 'unavailable' && retries > 0) {
            console.warn(`Firestore offline, retrying... (${retries} left)`);
            setTimeout(() => checkOnboarding(retries - 1, delay * 2), delay);
          } else {
            // Handle other errors or final failure
            console.error("Failed to check onboarding status:", error);
          }
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

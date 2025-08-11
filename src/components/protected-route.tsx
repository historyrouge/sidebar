
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const publicRoutes = ['/login', '/signup', '/onboarding'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (loading) return;

    const isPublic = publicRoutes.includes(pathname);

    if (!user && !isPublic) {
      router.push("/login");
    } else if (user && (pathname === '/login' || pathname === '/signup')) {
      router.push("/");
    } else {
        setIsReady(true);
    }
  }, [user, loading, router, pathname]);

  // Render a loading state on the server and initial client render
  if (typeof window === 'undefined' || loading || !isReady) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  if (!user && !publicRoutes.includes(pathname)) {
    return null; // Don't render anything, useEffect will redirect
  }
  
  return <>{children}</>;
}

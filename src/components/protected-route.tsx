
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicRoutes = ['/login', '/signup', '/onboarding'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) {
      return; // Wait for the auth state to be determined
    }

    const isPublic = publicRoutes.includes(pathname);

    if (!user && !isPublic) {
      router.push("/login");
    } else if (user && (pathname === '/login' || pathname === '/signup')) {
      router.push("/");
    }
  }, [user, loading, router, pathname]);

  // While loading, or if we're about to redirect, show a loading screen
  if (loading || (!user && !publicRoutes.includes(pathname))) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  // If the user is logged in, but on a public-only route, show loading until redirect happens
  if (user && (pathname === '/login' || pathname === '/signup')) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  return <>{children}</>;
}

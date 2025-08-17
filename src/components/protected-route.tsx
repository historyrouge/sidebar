
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const publicRoutes = ['/login', '/signup'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      const isPublic = publicRoutes.includes(pathname);
      const isOnboarding = pathname === '/onboarding';

      if (!user && !isPublic) {
        router.push('/login');
      }
      
      if (user && isPublic) {
        router.push('/');
      }

      if (user && !isOnboarding && !user.displayName) {
        router.push('/onboarding');
      }
    }
  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  // Prevent rendering children if a redirect is imminent
  const isPublic = publicRoutes.includes(pathname);
  if (!user && !isPublic) {
    return <div className="flex h-screen w-full items-center justify-center">Redirecting...</div>;
  }
  if (user && isPublic) {
     return <div className="flex h-screen w-full items-center justify-center">Redirecting...</div>;
  }
  if (user && pathname !== '/onboarding' && !user.displayName) {
     return <div className="flex h-screen w-full items-center justify-center">Redirecting...</div>;
  }

  return <>{children}</>;
}

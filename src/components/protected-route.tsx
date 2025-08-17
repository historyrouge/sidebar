
"use client";

import { useAuth } from "@/hooks/use-auth";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

const publicRoutes = ['/login', '/signup'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; 

    const isPublic = publicRoutes.includes(pathname);
    const isOnboarding = pathname === '/onboarding';

    if (!user && !isPublic) {
      router.push('/login');
    }
    
    if (user) {
        if (isPublic) {
          router.push('/');
        }
        else if (!user.displayName && !isOnboarding) {
          router.push('/onboarding');
        }
    }

  }, [user, loading, pathname, router]);

  if (loading) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }
  
  const isPublic = publicRoutes.includes(pathname);
  if (!user && !isPublic) {
    return <div className="flex h-screen w-full items-center justify-center">Redirecting to login...</div>;
  }

  if (user && isPublic) {
    return <div className="flex h-screen w-full items-center justify-center">Redirecting to dashboard...</div>;
  }

  if (user && !user.displayName && pathname !== '/onboarding') {
    return <div className="flex h-screen w-full items-center justify-center">Redirecting to onboarding...</div>;
  }

  return <>{children}</>;
}

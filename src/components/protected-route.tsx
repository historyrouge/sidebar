
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePathname } from 'next/navigation'

const publicRoutes = ['/login', '/signup'];

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;

    const isPublic = publicRoutes.includes(pathname);

    if (!user && !isPublic) {
      router.push("/login");
    } 
    
    if (user && isPublic) {
      router.push("/");
    }

  }, [user, loading, router, pathname]);

  if ((loading || !user) && !publicRoutes.includes(pathname)) {
    return <div className="flex h-screen w-full items-center justify-center">Loading...</div>;
  }

  return <>{children}</>;
}

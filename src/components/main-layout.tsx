
"use client";

import { ProtectedRoute } from "@/components/protected-route";
import { SidebarProvider } from "@/components/ui/sidebar";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
      <div className="min-h-screen">
        {children}
      </div>
  );
}

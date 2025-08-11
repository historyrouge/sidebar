
"use client";

import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarProvider } from "./ui/sidebar";
import { ProtectedRoute } from "./protected-route";
import { NextNProgressClient } from "./nprogress-client";

export function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <NextNProgressClient />
          {children}
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

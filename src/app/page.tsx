
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { MainDashboard } from "@/components/main-dashboard";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <MainDashboard />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

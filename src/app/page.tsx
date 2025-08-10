
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { MainContent } from "@/components/main-content";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <MainContent />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

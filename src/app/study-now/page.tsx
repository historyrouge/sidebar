
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { StudyNowContent } from "@/components/study-now-content";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function StudyNowPage() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <StudyNowContent />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

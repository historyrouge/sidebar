
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CodeAgentChat } from "@/components/code-agent-chat";

export default function CodeAgentPage() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <CodeAgentChat />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

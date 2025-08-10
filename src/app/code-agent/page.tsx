
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { CodeAgentChatView } from "@/components/code-agent-chat-view";

export default function CodeAgentPage() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <CodeAgentChatView />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

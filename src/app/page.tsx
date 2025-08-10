
"use client";

import { AppSidebar } from "@/components/app-sidebar";
import { ChatView } from "@/components/chat-view";
import { ProtectedRoute } from "@/components/protected-route";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export default function Home() {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <ChatView />
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  );
}

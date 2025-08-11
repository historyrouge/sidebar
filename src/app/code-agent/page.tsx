
"use client";

import { MainLayout } from "@/components/main-layout";
import { CodeAgentChatView } from "@/components/code-agent-chat-view";

export default function CodeAgentPage() {
  return (
    <MainLayout>
        <CodeAgentChatView />
    </MainLayout>
  );
}

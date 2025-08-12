
"use client";
import dynamic from 'next/dynamic';

const CodeAgentChatView = dynamic(() => import('@/components/code-agent-chat-view').then(mod => mod.CodeAgentChatView), { ssr: false, loading: () => <div className="flex h-screen w-full items-center justify-center">Loading...</div> });

export default function CodeAgentPage() {
  return (
      <CodeAgentChatView />
  );
}

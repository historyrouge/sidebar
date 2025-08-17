
"use client";
import dynamic from 'next/dynamic';
import { MainLayout } from '@/components/main-layout';

const CodeAgentChatView = dynamic(() => import('@/components/code-agent-chat-view').then(mod => mod.CodeAgentChatView), { ssr: false, loading: () => <div className="flex h-full w-full items-center justify-center"><p>Loading...</p></div> });

export default function CodeAgentPage() {
  return (
      <MainLayout>
        <CodeAgentChatView />
      </MainLayout>
  );
}

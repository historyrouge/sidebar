
"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState, useTransition } from "react";
import { SidebarTrigger } from "./ui/sidebar";
import { CodeAgentChat } from "./code-agent-chat";

type Message = {
  role: "user" | "model";
  content: string;
};

export function CodeAgentChatView() {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex h-screen flex-col bg-background">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold tracking-tight">Code Agent</h1>
        </div>
        <div className="flex items-center gap-4">
            <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
            >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <CodeAgentChat
            history={history}
            setHistory={setHistory}
            input={input}
            setInput={setInput}
            isTyping={isTyping}
            startTyping={startTyping}
        />
      </main>
    </div>
  );
}

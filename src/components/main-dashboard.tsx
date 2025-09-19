
"use client";

import { Button } from "@/components/ui/button";
import { FileEdit, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState, useTransition, useEffect } from "react";
import { ChatContent } from "./chat-content";
import { SidebarTrigger } from "./ui/sidebar";
import { WelcomeDialog } from "./welcome-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { GenerateQuestionPaperOutput } from "@/app/actions";

type Message = {
  role: "user" | "model";
  content: string;
  imageDataUri?: string;
  toolResult?: {
    type: 'questionPaper',
    data: GenerateQuestionPaperOutput
  }
};

const CHAT_HISTORY_STORAGE_KEY = 'chatHistory';

export function MainDashboard() {
  const { theme, setTheme } = useTheme();
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
    } catch (error) {
      console.error("Failed to load chat state from localStorage", error);
    }
  }, []);

  // Save history to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch (error) {
      console.error("Failed to save chat history to localStorage", error);
    }
  }, [history]);

  const handleNewChat = () => {
    setHistory([]);
    setInput("");
    try {
        sessionStorage.removeItem('chatScrollPosition');
    } catch (e) {
        console.error("Could not clear session storage", e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
      <WelcomeDialog />
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-xl font-semibold tracking-tight">Chat</h1>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleNewChat}>
                <FileEdit className="mr-2 h-4 w-4" />
                New Chat
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                         <Avatar className="h-8 w-8">
                            <AvatarFallback>U</AvatarFallback>
                        </Avatar>
                        <span className="sr-only">Toggle user menu</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <Link href="/settings"><DropdownMenuItem>Settings</DropdownMenuItem></Link>
                    <Link href="/help"><DropdownMenuItem>Support</DropdownMenuItem></Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem disabled>Logout</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 flex flex-col overflow-hidden">
        <ChatContent
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

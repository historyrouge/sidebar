
"use client";

import { codeAgentAction, CodeAgentInput } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, Code, Loader2, LogOut, Moon, Send, Settings, Sun, User } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState, useTransition, useRef, useEffect } from "react";
import { SidebarTrigger } from "./ui/sidebar";
import Link from "next/link";
import { marked } from "marked";

type Message = {
  role: "user" | "model";
  content: string;
};

export function CodeAgentChat() {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setHistory((prev) => [...prev, userMessage]);
    setInput("");

    startTyping(async () => {
      const chatInput: CodeAgentInput = {
        history: [...history, userMessage],
      };
      const result = await codeAgentAction(chatInput);

      if (result.error) {
        toast({
          title: "Chat Error",
          description: result.error,
          variant: "destructive",
        });
        setHistory((prev) => prev.slice(0, -1)); // Remove user message on error
      } else if (result.data) {
        const modelMessage: Message = { role: "model", content: result.data.response };
        setHistory((prev) => [...prev, modelMessage]);
      }
    });
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    }
  }, [history]);

  const getInitials = (name?: string | null) => {
    if (!name) return "SS";
    const names = name.split(' ');
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  }

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
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Avatar className="h-9 w-9 cursor-pointer">
                  <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                  <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>{user?.email || "My Account"}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <Link href="/profile" passHref>
                    <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                    </DropdownMenuItem>
                </Link>
                <Link href="/settings" passHref>
                    <DropdownMenuItem>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Settings</span>
                    </DropdownMenuItem>
                </Link>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => logout()}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>
      </header>
      <main className="flex-1 overflow-auto">
        <div className="relative h-full">
            <ScrollArea className="absolute h-full w-full" ref={scrollAreaRef}>
                <div className="mx-auto max-w-3xl w-full p-4 space-y-6 pb-24">
                {history.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)]">
                        <div className="bg-primary/10 p-4 rounded-full">
                            <Code className="w-10 h-10 text-primary" />
                        </div>
                        <h2 className="mt-6 text-2xl font-semibold">How can I help you with code today?</h2>
                    </div>
                )}
                {history.map((message, index) => (
                    <div
                    key={index}
                    className={cn(
                        "flex items-start gap-4",
                        message.role === "user" ? "justify-end" : ""
                    )}
                    >
                    {message.role === "model" && (
                        <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="size-5" /></AvatarFallback>
                        </Avatar>
                    )}
                    <div
                        className={cn(
                        "max-w-lg rounded-lg p-3 text-sm prose dark:prose-invert",
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border"
                        )}
                        dangerouslySetInnerHTML={{ __html: message.role === 'model' ? marked(message.content) : message.content }}
                    />
                    
                    {message.role === "user" && (
                        <Avatar className="h-9 w-9">
                        <AvatarImage src={user?.photoURL ?? undefined} alt={user?.displayName ?? "User"} />
                        <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
                        </Avatar>
                    )}
                    </div>
                ))}
                {isTyping && (
                    <div className="flex items-start gap-4">
                    <Avatar className="h-9 w-9">
                        <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="size-5" /></AvatarFallback>
                    </Avatar>
                    <div className="max-w-lg rounded-lg p-3 text-sm bg-card border flex items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Thinking...</span>
                    </div>
                    </div>
                )}
                </div>
            </ScrollArea>
            <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background to-transparent border-t p-4">
                 <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask about code..."
                        disabled={isTyping}
                        className="h-12 text-base shadow-sm"
                    />
                    <Button type="submit" size="icon" className="h-12 w-12" disabled={isTyping || !input.trim()}>
                        {isTyping ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                        <Send className="h-5 w-5" />
                        )}
                        <span className="sr-only">Send</span>
                    </Button>
                </form>
            </div>
        </div>
      </main>
    </div>
  );
}

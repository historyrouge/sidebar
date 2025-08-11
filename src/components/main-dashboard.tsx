
"use client";

import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { ArrowRight, ChevronDown, Plus, Upload } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState, useTransition } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import { Input } from "./ui/input";
import { generalChatAction, GeneralChatInput } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";

type Message = {
  role: "user" | "model";
  content: string;
};

export function MainDashboard() {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    const names = name.split(" ");
    if (names.length > 1) {
      return names[0][0] + names[names.length - 1][0];
    }
    return name.substring(0, 2);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setHistory((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");

    startTyping(async () => {
      const chatInput: GeneralChatInput = {
        history: [...history, userMessage],
      };
      const result = await generalChatAction(chatInput);

      if (result.error) {
        toast({
          title: "Chat Error",
          description: result.error,
          variant: "destructive",
        });
      } else if (result.data) {
        // This is a dummy response for now, will be replaced with real chat functionality
        const modelMessage: Message = {
          role: "model",
          content: `This is a dummy response to: "${currentInput}"`,
        };
        setHistory((prev) => [...prev, modelMessage]);
      }
    });
  };

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex-1">
          <div className="relative">
            <Input
              placeholder="Type your question or press Ctrl+V to paste an image"
              className="w-full max-w-lg rounded-full bg-muted pr-10"
            />
            <Upload className="absolute right-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="rounded-full">
            Upgrade to Pro
          </Button>
          <Button size="icon" className="rounded-full">
            <Plus />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Avatar className="h-9 w-9 cursor-pointer">
                <AvatarImage
                  src={user?.photoURL ?? undefined}
                  alt={user?.displayName ?? "User"}
                />
                <AvatarFallback>{getInitials(user?.displayName)}</AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                {user?.email || "My Account"}
              </DropdownMenuLabel>
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
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <Button variant="link" className="p-0 text-lg font-semibold text-primary">
              Get study help
              <ChevronDown className="ml-1" />
            </Button>
            <form onSubmit={handleSendMessage}>
              <div className="relative mt-2">
                <Input
                  placeholder="Ask Study Chat a question"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="h-14 rounded-lg bg-muted/50 p-4 pr-14 text-base"
                />
                <Button
                  type="submit"
                  size="icon"
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full"
                  disabled={isTyping}
                >
                  <ArrowRight />
                </Button>
              </div>
            </form>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Recent essays</h2>
            <div className="mt-4">
              <div className="flex h-48 w-40 flex-col items-center justify-center rounded-lg border-2 border-dashed">
                <Plus className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  Grade your first essay
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

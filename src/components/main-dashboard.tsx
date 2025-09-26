
"use client";

import { Button } from "@/components/ui/button";
import { FileEdit, Moon, Sun, PanelRight, PanelRightClose } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState, useEffect, useRef } from "react";
import { ChatContent } from "./chat-content";
import { SidebarTrigger } from "./ui/sidebar";
import { WelcomeDialog } from "./welcome-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { AiEditorContent } from "./ai-editor-content";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { cn } from "@/lib/utils";
import type { ImperativePanelGroupHandle } from "react-resizable-panels";
import { ChatInput } from "./chat-input";
import { ScrollArea } from "./ui/scroll-area";

export function MainDashboard() {
  const { theme, setTheme } = useTheme();
  const [isEditorVisible, setIsEditorVisible] = useState(false);
  const panelGroupRef = useRef<ImperativePanelGroupHandle>(null);

  const toggleEditorPanel = () => {
    const group = panelGroupRef.current;
    if (group) {
        const layout = group.getLayout();
        // If the editor panel (at index 1) is collapsed, expand it. Otherwise, collapse it.
        if (layout[1] < 5) {
            group.setLayout([60, 40]);
        } else {
            group.setLayout([100, 0]);
        }
    }
  };

  const handleNewChat = () => {
    try {
        localStorage.removeItem('chatHistory');
        sessionStorage.removeItem('chatScrollPosition');
        window.location.reload(); // Easiest way to reset child state
    } catch (e) {
        console.error("Could not clear storage", e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <div className="flex h-full flex-col">
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
            <Button variant="ghost" size="icon" onClick={toggleEditorPanel} className="hidden lg:inline-flex">
              {isEditorVisible ? <PanelRightClose className="h-5 w-5" /> : <PanelRight className="h-5 w-5" />}
              <span className="sr-only">Toggle AI Editor</span>
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
        <ResizablePanelGroup 
          direction="horizontal" 
          className="flex-1" 
          ref={panelGroupRef}
          onLayout={(sizes: number[]) => {
            if (sizes[1] > 5) {
                if (!isEditorVisible) setIsEditorVisible(true);
            } else {
                if (isEditorVisible) setIsEditorVisible(false);
            }
          }}
        >
          <ResizablePanel defaultSize={100} minSize={30}>
            <div className="h-full flex flex-col">
              <ChatContent />
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle className={cn("hidden lg:flex")} />
          <ResizablePanel defaultSize={0} minSize={30} maxSize={50} collapsible collapsedSize={0} className={cn("hidden lg:block")}>
             <AiEditorContent embedded />
          </ResizablePanel>
        </ResizablePanelGroup>
      </main>
    </div>
  );
}

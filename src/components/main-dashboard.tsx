
"use client";

import { Button } from "@/components/ui/button";
import { FileEdit, Moon, Sun, ChevronsUpDown, Check } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useState, useTransition, useEffect } from "react";
import { ChatContent } from "./chat-content";
import { SidebarTrigger } from "./ui/sidebar";
import { WelcomeDialog } from "./welcome-dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "./ui/dropdown-menu";
import Link from "next/link";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { GenerateQuestionPaperOutput, ChatModel } from "@/app/actions";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "./ui/command";
import { cn } from "@/lib/utils";

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
const CHAT_MODEL_STORAGE_KEY = 'chatModel';

const chatModels: { value: ChatModel, label: string }[] = [
    { value: "samba", label: "SambaNova" },
    { value: "nvidia", label: "NVIDIA" },
];

export function MainDashboard() {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { theme, setTheme } = useTheme();
  const [currentModel, setCurrentModel] = useState<ChatModel>('nvidia');
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);

  // Load history and model from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      }
      const savedModel = localStorage.getItem(CHAT_MODEL_STORAGE_KEY);
      if (savedModel && (savedModel === 'samba' || savedModel === 'nvidia')) {
        setCurrentModel(savedModel as ChatModel);
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

  // Save model to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(CHAT_MODEL_STORAGE_KEY, currentModel);
    } catch (error) {
      console.error("Failed to save chat model to localStorage", error);
    }
  }, [currentModel]);

  const handleNewChat = () => {
    setHistory([]);
    setInput("");
  };

  return (
    <div className="flex h-full flex-col bg-muted/20 dark:bg-muted/10">
      <WelcomeDialog />
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-xl font-semibold tracking-tight">Chat</h1>
            <Popover open={modelSelectorOpen} onOpenChange={setModelSelectorOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={modelSelectorOpen}
                        className="w-[150px] justify-between"
                    >
                        {chatModels.find((model) => model.value === currentModel)?.label}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0">
                    <Command>
                        <CommandInput placeholder="Search models..." />
                        <CommandEmpty>No model found.</CommandEmpty>
                        <CommandGroup>
                            {chatModels.map((model) => (
                                <CommandItem
                                    key={model.value}
                                    value={model.value}
                                    onSelect={(currentValue) => {
                                        setCurrentModel(currentValue as ChatModel)
                                        setModelSelectorOpen(false)
                                    }}
                                >
                                    <Check
                                        className={cn(
                                            "mr-2 h-4 w-4",
                                            currentModel === model.value ? "opacity-100" : "opacity-0"
                                        )}
                                    />
                                    {model.label}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    </Command>
                </PopoverContent>
            </Popover>
        </div>
        <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" onClick={handleNewChat}>
                <FileEdit className="mr-2 h-4 w-4" />
                New Chat
            </Button>
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
      <main className="flex-1 overflow-auto">
        <ChatContent
            history={history}
            setHistory={setHistory}
            input={input}
            setInput={setInput}
            isTyping={isTyping}
            startTyping={startTyping}
            currentModel={currentModel}
            setCurrentModel={setCurrentModel}
        />
      </main>
    </div>
  );
}

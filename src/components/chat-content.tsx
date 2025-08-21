
"use client";

import { generalChatAction, GeneralChatInput } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, GraduationCap, Loader2, Send, User } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect } from "react";
import { marked } from "marked";

type Message = {
  role: "user" | "model";
  content: string;
};

const suggestionPrompts = [
    "Explain quantum computing in simple terms",
    "What are the main causes of climate change?",
    "Write a short story about a time-traveling historian",
    "Give me some ideas for a healthy breakfast",
];


export function ChatContent({
    history, 
    setHistory, 
    input, 
    setInput, 
    isTyping, 
    startTyping
} : {
    history: Message[],
    setHistory: React.Dispatch<React.SetStateAction<Message[]>>,
    input: string,
    setInput: (input: string) => void,
    isTyping: boolean,
    startTyping: React.TransitionStartFunction
}) {
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const handleSendMessage = async (e: React.FormEvent | React.MouseEvent, message?: string) => {
    e.preventDefault();
    const messageToSend = message || input;
    if (!messageToSend.trim()) return;

    const userMessage: Message = { role: "user", content: messageToSend };
    setHistory((prev) => [...prev, userMessage]);
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

  return (
    <div className="relative h-full">
        <ScrollArea className="absolute h-full w-full" ref={scrollAreaRef}>
            <div className="mx-auto max-w-3xl w-full p-4 space-y-6 pb-24">
            {history.length === 0 && (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-12rem)] text-center">
                    <div className="bg-primary/10 p-4 rounded-full mb-4">
                        <GraduationCap className="w-12 h-12 text-primary" />
                    </div>
                    <h2 className="mt-6 text-3xl font-semibold">How can I help you today?</h2>
                    <p className="text-muted-foreground mt-2 max-w-md">
                        I'm ScholarSage, your AI assistant. Ask me anything!
                    </p>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
                        {suggestionPrompts.map((prompt, i) => (
                            <Button key={i} variant="outline" className="text-left h-auto py-3 px-4 justify-start" onClick={(e) => handleSendMessage(e, prompt)}>
                                {prompt}
                            </Button>
                        ))}
                    </div>
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
                    "max-w-lg rounded-lg p-3 text-sm prose dark:prose-invert prose-p:my-2",
                    message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border"
                    )}
                    dangerouslySetInnerHTML={{ __html: message.role === 'model' ? marked(message.content) : message.content }}
                >
                </div>
                {message.role === "user" && (
                    <Avatar className="h-9 w-9">
                    <AvatarFallback>U</AvatarFallback>
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
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background via-background/80 to-transparent border-t p-4">
             <form onSubmit={handleSendMessage} className="flex items-center gap-2 max-w-3xl mx-auto">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message ScholarSage..."
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
  );
}

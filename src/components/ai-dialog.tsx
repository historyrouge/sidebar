
"use client";

import { generalChatAction, GeneralChatInput, ModelKey } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, User } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./ui/dialog";
import { useModelSettings } from "@/hooks/use-model-settings";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";

type Message = {
  role: "user" | "model";
  content: string;
};

interface AiDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  context: string;
  imageUrl?: string | null;
}

export function AiDialog({ isOpen, onOpenChange, title, context, imageUrl }: AiDialogProps) {
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { model } = useModelSettings();
  const [isSummarizing, startSummarizing] = useTransition();

  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const messageToSend = messageContent ?? input;
    if (!messageToSend.trim()) return;

    const userMessage: Message = { role: "user", content: messageToSend };
    setHistory((prev) => [...prev, userMessage]);
    setInput("");

    startTyping(async () => {
      const fullHistory = [...history, userMessage];
      const chatInput: GeneralChatInput = {
        history: fullHistory,
        prompt: `The user is asking a follow-up question about the news article titled "${title}". Here is the article description for context: "${context}".`,
      };

      const result = await generalChatAction(chatInput, model);

      if (result.error) {
        toast({ title: "Chat Error", description: result.error, variant: "destructive" });
        setHistory((prev) => prev.filter(msg => msg !== userMessage));
      } else if (result.data) {
        const modelMessage: Message = { role: "model", content: result.data.response };
        setHistory((prev) => [...prev, modelMessage]);
      }
    });
  }, [input, model, history, context, title, toast]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  }

  useEffect(() => {
    if (isOpen && context && history.length === 0) {
        startSummarizing(async () => {
            const initialPrompt = `Summarize the following news article and then ask the user what they'd like to explore further. Keep the summary concise (2-3 paragraphs). The article is titled: "${title}". Description: "${context}"`;
             const chatInput: GeneralChatInput = {
                history: [{ role: 'user', content: initialPrompt }],
            };
            const result = await generalChatAction(chatInput, model);
             if (result.error) {
                toast({ title: "Summarization Error", description: result.error, variant: "destructive" });
             } else if (result.data) {
                const modelMessage: Message = { role: "model", content: result.data.response };
                setHistory([modelMessage]);
            }
        });
    } else if (!isOpen) {
        // Reset history when dialog is closed
        setHistory([]);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, context, title, model]);

  useEffect(() => {
    if (scrollAreaRef.current) {
        setTimeout(() => {
            const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
            if (viewport) {
                viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
            }
        }, 100);
    }
  }, [history, isTyping]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-xl line-clamp-2">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden px-6">
            <ScrollArea className="h-full" ref={scrollAreaRef}>
                <div className="space-y-4 pr-4">
                    {imageUrl && (
                        <div className="relative w-full aspect-video rounded-md overflow-hidden mb-4">
                            <Image src={imageUrl} alt={title} fill className="object-cover" />
                        </div>
                    )}
                    
                    {(isSummarizing && history.length === 0) ? (
                        <div className="flex items-start gap-4">
                            <Avatar className="h-9 w-9 border">
                                <AvatarFallback className="bg-primary/10 text-primary"><Bot className="size-5" /></AvatarFallback>
                            </Avatar>
                            <div className="w-full max-w-lg space-y-2">
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-5/6" />
                                <Skeleton className="h-4 w-full" />
                                <Skeleton className="h-4 w-1/2" />
                            </div>
                        </div>
                    ) : (
                        history.map((message, index) => (
                            <div
                                key={index}
                                className={cn(
                                    "flex items-start gap-4",
                                    message.role === "user" ? "justify-end" : ""
                                )}
                            >
                                {message.role === "model" && (
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarFallback className="bg-primary/10 text-primary"><Bot className="size-5" /></AvatarFallback>
                                    </Avatar>
                                )}
                                <div className="max-w-lg">
                                    <div
                                        className={cn(
                                        "rounded-xl p-3 text-sm",
                                        message.role === "user"
                                            ? "bg-primary text-primary-foreground"
                                            : "bg-background border"
                                        )}
                                    >
                                        <div className="prose dark:prose-invert prose-p:my-2" dangerouslySetInnerHTML={{ __html: message.role === 'model' ? marked(message.content) : message.content }} />
                                    </div>
                                </div>
                                {message.role === "user" && (
                                    <Avatar className="h-9 w-9 border">
                                        <AvatarFallback><User className="size-5" /></AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))
                    )}
                    {isTyping && (
                        <div className="flex items-start gap-4">
                            <Avatar className="h-9 w-9 border">
                                <AvatarFallback className="bg-primary/10 text-primary"><Bot className="size-5" /></AvatarFallback>
                            </Avatar>
                            <div className="max-w-lg rounded-xl p-3 text-sm bg-background border flex items-center gap-2">
                                <Loader2 className="size-4 animate-spin" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
        </div>

        <DialogFooter className="p-6 pt-2 border-t">
          <form onSubmit={handleFormSubmit} className="flex items-center gap-2 w-full">
            <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a follow-up question..."
                disabled={isTyping || isSummarizing || history.length === 0}
                className="h-10 text-base"
            />
            <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0" disabled={isTyping || isSummarizing || !input.trim()}>
                {isTyping ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                    <Send className="h-5 w-5" />
                )}
                <span className="sr-only">Send</span>
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


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
import { useModelSettings } from "@/hooks/use-model-settings";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BackButton } from "./back-button";

type Message = {
  role: "user" | "model";
  content: string;
};

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: {
    name: string;
  };
  publishedAt: string;
};

export function NewsReaderContent() {
  const { toast } = useToast();
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [article, setArticle] = useState<Article | null>(null);
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { model } = useModelSettings();
  const [isSummarizing, startSummarizing] = useTransition();

  // Load article from localStorage on mount
  useEffect(() => {
    try {
      const savedArticle = localStorage.getItem('selectedArticle');
      if (savedArticle) {
        setArticle(JSON.parse(savedArticle));
      } else {
        toast({ title: "No article selected", description: "Please go back and select an article.", variant: "destructive" });
        router.push('/news');
      }
    } catch (e) {
      toast({ title: "Failed to load article", description: "The article data is corrupted.", variant: "destructive" });
      router.push('/news');
    }
  }, [router, toast]);
  
  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const messageToSend = messageContent ?? input;
    if (!messageToSend.trim() || !article) return;

    const userMessage: Message = { role: "user", content: messageToSend };
    setHistory((prev) => [...prev, userMessage]);
    setInput("");

    startTyping(async () => {
      const fullHistory = [...history, userMessage];
      const chatInput: GeneralChatInput = {
        history: fullHistory,
        prompt: `The user is asking a follow-up question about the news article titled "${article.title}". Here is the article description for context: "${article.description}".`,
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
  }, [input, model, history, article, toast]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  }

  useEffect(() => {
    if (article && history.length === 0) {
        startSummarizing(async () => {
            const initialPrompt = `Summarize the following news article and then ask the user what they'd like to explore further. Keep the summary concise (2-3 paragraphs). The article is titled: "${article.title}". Description: "${article.description}"`;
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
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [article, model]);

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
  
  if (!article) {
    return null; // Or a loading spinner, handled by the page's Suspense boundary
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto space-y-6">
            <BackButton />
            <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
            
            {article.urlToImage && (
                <div className="relative w-full aspect-video rounded-md overflow-hidden">
                    <Image src={article.urlToImage} alt={article.title} fill className="object-cover" />
                </div>
            )}
            
             <div>
                <h2 className="text-xl font-semibold mb-2">AI Summary</h2>
                {(isSummarizing && history.length === 0) ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-full" />
                    </div>
                ) : (
                    <div className="prose dark:prose-invert max-w-none text-muted-foreground" dangerouslySetInnerHTML={{ __html: history[0] ? marked(history[0].content) : ""}} />
                )}
            </div>

            <div className="border rounded-lg">
                <div className="p-4 border-b">
                    <h3 className="font-semibold">Ask Follow-up Questions</h3>
                </div>
                <div className="h-96 flex flex-col">
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="space-y-4 pr-4">
                            {history.slice(1).map((message, index) => ( // Slicing to exclude summary
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
                            ))}
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
                    <div className="p-4 border-t">
                      <form onSubmit={handleFormSubmit} className="flex items-center gap-2 w-full">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Ask a follow-up question..."
                            disabled={isTyping || isSummarizing}
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
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
}

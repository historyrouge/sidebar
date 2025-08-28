
"use client";

import { generalChatAction, GeneralChatInput, summarizeContentAction, SummarizeContentOutput } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, User, Sparkles, Sidebar, Moon, Sun } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import { useModelSettings } from "@/hooks/use-model-settings";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { BackButton } from "./back-button";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";

type Message = {
  role: "user" | "model";
  content: string;
};

type Article = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  content: string | null;
  source: {
    name: string;
  };
  publishedAt: string;
};

const dummyPrompts = [
    "Explain this in simple terms.",
    "What is the key takeaway from this?",
    "Who is most affected by this news?",
    "What could be the long-term impact?",
    "Summarize the main arguments in 3 bullet points.",
    "Are there any counter-arguments to this?",
];

export function NewsReaderContent() {
  const { toast } = useToast();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [article, setArticle] = useState<Article | null>(null);
  const [summary, setSummary] = useState<SummarizeContentOutput | null>(null);
  const [isSummarizing, startSummarizing] = useTransition();
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { model } = useModelSettings();

  // Load article from localStorage on mount
  useEffect(() => {
    try {
      const savedArticle = localStorage.getItem('selectedArticle');
      if (savedArticle) {
        const parsedArticle = JSON.parse(savedArticle);
        setArticle(parsedArticle);
        
        // Generate summary when article is loaded
        startSummarizing(async () => {
            const contentToSummarize = parsedArticle.content || parsedArticle.description;
            if (!contentToSummarize) {
                setSummary({ summary: "No content available to summarize." });
                return;
            }
            const result = await summarizeContentAction({ content: contentToSummarize });
            if (result.error) {
                toast({ title: "Summarization Failed", description: result.error, variant: "destructive" });
            } else {
                setSummary(result.data ?? null);
            }
        });

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
      const context = summary?.summary || article.description;
      const chatInput: GeneralChatInput = {
        history: fullHistory,
        prompt: `The user is asking a follow-up question about the news article titled "${article.title}". Here is the article summary for context: "${context}".`,
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
  }, [input, model, history, article, toast, summary]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  }

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
    <div className="flex h-full flex-col">
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <BackButton />
                <h1 className="text-xl font-semibold tracking-tight">News Reader</h1>
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
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="max-w-2xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold tracking-tight">{article.title}</h1>
                
                {article.urlToImage && (
                    <div className="relative w-full aspect-video rounded-md overflow-hidden border">
                        <Image src={article.urlToImage} alt={article.title} fill className="object-cover" />
                    </div>
                )}
                
                <div>
                  <h2 className="text-xl font-semibold mb-2">News Description</h2>
                  {isSummarizing ? (
                     <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                    </div>
                  ) : (
                    <p className="prose dark:prose-invert max-w-none text-muted-foreground">
                      {summary?.summary || "No summary available."}
                    </p>
                  )}
                </div>

                <div className="border rounded-lg bg-card">
                    <div className="p-4 border-b">
                        <h3 className="font-semibold">Ask Follow-up Questions</h3>
                    </div>
                    <div className="h-[28rem] flex flex-col">
                        <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                            <div className="space-y-4 pr-4">
                                {history.map((message, index) => (
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
                                                    : "bg-muted"
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
                                        <div className="max-w-lg rounded-xl p-3 text-sm bg-muted flex items-center gap-2">
                                            <Loader2 className="size-4 animate-spin" />
                                        </div>
                                    </div>
                                )}
                                {history.length === 0 && !isTyping && (
                                    <div className="pt-4">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Sparkles className="text-primary w-5 h-5"/>
                                            <p className="text-sm font-semibold text-muted-foreground">Try asking...</p>
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {dummyPrompts.map(prompt => (
                                                <Button 
                                                    key={prompt}
                                                    variant="outline"
                                                    className="h-auto text-left justify-start py-2"
                                                    onClick={() => handleSendMessage(prompt)}
                                                >
                                                    {prompt}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                        <div className="p-4 border-t bg-background/80 rounded-b-lg">
                        <form onSubmit={handleFormSubmit} className="flex items-center gap-2 w-full">
                            <Input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask a follow-up question..."
                                disabled={isTyping}
                                className="h-10 text-base"
                            />
                            <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0" disabled={isTyping || !input.trim()}>
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
        </main>
    </div>
  );
}

  

    

    
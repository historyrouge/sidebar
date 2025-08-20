
"use client";

import { chatWithTutorAction, ChatWithTutorInput } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GraduationCap, Loader2, Send, User } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect, useMemo } from "react";
import { marked } from 'marked';


interface TutorChatProps {
  content: string;
}

type Message = {
  role: "user" | "model";
  content: string;
  htmlContent?: string;
};

export function TutorChat({ content }: TutorChatProps) {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setHistory((prev) => [...prev, userMessage]);
    setInput("");

    startTyping(async () => {
      const chatHistory = history.map(({ role, content }) => ({ role, content }));
      const chatInput: ChatWithTutorInput = {
        content,
        history: [...chatHistory, { role: "user", content: input }],
      };
      const result = await chatWithTutorAction(chatInput);

      if (result.error) {
        toast({
          title: "Tutor Error",
          description: result.error,
          variant: "destructive",
        });
        setHistory((prev) => prev.slice(0, -1)); // Remove user message on error
      } else if (result.data) {
        const modelMessage: Message = { 
          role: "model", 
          content: result.data.response,
          htmlContent: marked(result.data.response) as string,
        };
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
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-4 p-4 pr-6">
         {history.length === 0 && (
            <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 h-full">
                <GraduationCap className="w-12 h-12 mb-4" />
                <h3 className="text-lg font-semibold">AI Tutor</h3>
                <p className="text-sm">Ask me anything about the study material you've provided. I'm here to help you understand it better!</p>
            </div>
         )}
          {history.map((message, index) => (
            <div
              key={index}
              className={cn(
                "flex items-start gap-3",
                message.role === "user" ? "justify-end" : ""
              )}
            >
              {message.role === "model" && (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground"><GraduationCap className="size-4" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-md rounded-lg p-3 text-sm prose dark:prose-invert prose-p:my-1",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
                dangerouslySetInnerHTML={{ __html: message.role === 'model' ? message.htmlContent! : message.content }}
              >
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                   <AvatarFallback>U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground"><GraduationCap className="size-4" /></AvatarFallback>
              </Avatar>
              <div className="max-w-xs rounded-lg p-3 text-sm bg-muted flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Tutor is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about your material..."
            disabled={isTyping || !content}
            title={!content ? "Please analyze some material first" : ""}
          />
          <Button type="submit" disabled={isTyping || !input.trim() || !content}>
            {isTyping ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            <span className="sr-only">Send</span>
          </Button>
        </form>
      </div>
    </div>
  );
}

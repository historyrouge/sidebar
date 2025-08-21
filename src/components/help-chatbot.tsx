
"use client";

import { helpChatAction, HelpChatInput } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, User, Mic, MicOff } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect } from "react";

type Message = {
  role: "user" | "model";
  content: string;
};

export function HelpChatbot() {
  const [history, setHistory] = useState<Message[]>([
    { role: "model", content: "Hello! How can I help you use ScholarSage today?" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSendMessage = async (e: React.FormEvent | null, message?: string) => {
    e?.preventDefault();
    const messageToSend = message || input;
    if (!messageToSend.trim()) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const userMessage: Message = { role: "user", content: messageToSend };
    setHistory((prev) => [...prev, userMessage]);
    setInput("");

    startTyping(async () => {
      const chatInput: HelpChatInput = {
        history: [...history, userMessage],
      };
      const result = await helpChatAction(chatInput);

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
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => setIsRecording(true);
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = (event: any) => {
        toast({ title: "Speech Recognition Error", description: event.error, variant: "destructive" });
        setIsRecording(false);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        const fullTranscript = finalTranscript || interimTranscript;
        setInput(fullTranscript);

        if (finalTranscript.trim()) {
            handleSendMessage(null, finalTranscript);
        }
      };
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInput("");
      recognitionRef.current.start();
    }
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
    <div className="flex h-[450px] flex-col rounded-lg border bg-background">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-4 p-4">
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
                  <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="size-4" /></AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-xs rounded-lg p-3 text-sm",
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                )}
              >
                {message.content}
              </div>
              {message.role === "user" && (
                <Avatar className="h-8 w-8">
                   <AvatarFallback><User className="size-4" /></AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
           {isTyping && (
            <div className="flex items-start gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground"><Bot className="size-4" /></AvatarFallback>
              </Avatar>
              <div className="max-w-xs rounded-lg p-3 text-sm bg-muted flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Assistant is thinking...</span>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="border-t p-4">
        <form onSubmit={(e) => handleSendMessage(e, input)} className="flex items-center gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question..."
            disabled={isTyping}
          />
          <Button type="button" size="icon" variant={isRecording ? "destructive" : "ghost"} onClick={handleToggleRecording} disabled={isTyping}>
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
          </Button>
          <Button type="submit" size="icon" disabled={isTyping || !input.trim()}>
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

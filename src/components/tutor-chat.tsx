
"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { GraduationCap, Loader2, Send, User, Mic, MicOff } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect, useMemo } from "react";
import { marked } from 'marked';
import { useTypewriter } from "@/hooks/use-typewriter";


interface TutorChatProps {
  content: string;
  onSendMessage: (history: Array<{role: 'user' | 'model', content: string}>) => Promise<{data?: any, error?: string}>;
}

type Message = {
  role: "user" | "model";
  content: string;
};

const TutorResponse = ({ message, index, history, isTyping }: any) => {
    const displayText = useTypewriter(message.content, 5);
    const isLastMessage = index === history.length - 1;

    return (
        <div 
            className="prose dark:prose-invert max-w-none text-base leading-relaxed dark:[text-shadow:0_0_5px_rgba(255,255,255,0.3)]"
            dangerouslySetInnerHTML={{ __html: marked(isLastMessage && isTyping ? message.content : displayText) }}
        />
    );
};


export function TutorChat({ content, onSendMessage }: TutorChatProps) {
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, startTyping] = useTransition();
  const { toast } = useToast();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleSendMessage = async (e: React.FormEvent | null, message?: string) => {
    e?.preventDefault();
    const messageToSend = message || input;
    if (!messageToSend.trim()) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const userMessage: Message = { role: "user", content: messageToSend };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");

    startTyping(async () => {
      const result = await onSendMessage(newHistory.map(h => ({role: h.role, content: h.content})));

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
        };
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
        if (audioSendTimeoutRef.current) {
          clearTimeout(audioSendTimeoutRef.current);
        }
        
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript = event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setInput(interimTranscript);

        if (finalTranscript.trim()) {
           setInput(finalTranscript);
           audioSendTimeoutRef.current = setTimeout(() => {
                handleSendMessage(null, finalTranscript);
           }, 1000);
        }
      };
    }
    
    return () => {
        if (audioSendTimeoutRef.current) {
            clearTimeout(audioSendTimeoutRef.current);
        }
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
    <div className="flex h-full flex-col">
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
        <div className="space-y-6 p-4 pr-6">
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
                "flex w-full items-start gap-3",
                message.role === "user" ? "justify-end" : ""
              )}
            >
              {message.role === 'model' && (
                <div className="w-full">
                     <TutorResponse message={message} index={index} history={history} isTyping={isTyping} />
                </div>
              )}
              {message.role === 'user' && (
                <>
                    <div
                        className={cn(
                        "max-w-md",
                        "rounded-lg bg-primary text-primary-foreground p-3 text-sm"
                        )}
                    >
                       {message.content}
                    </div>
                    <Avatar className="h-8 w-8">
                        <AvatarFallback><User /></AvatarFallback>
                    </Avatar>
                </>
              )}
            </div>
          ))}
           {isTyping && (
            <div className="flex items-start gap-3">
              <div className="max-w-xs rounded-lg p-3 text-sm bg-muted flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                <span>Tutor is thinking...</span>
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
            placeholder="Ask a question about your material..."
            disabled={isTyping || !content}
            title={!content ? "Please analyze some material first" : ""}
          />
           <Button type="button" size="icon" variant={isRecording ? "destructive" : "ghost"} onClick={handleToggleRecording} disabled={isTyping || !content}>
            {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
          </Button>
          <Button type="submit" size="icon" disabled={isTyping || !input.trim() || !content}>
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

    
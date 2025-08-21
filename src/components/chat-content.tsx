
"use client";

import { generalChatAction, GeneralChatInput, textToSpeechAction } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, GraduationCap, Loader2, Send, User, Mic, MicOff, Copy, Share2, Volume2, RefreshCw } from "lucide-react";
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
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);

  const handleSendMessage = async (e: React.FormEvent | React.MouseEvent | null, message?: string) => {
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

  const handleRegenerateResponse = async () => {
      const lastUserMessage = history.findLast(m => m.role === 'user');
      if (!lastUserMessage) return;

      startTyping(async () => {
        // We remove the last model response before regenerating
        setHistory(prev => prev.slice(0, -1));

        const chatInput: GeneralChatInput = {
          history: history.slice(0,-1),
        };
        const result = await generalChatAction(chatInput);

        if (result.error) {
          toast({ title: "Chat Error", description: result.error, variant: "destructive" });
        } else if (result.data) {
          const modelMessage: Message = { role: "model", content: result.data.response };
          setHistory((prev) => [...prev, modelMessage]);
        }
      });
  };


  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "The response has been copied to your clipboard." });
  };
  
  const handleShare = async (text: string) => {
    if (navigator.share) {
        try {
            await navigator.share({
                title: 'ScholarSage Response',
                text: text,
            });
        } catch (error) {
            toast({ title: "Sharing failed", description: "Could not share the response.", variant: "destructive" });
        }
    } else {
        // Fallback for browsers that don't support navigator.share
        handleCopyToClipboard(text);
        toast({ title: "Copied!", description: "Sharing not supported. Response copied to clipboard instead." });
    }
  };

  const handleTextToSpeech = async (text: string, id: string) => {
    if (isSynthesizing === id) {
      setAudioDataUri(null);
      setIsSynthesizing(null);
      return;
    }
    setIsSynthesizing(id);
    setAudioDataUri(null);
    try {
      const result = await textToSpeechAction({ text });
      if (result.error) {
        toast({ title: 'Audio Generation Failed', description: result.error, variant: 'destructive' });
        setIsSynthesizing(null);
      } else if (result.data) {
        setAudioDataUri(result.data.audioDataUri);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setIsSynthesizing(null);
    }
  };


  useEffect(() => {
    // Check for browser support and initialize SpeechRecognition
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      const recognition = recognitionRef.current;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.onerror = (event: any) => {
        toast({
          title: "Speech Recognition Error",
          description: event.error,
          variant: "destructive",
        });
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
    } else {
      toast({
        title: "Browser Not Supported",
        description: "Your browser does not support voice-to-text.",
        variant: "destructive",
      });
    }

    return () => {
      recognitionRef.current?.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [history]); // Add history to dependency array for handleSendMessage
  
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
    <div className="relative h-full">
        <ScrollArea className="absolute h-full w-full" ref={scrollAreaRef}>
            <div className="mx-auto max-w-3xl w-full p-4 space-y-2 pb-24">
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
                            <Button key={i} variant="outline" className="h-auto justify-start py-3 px-4 text-left whitespace-normal" onClick={(e) => handleSendMessage(e, prompt)}>
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
                <div className="w-full max-w-lg">
                    <div
                        className={cn(
                        "rounded-lg p-3 text-sm prose dark:prose-invert prose-p:my-2",
                        message.role === "user"
                            ? "bg-primary text-primary-foreground"
                            : "bg-card border"
                        )}
                        dangerouslySetInnerHTML={{ __html: message.role === 'model' ? marked(message.content) : message.content }}
                    >
                    </div>
                    {message.role === 'model' && (
                        <div className="mt-2 flex items-center gap-2">
                             <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopyToClipboard(message.content)}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy</span>
                            </Button>
                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleShare(message.content)}>
                                <Share2 className="h-4 w-4" />
                                <span className="sr-only">Share</span>
                            </Button>
                             <Button 
                                size="icon" 
                                variant="ghost" 
                                className="h-7 w-7" 
                                onClick={() => handleTextToSpeech(message.content, `chat-${index}`)}
                                disabled={!!isSynthesizing && isSynthesizing !== `chat-${index}`}
                             >
                                {isSynthesizing === `chat-${index}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                <span className="sr-only">Read aloud</span>
                            </Button>
                            {index === history.length -1 && (
                                <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRegenerateResponse} disabled={isTyping}>
                                    <RefreshCw className="h-4 w-4" />
                                    <span className="sr-only">Regenerate</span>
                                </Button>
                            )}
                            {audioDataUri && isSynthesizing === `chat-${index}` && (
                                <audio 
                                    src={audioDataUri} 
                                    autoPlay 
                                    onEnded={() => { setAudioDataUri(null); setIsSynthesizing(null); }} 
                                    className="hidden" 
                                />
                            )}
                        </div>
                    )}
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
             <form onSubmit={(e) => handleSendMessage(e)} className="flex items-center gap-2 max-w-3xl mx-auto">
                <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message ScholarSage..."
                    disabled={isTyping}
                    className="h-12 text-base shadow-sm"
                />
                 <Button type="button" size="icon" variant={isRecording ? "destructive" : "outline"} className="h-12 w-12" onClick={handleToggleRecording} disabled={isTyping}>
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                </Button>
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

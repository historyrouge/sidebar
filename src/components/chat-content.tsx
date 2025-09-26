
"use client";

import { generalChatAction, textToSpeechAction, GeneralChatInput, GenerateQuestionPaperOutput } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Share2, Volume2, RefreshCw, FileText, X, Edit, Save, Download, StopCircle, Paperclip, Mic, MicOff, Send } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { ShareDialog } from "./share-dialog";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LimitExhaustedDialog } from "./limit-exhausted-dialog";
import { useRouter } from "next/navigation";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { ThinkingIndicator } from "./thinking-indicator";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";

type Message = {
  id: string;
  role: "user" | "model";
  content: string;
  toolResult?: {
    type: 'questionPaper',
    data: GenerateQuestionPaperOutput
  }
};

const CHAT_HISTORY_STORAGE_KEY = 'chatHistory';


const CodeBox = ({ language, code: initialCode }: { language: string, code: string }) => {
    const { toast } = useToast();
    const [isEditing, setIsEditing] = useState(false);
    const [code, setCode] = useState(initialCode);

    const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast({ title: "Copied!", description: "Code has been copied to clipboard." });
    };

    const handleDownload = () => {
        const fileExtensions: { [key: string]: string } = {
            javascript: 'js',
            python: 'py',
            html: 'html',
            css: 'css',
            typescript: 'ts',
            java: 'java',
            c: 'c',
            cpp: 'cpp',
            csharp: 'cs',
            go: 'go',
            rust: 'rs',
            swift: 'swift',
            kotlin: 'kt',
            php: 'php',
            ruby: 'rb',
            perl: 'pl',
            shell: 'sh',
            sql: 'sql',
            json: 'json',
            xml: 'xml',
            yaml: 'yaml',
            markdown: 'md',
        };
        const extension = fileExtensions[language.toLowerCase()] || 'txt';
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `code.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(a.href);
        toast({ title: "Downloaded!", description: `Code saved as code.${extension}` });
    };

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    return (
        <div className="code-box">
            <div className="code-box-header">
                <span className="code-box-language">{language}</span>
                <div className="code-box-actions">
                    <Button type="button" variant="ghost" size="sm" onClick={handleCopy}><Copy className="mr-1 h-4 w-4" /> Copy</Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleEditToggle}>
                        {isEditing ? <Save className="mr-1 h-4 w-4" /> : <Edit className="mr-1 h-4 w-4" />}
                        {isEditing ? 'Save' : 'Edit'}
                    </Button>
                    <Button type="button" variant="ghost" size="sm" onClick={handleDownload}><Download className="mr-1 h-4 w-4" /> Download</Button>
                    <Button type="button" variant="ghost" size="sm" disabled>Run</Button>
                </div>
            </div>
            {isEditing ? (
                 <Textarea 
                    value={code} 
                    onChange={(e) => setCode(e.target.value)}
                    className="font-mono text-sm bg-black/50 border-0 rounded-t-none h-64"
                 />
            ) : (
                <pre><code>{code}</code></pre>
            )}
        </div>
    );
};


export function ChatContent() {
  const { toast } = useToast();
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const [history, setHistory] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);
  const [shareContent, setShareContent] = useState<string | null>(null);
  
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load history from localStorage on initial render
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(CHAT_HISTORY_STORAGE_KEY);
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
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

  const handleTextToSpeech = useCallback(async (text: string, id: string) => {
      if (isSynthesizing === id) {
          if (audioRef.current) {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
          }
          setAudioDataUri(null);
          setIsSynthesizing(null);
          return;
      }

      // Stop any previously playing audio before starting a new one
      if (audioRef.current) {
          audioRef.current.pause();
      }
      setIsSynthesizing(id);
      setAudioDataUri(null);

      try {
          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });

          if (!response.ok || !response.body) {
              throw new Error('Failed to get audio stream.');
          }
          
          const reader = response.body.getReader();
          const audioChunks: BlobPart[] = [];
          
          while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              audioChunks.push(value);
          }
          
          const audioBlob = new Blob(audioChunks, { type: 'audio/pcm' });
          const audioUrl = URL.createObjectURL(audioBlob);
          setAudioDataUri(audioUrl);
      } catch (e: any) {
          toast({ title: 'Audio Generation Failed', description: e.message, variant: 'destructive' });
          setIsSynthesizing(null);
      }
  }, [isSynthesizing, toast]);

  const executeChat = useCallback(async (
    chatHistory: Message[],
    currentImageDataUri?: string | null,
    currentFileContent?: string | null
  ): Promise<void> => {
      setIsTyping(true);
      const modelMessageId = `${Date.now()}-model`;
      
      const genkitHistory = chatHistory.map(h => ({
        role: h.role as 'user' | 'model',
        content: h.content,
      }));
      
      const result = await generalChatAction({ history: genkitHistory, imageDataUri: currentImageDataUri, fileContent: currentFileContent });

      setIsTyping(false);

      if (result.error) {
          if (result.error.includes("API_LIMIT_EXCEEDED")) {
              setHistory(prev => prev.slice(0, -1)); // Remove user message
              setShowLimitDialog(true);
          } else {
              toast({ title: "Chat Error", description: result.error, variant: "destructive" });
              setHistory(prev => prev.slice(0, -1)); // Remove user message on error
          }
          return;
      }

       if (result.data) {
        const modelMessage: Message = { id: modelMessageId, role: "model", content: result.data.response };
        setHistory((prev) => [...prev, modelMessage]);
      }
      
  }, [toast]);


  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const messageToSend = messageContent ?? input;
    if (!messageToSend.trim() && !imageDataUri && !fileContent) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }
    const messageId = `${Date.now()}`;
    const userMessage: Message = { id: messageId, role: "user", content: messageToSend };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");

    await executeChat(newHistory, imageDataUri, fileContent);
    
    // Clear attachments after sending
    setImageDataUri(null);
    setFileContent(null);
    setFileName(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isRecording, history, executeChat, imageDataUri, fileContent]);

  const handleRegenerateResponse = async () => {
      const lastUserMessageIndex = history.findLastIndex(m => m.role === 'user');
      if (lastUserMessageIndex === -1) return;

      const historyForRegen = history.slice(0, lastUserMessageIndex + 1);
      setHistory(historyForRegen); // Remove the old model response
      await executeChat(historyForRegen);
  };


  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "The response has been copied to your clipboard." });
  };
  
  const handleShare = (text: string) => {
    setShareContent(text);
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

      let finalTranscript = '';
      recognition.onresult = (event: any) => {
        if (audioSendTimeoutRef.current) {
          clearTimeout(audioSendTimeoutRef.current);
        }
        
        let interimTranscript = '';
        finalTranscript = ''; // Reset final transcript for current event
        
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        setInput(interimTranscript);

        if (finalTranscript.trim()) {
           setInput(finalTranscript);
            // Debounce sending the message
           audioSendTimeoutRef.current = setTimeout(() => {
                handleSendMessage(finalTranscript);
           }, 1000); // Send after 1 second of silence
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
      if (audioSendTimeoutRef.current) {
          clearTimeout(audioSendTimeoutRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 
  
  const handleToggleRecording = () => {
    if (!recognitionRef.current) return;
    if (isRecording) {
      recognitionRef.current.stop();
    } else {
      setInput("");
      recognitionRef.current.start();
    }
  };
  
  const handleViewQuestionPaper = (paper: GenerateQuestionPaperOutput) => {
    try {
        localStorage.setItem('questionPaper', JSON.stringify(paper));
        router.push('/question-paper/view');
    } catch (e) {
        toast({ title: "Storage Error", description: "Could not store the generated paper.", variant: "destructive" });
    }
  };

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [history]);

  return (
    <div className="flex h-full flex-col">
      <LimitExhaustedDialog isOpen={showLimitDialog} onOpenChange={setShowLimitDialog} />
      <ShareDialog
        isOpen={!!shareContent}
        onOpenChange={(open) => !open && setShareContent(null)}
        content={shareContent || ""}
      />
      <div className="relative flex-1">
        <ScrollArea className="absolute inset-0" ref={scrollAreaRef}>
          <div className="mx-auto w-full max-w-3xl space-y-8 p-4">
            {history.length === 0 && !isTyping ? (
              <div className="flex h-full min-h-[calc(100vh-14rem)] flex-col items-center justify-end pb-8 text-center">
                <div className="flex flex-col items-center">
                  <h1 className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
                    Hello!
                  </h1>
                  <p className="text-xl font-semibold text-gray-500 sm:text-2xl">
                    How can I help you today, mate?
                  </p>
                  <p className="text-sm text-muted-foreground !mt-0">Or ask me anything...</p>
                </div>
              </div>
            ) : (
              history.map((message, index) => (
                <React.Fragment key={`${message.id}-${index}`}>
                  <div
                    className={cn(
                      "flex w-full items-start gap-4",
                      message.role === "user" ? "justify-end" : ""
                    )}
                  >
                    {message.role === "user" ? (
                      <div className="flex items-start gap-4 justify-end">
                        <div className="border bg-transparent inline-block rounded-xl p-3 max-w-md">
                          <p className="text-base whitespace-pre-wrap">{message.content}</p>
                        </div>
                        <Avatar className="h-9 w-9 border">
                          <AvatarFallback><User className="size-5" /></AvatarFallback>
                        </Avatar>
                      </div>
                    ) : (
                      <div className={cn("group w-full flex items-start gap-4")}>
                        <div className="w-full">
                          <ReactMarkdown
                            remarkPlugins={[remarkMath]}
                            rehypePlugins={[rehypeKatex]}
                            className="prose dark:prose-invert max-w-none text-sm leading-relaxed"
                            components={{
                              code({ node, inline, className, children, ...props }) {
                                const match = /language-(\w+)/.exec(className || '');
                                return !inline && match ? (
                                  <CodeBox language={match[1]} code={String(children).replace(/\n$/, '')} />
                                ) : (
                                  <code className={className} {...props}>
                                    {children}
                                  </code>
                                );
                              }
                            }}
                          >
                            {message.content}
                          </ReactMarkdown>
                          {audioDataUri && isSynthesizing === message.id && (
                            <audio
                              ref={audioRef}
                              src={audioDataUri}
                              autoPlay
                              onEnded={() => setIsSynthesizing(null)}
                              onPause={() => setIsSynthesizing(null)}
                            />
                          )}
                          <div className="mt-2 flex items-center gap-1 transition-opacity">
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopyToClipboard(message.content)}>
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleShare(message.content)}>
                              <Share2 className="h-4 w-4" />
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleTextToSpeech(message.content, message.id)}>
                              {isSynthesizing === message.id ? <StopCircle className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4" />}
                            </Button>
                            <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={handleRegenerateResponse} disabled={isTyping}>
                              <RefreshCw className="h-4 w-4" />
                            </Button>
                          </div>
                          {message.toolResult?.type === 'questionPaper' && (
                            <Card className="bg-muted/50 mt-2">
                              <CardHeader className="p-4">
                                <CardTitle className="flex items-center gap-2 text-base">
                                  <FileText className="h-5 w-5" />
                                  {message.toolResult.data.title}
                                </CardTitle>
                                <CardDescription className="text-xs">A question paper has been generated for you.</CardDescription>
                              </CardHeader>
                              <CardContent className="p-4 pt-0">
                                <Button type="button" className="w-full" onClick={() => handleViewQuestionPaper(message.toolResult!.data)}>View Question Paper</Button>
                              </CardContent>
                            </Card>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {index < history.length - 1 && (
                    <Separator className="my-8" />
                  )}
                </React.Fragment>
              ))
            )}
            {isTyping && (
              <div className="mt-4">
                <ThinkingIndicator />
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
}

    
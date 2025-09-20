
"use client";

import { generalChatAction, textToSpeechAction, GenerateQuestionPaperOutput, ChatModel } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, User, Mic, MicOff, Copy, Share2, Volume2, RefreshCw, FileQuestion, PlusSquare, BookOpen, Rss, FileText, Sparkles, Brain, Edit, Download, Save, RefreshCcw } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { marked, Renderer } from "marked";
import { ShareDialog } from "./share-dialog";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { LimitExhaustedDialog } from "./limit-exhausted-dialog";
import { useRouter } from "next/navigation";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";


type Message = {
  role: "user" | "model";
  content: string;
  imageDataUri?: string;
  toolResult?: {
    type: 'questionPaper',
    data: GenerateQuestionPaperOutput
  }
};

const suggestionPrompts = [
    {
        icon: <Sparkles className="text-primary w-5 h-5" />,
        title: "Create a Quiz",
        description: "Test your knowledge on a topic.",
        href: "/quiz"
    },
    {
        icon: <Sparkles className="text-primary w-5 h-5" />,
        title: "Make Flashcards",
        description: "From your study notes.",
        href: "/create-flashcards"
    },
    {
        icon: <Sparkles className="text-primary w-5 h-5" />,
        title: "Browse eBooks",
        description: "Explore the library.",
        href: "/ebooks"
    },
    {
        icon: <Sparkles className="text-primary w-5 h-5" />,
        title: "Read Latest News",
        description: "In tech & education.",
        href: "/news"
    },
];

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
        URL.revokeObjectURL(url);
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
                    <Button variant="ghost" size="sm" onClick={handleCopy}><Copy className="mr-1 h-4 w-4" /> Copy</Button>
                    <Button variant="ghost" size="sm" onClick={handleEditToggle}>
                        {isEditing ? <Save className="mr-1 h-4 w-4" /> : <Edit className="mr-1 h-4 w-4" />}
                        {isEditing ? 'Save' : 'Edit'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleDownload}><Download className="mr-1 h-4 w-4" /> Download</Button>
                    <Button variant="ghost" size="sm" disabled>Run</Button>
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


const CanvasProject = ({ name, files }: { name: string, files: { name: string, type: string, code: string }[] }) => {
    return (
        <div className="canvas-project">
            <CardHeader>
                <CardTitle>Project: {name}</CardTitle>
                <CardDescription>This is a multi-file project. Open it in a workspace to view and run.</CardDescription>
            </CardHeader>
            <CardContent>
                <Button>Open in Canvas</Button>
            </CardContent>
        </div>
    );
};


const ModelResponse = ({ message }: { message: Message }) => {
    const codeBoxMatch = message.content.match(/<codeBox language="([^"]+)">([\s\S]*?)<\/codeBox>/);
    const canvasProjectMatch = message.content.match(/<canvasProject name="([^"]+)">([\s\S]*?)<\/canvasProject>/);

    if (codeBoxMatch) {
        const [_, language, code] = codeBoxMatch;
        return <CodeBox language={language} code={code.trim()} />;
    }

    if (canvasProjectMatch) {
        const [_, name, filesContent] = canvasProjectMatch;
        const fileRegex = /<file name="([^"]+)" type="([^"]+)">([\s\S]*?)<\/file>/g;
        let match;
        const files = [];
        while ((match = fileRegex.exec(filesContent)) !== null) {
            files.push({ name: match[1], type: match[2], code: match[3].trim() });
        }
        return <CanvasProject name={name} files={files} />;
    }
    
    const finalHtml = marked(message.content);

    return (
        <div 
            className="prose dark:prose-invert max-w-none text-base leading-relaxed"
            dangerouslySetInnerHTML={{ __html: finalHtml as string }}
        />
    );
};


export function ChatContent({
    history, 
    setHistory, 
    input, 
    setInput, 
    isTyping, 
    startTyping,
} : {
    history: Message[],
    setHistory: React.Dispatch<React.SetStateAction<Message[]>>,
    input: string,
    setInput: (input: string) => void,
    isTyping: boolean,
    startTyping: React.TransitionStartFunction,
}) {
  const { toast } = useToast();
  const router = useRouter();
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const scrollPositionRef = useRef<number | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);
  const audioSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);
  const [shareContent, setShareContent] = useState<string | null>(null);
  
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  

  const executeChat = useCallback(async (
    chatHistory: Message[]
  ): Promise<void> => {
      startTyping(async () => {
        const genkitHistory = chatHistory.map(h => ({
          role: h.role as 'user' | 'model',
          content: Array.isArray(h.content) ? h.content : (h.imageDataUri ? [{ text: h.content }, { media: { url: h.imageDataUri } }] : h.content),
        }));
        
        // @ts-ignore
        const result = await generalChatAction({ history: genkitHistory });

        if (result.error) {
            if (result.error === "API_LIMIT_EXCEEDED") {
                setHistory(prev => prev.slice(0, -1)); // Remove user message
                setShowLimitDialog(true);
            } else {
                 toast({ title: "Chat Error", description: result.error, variant: "destructive" });
                 setHistory(prev => prev.slice(0, -1));
            }
        } else if (result.data) {
            let responseText = result.data.response;
            let conversationalPart = responseText;
            let toolResult: Message['toolResult'] | undefined = undefined;

            if (responseText.includes('[TOOL_RESULT:questionPaper]')) {
                const parts = responseText.split('\n\n[TOOL_RESULT:questionPaper]\n');
                conversationalPart = parts[0];
                try {
                    const toolData = JSON.parse(parts[1]);
                    toolResult = { type: 'questionPaper', data: toolData };
                } catch (e) {
                    console.error("Failed to parse tool result JSON", e);
                }
            }

            const modelMessage: Message = { role: "model", content: conversationalPart, toolResult };
            setHistory((prev) => [...prev, modelMessage]);
        }
      });
  }, [startTyping, toast, setHistory]);


  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const messageToSend = messageContent ?? input;
    if (!messageToSend.trim()) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const userMessage: Message = { role: "user", content: messageToSend, imageDataUri: undefined };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");

    await executeChat(newHistory);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isRecording, history, executeChat]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  }

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
    if (!viewport) return;

    const handleScroll = () => {
        if (viewport) {
            sessionStorage.setItem('chatScrollPosition', String(viewport.scrollTop));
        }
    };

    if (history.length > 0 && !isTyping) {
        const savedPosition = sessionStorage.getItem('chatScrollPosition');
        if (savedPosition) {
            viewport.scrollTo({ top: parseInt(savedPosition) });
        }
    }
    
    viewport.addEventListener('scroll', handleScroll);
    return () => {
        viewport.removeEventListener('scroll', handleScroll);
    };
  }, [history.length, isTyping]);


  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [history]);

  return (
    <>
        <LimitExhaustedDialog isOpen={showLimitDialog} onOpenChange={setShowLimitDialog} />
        <ShareDialog
            isOpen={!!shareContent}
            onOpenChange={(open) => !open && setShareContent(null)}
            content={shareContent || ""}
        />
        <ScrollArea className="h-full w-full" ref={scrollAreaRef}>
            <div className="mx-auto w-full max-w-3xl space-y-8 p-4 pb-48 sm:pb-40">
            {history.length === 0 && !isTyping ? (
                <div className="flex h-[calc(100vh-18rem)] flex-col items-center justify-center text-center">
                    <div className="mb-4">
                        <h1 className="heading bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent sm:text-6xl">
                            Hello!
                        </h1>
                        <p className="mt-2 text-xl font-semibold text-gray-500 sm:text-2xl">
                           How can I help you today?
                        </p>
                    </div>
                    <div className="mt-8 grid w-full max-w-2xl grid-cols-1 gap-4 sm:grid-cols-2">
                        {suggestionPrompts.map((prompt, i) => (
                             <Button
                                key={i}
                                asChild
                                variant="outline"
                                className="h-auto w-full justify-start rounded-lg border-border/70 p-4 hover:bg-muted"
                                >
                                <Link href={prompt.href}>
                                    <div className="flex items-start gap-4">
                                        {prompt.icon}
                                        <div>
                                            <h3 className="text-left text-base font-semibold text-foreground">{prompt.title}</h3>
                                            <p className="text-left text-sm text-muted-foreground">{prompt.description}</p>
                                        </div>
                                    </div>
                                </Link>
                            </Button>
                        ))}
                    </div>
                    <p className="mt-8 text-sm text-muted-foreground">Or ask me anything...</p>
                </div>
            ) : (
                history.map((message, index) => (
                    <React.Fragment key={index}>
                        <div
                        className={cn(
                            "flex w-full items-start gap-4",
                            message.role === "user" ? "justify-end" : ""
                        )}
                        >
                        {message.role === "user" ? (
                             <div className="border bg-primary/10 inline-block rounded-xl p-3">
                                {message.imageDataUri && (
                                    <Image src={message.imageDataUri} alt="User upload" width={300} height={200} className="mb-2 rounded-md" />
                                )}
                                <span className="text-foreground">{message.content}</span>
                             </div>
                        ) : (
                            <div className={cn("group w-full")}>
                                <ModelResponse 
                                    message={message}
                                />
                                <div className="mt-2 flex items-center gap-1 transition-opacity">
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopyToClipboard(message.content)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                     <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleShare(message.content)}>
                                        <Share2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleTextToSpeech(message.content, `tts-${index}`)} disabled={!!isSynthesizing}>
                                        {isSynthesizing === `tts-${index}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <Volume2 className="h-4 w-4" />}
                                    </Button>
                                    {index === history.length - 1 && !isTyping && (
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRegenerateResponse} disabled={isTyping}>
                                            <RefreshCw className="h-4 w-4" />
                                        </Button>
                                    )}
                                </div>
                                 {audioDataUri && isSynthesizing === `tts-${index}` && (
                                    <div className="mt-2">
                                        <audio controls autoPlay src={audioDataUri} className="h-8 w-full" onEnded={() => { setAudioDataUri(null); setIsSynthesizing(null); }} />
                                    </div>
                                )}
                            </div>
                        )}
        
                                 {message.toolResult?.type === 'questionPaper' && (
                                    <Card className="bg-muted/50 mt-2">
                                        <CardHeader className="p-4">
                                            <CardTitle className="flex items-center gap-2 text-base">
                                                <FileText className="h-5 w-5"/>
                                                {message.toolResult.data.title}
                                            </CardTitle>
                                            <CardDescription className="text-xs">A question paper has been generated for you.</CardDescription>
                                        </CardHeader>
                                        <CardContent className="p-4 pt-0">
                                            <Button className="w-full" onClick={() => handleViewQuestionPaper(message.toolResult!.data)}>View Question Paper</Button>
                                        </CardContent>
                                    </Card>
                                )}
                             {message.role === "user" && (
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback><User className="size-5" /></AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                        {index < history.length - 1 && (
                             <Separator className="my-8" />
                        )}
                    </React.Fragment>
                ))
            )}
            {isTyping && history[history.length-1]?.role !== "model" && (
                <div className="flex items-start gap-4">
                    <div className="flex max-w-lg items-center gap-2">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Generating...</span>
                    </div>
                </div>
            )}
            </div>
        </ScrollArea>
        <div className="from-background/90 via-background/80 to-transparent absolute bottom-0 left-0 w-full bg-gradient-to-t p-4 pb-6">
             <Card className="shadow-lg mx-auto max-w-3xl rounded-3xl p-2 bg-card border border-border/80 focus-within:border-primary focus-within:shadow-md focus-within:shadow-primary/20">
                <div className="relative">
                    <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message Easy Learn AI..."
                            disabled={isTyping}
                            className="h-12 border-0 text-base shadow-none focus-visible:ring-0 bg-transparent"
                        />
                         <Button type="button" size="icon" variant={isRecording ? "destructive" : "ghost"} className="h-10 w-10 flex-shrink-0" onClick={handleToggleRecording} disabled={isTyping}>
                            {isRecording ? <MicOff className="h-5 h-5" /> : <Mic className="h-5 h-5" />}
                            <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                        </Button>
                        <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0" disabled={isTyping || !input.trim()}>
                            {isTyping && history[history.length-1]?.role === "user" ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                            <Send className="h-5 w-5" />
                            )}
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </div>
            </Card>
        </div>
    </>
  );
}

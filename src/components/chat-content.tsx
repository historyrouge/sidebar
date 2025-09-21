
"use client";

import { generalChatAction, textToSpeechAction, GenerateQuestionPaperOutput, ChatModel, streamTextToSpeech } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, User, Mic, MicOff, Copy, Share2, Volume2, RefreshCw, FileQuestion, PlusSquare, BookOpen, Rss, FileText, Sparkles, Brain, Edit, Download, Save, RefreshCcw, Paperclip, StopCircle, X } from "lucide-react";
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
import imageToDataUri from "image-to-data-uri";


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
            className="prose dark:prose-invert max-w-none text-base leading-relaxed text-foreground"
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
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);
  const [shareContent, setShareContent] = useState<string | null>(null);
  
  const [showLimitDialog, setShowLimitDialog] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioQueueRef = useRef<ArrayBuffer[]>([]);
  const isPlayingRef = useRef(false);
  const sourceNodeRef = useRef<AudioBufferSourceNode | null>(null);


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
    if (!messageToSend.trim() && !imagePreview) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const userMessage: Message = { role: "user", content: messageToSend, imageDataUri: imagePreview ?? undefined };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");
    setImagePreview(null);

    await executeChat(newHistory);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isRecording, history, executeChat, imagePreview]);

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

  const stopCurrentAudio = useCallback(() => {
    if (sourceNodeRef.current) {
        sourceNodeRef.current.stop();
        sourceNodeRef.current.disconnect();
        sourceNodeRef.current = null;
    }
    audioQueueRef.current = [];
    isPlayingRef.current = false;
    setIsSynthesizing(null);
  }, []);

  const playAudio = useCallback(async () => {
      if (isPlayingRef.current || audioQueueRef.current.length === 0) return;
  
      isPlayingRef.current = true;
      const audioData = audioQueueRef.current.shift();
      if (!audioData || !audioContextRef.current) {
          isPlayingRef.current = false;
          return;
      }
  
      try {
          const audioBuffer = await audioContextRef.current.decodeAudioData(audioData);
          const source = audioContextRef.current.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContextRef.current.destination);
          source.onended = () => {
              isPlayingRef.current = false;
              if (audioQueueRef.current.length > 0) {
                  playAudio();
              } else {
                  setIsSynthesizing(null); // All chunks played
              }
          };
          source.start();
          sourceNodeRef.current = source;
      } catch (error) {
          console.error("Error decoding or playing audio:", error);
          isPlayingRef.current = false;
          setIsSynthesizing(null);
          toast({ title: 'Audio Playback Error', description: 'Could not play the generated audio.', variant: 'destructive' });
      }
  }, [toast]);
  

  const handleTextToSpeech = async (text: string, id: string) => {
      if (isSynthesizing === id) {
          stopCurrentAudio();
          return;
      }

      // Stop any previously playing audio before starting a new one
      stopCurrentAudio();
      setIsSynthesizing(id);

      if (!audioContextRef.current) {
          try {
              audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({
                  sampleRate: 24000,
              });
          } catch (e) {
              toast({ title: 'Browser Not Supported', description: 'Your browser does not support the Web Audio API.', variant: 'destructive'});
              setIsSynthesizing(null);
              return;
          }
      }

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
          while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const pcmData = value.buffer;
              audioQueueRef.current.push(pcmData);
              if (!isPlayingRef.current) {
                  playAudio();
              }
          }
      } catch (e: any) {
          toast({ title: 'Audio Generation Failed', description: e.message, variant: 'destructive' });
          stopCurrentAudio();
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

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
        try {
            const dataUri = await imageToDataUri(URL.createObjectURL(file));
            setImagePreview(dataUri);
            if(fileInputRef.current) fileInputRef.current.value = ""; // Reset file input
        } catch (error) {
            toast({ title: "Image processing failed", description: "Could not read the image file.", variant: "destructive" });
        }
    } else if (file) {
        toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
    }
  };

  const handleAttachmentClick = () => {
      fileInputRef.current?.click();
  }


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
            {history.length === 0 && !isTyping && !imagePreview ? (
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
                                className="h-auto w-full justify-start rounded-lg border p-4 hover:bg-muted"
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
                            <div className="flex items-start gap-4 justify-end">
                                <div className="border bg-primary text-primary-foreground inline-block rounded-xl p-3 max-w-md">
                                    {message.imageDataUri && (
                                        <Image src={message.imageDataUri} alt="User upload" width={300} height={200} className="mb-2 rounded-md" />
                                    )}
                                    {message.content && <p className="text-base whitespace-pre-wrap">{message.content}</p>}
                                </div>
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback><User className="size-5" /></AvatarFallback>
                                </Avatar>
                            </div>
                        ) : (
                            <div className={cn("group w-full flex items-start gap-4")}>
                                <Avatar className="h-9 w-9 border">
                                    <AvatarFallback className="bg-primary/10"><Bot className="size-5 text-primary" /></AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <ModelResponse message={message} />
                                    <div className="mt-2 flex items-center gap-1 transition-opacity">
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopyToClipboard(message.content)}>
                                            <Copy className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleShare(message.content)}>
                                            <Share2 className="h-4 w-4" />
                                        </Button>
                                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleTextToSpeech(message.content, `tts-${index}`)}>
                                            {isSynthesizing === `tts-${index}` ? <StopCircle className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4" />}
                                        </Button>
                                        {index === history.length - 1 && !isTyping && (
                                            <Button size="icon" variant="ghost" className="h-7 w-7" onClick={handleRegenerateResponse} disabled={isTyping}>
                                                <RefreshCw className="h-4 w-4" />
                                            </Button>
                                        )}
                                    </div>
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
            {isTyping && history[history.length-1]?.role !== "model" && (
                <div className="flex items-start gap-4">
                     <Avatar className="h-9 w-9 border">
                        <AvatarFallback className="bg-primary/10"><Bot className="size-5 text-primary" /></AvatarFallback>
                    </Avatar>
                    <div className="flex max-w-lg items-center gap-2 rounded-lg p-3 text-sm bg-muted text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        <span>Generating...</span>
                    </div>
                </div>
            )}
            </div>
        </ScrollArea>
        <div className="from-background/90 via-background/80 to-transparent absolute bottom-0 left-0 w-full bg-gradient-to-t p-4 pb-6">
            <div className="mx-auto max-w-3xl">
                 {imagePreview && (
                    <div className="mb-4 relative w-fit mx-auto">
                        <Image src={imagePreview} alt="Preview" width={80} height={80} className="rounded-lg border" />
                        <Button size="icon" variant="destructive" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => setImagePreview(null)}>
                            <X className="h-4 w-4"/>
                        </Button>
                    </div>
                )}
                <form 
                    onSubmit={handleFormSubmit} 
                    className="relative flex items-center rounded-full border bg-card p-2 shadow-lg focus-within:border-primary"
                >
                    <input type="file" ref={fileInputRef} onChange={handleImageFileChange} className="hidden" accept="image/*" />
                    <Button type="button" size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0" onClick={handleAttachmentClick} title="Attach an image to extract text">
                        <Paperclip className="h-5 w-5" />
                        <span className="sr-only">Attach an image to extract text</span>
                    </Button>
                    <Input
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Message Easy Learn AI..."
                        disabled={isTyping}
                        className="h-10 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                    />
                    <div className="flex items-center gap-1">
                        <Button type="button" size="icon" variant={isRecording ? "destructive" : "ghost"} className="h-9 w-9 flex-shrink-0" onClick={handleToggleRecording} disabled={isTyping}>
                            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                        </Button>
                        <Button type="submit" size="icon" className="h-9 w-9 flex-shrink-0" disabled={isTyping || (!input.trim() && !imagePreview)}>
                            {isTyping && history[history.length-1]?.role === "user" ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <Send className="h-5 w-5" />
                            )}
                            <span className="sr-only">Send</span>
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    </>
  );
}

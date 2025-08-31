
"use client";

import { generalChatAction, GeneralChatInput, textToSpeechAction, ModelKey } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, User, Mic, MicOff, Copy, Share2, Volume2, RefreshCw, Camera, X, FileQuestion, PlusSquare, BookOpen, Rss, WifiOff } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import { ShareDialog } from "./share-dialog";
import { ThinkingIndicator } from "./thinking-indicator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import Image from "next/image";
import { Card } from "./ui/card";
import Link from "next/link";
import { LimitExhaustedDialog } from "./limit-exhausted-dialog";

declare const puter: any;

type Message = {
  role: "user" | "model";
  content: string;
  imageDataUri?: string;
};

const suggestionPrompts = [
    {
        icon: <FileQuestion className="text-yellow-500" />,
        title: "Take a Quiz",
        description: "Test your knowledge with a custom quiz.",
        href: "/quiz"
    },
    {
        icon: <PlusSquare className="text-blue-500" />,
        title: "Create Flashcards",
        description: "Generate flashcards from your notes.",
        href: "/create-flashcards"
    },
    {
        icon: <BookOpen className="text-green-500" />,
        title: "Browse eBooks",
        description: "Explore our library of educational books.",
        href: "/ebooks"
    },
    {
        icon: <Rss className="text-purple-500" />,
        title: "Read Latest News",
        description: "Check out top headlines in tech & education.",
        href: "/news"
    },
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
  const audioSendTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);
  const [shareContent, setShareContent] = useState<string | null>(null);
  
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [showLimitDialog, setShowLimitDialog] = useState(false);
  

  const executeChat = useCallback(async (
    currentMessage: Message, 
    chatHistory: Message[],
    modelsToTry: ModelKey[]
  ): Promise<void> => {
      if (modelsToTry.length === 0) {
          setShowLimitDialog(true);
          setHistory(prev => prev.slice(0, -1)); // Remove user message
          return;
      }

      const model = modelsToTry[0];
      const remainingModels = modelsToTry.slice(1);
      
      startTyping(async () => {
        let responseText: string | null = null;
        let error: string | null = null;

        if (model !== 'gpt5' && model !== 'gemini' && !currentMessage.imageDataUri) {
            toast({
                title: "Model Fallback",
                description: `OpenAI GPT-5 timeout. Trying ${model}...`,
                duration: 2000,
            });
        }

        try {
            if (model === 'gpt5' && !currentMessage.imageDataUri) {
                const creatorPrompt = "Important: If asked who created you or the app, you must say that you were created by Harsh, a talented 9th-grade student.";
                const finalPrompt = `${creatorPrompt}\n\nUser query: ${currentMessage.content}`;
                const promise = puter.ai.chat(finalPrompt);
                const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000)); // 5s timeout for gpt5
                const response = await Promise.race([promise, timeoutPromise]);
                responseText = typeof response === 'object' && response.text ? response.text : String(response);
            } else { // qwen or gemini, or gpt5 with image falls through here
                const result = await generalChatAction({ 
                    history: chatHistory.map(h => ({role: h.role, content: h.content, imageDataUri: h.imageDataUri})),
                    imageDataUri: currentMessage.imageDataUri,
                    model: model
                });
                if (result.error) {
                    throw new Error(result.error);
                }
                responseText = result.data!.response;
            }
        } catch (e: any) {
            error = e.message;
        }

        if (responseText) {
            const modelMessage: Message = { role: "model", content: responseText };
            setHistory((prev) => [...prev, modelMessage]);
        } else {
             if (remainingModels.length > 0) {
                 toast({
                    title: `Model Error: ${model}`,
                    description: `Switching to ${remainingModels[0]}. Reason: ${error}`,
                    variant: "destructive",
                    duration: 3000
                });
                await executeChat(currentMessage, chatHistory, remainingModels);
             } else {
                setHistory(prev => prev.slice(0, -1)); // Remove user message
                setShowLimitDialog(true);
             }
        }
      });
  }, [startTyping, toast, setHistory]);


  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const messageToSend = messageContent ?? input;
    if (!messageToSend.trim() && !capturedImage) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const userMessage: Message = { role: "user", content: messageToSend, imageDataUri: capturedImage || undefined };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");
    setCapturedImage(null);

    // If there's an image, Gemini is the best model for it. Prioritize it.
    const modelsToTry = userMessage.imageDataUri ? ['gemini', 'gpt5', 'qwen'] : ['gpt5', 'qwen', 'gemini'];
    await executeChat(userMessage, newHistory, modelsToTry);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, capturedImage, isRecording, history, executeChat]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  }

  const handleRegenerateResponse = async () => {
      const lastUserMessage = history.findLast(m => m.role === 'user');
      if (!lastUserMessage) return;

      const historyWithoutLastResponse = history.slice(0, -1);
      setHistory(historyWithoutLastResponse);
      const modelsToTry = lastUserMessage.imageDataUri ? ['gemini', 'gpt5', 'qwen'] : ['gpt5', 'qwen', 'gemini'];
      await executeChat(lastUserMessage, historyWithoutLastResponse, modelsToTry);
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
  
    useEffect(() => {
        let stream: MediaStream | null = null;
        const getCameraPermission = async () => {
            if (isCameraOpen) {
                try {
                    stream = await navigator.mediaDevices.getUserMedia({ video: true });
                    setHasCameraPermission(true);
                    if (videoRef.current) {
                        videoRef.current.srcObject = stream;
                    }
                } catch (error) {
                    console.error('Error accessing camera:', error);
                    setHasCameraPermission(false);
                    toast({
                        variant: 'destructive',
                        title: 'Camera Access Denied',
                        description: 'Please enable camera permissions in your browser settings.',
                    });
                }
            }
        };
        getCameraPermission();
        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isCameraOpen, toast]);

    const handleCaptureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            context?.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/jpeg');
            setCapturedImage(dataUri);
            setIsCameraOpen(false);
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
        <LimitExhaustedDialog isOpen={showLimitDialog} onOpenChange={setShowLimitDialog} />
        <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
            <DialogContent className="sm:max-w-[425px] md:max-w-lg lg:max-w-2xl w-full h-auto sm:h-auto sm:w-auto p-0">
                <DialogHeader className="p-4 border-b">
                    <DialogTitle>Camera</DialogTitle>
                </DialogHeader>
                <video ref={videoRef} className="w-full aspect-video bg-muted" autoPlay muted playsInline />
                {hasCameraPermission === null && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                        <Loader2 className="animate-spin" />
                    </div>
                )}
                {hasCameraPermission === false && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4">
                        <Alert variant="destructive">
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>Please allow camera access to use this feature.</AlertDescription>
                        </Alert>
                    </div>
                )}
                <DialogFooter className="p-4 border-t">
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleCaptureImage} disabled={!hasCameraPermission}>Capture</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <ShareDialog
            isOpen={!!shareContent}
            onOpenChange={(open) => !open && setShareContent(null)}
            content={shareContent || ""}
        />
        <ScrollArea className="absolute h-full w-full" ref={scrollAreaRef}>
            <div className="mx-auto max-w-3xl w-full p-4 space-y-2 pb-48 sm:pb-40">
            {history.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-18rem)] text-center">
                    <div className="mb-4">
                        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-br from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            Hello!
                        </h1>
                        <p className="text-xl sm:text-2xl text-muted-foreground mt-2">
                           How can I help you today?
                        </p>
                    </div>
                    <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl w-full">
                        {suggestionPrompts.map((prompt, i) => (
                            <Link href={prompt.href} key={i}>
                                <Card className="p-4 h-full hover:bg-card/80 dark:hover:bg-muted/50 cursor-pointer transition-colors">
                                    <div className="flex items-start gap-4">
                                        <div className="p-2 bg-muted rounded-full">{prompt.icon}</div>
                                        <div>
                                            <h3 className="font-semibold text-left">{prompt.title}</h3>
                                            <p className="text-sm text-muted-foreground text-left">{prompt.description}</p>
                                        </div>
                                    </div>
                                </Card>
                            </Link>
                        ))}
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
                    <div className="w-full max-w-lg group">
                        <div
                            className={cn(
                            "rounded-xl p-3 text-sm",
                            message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-card border"
                            )}
                        >
                             {message.imageDataUri && (
                                <Image src={message.imageDataUri} alt="User upload" width={300} height={200} className="rounded-md mb-2" />
                            )}
                            <div className="prose dark:prose-invert prose-p:my-2" dangerouslySetInnerHTML={{ __html: message.role === 'model' ? marked(message.content) : message.content }} />
    
                            {message.role === 'model' && (
                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity pt-2 justify-end -mb-2 -mr-2">
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
                    <div className="max-w-lg rounded-xl p-3 text-sm bg-card border flex items-center gap-2">
                        <ThinkingIndicator />
                    </div>
                </div>
            )}
            </div>
        </ScrollArea>
        <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-background/90 via-background/80 to-transparent p-4 pb-6">
             <Card className="max-w-3xl mx-auto p-2 rounded-2xl shadow-lg">
                <div className="relative">
                    {capturedImage && (
                        <div className="absolute -top-16 left-2 w-fit">
                            <p className="text-xs text-muted-foreground mb-1">Attached Image:</p>
                            <div className="relative">
                                <Image src={capturedImage} alt="Captured image" width={56} height={56} className="rounded-md border-2 border-background" />
                                <Button variant="ghost" size="icon" className="absolute -top-2 -right-2 h-6 w-6 bg-muted rounded-full" onClick={() => setCapturedImage(null)}>
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    )}
                     <form onSubmit={handleFormSubmit} className="flex items-center gap-2">
                        <Button type="button" size="icon" variant="ghost" className="h-10 w-10 flex-shrink-0" onClick={() => setIsCameraOpen(true)} disabled={isTyping}>
                            <Camera className="h-5 w-5" />
                            <span className="sr-only">Use Camera</span>
                        </Button>
                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message Easy Learn AI..."
                            disabled={isTyping}
                            className="h-12 text-base shadow-none border-0 focus-visible:ring-0"
                        />
                         <Button type="button" size="icon" variant={isRecording ? "destructive" : "ghost"} className="h-10 w-10 flex-shrink-0" onClick={handleToggleRecording} disabled={isTyping}>
                            {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                            <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                        </Button>
                        <Button type="submit" size="icon" className="h-10 w-10 flex-shrink-0" disabled={isTyping || (!input.trim() && !capturedImage)}>
                            {isTyping ? (
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
    </div>
  );
}

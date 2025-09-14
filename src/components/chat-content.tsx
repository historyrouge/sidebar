
"use client";

import { generalChatAction, textToSpeechAction, GenerateQuestionPaperOutput } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, Loader2, Send, User, Mic, MicOff, Copy, Share2, Volume2, RefreshCw, Camera, X, FileQuestion, PlusSquare, BookOpen, Rss, WifiOff, FileText, CameraRotate } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { marked } from "marked";
import { ShareDialog } from "./share-dialog";
import { ThinkingIndicator } from "./thinking-indicator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "./ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { LimitExhaustedDialog } from "./limit-exhausted-dialog";
import { useRouter } from "next/navigation";


type Message = {
  role: "user" | "model";
  content: string;
  imageDataUri?: string;
  toolResult?: {
    type: 'questionPaper',
    data: GenerateQuestionPaperOutput
  }
};

const QuizIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="url(#quiz-gradient)"/>
        <path d="M24.5 32H23.5C22.3954 32 21.5 31.1046 21.5 30V28C21.5 26.8954 22.3954 26 23.5 26H24.5C25.6046 26 26.5 26.8954 26.5 28V30C26.5 31.1046 25.6046 32 24.5 32Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M24.5 22C24.5 20.3431 23.1569 19 21.5 19C19.8431 19 18.5 20.3431 18.5 22C18.5 23.6569 20.3726 25.9314 21.5 26H26.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <circle cx="30.5" cy="17" r="2" fill="white"/>
        <defs>
            <linearGradient id="quiz-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#34D399"/>
                <stop offset="1" stopColor="#059669"/>
            </linearGradient>
        </defs>
    </svg>
);

const FlashcardsIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="url(#flash-gradient)"/>
        <path d="M18 19H30V29H18V19Z" fill="#A78BFA" stroke="white" strokeWidth="2" strokeLinejoin="round" transform="rotate(-10 24 24)"/>
        <path d="M22 17H34V27H22V17Z" fill="#C4B5FD" stroke="white" strokeWidth="2" strokeLinejoin="round" transform="rotate(5 24 24)"/>
        <defs>
            <linearGradient id="flash-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#A78BFA"/>
                <stop offset="1" stopColor="#7C3AED"/>
            </linearGradient>
        </defs>
    </svg>
);

const EbooksIcon = () => (
     <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="url(#ebook-gradient)"/>
        <path d="M29 16H19C17.8954 16 17 16.8954 17 18V30C17 31.1046 17.8954 32 19 32H29C30.1046 32 31 31.1046 31 30V18C31 16.8954 30.1046 16 29 16Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M26 16V32" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="ebook-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6EE7B7"/>
                <stop offset="1" stopColor="#10B981"/>
            </linearGradient>
        </defs>
    </svg>
);

const NewsIcon = () => (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="24" cy="24" r="24" fill="url(#news-gradient)"/>
        <path d="M16 20H32" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 26H24" stroke="white" strokeWidth="2" strokeLinecap="round"/>
        <path d="M16 16H32V32H16V16Z" stroke="white" strokeWidth="2" strokeLinejoin="round"/>
        <defs>
            <linearGradient id="news-gradient" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FBBF24"/>
                <stop offset="1" stopColor="#F59E0B"/>
            </linearGradient>
        </defs>
    </svg>
);

const suggestionPrompts = [
    {
        icon: <QuizIcon />,
        title: "Take a Quiz",
        description: "Test your knowledge with a custom quiz.",
        href: "/quiz",
        gradient: "from-teal-400 to-cyan-500"
    },
    {
        icon: <FlashcardsIcon />,
        title: "Create Flashcards",
        description: "Generate flashcards from your notes.",
        href: "/create-flashcards",
        gradient: "from-purple-400 to-indigo-500"
    },
    {
        icon: <EbooksIcon />,
        title: "Browse eBooks",
        description: "Explore our library of educational books.",
        href: "/ebooks",
        gradient: "from-green-400 to-emerald-500"
    },
    {
        icon: <NewsIcon />,
        title: "Read Latest News",
        description: "Check out top headlines in tech & education.",
        href: "/news",
        gradient: "from-orange-400 to-rose-500"
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
  const router = useRouter();
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
  const [isStreamReady, setIsStreamReady] = useState(false);
  
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);


  const [showLimitDialog, setShowLimitDialog] = useState(false);
  

  const executeChat = useCallback(async (
    chatHistory: Message[]
  ): Promise<void> => {
      startTyping(async () => {
        // Convert the message history to the format Genkit expects
        const genkitHistory = chatHistory.map(h => ({
            role: h.role as 'user' | 'model', // Cast to what Genkit flow expects
            content: h.imageDataUri ? [{ text: h.content }, { media: { url: h.imageDataUri } }] : h.content,
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
    if (!messageToSend.trim() && !capturedImage) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }

    const userMessage: Message = { role: "user", content: messageToSend, imageDataUri: capturedImage || undefined };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");
    setCapturedImage(null);

    await executeChat(newHistory);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, capturedImage, isRecording, history, executeChat]);

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
  
    const startCamera = useCallback(async (deviceId?: string) => {
        // Stop any existing stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsStreamReady(false);
        try {
            const constraints: MediaStreamConstraints = {
                video: deviceId ? { deviceId: { exact: deviceId } } : true,
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            streamRef.current = stream;
            setHasCameraPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => {
                    setIsStreamReady(true);
                };
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
        }
    }, []);

    useEffect(() => {
        const getDevicesAndStart = async () => {
            if (isCameraOpen) {
                setHasCameraPermission(null);
                await startCamera(currentDeviceId); // Initial start
                
                // Now get all devices to allow switching
                const devices = await navigator.mediaDevices.enumerateDevices();
                const videoDevs = devices.filter(d => d.kind === 'videoinput');
                setVideoDevices(videoDevs);
                if (!currentDeviceId && videoDevs.length > 0) {
                    setCurrentDeviceId(videoDevs[0].deviceId);
                }
            }
        };

        getDevicesAndStart();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [isCameraOpen, currentDeviceId, startCamera]);

    const handleSwitchCamera = () => {
        if (videoDevices.length > 1) {
            const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
            const nextIndex = (currentIndex + 1) % videoDevices.length;
            setCurrentDeviceId(videoDevices[nextIndex].deviceId);
        }
    };


    const handleCaptureImage = () => {
        if (videoRef.current) {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current.videoWidth;
            canvas.height = videoRef.current.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
                const dataUri = canvas.toDataURL('image/png'); // Use PNG for higher quality
                setCapturedImage(dataUri);
                setIsCameraOpen(false);
            }
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
                <div className="relative">
                    <video ref={videoRef} className="w-full aspect-video bg-muted" autoPlay muted playsInline />
                    {hasCameraPermission === null && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                            <div className="text-center">
                                <Loader2 className="animate-spin h-8 w-8 mx-auto" />
                                <p className="mt-2 text-muted-foreground">Requesting camera access...</p>
                            </div>
                        </div>
                    )}
                    {hasCameraPermission === false && (
                         <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4">
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access in your browser settings to use this feature. You may need to reload the page after granting permission.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <DialogFooter className="p-4 border-t flex justify-between">
                    <div>
                        {videoDevices.length > 1 && (
                            <Button variant="outline" onClick={handleSwitchCamera}>
                                <CameraRotate className="mr-2 h-4 w-4" /> Switch Camera
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <DialogClose asChild>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button onClick={handleCaptureImage} disabled={!hasCameraPermission || !isStreamReady}>
                            {isStreamReady ? 'Capture' : 'Starting Camera...'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
        <ShareDialog
            isOpen={!!shareContent}
            onOpenChange={(open) => !open && setShareContent(null)}
            content={shareContent || ""}
        />
        <ScrollArea className="absolute h-full w-full" ref={scrollAreaRef}>
            <div className="mx-auto max-w-3xl w-full p-4 space-y-8 pb-48 sm:pb-40">
            {history.length === 0 && !isTyping ? (
                <div className="flex flex-col items-center justify-center h-[calc(100vh-18rem)] text-center">
                    <div className="mb-4">
                        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-br from-primary via-blue-500 to-purple-600 bg-clip-text text-transparent">
                            Hello!
                        </h1>
                        <p className="text-xl sm:text-2xl text-muted-foreground mt-2 font-semibold">
                           How can I help you today?
                        </p>
                    </div>
                    <div className="mt-8 grid grid-cols-2 gap-4 max-w-2xl w-full">
                        {suggestionPrompts.map((prompt, i) => (
                            <Link href={prompt.href} key={i}>
                                <Card className={cn("p-6 h-full text-white bg-gradient-to-br hover:-translate-y-1 transition-transform duration-300 shadow-lg rounded-2xl", prompt.gradient)}>
                                    <div className="flex flex-col items-start gap-4 h-full">
                                        {prompt.icon}
                                        <div className="mt-auto">
                                            <h3 className="font-semibold text-xl">{prompt.title}</h3>
                                            <p className="text-sm text-white/80">{prompt.description}</p>
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
                        "flex w-full items-start gap-4",
                        message.role === "user" ? "justify-end" : "justify-start"
                    )}
                    >
                    
                    <div className={cn("w-full max-w-lg group", message.role === "model" && "pt-1")}>
                        {message.role === "user" ? (
                             <div className="rounded-xl p-3 text-sm bg-primary text-primary-foreground">
                                {message.imageDataUri && (
                                    <Image src={message.imageDataUri} alt="User upload" width={300} height={200} className="rounded-md mb-2" />
                                )}
                                {message.content}
                             </div>
                        ) : (
                            <div className="prose dark:prose-invert prose-p:my-2 max-w-none" dangerouslySetInnerHTML={{ __html: marked(message.content) }} />
                        )}
    
                             {message.toolResult?.type === 'questionPaper' && (
                                <Card className="mt-2 bg-muted/50">
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
                    <div className="max-w-lg flex items-center gap-2">
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

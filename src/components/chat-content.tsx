

"use client";

import { generalChatAction, textToSpeechAction, GeneralChatInput, GenerateQuestionPaperOutput } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Share2, Volume2, RefreshCw, FileText, X, Edit, Save, Download, StopCircle, Paperclip, Mic, MicOff, Send, Layers, Plus, Search, ArrowUp, Wand2, Music, Youtube, MoreVertical, Play, Pause, Rewind, FastForward } from "lucide-react";
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "./ui/progress";
import Tesseract from 'tesseract.js';
import { ModelSwitcher } from "./model-switcher";
import { create } from 'zustand';
import { YoutubeChatCard } from "./youtube-chat-card";


type Message = {
  id: string;
  role: "user" | "model" | "tool";
  content: { text: string; image?: string | null };
};

const CHAT_HISTORY_STORAGE_KEY = 'chatHistory';

type ChatStore = {
  activeVideoId: string | null;
  activeVideoTitle: string | null;
  isPlaying: boolean;
  showPlayer: boolean;
  setActiveVideoId: (id: string | null, title: string | null) => void;
  togglePlay: () => void;
  setShowPlayer: (show: boolean) => void;
};

export const useChatStore = create<ChatStore>((set) => ({
  activeVideoId: null,
  activeVideoTitle: null,
  isPlaying: false,
  showPlayer: false,
  setActiveVideoId: (id, title) => set({ activeVideoId: id, activeVideoTitle: title, isPlaying: !!id, showPlayer: !!id }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),
  setShowPlayer: (show) => set({ showPlayer: show }),
}));


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
  
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState(0);

  const [currentModel, setCurrentModel] = useState('Meta-Llama-3.1-8B-Instruct');
  const [activeButton, setActiveButton] = useState<'deepthink' | 'music' | 'search' | 'agent' | null>(null);

  const { setActiveVideoId } = useChatStore();


  const handleToolButtonClick = (tool: 'deepthink' | 'music' | 'search' | 'agent') => {
      const newActiveButton = activeButton === tool ? null : tool;
      setActiveButton(newActiveButton);

      if (newActiveButton === 'deepthink') {
        setCurrentModel('gpt-oss-120b');
        toast({ title: 'Model Switched', description: 'DeepThink activated: Using SearnAI V3.1 for complex reasoning.' });
      } else if (newActiveButton === 'music') {
        toast({ title: 'Music Mode Activated', description: 'Search for a song to play it from YouTube.' });
      } else {
        // Revert to default model if no special mode is active
        if (currentModel === 'gpt-oss-120b' && newActiveButton !== 'deepthink') {
             setCurrentModel('Meta-Llama-3.1-8B-Instruct');
        }
      }
  };


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
        role: h.role as 'user' | 'model' | 'tool',
        content: h.content.text, // Pass only text content
      }));
      
      const result = await generalChatAction({ 
          history: genkitHistory, 
          fileContent: currentFileContent, 
          imageDataUri: currentImageDataUri,
          model: currentModel,
          isMusicMode: activeButton === 'music',
      });

      setIsTyping(false);

      if (result.error) {
          if (result.error.includes("API_LIMIT_EXCEEDED")) {
              setHistory(prev => prev.slice(0, -1));
              setShowLimitDialog(true);
          } else {
              toast({ title: "Chat Error", description: result.error, variant: "destructive" });
              setHistory(prev => prev.slice(0, -1));
          }
          return;
      }

       if (result.data) {
          const modelMessage: Message = { id: modelMessageId, role: "model", content: { text: result.data.response } };
          setHistory((prev) => [...prev, modelMessage]);
      }
      
  }, [toast, currentModel, activeButton]);


  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const messageToSend = messageContent ?? input;
    if (!messageToSend.trim() && !imageDataUri && !fileContent) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }
    const messageId = `${Date.now()}`;
    const userMessage: Message = { id: messageId, role: "user", content: { text: messageToSend, image: imageDataUri } };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");

    await executeChat(newHistory, imageDataUri, fileContent);
    
    // Deactivate music mode after one use
    if (activeButton === 'music') {
        setActiveButton(null);
    }
    
    // Do not clear image/file after sending for follow-up questions
    // setImageDataUri(null);
    // setFileContent(null);
    // setFileName(null);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isRecording, history, executeChat, imageDataUri, fileContent, activeButton]);

  const handleRegenerateResponse = async () => {
      const lastUserMessageIndex = history.findLastIndex(m => m.role === 'user');
      if (lastUserMessageIndex === -1) return;

      const historyForRegen = history.slice(0, lastUserMessageIndex + 1);
      setHistory(historyForRegen);
      
      const lastUserMessage = historyForRegen[lastUserMessageIndex];
      await executeChat(historyForRegen, lastUserMessage.content.image, fileContent);
  };


  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "The response has been copied to clipboard." });
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
        finalTranscript = '';
        
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
           }, 1000);
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
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
            setFileContent(e.target?.result as string);
            setFileName(file.name);
            setImageDataUri(null);
        };
        reader.readAsText(file);
      } else {
        toast({ title: "Invalid file type", description: "Please upload a .txt file.", variant: "destructive" });
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
        return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
        const dataUri = reader.result as string;
        setImageDataUri(dataUri);
        setFileContent(null);
        setFileName(null);
        // We will pass the data URI directly to the model now, no need for OCR here.
        toast({
            title: "Image Attached",
            description: `You can now ask questions about the image.`,
        });
    };
    reader.readAsDataURL(file);

    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
        fileInputRef.current.accept = ".txt";
        fileInputRef.current.onchange = handleFileChange;
        fileInputRef.current.click();
    }
  };

  const handleOpenImageDialog = () => {
      if (fileInputRef.current) {
          fileInputRef.current.accept = "image/*";
          fileInputRef.current.onchange = handleImageFileChange;
          fileInputRef.current.click();
      }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSendMessage();
  };

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [history]);
  
  const showWelcome = history.length === 0 && !isTyping;
  const isInputDisabled = isTyping || isOcrProcessing;

  const renderMessageContent = (message: Message) => {
    if (message.role === 'model') {
      try {
        const data = JSON.parse(message.content.text);
        if (data.type === 'youtube' && data.videoId) {
          return <YoutubeChatCard videoData={data} onPin={() => setActiveVideoId(data.videoId, data.title)} />;
        }
      } catch (e) {
        // Not a JSON object, so render as plain text
      }
    }
    
    // For user messages or non-JSON model messages
    return (
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
            },
            p: ({node, ...props}) => <p className="mb-4" {...props} />,
          }}
        >
          {message.content.text}
        </ReactMarkdown>
    );
  };

  if (showWelcome) {
    return (
        <div className="flex h-full flex-col items-center justify-center p-4">
             <div className="w-full max-w-2xl mx-auto flex flex-col items-center gap-8">
                <h1 className="text-4xl font-bold">SearnAI</h1>
                <div className="flex flex-wrap justify-center gap-2">
                    <Button variant="outline" className="rounded-full" onClick={() => handleSendMessage('Generate a summary, highlights, and key insights')}>Generate a summary, highlights, and key insights</Button>
                    <Button variant="outline" className="rounded-full" onClick={() => handleSendMessage('Summarize core points and important details')}>Summarize core points and important details</Button>
                    <Button variant="outline" className="rounded-full" onClick={() => handleSendMessage('Create Presentation')}>Create Presentation</Button>
                    <Button variant="outline" className="rounded-full" onClick={() => handleSendMessage('News')}>News</Button>
                </div>
                 <div className="w-full max-w-3xl">
                     <div className="flex justify-start mb-2 items-center gap-2">
                        <div className="bg-muted/50 p-1 rounded-lg w-fit">
                            <ModelSwitcher selectedModel={currentModel} onModelChange={setCurrentModel} disabled={isInputDisabled} />
                        </div>
                        <div className="bg-muted/50 p-1 rounded-lg w-fit flex gap-2">
                            <Button 
                                variant={activeButton === 'agent' ? 'default' : 'outline'}
                                onClick={() => handleToolButtonClick('agent')}
                                className="gap-2"
                            >
                                <Bot className="h-5 w-5" />
                                Agent
                            </Button>
                            <Button 
                                variant={activeButton === 'deepthink' ? 'default' : 'outline'}
                                onClick={() => handleToolButtonClick('deepthink')}
                            >
                                DeepThink
                            </Button>
                            <Button type="button" variant={activeButton === 'music' ? 'default' : 'outline'} disabled={isInputDisabled} onClick={() => handleToolButtonClick('music')}>
                                <Music className="h-5 w-5" />
                            </Button>
                            <Button type="button" variant={activeButton === 'search' ? 'default' : 'outline'} disabled={isInputDisabled} onClick={() => handleToolButtonClick('search')}>
                                <Search className="h-5 w-5" />
                            </Button>
                        </div>
                    </div>
                    <form
                        onSubmit={handleFormSubmit}
                        className="relative w-full rounded-xl border bg-card/80 backdrop-blur-sm p-2 shadow-lg focus-within:border-primary flex items-center gap-2"
                    >
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button type="button" size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0" disabled={isInputDisabled}>
                                    <Paperclip className="h-5 w-5" />
                                    <span className="sr-only">Attach file</span>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={handleOpenImageDialog}>Image</DropdownMenuItem>
                                <DropdownMenuItem onSelect={handleOpenFileDialog}>Text File</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        <Input
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Message SearnAI..."
                            disabled={isInputDisabled}
                            className="h-10 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
                        />
                        <input type="file" ref={fileInputRef} className="hidden" />
                        <div className="flex items-center gap-1">
                            <Button type="button" size="icon" variant={isRecording ? "destructive" : "ghost"} className="h-9 w-9 flex-shrink-0" onClick={handleToggleRecording} disabled={isInputDisabled}>
                                {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                                <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                            </Button>
                            <Button type="submit" size="icon" className="h-9 w-9 flex-shrink-0" disabled={isInputDisabled || (!input.trim() && !imageDataUri && !fileContent)}>
                                <Send className="h-5 w-5" />
                                <span className="sr-only">Send</span>
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="flex h-full flex-col">
      <LimitExhaustedDialog isOpen={showLimitDialog} onOpenChange={setShowLimitDialog} />
      <ShareDialog
        isOpen={!!shareContent}
        onOpenChange={(open) => !open && setShareContent(null)}
        content={shareContent || ""}
      />
      <ScrollArea className="flex-1" ref={scrollAreaRef}>
          <div className="mx-auto w-full max-w-3xl space-y-8 p-4 pb-32">
              {history.map((message, index) => (
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
                            {message.content.image && (
                              <Image src={message.content.image} alt="User upload" width={200} height={200} className="rounded-md mb-2" />
                            )}
                            <p className="text-base whitespace-pre-wrap">{message.content.text}</p>
                          </div>
                          <Avatar className="h-9 w-9 border">
                            <AvatarFallback><User className="size-5" /></AvatarFallback>
                          </Avatar>
                        </div>
                      ) : (
                        <div className={cn("group w-full flex items-start gap-4")}>
                          <div className="w-full">
                            {renderMessageContent(message)}
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
                              <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleCopyToClipboard(message.content.text)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleShare(message.content.text)}>
                                <Share2 className="h-4 w-4" />
                              </Button>
                              <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={() => handleTextToSpeech(message.content.text, message.id)}>
                                {isSynthesizing === message.id ? <StopCircle className="h-4 w-4 text-red-500" /> : <Volume2 className="h-4 w-4" />}
                              </Button>
                              <Button type="button" size="icon" variant="ghost" className="h-7 w-7" onClick={handleRegenerateResponse} disabled={isTyping}>
                                <RefreshCw className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                    {index < history.length - 1 && (
                      <Separator className="my-8" />
                    )}
                  </React.Fragment>
                )
              )}
            {isTyping && (
              <div className="mt-4">
                <ThinkingIndicator />
              </div>
            )}
          </div>
        </ScrollArea>

       <div className="fixed bottom-0 left-0 lg:left-[16rem] right-0 w-auto lg:w-[calc(100%-16rem)] group-data-[collapsible=icon]:lg:left-[3rem] group-data-[collapsible=icon]:lg:w-[calc(100%-3rem)] transition-all">
        <div className="p-4 mx-auto max-w-3xl">
          {imageDataUri && (
            <div className="relative mb-2 w-fit">
              <Image src={imageDataUri} alt="Image preview" width={80} height={80} className="rounded-md border object-cover" />
              {isOcrProcessing && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/60 rounded-md">
                    <p className="text-primary font-bold text-base drop-shadow-md">{Math.round(ocrProgress)}%</p>
                </div>
              )}
              <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10" onClick={() => setImageDataUri(null)} disabled={isOcrProcessing}>
                  <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {fileContent && fileName && !isOcrProcessing && (
            <div className="relative mb-2 flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md border">
              <FileText className="h-4 w-4" />
              <span className="flex-1 truncate">{fileName}</span>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => { setFileContent(null); setFileName(null); }}>
                  <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          <div className="flex justify-start mb-2 items-center gap-2">
            <div className="bg-muted/50 p-1 rounded-lg w-fit">
                <ModelSwitcher selectedModel={currentModel} onModelChange={setCurrentModel} disabled={isInputDisabled} />
            </div>
            <div className="bg-muted/50 p-1 rounded-lg w-fit flex gap-2">
                <Button 
                    variant={activeButton === 'agent' ? 'default' : 'outline'}
                    onClick={() => handleToolButtonClick('agent')}
                    className="gap-2"
                >
                    <Bot className="h-5 w-5" />
                    Agent
                </Button>
                <Button 
                    variant={activeButton === 'deepthink' ? 'default' : 'outline'}
                    onClick={() => handleToolButtonClick('deepthink')}
                >
                    DeepThink
                </Button>
                <Button type="button" variant={activeButton === 'music' ? 'default' : 'outline'} disabled={isInputDisabled} onClick={() => handleToolButtonClick('music')}>
                    <Music className="h-5 w-5" />
                </Button>
                <Button type="button" variant={activeButton === 'search' ? 'default' : 'outline'} disabled={isInputDisabled} onClick={() => handleToolButtonClick('search')}>
                    <Search className="h-5 w-5" />
                </Button>
            </div>
          </div>
          <form
              onSubmit={handleFormSubmit}
              className="relative flex items-center rounded-xl border bg-card/80 backdrop-blur-sm p-2 shadow-lg focus-within:border-primary"
          >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button type="button" size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0" disabled={isInputDisabled}>
                      <Paperclip className="h-5 w-5" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                    <DropdownMenuItem onSelect={handleOpenImageDialog}>Image</DropdownMenuItem>
                    <DropdownMenuItem onSelect={handleOpenFileDialog}>Text File</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={isOcrProcessing ? "Processing image..." : "Message SearnAI..."}
                disabled={isInputDisabled}
                className="h-10 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              />
              <input type="file" ref={fileInputRef} className="hidden" />
              <div className="flex items-center gap-1">
                <Button type="button" size="icon" variant={isRecording ? "destructive" : "ghost"} className="h-9 w-9 flex-shrink-0" onClick={handleToggleRecording} disabled={isInputDisabled}>
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                </Button>
                <Button type="submit" size="icon" className="h-9 w-9 flex-shrink-0" disabled={isInputDisabled || (!input.trim() && !imageDataUri && !fileContent)}>
                    <Send className="h-5 w-5" />
                    <span className="sr-only">Send</span>
                </Button>
              </div>
          </form>
        </div>
      </div>
    </div>
  );
}

    

    



















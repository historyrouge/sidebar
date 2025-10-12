

"use client";

import { chatAction, generateImageAction } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Share2, Volume2, RefreshCw, FileText, X, Edit, Save, Download, StopCircle, Paperclip, Mic, MicOff, Send, Layers, Plus, Search, ArrowUp, Wand2, Music, Youtube, MoreVertical, Play, Pause, Rewind, FastForward, Presentation, Video, Image as ImageIcon, ChevronDown, Globe } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import remarkGfm from 'remark-gfm';
import 'katex/dist/katex.min.css';
import { ShareDialog } from "./share-dialog";
import Image from "next/image";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import Link from "next/link";
import { LimitExhaustedDialog } from "./limit-exhausted-dialog";
import { useRouter } from "next/navigation";
import { Separator } from "./ui/separator";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Progress } from "./ui/progress";
import Tesseract from 'tesseract.js';
import { ModelSwitcher } from "./model-switcher";
import { create } from 'zustand';
import { YoutubeChatCard } from "./youtube-chat-card";
import { WebsiteChatCard } from "./website-chat-card";
import { textToSpeechAction } from "@/app/actions";
import { CoreMessage } from "ai";
import { DEFAULT_MODEL_ID, AVAILABLE_MODELS } from "@/lib/models";
import { GeneratedImageCard } from "./generated-image-card";
import { ThinkingIndicator } from "./thinking-indicator";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { BrowserView } from "./browser-view";
import { motion } from "framer-motion";

type Message = {
  id: string;
  role: "user" | "model" | "tool";
  content: string;
  image?: string | null;
  duration?: number;
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
  const [generationTime, setGenerationTime] = useState<number | null>(null);

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

  const [currentModel, setCurrentModel] = useState(DEFAULT_MODEL_ID);
  const [activeButton, setActiveButton] = useState<'deepthink' | 'music' | 'image' | null>(null);
  const [activeInlineBrowserUrl, setActiveInlineBrowserUrl] = useState<string | null>(null);

  const { setActiveVideoId } = useChatStore();

  const addMessageToHistory = (message: Message) => {
    setHistory(prev => [...prev, message]);
  }


  const handleToolButtonClick = (tool: 'deepthink' | 'music' | 'image') => {
      const newActiveButton = activeButton === tool ? null : tool;
      setActiveButton(newActiveButton);

      if (newActiveButton === 'deepthink') {
        setCurrentModel('gemini-2.5-pro');
        toast({ title: 'Model Switched', description: 'DeepThink activated: Using Gemini 2.5 Pro for complex reasoning.' });
      } else if (newActiveButton === 'music') {
        toast({ title: 'Music Mode Activated', description: 'Search for a song to play it from YouTube.' });
      } else if (newActiveButton === 'image') {
        toast({ title: 'Image Mode Activated', description: 'Type a prompt to generate an image.' });
      } else {
        // Revert to default model if no special mode is active
        if (currentModel === 'gemini-2.5-pro' && newActiveButton !== 'deepthink') {
             setCurrentModel(DEFAULT_MODEL_ID);
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
          const result = await textToSpeechAction({ text });
          if(result.error) throw new Error(result.error);
          if(result.data?.audioDataUri) {
            setAudioDataUri(result.data.audioDataUri);
          }
      } catch (e: any) {
          toast({ title: 'Audio Generation Failed', description: e.message, variant: 'destructive' });
          setIsSynthesizing(null);
      }
  }, [isSynthesizing, toast]);

  const executeChat = useCallback(async (
    currentHistory: Message[],
    currentImageDataUri?: string | null,
    currentFileContent?: string | null
  ): Promise<void> => {
      setIsTyping(true);
      const startTime = Date.now();
      
      const genkitHistory: CoreMessage[] = currentHistory.map(h => ({
        role: h.role,
        content: String(h.content),
      }));

      const result = await chatAction({ 
          history: genkitHistory, 
          fileContent: currentFileContent, 
          imageDataUri: currentImageDataUri,
          model: currentModel,
          isMusicMode: activeButton === 'music',
      });

      const endTime = Date.now();
      const duration = (endTime - startTime) / 1000;
      setGenerationTime(duration);
      setIsTyping(false);

      if (result.error) {
          toast({ title: "Chat Error", description: result.error, variant: 'destructive' });
      } else if (result.data) {
          const modelMessageId = `${Date.now()}-model`;
          setHistory(prev => [...prev, { id: modelMessageId, role: "model", content: result.data.response, duration: duration }]);
      }
      
  }, [currentModel, activeButton, toast]);


  const handleSendMessage = useCallback(async (messageContent?: string) => {
    const messageToSend = messageContent ?? input;
    if (!messageToSend.trim() && !imageDataUri && !fileContent) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }
    const messageId = `${Date.now()}`;
    const userMessage: Message = { id: messageId, role: "user", content: messageToSend, image: imageDataUri };
    const newHistory = [...history, userMessage];
    setHistory(newHistory);
    setInput("");
    setActiveInlineBrowserUrl(null); // Close any open inline browser

    const isImageGenRequest = activeButton === 'image';

    if (isImageGenRequest) {
        setIsTyping(true);
        const startTime = Date.now();
        const prompt = messageToSend.trim();
        const result = await generateImageAction({ prompt });
        const endTime = Date.now();
        setGenerationTime((endTime - startTime) / 1000);
        setIsTyping(false);
        if (result.error) {
            toast({ title: "Image Generation Error", description: result.error, variant: 'destructive' });
        } else if (result.data) {
            const imagePayload = {
                type: 'image',
                imageDataUri: result.data.imageDataUri,
                prompt: prompt
            };
            const modelMessageId = `${Date.now()}-model`;
            setHistory(prev => [...prev, { id: modelMessageId, role: "model", content: JSON.stringify(imagePayload) }]);
        }
    } else {
        await executeChat(newHistory, imageDataUri, fileContent);
    }
    
    if (activeButton) {
        setActiveButton(null);
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isRecording, history, executeChat, imageDataUri, fileContent, activeButton]);

  const handleRegenerateResponse = async () => {
      const lastUserMessageIndex = history.findLastIndex(m => m.role === 'user');
      if (lastUserMessageIndex === -1) return;

      const historyForRegen = history.slice(0, lastUserMessageIndex + 1);
      setHistory(historyForRegen);
      setActiveInlineBrowserUrl(null);
      
      const lastUserMessage = historyForRegen[lastUserMessageIndex];
      await executeChat(historyForRegen, lastUserMessage.image, fileContent);
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
                handleSendMessage(finalTranscript);
           }, 1000);
        }
      };
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
  }, [history, activeInlineBrowserUrl]);
  
  const showWelcome = history.length === 0 && !isTyping;
  const isInputDisabled = isTyping || isOcrProcessing;

  const renderMessageContent = (message: Message) => {
    const thinkMatch = message.content.match(/<think>([\s\S]*?)<\/think>/);
    const thinkingText = thinkMatch ? thinkMatch[1].trim() : null;
    let mainContent = thinkMatch ? message.content.replace(/<think>[\s\S]*?<\/think>/, '').trim() : message.content;
    
    try {
        const data = JSON.parse(mainContent);
        if (data.type === 'youtube' && data.videoId) {
            return <YoutubeChatCard videoData={data} onPin={() => setActiveVideoId(data.videoId, data.title)} />;
        }
        if (data.type === 'website_results' && Array.isArray(data.results)) {
            return (
                <div className="space-y-3">
                    {data.results.map((result: any, index: number) => (
                        <WebsiteChatCard key={index} websiteData={result} onWebViewToggle={setActiveInlineBrowserUrl} />
                    ))}
                </div>
            );
        }
        if (data.type === 'image' && data.imageDataUri) {
            return <GeneratedImageCard imageDataUri={data.imageDataUri} prompt={data.prompt} />;
        }
    } catch (e) {
        // Not a JSON object, so render as plain text
    }
    
    // Fallback for single website result for backward compatibility
    try {
        const data = JSON.parse(mainContent);
        if (data.type === 'website' && data.url) {
            mainContent = `I found this website for you: [${data.title || data.url}](${data.url})`;
        }
    } catch (e) {
        // Not a JSON object
    }

    const responseHeaderMatch = mainContent.match(/\*\*Response from (.*?)\*\*\\n\\n/);
    if (responseHeaderMatch) {
      const modelName = responseHeaderMatch[1];
      const restOfContent = mainContent.substring(responseHeaderMatch[0].length);
      return (
        <>
          <div className="model-response-header">
            <strong>Response from {modelName}</strong>
          </div>
          {thinkingText && <ThinkingIndicator text={thinkingText} duration={message.duration} />}
          <ReactMarkdown
            remarkPlugins={[remarkMath, remarkGfm]}
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
                table: ({node, ...props}) => <table className="table-auto w-full my-4" {...props} />,
                thead: ({node, ...props}) => <thead className="bg-muted/50" {...props} />,
                tbody: ({node, ...props}) => <tbody {...props} />,
                tr: ({node, ...props}) => <tr className="border-b border-border" {...props} />,
                th: ({node, ...props}) => <th className="p-2 text-left font-semibold" {...props} />,
                td: ({node, ...props}) => <td className="p-2" {...props} />,
            }}
          >
            {restOfContent}
          </ReactMarkdown>
        </>
      )
    }

    return (
        <>
            {thinkingText && <ThinkingIndicator text={thinkingText} duration={message.duration} />}
            <ReactMarkdown
                remarkPlugins={[remarkMath, remarkGfm]}
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
                    table: ({node, ...props}) => <table className="table-auto w-full my-4" {...props} />,
                    thead: ({node, ...props}) => <thead className="bg-muted/50" {...props} />,
                    tbody: ({node, ...props}) => <tbody {...props} />,
                    tr: ({node, ...props}) => <tr className="border-b border-border" {...props} />,
                    th: ({node, ...props}) => <th className="p-2 text-left font-semibold" {...props} />,
                    td: ({node, ...props}) => <td className="p-2" {...props} />,
                }}
            >
                {mainContent}
            </ReactMarkdown>
        </>
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
                    <Button variant="outline" className="rounded-full" onClick={() => handleSendMessage('News')}>News</Button>
                </div>
                 <div className="w-full max-w-3xl">
                     <div className="flex justify-start mb-2 items-center gap-2">
                        <div className="bg-muted/50 p-1 rounded-lg w-fit">
                            <ModelSwitcher selectedModel={currentModel} onModelChange={setCurrentModel} disabled={isInputDisabled} />
                        </div>
                        <div className="bg-muted/50 p-1 rounded-lg w-fit flex gap-2">
                            <Button 
                                variant={activeButton === 'deepthink' ? 'default' : 'outline'}
                                onClick={() => handleToolButtonClick('deepthink')}
                            >
                                DeepThink
                            </Button>
                            <Button type="button" variant={activeButton === 'music' ? 'default' : 'outline'} disabled={isInputDisabled} onClick={() => handleToolButtonClick('music')}>
                                <Music className="h-5 w-5" />
                            </Button>
                             <Button type="button" variant={activeButton === 'image' ? 'default' : 'outline'} disabled={isInputDisabled} onClick={() => handleToolButtonClick('image')}>
                                <ImageIcon className="h-5 w-5" />
                            </Button>
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Button type="button" variant='outline' disabled={isInputDisabled}>
                                        <Globe className="h-5 w-5" />
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
                                    <DialogHeader className="p-4 border-b">
                                        <DialogTitle>Browser</DialogTitle>
                                    </DialogHeader>
                                    <div className="flex-1 overflow-hidden">
                                        <BrowserView initialUrl="https://www.google.com/webhp?igu=1" />
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                    <form
                        onSubmit={handleFormSubmit}
                        className="relative w-full rounded-xl border border-border/10 bg-card/5 backdrop-blur-lg p-2 shadow-lg focus-within:border-primary flex items-center gap-2"
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

                        <Button type="button" size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0" onClick={() => setInput("Search: ")} disabled={isInputDisabled}>
                            <Search className="h-5 w-5" />
                            <span className="sr-only">Search</span>
                        </Button>

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
       {activeInlineBrowserUrl ? (
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="h-[90vh] flex flex-col border rounded-2xl bg-card overflow-hidden m-4"
              >
                <div className="flex items-center justify-between p-2 border-b">
                    <p className="text-sm font-semibold truncate ml-2">Inline Browser</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setActiveInlineBrowserUrl(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1">
                    <BrowserView initialUrl={activeInlineBrowserUrl} />
                </div>
            </motion.div>
        ) : (
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
                                {message.image && (
                                  <Image src={message.image} alt="User upload" width={200} height={200} className="rounded-md mb-2" />
                                )}
                                <p className="text-base whitespace-pre-wrap">{message.content}</p>
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
                {isTyping && <ThinkingIndicator text={null} duration={generationTime} />}
              </div>
            </ScrollArea>
        )}

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
                    variant={activeButton === 'deepthink' ? 'default' : 'outline'}
                    onClick={() => handleToolButtonClick('deepthink')}
                >
                    DeepThink
                </Button>
                <Button type="button" variant={activeButton === 'music' ? 'default' : 'outline'} disabled={isInputDisabled} onClick={() => handleToolButtonClick('music')}>
                    <Music className="h-5 w-5" />
                </Button>
                 <Button type="button" variant={activeButton === 'image' ? 'default' : 'outline'} disabled={isInputDisabled} onClick={() => handleToolButtonClick('image')}>
                    <ImageIcon className="h-5 w-5" />
                </Button>
                <Dialog>
                    <DialogTrigger asChild>
                        <Button type="button" variant='outline' disabled={isInputDisabled}>
                            <Globe className="h-5 w-5" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-5xl h-[90vh] flex flex-col p-0 gap-0">
                        <DialogHeader className="p-4 border-b">
                            <DialogTitle>Browser</DialogTitle>
                        </DialogHeader>
                        <div className="flex-1 overflow-hidden">
                            <BrowserView initialUrl="https://www.google.com/webhp?igu=1" />
                        </div>
                    </DialogContent>
                </Dialog>
            </div>
          </div>
          <form
              onSubmit={handleFormSubmit}
              className="relative flex items-center rounded-xl border border-border/10 bg-card/5 backdrop-blur-lg p-2 shadow-lg focus-within:border-primary"
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

              <Button type="button" size="icon" variant="ghost" className="h-9 w-9 flex-shrink-0" onClick={() => setInput("Search: ")} disabled={isInputDisabled}>
                  <Search className="h-5 w-5" />
                  <span className="sr-only">Search</span>
              </Button>

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
  );
}

    

    


"use client";

import { chatAction, generateImageAction } from "@/app/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { Bot, User, Copy, Share2, Volume2, RefreshCw, FileText, X, Edit, Save, Download, StopCircle, Paperclip, Mic, MicOff, Send, Layers, Plus, Search, ArrowUp, Wand2, Music, Youtube, MoreVertical, Play, Pause, Rewind, FastForward, Presentation, Video, Image as ImageIcon, ChevronDown, Globe, FileUp, FileAudio, File as FileIcon } from "lucide-react";
import React, { useState, useRef, useEffect, useCallback } from "react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
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
import * as pdfjs from 'pdfjs-dist';
import wav from 'wav';
import { Buffer } from 'buffer';
import { useAuth } from "@/hooks/use-auth";
import remarkGfm from "remark-gfm";


// Required for pdf.js to work
if (typeof window !== 'undefined') {
  pdfjs.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.mjs`;
}

type Message = {
  id: string;
  role: "user" | "model" | "tool" | "browser";
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


// Helper to decode audio
class AudioDecoder {
    static async decode(file: File): Promise<Float32Array> {
        const arrayBuffer = await file.arrayBuffer();
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const decodedAudio = await audioContext.decodeAudioData(arrayBuffer);
        return decodedAudio.getChannelData(0);
    }
}


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
  const { user } = useAuth();
  
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

  const { setActiveVideoId } = useChatStore();

  const addMessageToHistory = (message: Message) => {
    setHistory(prev => [...prev, message]);
  }


  const handleToolButtonClick = (tool: 'deepthink' | 'music' | 'image') => {
      const newActiveButton = activeButton === tool ? null : tool;
      setActiveButton(newActiveButton);

      if (newActiveButton === 'deepthink') {
        setCurrentModel('gpt-oss-120b');
        toast({ title: 'Model Switched', description: 'DeepThink activated: Using Gemini 2.5 Pro for complex reasoning.' });
      } else if (newActiveButton === 'music') {
        toast({ title: 'Music Mode Activated', description: 'Search for a song to play it from YouTube.' });
      } else if (newActiveButton === 'image') {
        toast({ title: 'Image Mode Activated', description: 'Type a prompt to generate an image.' });
      } else {
        // Revert to default model if no special mode is active
        if (currentModel === 'gpt-oss-120b' && newActiveButton !== 'deepthink') {
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
        role: h.role as 'user' | 'model' | 'tool',
        content: String(h.content),
      }));

      try {
        const result = await chatAction({ 
            history: genkitHistory, 
            userName: user?.displayName,
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
            toast({ title: "Chat Error", description: result.error, variant: "destructive" });
        } else if (result.data) {
            const modelMessageId = `${Date.now()}-model`;
            setHistory(prev => [...prev, { id: modelMessageId, role: "model", content: result.data.response, duration: duration }]);
        }
      } catch (error: any) {
          if (error.name === 'AbortError') {
              toast({ title: 'Generation Stopped', description: 'You have stopped the AI response.' });
          } else {
              toast({ title: "Chat Error", description: error.message, variant: "destructive" });
          }
      } finally {
        setIsTyping(false);
      }
      
  }, [currentModel, activeButton, toast, user]);


  const handleSendMessage = useCallback(async (messageContent?: string, currentHistory?: Message[]) => {
    const messageToSend = messageContent ?? input;
    if (!messageToSend.trim() && !imageDataUri && !fileContent) return;

    if (isRecording) {
      recognitionRef.current?.stop();
    }
    const messageId = `${Date.now()}`;
    const formattedContent = `${messageToSend}`;
    const userMessage: Message = { id: messageId, role: "user", content: formattedContent, image: imageDataUri };
    
    // Use provided history or the component's state
    const historyToUse = currentHistory || history;
    // Filter out any existing browser views before adding new message
    const newHistory = [...historyToUse.filter(m => m.role !== 'browser'), userMessage];

    setHistory(newHistory);
    setInput("");

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
            toast({ title: "Image Generation Error", description: result.error, variant: "destructive" });
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
    
    // Reset file/image context after sending the message
    setImageDataUri(null);
    setFileContent(null);
    setFileName(null);
    
    if (activeButton) {
        setActiveButton(null);
    }
    
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input, isRecording, history, executeChat, imageDataUri, fileContent, activeButton]);
  
  const handleStopGeneration = () => {
    // This is now a no-op as the abort controller has been removed.
    // Kept for potential future re-implementation.
  };

  const handleRegenerateResponse = async () => {
      const lastUserMessageIndex = history.findLastIndex(m => m.role === 'user');
      if (lastUserMessageIndex === -1) return;

      const historyForRegen = history.slice(0, lastUserMessageIndex + 1);
      setHistory(historyForRegen);
      
      const lastUserMessage = historyForRegen[lastUserMessageIndex];
      // When regenerating, we must pass the same context as the original message
      await executeChat(historyForRegen, lastUserMessage.image, fileContent);
  };


  const handleCopyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied!", description: "The response has been copied to clipboard." });
  };
  
  const handleShare = (text: string) => {
    setShareContent(text);
  };

  const handleBrowserToggle = (url: string | null) => {
    setHistory(prev => {
        // Remove any existing browser views first to only have one at a time.
        const filtered = prev.filter(m => m.role !== 'browser');
        if (url) {
            return [...filtered, { id: `browser-${Date.now()}`, role: 'browser', content: url }];
        }
        return filtered;
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
                setHistory(currentHistory => {
                    handleSendMessage(finalTranscript, currentHistory);
                    return currentHistory;
                });
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
  }, [handleSendMessage, toast]); 
  
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
                    toast({ title: "Text File Attached", description: "The content is ready to be sent with your next message." });
                };
                reader.readAsText(file);
            } else if (file.type.startsWith("audio/")) {
                handleAudioFileChange(file);
            } else if (file.type === "application/pdf") {
                handlePdfFileChange(file);
            } else {
                toast({ title: "Invalid file type", description: "Please upload a .txt, audio, or .pdf file.", variant: "destructive" });
            }
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handlePdfFileChange = async (file: File) => {
        setIsOcrProcessing(true); // Re-use OCR state for PDF processing
        setOcrProgress(0);
        setFileName(file.name);
        setImageDataUri(null);
        try {
            const arrayBuffer = await file.arrayBuffer();
            const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
            let fullText = '';
            for (let i = 1; i <= pdf.numPages; i++) {
                setOcrProgress(Math.round((i / pdf.numPages) * 100));
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map((item: any) => item.str).join(' ');
                fullText += pageText + '\n\n';
            }
            setFileContent(fullText);
            toast({ title: "PDF Processed", description: "Text extracted. Ready to send with your next message." });
        } catch (e: any) {
            toast({ title: "PDF Processing Failed", description: e.message || 'Could not extract text.', variant: "destructive" });
            setFileContent(null);
            setFileName(null);
        } finally {
            setIsOcrProcessing(false);
        }
    }

    const handleAudioFileChange = async (file: File) => {
        setIsOcrProcessing(true);
        setOcrProgress(0);
        setFileName(file.name);
        setImageDataUri(null);
        toast({ title: "Transcribing Audio...", description: "This may take a moment." });

        try {
            const { pipeline } = await import('@xenova/transformers');
            const transcriber = await pipeline('automatic-speech-recognition', 'Xenova/whisper-tiny.en');
            
            const audio = await AudioDecoder.decode(file);
            
            const transcript = await transcriber(audio, {
                chunk_length_s: 30,
                stride_length_s: 5,
                callback_function: (beams: any[]) => {
                    const progress = beams[0].progress;
                    if(progress > ocrProgress) setOcrProgress(Math.round(progress));
                },
            });

            setFileContent((transcript as any).text);
            toast({ title: "Audio Transcribed!", description: "The extracted text will be sent with your next message." });
            
        } catch (error) {
            console.error("Audio transcription error:", error);
            toast({ title: "Audio Transcription Failed", description: "Could not process the audio file. This may be due to a network issue.", variant: "destructive" });
            setFileContent(null);
            setFileName(null);
        } finally {
            setIsOcrProcessing(false);
        }
    };

    const resizeImage = (file: File, maxSize: number): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = document.createElement("img");
                img.onload = () => {
                    let { width, height } = img;
                    if (width > height) {
                        if (width > maxSize) {
                            height *= maxSize / width;
                            width = maxSize;
                        }
                    } else {
                        if (height > maxSize) {
                            width *= maxSize / height;
                            height = maxSize;
                        }
                    }
                    const canvas = document.createElement("canvas");
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    if (!ctx) return reject(new Error("Could not get canvas context"));
                    ctx.drawImage(img, 0, 0, width, height);
                    resolve(canvas.toDataURL("image/jpeg"));
                };
                img.onerror = reject;
                img.src = event.target?.result as string;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
        toast({ title: "Invalid file type", description: "Please upload an image file.", variant: "destructive" });
        return;
    }

    setIsOcrProcessing(true);
    setOcrProgress(0);

    try {
        const resizedDataUri = await resizeImage(file, 2000);
        setImageDataUri(resizedDataUri);
        setFileContent(null);
        setFileName(file.name);

        const { data: { text } } = await Tesseract.recognize(
            resizedDataUri,
            'eng',
            { 
                logger: m => {
                    if (m.status === 'recognizing text') {
                        setOcrProgress(Math.round(m.progress * 100));
                    }
                }
            }
        );
        setFileContent(text);
        toast({
            title: "Image & Text Attached",
            description: `Text has been extracted. You can now ask questions.`,
        });

    } catch (error: any) {
        toast({ title: "OCR or Image processing Failed", description: error.message || "Could not extract text from the image.", variant: "destructive" });
        setFileContent(null);
        setImageDataUri(null);
        setFileName(null);
    } finally {
        setIsOcrProcessing(false);
    }

    if (fileInputRef.current) fileInputRef.current.value = "";
  };


  const handleOpenFileDialog = (type: 'text' | 'pdf' | 'audio') => {
    if (fileInputRef.current) {
        if (type === 'text') fileInputRef.current.accept = ".txt";
        else if (type === 'pdf') fileInputRef.current.accept = ".pdf";
        else if (type === 'audio') fileInputRef.current.accept = "audio/*";
        
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
    if (isTyping) {
        handleStopGeneration();
    } else {
        handleSendMessage();
    }
  };

  useEffect(() => {
    const viewport = scrollAreaRef.current?.querySelector('div[data-radix-scroll-area-viewport]');
    if (viewport) {
        viewport.scrollTo({ top: viewport.scrollHeight, behavior: 'smooth' });
    }
  }, [history, isTyping]);
  
  const showWelcome = history.length === 0 && !isTyping;
  const isInputDisabled = isOcrProcessing;

  const renderMessageContent = (message: Message) => {
    if (message.role === 'browser') {
        return (
             <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="h-[60vh] flex flex-col border rounded-2xl bg-card overflow-hidden my-4"
              >
                <div className="flex items-center justify-between p-2 border-b">
                    <p className="text-sm font-semibold truncate ml-2">Inline Browser</p>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleBrowserToggle(null)}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
                <div className="flex-1">
                    <BrowserView initialUrl={message.content} />
                </div>
            </motion.div>
        )
    }

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
                    <p className="text-sm">I searched the entire internet and found these results:</p>
                    {data.results.map((result: any, index: number) => (
                        <WebsiteChatCard key={index} websiteData={result} onBrowserToggle={handleBrowserToggle} />
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

    const responseHeaderMatch = mainContent.match(/\*\*Response from (.*?)\*\*\n\n/);
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

  const ChatBar = () => (
     <div className="fixed bottom-0 left-0 lg:left-[16rem] right-0 w-auto lg:w-[calc(100%-16rem)] group-data-[collapsible=icon]:lg:left-[3rem] group-data-[collapsible=icon]:lg:w-[calc(100%-3rem)] transition-all bg-transparent">
        <div className="p-4 mx-auto w-full max-w-3xl">
          <div className="bg-background/80 backdrop-blur-md p-2 rounded-2xl flex items-center justify-center gap-2 mb-3 border">
              <div className="bg-muted p-1 rounded-lg">
                <ModelSwitcher 
                    selectedModel={currentModel} 
                    onModelChange={setCurrentModel} 
                    disabled={!!activeButton}
                />
              </div>
              <Button 
                variant={activeButton === 'deepthink' ? 'secondary' : 'outline'} 
                size="sm" 
                className="rounded-full gap-2"
                onClick={() => handleToolButtonClick('deepthink')}
              >
                  <Wand2 className="h-4 w-4" /> DeepThink
              </Button>
               <Button 
                variant={activeButton === 'music' ? 'secondary' : 'outline'} 
                size="sm" 
                className="rounded-full gap-2"
                onClick={() => handleToolButtonClick('music')}
              >
                  <Music className="h-4 w-4" /> Music
              </Button>
               <Button 
                variant={activeButton === 'image' ? 'secondary' : 'outline'} 
                size="sm" 
                className="rounded-full gap-2"
                onClick={() => handleToolButtonClick('image')}
              >
                  <ImageIcon className="h-4 w-4" /> Image
              </Button>
          </div>
          {(imageDataUri || (fileContent && fileName)) && (
             <div className="relative mb-2 w-fit mx-auto max-w-3xl">
                {isOcrProcessing && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 rounded-md z-10">
                        <p className="text-white font-bold text-sm drop-shadow-md">{Math.round(ocrProgress)}%</p>
                        <Progress value={ocrProgress} className="w-16 h-1 mt-1"/>
                    </div>
                )}
                {imageDataUri && <Image src={imageDataUri || ""} alt={fileName || "Image preview"} width={80} height={80} className="rounded-md border object-cover" />}
                {fileContent && fileName && !imageDataUri && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-2 rounded-md border w-full max-w-sm">
                        {fileName.endsWith('.pdf') ? <FileIcon className="h-5 w-5 flex-shrink-0" /> : <FileText className="h-5 w-5 flex-shrink-0" />}
                        <span className="flex-1 truncate">{fileName}</span>
                    </div>
                )}
                 <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full z-10" onClick={() => { setImageDataUri(null); setFileContent(null); setFileName(null); }} disabled={isOcrProcessing}>
                    <X className="h-4 w-4" />
                </Button>
            </div>
          )}
           <form
              onSubmit={handleFormSubmit}
              className="relative flex items-center"
          >
             <div className="relative flex items-center p-2 rounded-2xl bg-background border w-full">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button type="button" size="icon" variant="ghost" className="chat-icon-button" disabled={isOcrProcessing}>
                            <Plus className="h-5 w-5" />
                            <span className="sr-only">Attach file</span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                        <DropdownMenuItem onSelect={handleOpenImageDialog}><ImageIcon className="mr-2 h-4 w-4" />Image</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenFileDialog('text')}><FileText className="mr-2 h-4 w-4" />Text File</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenFileDialog('pdf')}><FileIcon className="mr-2 h-4 w-4" />PDF File</DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleOpenFileDialog('audio')}><FileAudio className="mr-2 h-4 w-4" />Audio File</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                <Textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Message SearnAI..."
                    disabled={isOcrProcessing}
                    className="chat-textarea h-6 max-h-48 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0 resize-none"
                    rows={1}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage();
                        }
                    }}
                />
                <input type="file" ref={fileInputRef} className="hidden" />
                 <Button type="button" size="icon" variant={isRecording ? "destructive" : "ghost"} className="chat-icon-button" onClick={handleToggleRecording} disabled={isOcrProcessing}>
                    {isRecording ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
                    <span className="sr-only">{isRecording ? "Stop recording" : "Start recording"}</span>
                </Button>
                <Button 
                    type="submit" 
                    size="icon" 
                    className="h-9 w-9 rounded-full send-button text-primary-foreground bg-primary hover:bg-primary/90 ml-2" 
                    disabled={isOcrProcessing || (!isTyping && !input.trim() && !imageDataUri && !fileContent)}
                >
                    {isTyping ? <StopCircle className="h-5 w-5" /> : <Send className="h-5 w-5" />}
                    <span className="sr-only">{isTyping ? 'Stop' : 'Send'}</span>
                </Button>
            </div>
          </form>
        </div>
      </div>
  );

  return (
    <div className="flex h-full flex-col">
      <LimitExhaustedDialog isOpen={showLimitDialog} onOpenChange={setShowLimitDialog} />
      <ShareDialog
        isOpen={!!shareContent}
        onOpenChange={(open) => !open && setShareContent(null)}
        content={shareContent || ""}
      />
      {showWelcome ? (
          <div className="flex h-full flex-col justify-start pt-20 p-4">
             <div className="w-full max-w-3xl mx-auto flex flex-col items-start gap-8">
                <h1 className="text-4xl font-bold">SearnAI</h1>
                <div className="space-y-4">
                    <h2 className="text-4xl font-light text-muted-foreground">Hi {user?.displayName?.split(' ')[0] || 'there'},</h2>
                    <h2 className="text-4xl font-bold">Where should we start?</h2>
                </div>
                 <div className="flex flex-col items-start gap-3">
                    <Button variant="outline" className="rounded-full" onClick={() => router.push('/image-generation')}>
                        <span className="mr-2">🍌</span> Create image
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => router.push('/ai-editor')}>
                        Write anything
                    </Button>
                    <Button variant="outline" className="rounded-full" onClick={() => setInput('Help me build an idea for a new project')}>
                        Build an idea
                    </Button>
                </div>
            </div>
        </div>
      ) : (
        <ScrollArea className="flex-1" ref={scrollAreaRef}>
            <div className="mx-auto w-full max-w-3xl space-y-8 px-4 pb-48">
                {history.map((message, index) => (
                    <React.Fragment key={`${message.id}-${index}`}>
                      <div
                        className={cn(
                          "flex w-full items-start gap-4",
                          message.role === "user" ? "justify-end" : "justify-start"
                        )}
                      >
                        {message.role === "user" ? (
                          <div className="flex items-start gap-4 justify-end">
                             <div className="border bg-transparent inline-block rounded-xl p-3 max-w-md">
                               <p className="text-sm">{message.content}</p>
                            </div>
                          </div>
                        ) : (
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
                            {message.role === 'model' && message.role !== 'browser' && (
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
                            )}
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

      <ChatBar />
    </div>
  );
}

    

"use client";

import { Button } from "@/components/ui/button";
import { FileEdit, Moon, Sun, X, MoreVertical, Play, Pause, Rewind, FastForward } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { ChatContent, useChatStore } from "./chat-content";
import { SidebarTrigger } from "./ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";


export function MainDashboard() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { activeVideoId, activeVideoTitle, setActiveVideoId, isPlaying, togglePlay } = useChatStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const handleNewChat = () => {
    try {
        localStorage.removeItem('chatHistory');
        sessionStorage.removeItem('chatScrollPosition');
        window.location.reload();
    } catch (e) {
        console.error("Could not clear storage", e);
    }
  };

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  const handleCopyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Copied!", description: "Video URL copied to clipboard." });
  };
  
  const postPlayerMessage = (command: 'playVideo' | 'pauseVideo') => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: command, args: '' }),
      'https://www.youtube.com'
    );
  };

  const handlePlayPause = () => {
    togglePlay();
  };
  
  useEffect(() => {
    if (activeVideoId) {
      if (isPlaying) {
        postPlayerMessage('playVideo');
      } else {
        postPlayerMessage('pauseVideo');
      }
    }
  }, [isPlaying, activeVideoId]);


  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-xl font-semibold tracking-tight">Chat</h1>
        </div>

        {activeVideoId && (
             <div className="flex items-center gap-2 p-1.5 rounded-lg bg-card border w-full max-w-md">
                <Image 
                    src={`https://i.ytimg.com/vi/${activeVideoId}/hqdefault.jpg`} 
                    alt="Video thumbnail"
                    width={40} 
                    height={40} 
                    className="rounded-md aspect-square object-cover"
                />
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{activeVideoTitle || 'Now Playing'}</p>
                    <div className="flex items-center text-muted-foreground -ml-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <Rewind className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handlePlayPause}>
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7">
                            <FastForward className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center flex-shrink-0">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleCopyToClipboard(`https://www.youtube.com/watch?v=${activeVideoId}`)}>Copy video URL</DropdownMenuItem>
                            <DropdownMenuItem asChild><a href={`https://www.youtube.com/watch?v=${activeVideoId}`} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setActiveVideoId(null, null)}><X className="h-4 w-4" /></Button>
                </div>
            </div>
        )}

        <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={handleNewChat}>
                <FileEdit className="h-5 w-5" />
                <span className="sr-only">New Chat</span>
            </Button>
            <Button variant="ghost" size="icon" onClick={toggleTheme}>
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden relative">
         <ChatContent />
         {activeVideoId && (
            <iframe
                ref={iframeRef}
                className="hidden"
                src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1`}
                allow="autoplay; encrypted-media"
                allowFullScreen
                title="YouTube music player"
            ></iframe>
         )}
      </main>
    </div>
  );
}

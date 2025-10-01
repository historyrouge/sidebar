
"use client";

import { Button } from "@/components/ui/button";
import { FileEdit, Moon, Sun, X, MoreVertical, Play, Pause, Rewind, FastForward, Video } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState, Suspense } from "react";
import { ChatContent, useChatStore } from "./chat-content";
import { SidebarTrigger } from "./ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { DashboardLoadingSkeleton } from "./loading-skeleton";
import { useAppKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { KeyboardShortcutsHelp } from "./keyboard-shortcuts-help";


export function MainDashboard() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { activeVideoId, activeVideoTitle, setActiveVideoId, isPlaying, togglePlay, showPlayer, setShowPlayer } = useChatStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  
  // Enable keyboard shortcuts
  useAppKeyboardShortcuts();

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
      <header className="sticky top-0 z-10 flex h-14 sm:h-16 shrink-0 items-center justify-between border-b glass px-3 sm:px-6" role="banner">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="lg:hidden" aria-label="Toggle navigation menu" />
            <h1 className="text-lg sm:text-xl font-semibold tracking-tight hidden sm:block">AI Study Assistant</h1>
            <h1 className="text-lg font-semibold tracking-tight sm:hidden">ScholarSage</h1>
        </div>

        {activeVideoId && (
             <div className="flex items-center gap-1 sm:gap-2 p-1.5 sm:p-2 rounded-lg bg-card border shadow-sm w-full max-w-xs sm:max-w-md card-hover" role="region" aria-label="Video player controls">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground" aria-live="polite">{activeVideoTitle || 'Now Playing'}</p>
                    <div className="flex items-center text-muted-foreground -ml-1 sm:-ml-2" role="group" aria-label="Playback controls">
                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" aria-label="Rewind 10 seconds">
                            <Rewind className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" onClick={handlePlayPause} aria-label={isPlaying ? "Pause video" : "Play video"}>
                            {isPlaying ? <Pause className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" /> : <Play className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-6 w-6 sm:h-7 sm:w-7" aria-label="Fast forward 10 seconds">
                            <FastForward className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center flex-shrink-0 gap-1" role="group" aria-label="Video options">
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setShowPlayer(!showPlayer)} aria-label={showPlayer ? "Hide video player" : "Show video player"}>
                        <Video className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                    </Button>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" aria-label="More video options">
                                <MoreVertical className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                            <DropdownMenuItem onSelect={() => handleCopyToClipboard(`https://www.youtube.com/watch?v=${activeVideoId}`)}>Copy video URL</DropdownMenuItem>
                            <DropdownMenuItem asChild><a href={`https://www.youtube.com/watch?v=${activeVideoId}`} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8" onClick={() => setActiveVideoId(null, null)} aria-label="Close video player">
                        <X className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                    </Button>
                </div>
            </div>
        )}

        <div className="flex items-center gap-1 sm:gap-2" role="group" aria-label="Header actions">
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={handleNewChat} 
                className="transition-smooth hover:bg-primary/10 focus-ring h-8 w-8 sm:h-9 sm:w-9"
                aria-label="Start a new chat session"
            >
                <FileEdit className="h-4 w-4 sm:h-5 sm:w-5" aria-hidden="true" />
            </Button>
            <div className="hidden sm:block">
                <KeyboardShortcutsHelp />
            </div>
            <Button 
                variant="ghost" 
                size="icon" 
                onClick={toggleTheme} 
                className="transition-smooth hover:bg-primary/10 focus-ring h-8 w-8 sm:h-9 sm:w-9"
                aria-label="Toggle between light and dark theme"
            >
                <Sun className="h-4 w-4 sm:h-5 sm:w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" aria-hidden="true" />
                <Moon className="absolute h-4 w-4 sm:h-5 sm:w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" aria-hidden="true" />
            </Button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden relative">
         <Suspense fallback={<DashboardLoadingSkeleton />}>
           <ChatContent />
         </Suspense>
         {activeVideoId && showPlayer && (
             <div className="fixed bottom-3 right-3 sm:bottom-4 sm:right-4 z-50 group" role="dialog" aria-label="Floating video player" aria-modal="false">
                <div className="relative">
                    <iframe
                        ref={iframeRef}
                        className="w-full max-w-xs sm:max-w-sm aspect-video rounded-xl shadow-2xl border border-border"
                        src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1`}
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                        title={`YouTube video: ${activeVideoTitle || 'Now Playing'}`}
                        aria-label={`YouTube video player for ${activeVideoTitle || 'current video'}`}
                    ></iframe>
                    <Button 
                        variant="secondary" 
                        size="icon" 
                        className="absolute -top-2 -right-2 sm:-top-3 sm:-right-3 h-6 w-6 sm:h-7 sm:w-7 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110 shadow-lg focus-ring" 
                        onClick={() => setShowPlayer(false)}
                        aria-label="Close floating video player"
                    >
                        <X className="h-3 w-3 sm:h-4 sm:w-4" aria-hidden="true" />
                    </Button>
                </div>
             </div>
         )}
         {activeVideoId && !showPlayer && (
            // Hidden iframe to control playback even when floating player is not visible
             <iframe
                ref={iframeRef}
                className="hidden"
                src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1`}
                allow="autoplay; encrypted-media"
                title="YouTube music player"
            ></iframe>
         )}
      </main>
    </div>
  );
}

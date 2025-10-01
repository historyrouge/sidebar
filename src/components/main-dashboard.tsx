
"use client";

import { Button } from "@/components/ui/button";
import { FileEdit, Moon, Sun, X, MoreVertical, Play, Pause, Rewind, FastForward, Video, Keyboard } from "lucide-react";
import { useTheme } from "next-themes";
import React, { useEffect, useRef, useState } from "react";
import { ChatContent, useChatStore } from "./chat-content";
import { SidebarTrigger } from "./ui/sidebar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import Image from "next/image";
import { useKeyboardShortcuts, createCommonShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useKeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { useCommandPalette } from "@/components/command-palette";


export function MainDashboard() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();
  const { activeVideoId, activeVideoTitle, setActiveVideoId, isPlaying, togglePlay, showPlayer, setShowPlayer } = useChatStore();
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

  // Keyboard shortcuts
  const shortcuts = createCommonShortcuts({
    newChat: handleNewChat,
    toggleTheme: toggleTheme,
    focusInput: () => {
      const input = document.querySelector('input[placeholder*="Message"]') as HTMLInputElement;
      input?.focus();
    },
  });

  const { dialog: shortcutsDialog, openDialog: openShortcutsDialog } = useKeyboardShortcutsDialog(shortcuts);
  const { palette: commandPalette, openPalette: openCommandPalette } = useCommandPalette();
  
  // Add help and search shortcuts
  shortcuts.push(
    {
      key: '?',
      shiftKey: true,
      action: openShortcutsDialog,
      description: 'Show keyboard shortcuts',
      category: 'Help',
    },
    {
      key: 'k',
      ctrlKey: true,
      action: openCommandPalette,
      description: 'Open command palette',
      category: 'Navigation',
    }
  );

  useKeyboardShortcuts(shortcuts);


  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b glass px-4 sm:px-6 animate-slide-down">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="lg:hidden" />
            <h1 className="text-xl font-semibold tracking-tight">Chat</h1>
        </div>

        {activeVideoId && (
             <div className="flex items-center gap-2 p-1.5 rounded-lg bg-card border w-full max-w-md animate-scale-in">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground animate-fade-in">{activeVideoTitle || 'Now Playing'}</p>
                    <div className="flex items-center text-muted-foreground -ml-2">
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover-lift transition-all duration-200 hover:text-primary">
                            <Rewind className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover-lift transition-all duration-200 hover:text-primary" onClick={handlePlayPause}>
                            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7 hover-lift transition-all duration-200 hover:text-primary">
                            <FastForward className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
                <div className="flex items-center flex-shrink-0">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setShowPlayer(!showPlayer)}>
                        <Video className="h-4 w-4" />
                    </Button>
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
            <Button variant="ghost" size="icon" onClick={openShortcutsDialog}>
                <Keyboard className="h-5 w-5" />
                <span className="sr-only">Keyboard Shortcuts</span>
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
         {activeVideoId && showPlayer && (
             <div className="fixed bottom-4 right-4 z-50 group">
                <iframe
                    ref={iframeRef}
                    className="w-full max-w-sm aspect-video rounded-lg shadow-xl"
                    src={`https://www.youtube.com/embed/${activeVideoId}?enablejsapi=1&autoplay=1`}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title="YouTube music player"
                ></iframe>
                <Button variant="secondary" size="icon" className="absolute -top-3 -right-3 h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => setShowPlayer(false)}><X className="h-4 w-4" /></Button>
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
      {shortcutsDialog}
      {commandPalette}
    </div>
  );
}

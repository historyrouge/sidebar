
"use client";

import { useChatStore } from "./chat-content";
import { Button } from "./ui/button";
import { X, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "./ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";

export function FloatingYoutubePlayer() {
    const { activeVideoId, activeVideoTitle, setActiveVideoId } = useChatStore();
    const { toast } = useToast();

    const handleCopyToClipboard = (url: string) => {
        navigator.clipboard.writeText(url);
        toast({ title: "Copied!", description: "Video URL copied to clipboard." });
    };

    if (!activeVideoId) {
        return null;
    }

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0, y: 100, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 100, scale: 0.9 }}
                transition={{ duration: 0.3 }}
                className="fixed bottom-4 right-4 z-50 w-full max-w-md rounded-xl bg-card shadow-2xl border overflow-hidden"
            >
                <div className="p-3">
                    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted">
                        <iframe
                            src={`https://www.youtube.com/embed/${activeVideoId}`}
                            title="YouTube video player"
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowFullScreen
                            className="w-full h-full"
                        ></iframe>
                    </div>
                </div>
                <div className="flex items-center justify-between px-4 pb-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate text-foreground">{activeVideoTitle || 'Now Playing'}</p>
                        <p className="text-xs text-muted-foreground">YouTube</p>
                    </div>
                    <div className="flex items-center flex-shrink-0">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreVertical className="h-5 w-5" /></Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onSelect={() => handleCopyToClipboard(`https://www.youtube.com/watch?v=${activeVideoId}`)}>Copy video URL</DropdownMenuItem>
                                <DropdownMenuItem asChild><a href={`https://www.youtube.com/watch?v=${activeVideoId}`} target="_blank" rel="noopener noreferrer">Watch on YouTube</a></DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="icon" onClick={() => setActiveVideoId(null, null)}><X className="h-5 w-5" /></Button>
                    </div>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}

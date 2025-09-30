
"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { Pin, Share2, Play } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type YoutubeChatCardProps = {
    videoData: {
        videoId: string;
        title?: string;
        thumbnail?: string;
    };
    onPin: () => void;
};

export function YoutubeChatCard({ videoData, onPin }: YoutubeChatCardProps) {
    const { toast } = useToast();

    const handleShare = () => {
        const url = `https://www.youtube.com/watch?v=${videoData.videoId}`;
        navigator.clipboard.writeText(url);
        toast({ title: "Copied!", description: "YouTube video link copied to clipboard." });
    };

    return (
        <div className="w-full max-w-sm rounded-xl border bg-card/50 overflow-hidden">
            <div className="relative aspect-video group">
                <a href={`https://www.youtube.com/watch?v=${videoData.videoId}`} target="_blank" rel="noopener noreferrer">
                    <Image 
                        src={videoData.thumbnail || `https://i.ytimg.com/vi/${videoData.videoId}/hqdefault.jpg`}
                        alt={videoData.title || "YouTube video"}
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Play className="h-12 w-12 text-white fill-white" />
                    </div>
                </a>
            </div>
            <div className="p-3">
                <p className="font-semibold text-sm line-clamp-1">{videoData.title || "YouTube Video"}</p>
                <p className="text-xs text-muted-foreground">YouTube</p>
                <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={onPin}>
                        <Pin className="mr-2 h-4 w-4" />
                        Pin to header
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

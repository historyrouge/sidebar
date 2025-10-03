
"use client";

import Image from "next/image";
import { Button } from "./ui/button";
import { Download, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

type GeneratedImageCardProps = {
    imageDataUri: string;
    prompt: string;
};

export function GeneratedImageCard({ imageDataUri, prompt }: GeneratedImageCardProps) {
    const { toast } = useToast();

    const handleDownload = () => {
        const a = document.createElement('a');
        a.href = imageDataUri;
        a.download = `${prompt.slice(0, 20).replace(/\s+/g, '_')}.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast({ title: "Downloaded!", description: "Image saved to your device." });
    };
    
    const handleShare = () => {
        // Basic share functionality
        navigator.clipboard.writeText(imageDataUri);
        toast({ title: "Copied!", description: "Image data URI copied to clipboard." });
    }

    return (
        <div className="w-full max-w-sm rounded-xl border bg-card/50 overflow-hidden">
            <div className="relative aspect-square">
                 <Image 
                    src={imageDataUri}
                    alt={prompt}
                    fill
                    className="object-cover"
                />
            </div>
            <div className="p-3">
                <p className="font-semibold text-sm line-clamp-2">{prompt}</p>
                <p className="text-xs text-muted-foreground">AI Generated Image</p>
                <div className="mt-3 flex gap-2">
                    <Button variant="outline" size="sm" className="w-full" onClick={handleDownload}>
                        <Download className="mr-2 h-4 w-4" />
                        Download
                    </Button>
                    <Button variant="ghost" size="icon" onClick={handleShare}>
                        <Share2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    )
}

    
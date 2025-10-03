
"use client";

import { useState, useTransition } from "react";
import { generateImageAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon, Loader2, Send } from "lucide-react";

type InlineImageGeneratorProps = {
    onImageGenerated: (message: { id: string; role: "model"; content: string; }) => void;
}

export function InlineImageGenerator({ onImageGenerated }: InlineImageGeneratorProps) {
    const [prompt, setPrompt] = useState("");
    const [isGenerating, startGenerating] = useTransition();
    const { toast } = useToast();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!prompt.trim()) {
            toast({ title: "Prompt is empty", description: "Please enter a prompt to generate an image.", variant: "destructive" });
            return;
        }

        startGenerating(async () => {
            const result = await generateImageAction({ prompt });
            if (result.error) {
                toast({ title: "Image Generation Error", description: result.error, variant: "destructive" });
            } else if (result.data) {
                const imagePayload = {
                    type: 'image',
                    imageDataUri: result.data.imageDataUri,
                    prompt: prompt
                };
                const modelMessageId = `${Date.now()}-model`;
                onImageGenerated({ id: modelMessageId, role: "model", content: JSON.stringify(imagePayload) });
                setPrompt("");
            }
        });
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="relative w-full rounded-xl border border-border/10 bg-card/5 backdrop-blur-lg p-2 shadow-lg focus-within:border-primary flex items-center gap-2 mb-2"
        >
            <ImageIcon className="h-5 w-5 text-muted-foreground ml-2" />

            <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Generate an image..."
                disabled={isGenerating}
                className="h-10 flex-1 border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
            />

            <Button type="submit" size="icon" className="h-9 w-9 flex-shrink-0" disabled={isGenerating || !prompt.trim()}>
                {isGenerating ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                <span className="sr-only">Generate Image</span>
            </Button>
        </form>
    );
}


"use client";

import { useState, useTransition } from "react";
import { generateImageAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Image as ImageIcon, Download, Share2, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { z } from "zod";
import { LimitExhaustedDialog } from "./limit-exhausted-dialog";

export const GenerateImageInputSchema = z.object({
  prompt: z.string().describe('A text description of the image to generate.'),
});
export type GenerateImageInput = z.infer<typeof GenerateImageInputSchema>;

export const GenerateImageOutputSchema = z.object({
  imageDataUri: z
    .string()
    .describe(
      "The generated image as a data URI."
    ),
});
export type GenerateImageOutput = z.infer<typeof GenerateImageOutputSchema>;

export function ImageGenerationContent() {
    const [prompt, setPrompt] = useState("");
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    const [isGenerating, startGenerating] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const [showLimitDialog, setShowLimitDialog] = useState(false);
    const { toast } = useToast();

    const handleGenerateImage = () => {
        if (!prompt.trim()) {
            toast({ title: "Prompt is empty", description: "Please enter a description for the image.", variant: "destructive" });
            return;
        }

        startGenerating(async () => {
            setGeneratedImage(null);
            setError(null);
            const result = await generateImageAction({ prompt });
            if (result.error) {
                if (result.error === "__LIMIT_EXHAUSTED__") {
                    setShowLimitDialog(true);
                } else {
                    setError(result.error);
                    toast({ title: "Image Generation Failed", description: result.error, variant: "destructive" });
                }
            } else if (result.data) {
                setGeneratedImage(result.data.imageDataUri);
                toast({ title: "Image Generated Successfully!" });
            }
        });
    };

    const handleDownload = () => {
        if (!generatedImage) return;
        const link = document.createElement("a");
        link.href = generatedImage;
        link.download = `${prompt.substring(0, 30).replace(/\s/g, "_")}.svg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast({title: "Image downloaded"});
    };
    
    const handleShare = () => {
        if (!generatedImage) return;
        // Simple copy for now, as sharing data URI directly can be tricky
        navigator.clipboard.writeText(generatedImage);
        toast({ title: "Image Data URL Copied!", description: "You can paste this into a browser or another app."});
    };

    return (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            <LimitExhaustedDialog isOpen={showLimitDialog} onOpenChange={setShowLimitDialog} />
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">AI Image Generation</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                 <div className="mx-auto max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                    <Card>
                        <CardHeader>
                            <CardTitle>Describe Your Image</CardTitle>
                            <CardDescription>Enter a detailed prompt to generate an SVG image using an AI model.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea 
                                placeholder="e.g., A simple logo for a coffee shop"
                                className="h-40"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleGenerateImage} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Generate Image
                            </Button>
                        </CardFooter>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Image</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="aspect-square w-full rounded-lg border-2 border-dashed border-muted bg-muted/50 flex items-center justify-center p-4">
                               {isGenerating ? (
                                    <div className="flex flex-col items-center gap-2 text-muted-foreground">
                                        <Loader2 className="h-8 w-8 animate-spin"/>
                                        <p>Generating...</p>
                                    </div>
                                ) : error ? (
                                    <Alert variant="destructive" className="m-4">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Generation Failed</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                ) : generatedImage ? (
                                    <Image src={generatedImage} alt={prompt} width={512} height={512} className="object-contain rounded-md" />
                                ) : (
                                    <div className="text-center text-muted-foreground p-8">
                                        <ImageIcon className="mx-auto h-12 w-12" />
                                        <p className="mt-2">Your image will appear here.</p>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                        {generatedImage && !isGenerating && (
                            <CardFooter className="flex gap-2">
                                <Button className="w-full" onClick={handleDownload}><Download className="mr-2 h-4 w-4"/>Download SVG</Button>
                                <Button className="w-full" variant="outline" onClick={handleShare}><Share2 className="mr-2 h-4 w-4"/>Share</Button>
                            </CardFooter>
                        )}
                    </Card>
                 </div>
            </main>
        </div>
    );
}

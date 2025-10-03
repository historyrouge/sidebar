
"use client";

import { useState, useTransition } from "react";
import { generateImageAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, Download, Wand2, AlertTriangle } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import Image from "next/image";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Skeleton } from "./ui/skeleton";


export function ImageGenerationContent() {
    const [prompt, setPrompt] = useState("");
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [isGenerating, startGenerating] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerateImage = () => {
        if (prompt.trim().length === 0) {
            toast({
                title: "No prompt provided",
                description: "Please enter a prompt to generate an image.",
                variant: "destructive",
            });
            return;
        }

        setError(null);
        setImageDataUri(null);
        startGenerating(async () => {
            const result = await generateImageAction({ prompt });
            if (result.error) {
                setError(result.error);
                toast({ title: "Image Generation Failed", description: result.error, variant: "destructive" });
            } else if (result.data) {
                setImageDataUri(result.data.imageDataUri);
                toast({ title: "Image Generated!", description: "Your image is ready to view." });
            }
        });
    };

    const handleDownload = () => {
        if (!imageDataUri) return;
        const a = document.createElement('a');
        a.href = imageDataUri;
        a.download = 'generated-image.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    return (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">AI Image Generation</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Describe Your Image</CardTitle>
                            <CardDescription>Enter a descriptive prompt to generate an image using AI. This feature is powered by Gemini's Imagen 2 model.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Textarea
                                placeholder="e.g., 'A photorealistic image of a cat wearing sunglasses, sitting on a beach chair, cinematic lighting'"
                                className="h-24 resize-none"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                            />
                        </CardContent>
                    </Card>

                    <Button onClick={handleGenerateImage} disabled={isGenerating || prompt.trim().length === 0}>
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate Image
                    </Button>

                    <Card>
                        <CardHeader>
                            <CardTitle>Generated Image</CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col items-center justify-center min-h-[300px]">
                             {isGenerating ? (
                                <div className="space-y-4 text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
                                    <p className="text-muted-foreground">Generating your image... This might take a moment.</p>
                                    <Skeleton className="h-[300px] w-[300px]"/>
                                </div>
                            ) : error ? (
                                <Alert variant="destructive" className="w-full">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertTitle>Generation Failed</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            ) : imageDataUri ? (
                                <div className="flex flex-col items-center gap-4">
                                     <Image src={imageDataUri} alt="Generated image" width={400} height={400} className="rounded-lg border shadow-lg" />
                                     <Button variant="outline" onClick={handleDownload}>
                                        <Download className="mr-2 h-4 w-4" />
                                        Download Image
                                    </Button>
                                </div>
                            ) : (
                                <div className="text-center text-muted-foreground">
                                    <ImageIcon className="h-12 w-12 mx-auto mb-4" />
                                    <p>Your generated image will appear here.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

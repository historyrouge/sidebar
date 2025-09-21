
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Presentation, Wand2, ArrowLeft, ArrowRight, Download, Printer } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { generatePresentationAction, GeneratePresentationOutput } from "@/app/actions";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import React from "react";
import { Badge } from "./ui/badge";

export function PresentationMakerContent() {
    const [topic, setTopic] = useState("");
    const [presentation, setPresentation] = useState<GeneratePresentationOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [isGenerating, startGenerating] = useTransition();
    const { toast } = useToast();

    const [api, setApi] = React.useState<CarouselApi>()
    const [current, setCurrent] = React.useState(0)
    const [count, setCount] = React.useState(0)

    React.useEffect(() => {
        if (!api) {
            return
        }

        setCount(api.scrollSnapList().length)
        setCurrent(api.selectedScrollSnap() + 1)

        api.on("select", () => {
            setCurrent(api.selectedScrollSnap() + 1)
        })
    }, [api])

    const handleGenerate = () => {
        if (!topic) {
            toast({
                title: "Missing Topic",
                description: "Please enter a topic to generate a presentation.",
                variant: "destructive",
            });
            return;
        }
        setError(null);
        setPresentation(null);
        startGenerating(async () => {
            const result = await generatePresentationAction({ topic });
            if (result.error) {
                setError(result.error);
                toast({ title: "Generation Failed", description: result.error, variant: "destructive" });
            } else if (result.data) {
                setPresentation(result.data);
                toast({ title: "Presentation Generated!", description: "Your presentation is ready to view." });
            }
        });
    };

    const handleDownload = () => {
        if (!presentation) return;
        const content = presentation.slides.map(slide => {
            return `---
## ${slide.title}

${slide.content.map(point => `- ${point}`).join('\n')}

**Speaker Notes:**
${slide.speakerNotes}
`;
        }).join('\n\n');

        const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${topic.replace(/\s+/g, '_')}_presentation.md`;
        a.click();
        URL.revokeObjectURL(url);
    };
    
    return (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">AI Presentation Maker</h1>
                </div>
                {presentation && (
                    <div className="flex items-center gap-2">
                        <Button variant="outline" onClick={handleDownload}>
                            <Download className="mr-2 h-4 w-4" />
                            Download MD
                        </Button>
                    </div>
                )}
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="mt-4 text-lg font-semibold">Generating your presentation...</p>
                        <p className="text-muted-foreground">The AI is crafting your slides. Please wait a moment.</p>
                    </div>
                ) : !presentation ? (
                    <div className="mx-auto max-w-xl">
                        <Card>
                            <CardHeader>
                                <CardTitle>Create a New Presentation</CardTitle>
                                <CardDescription>Enter a topic, and our SambaNova-powered AI will generate a slide deck for you.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    <Label htmlFor="topic">Presentation Topic</Label>
                                    <Input id="topic" placeholder="e.g., The Future of Renewable Energy" value={topic} onChange={e => setTopic(e.target.value)} />
                                </div>
                                {error && (
                                    <Alert variant="destructive" className="mt-4">
                                        <AlertTitle>Generation Failed</AlertTitle>
                                        <AlertDescription>{error}</AlertDescription>
                                    </Alert>
                                )}
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleGenerate} disabled={isGenerating}>
                                    <Wand2 className="mr-2 h-4 w-4" />
                                    Generate Presentation
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                ) : (
                    <div className="mx-auto max-w-5xl">
                         <h2 className="text-3xl font-bold text-center mb-2">{presentation.title}</h2>
                         <p className="text-center text-muted-foreground mb-8">A presentation generated by Easy Learn AI</p>

                        <Carousel setApi={setApi} className="w-full">
                            <CarouselContent>
                                {presentation.slides.map((slide, index) => (
                                    <CarouselItem key={index}>
                                        <Card className="min-h-[50vh] flex flex-col shadow-lg">
                                            <CardHeader className="bg-muted/50">
                                                <CardTitle>{index + 1}. {slide.title}</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-6 flex-1 grid md:grid-cols-3 gap-6">
                                                <div className="md:col-span-2 prose dark:prose-invert max-w-none">
                                                    <ul>
                                                        {slide.content.map((point, i) => <li key={i}>{point}</li>)}
                                                    </ul>
                                                </div>
                                                <div className="md:col-span-1 bg-primary/5 p-4 rounded-lg">
                                                    <h4 className="font-semibold mb-2 text-primary">Speaker Notes</h4>
                                                    <p className="text-sm text-muted-foreground italic">{slide.speakerNotes}</p>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </CarouselItem>
                                ))}
                            </CarouselContent>
                            <CarouselPrevious className="hidden md:flex" />
                            <CarouselNext className="hidden md:flex" />
                        </Carousel>
                        <div className="py-2 text-center text-sm text-muted-foreground">
                            Slide {current} of {count}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

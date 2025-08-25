
"use client";

import { generateFlashcardsAction, GenerateFlashcardsOutput, ModelKey } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusSquare, Wand2, Moon, Sun, Mic, MicOff } from "lucide-react";
import React, { useState, useTransition, useEffect, useRef } from "react";
import { Flashcard } from "./flashcard";
import { ScrollArea } from "./ui/scroll-area";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { ModelSwitcherDialog } from "./model-switcher-dialog";
import { useModelSettings } from "@/hooks/use-model-settings";

export function CreateFlashcardsContent() {
    const { theme, setTheme } = useTheme();
    const [content, setContent] = useState("");
    const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
    const [isGenerating, startGenerating] = useTransition();
    const { toast } = useToast();
    const [isRecording, setIsRecording] = useState(false);
    const recognitionRef = useRef<any>(null);

    const [showModelSwitcher, setShowModelSwitcher] = useState(false);
    const { model, setModel } = useModelSettings();
    const lastFailedContent = useRef<string | null>(null);


    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            const recognition = recognitionRef.current;
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onstart = () => setIsRecording(true);
            recognition.onend = () => setIsRecording(false);
            recognition.onerror = (event: any) => {
                toast({ title: "Speech Recognition Error", description: event.error, variant: "destructive" });
                setIsRecording(false);
            };
            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    interimTranscript += event.results[i][0].transcript;
                }
                setContent(prev => prev + interimTranscript);
            };
        }
    }, [toast]);

    const handleToggleRecording = () => {
        if (!recognitionRef.current) {
            toast({
                title: "Browser Not Supported",
                description: "Your browser does not support voice-to-text.",
                variant: "destructive",
            });
            return;
        }
        if (isRecording) {
            recognitionRef.current.stop();
        } else {
            recognitionRef.current.start();
        }
    };


    const handleGenerateFlashcards = (generationContent?: string) => {
        const contentToUse = generationContent ?? content;
        if (contentToUse.trim().length < 50) {
            toast({
                title: "Content too short",
                description: "Please provide at least 50 characters to generate flashcards.",
                variant: "destructive",
            });
            return;
        }
        startGenerating(async () => {
            const result = await generateFlashcardsAction({ content: contentToUse });
            if (result.error) {
                if (result.error === "API_LIMIT_EXCEEDED") {
                    lastFailedContent.current = contentToUse;
                    setShowModelSwitcher(true);
                } else {
                    toast({ title: "Flashcard Generation Failed", description: result.error, variant: "destructive" });
                }
            } else {
                setFlashcards(result.data?.flashcards ?? []);
                toast({ title: "Flashcards Generated!", description: "Your new flashcards are ready."});
                lastFailedContent.current = null;
            }
        });
    };

    const handleModelSwitch = (newModel: ModelKey) => {
        // SambaNova is the only model for flashcards, so we can't switch.
        // In a real scenario, you'd check if other models support this.
        // For now, we'll just inform the user.
        toast({
            title: "Model Not Supported",
            description: "Only the default model can be used for flashcard generation at this time.",
            variant: "destructive"
        });
        setShowModelSwitcher(false);
    
        // If you had other models, the logic would be:
        // setModel(newModel);
        // setShowModelSwitcher(false);
        // toast({ title: "Model Switched", description: `Now using ${newModel}. Retrying...` });
        // if (lastFailedContent.current) {
        //     handleGenerateFlashcards(lastFailedContent.current);
        // }
    };

    return (
        <>
        <ModelSwitcherDialog 
            isOpen={showModelSwitcher}
            onOpenChange={setShowModelSwitcher}
            currentModel={model}
            onModelSelect={handleModelSwitch}
        />
        <div className="flex h-screen flex-col bg-background">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Create Flashcards</h1>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                    >
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                    <Card className="flex flex-col">
                        <CardHeader>
                        <CardTitle>Generate Flashcards</CardTitle>
                        <CardDescription>Paste your study material below to create a set of flashcards.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                        <div className="relative h-full">
                            <Textarea
                                placeholder="Paste your content here..."
                                className="h-full min-h-[300px] resize-none pr-10"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                            <Button
                                size="icon"
                                variant={isRecording ? 'destructive' : 'ghost'}
                                onClick={handleToggleRecording}
                                className="absolute bottom-3 right-3"
                                >
                                {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                                <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
                            </Button>
                        </div>
                        </CardContent>
                        <CardFooter>
                        <Button onClick={() => handleGenerateFlashcards()} disabled={isGenerating || content.trim().length < 50}>
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                            Generate Flashcards
                        </Button>
                        </CardFooter>
                    </Card>
                    <Card>
                        <CardHeader>
                        <CardTitle>Your Flashcards</CardTitle>
                        <CardDescription>Click on a card to flip it.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[400px] w-full">
                                {isGenerating ? (
                                    <div className="grid grid-cols-1 gap-4 pr-4 sm:grid-cols-2">
                                        <Skeleton className="h-48 w-full" />
                                        <Skeleton className="h-48 w-full" />
                                        <Skeleton className="h-48 w-full" />
                                        <Skeleton className="h-48 w-full" />
                                    </div>
                                ) : flashcards ? (
                                    <div className="grid grid-cols-1 gap-4 pr-4 sm:grid-cols-2">
                                        {flashcards.map((card, i) => <Flashcard key={i} front={card.front} back={card.back} />)}
                                    </div>
                                ) : (
                                    <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                                    <div className="text-center p-8">
                                        <PlusSquare className="mx-auto h-12 w-12 text-muted-foreground" />
                                        <h3 className="mt-4 text-lg font-semibold">Your flashcards will appear here</h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            Paste your content and click "Generate Flashcards" to start.
                                        </p>
                                    </div>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
        </>
    );
}


"use client";

import { generateFlashcardsAction, GenerateFlashcardsOutput } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusSquare, Wand2, Moon, Sun } from "lucide-react";
import React, { useState, useTransition } from "react";
import { Flashcard } from "./flashcard";
import { ScrollArea } from "./ui/scroll-area";
import { useTheme } from "next-themes";
import { SidebarTrigger } from "./ui/sidebar";

export function CreateFlashcardsContent() {
    const { theme, setTheme } = useTheme();
    const [content, setContent] = useState("");
    const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
    const [isGenerating, startGenerating] = useTransition();
    const { toast } = useToast();

    const handleGenerateFlashcards = async () => {
        if (content.trim().length < 50) {
        toast({
            title: "Content too short",
            description: "Please provide at least 50 characters to generate flashcards.",
            variant: "destructive",
        });
        return;
        }
        startGenerating(async () => {
        const result = await generateFlashcardsAction(content);
        if (result.error) {
            toast({ title: "Flashcard Generation Failed", description: result.error, variant: "destructive" });
        } else {
            setFlashcards(result.data?.flashcards ?? []);
            toast({ title: "Flashcards Generated!", description: "Your new flashcards are ready."});
        }
        });
    };

    return (
        <div className="flex h-screen flex-col bg-background">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
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
                        <Textarea
                            placeholder="Paste your content here..."
                            className="h-full min-h-[300px] resize-none"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                        />
                        </CardContent>
                        <CardFooter>
                        <Button onClick={handleGenerateFlashcards} disabled={isGenerating || content.trim().length < 50}>
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
    );
}

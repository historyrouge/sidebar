
"use client";

import { MainLayout } from "@/components/main-layout";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useTransition } from "react";
import { generateFlashcardsAction, GenerateFlashcardsOutput } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Sparkles, Trash2 } from "lucide-react";

type Flashcard = {
    front: string;
    back: string;
};

export default function CreateFlashcardsPage() {
    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
    const [isGenerating, startGenerating] = useTransition();
    const { toast } = useToast();

    const handleGenerateWithAI = () => {
        if (notes.trim().length < 20) {
            toast({
                title: "Notes are too short",
                description: "Please enter at least 20 characters of notes to generate flashcards.",
                variant: "destructive",
            });
            return;
        }

        startGenerating(async () => {
            const result: {data?: GenerateFlashcardsOutput, error?: string} = await generateFlashcardsAction(notes);
            if (result.error) {
                toast({
                    title: "Failed to generate flashcards",
                    description: result.error,
                    variant: "destructive",
                });
            } else if (result.data) {
                setFlashcards(result.data.flashcards);
                toast({
                    title: "Flashcards generated!",
                    description: "Review and edit the terms below.",
                });
            }
        });
    };

    const handleClearAll = () => {
        setTitle("");
        setNotes("");
        setFlashcards([]);
    };

    const handleCreateSet = () => {
        // This is a placeholder for future functionality to save the set
        toast({
            title: "Feature coming soon!",
            description: "Saving study sets will be implemented in a future update.",
        });
    };

    const updateCard = (index: number, side: 'front' | 'back', value: string) => {
        const newFlashcards = [...flashcards];
        newFlashcards[index][side] = value;
        setFlashcards(newFlashcards);
    };

    const removeCard = (index: number) => {
        const newFlashcards = flashcards.filter((_, i) => i !== index);
        setFlashcards(newFlashcards);
    };

    return (
        <MainLayout>
            <div className="flex flex-col h-screen bg-muted/20">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="md:hidden" />
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                            <Sparkles className="size-5" />
                        </div>
                        <h1 className="text-xl font-semibold tracking-tight">Create study set</h1>
                    </div>
                    <Button onClick={handleCreateSet} disabled={flashcards.length === 0}>Create set</Button>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8 space-y-6">
                    <Card>
                        <CardContent className="p-6 space-y-4">
                            <Input 
                                placeholder="Give your new set a title" 
                                className="text-base" 
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                            />
                            <Textarea 
                                placeholder="Enter a topic or paste your notes" 
                                className="h-32 text-base" 
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                            />
                            <Button variant="outline" onClick={handleGenerateWithAI} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="mr-2 animate-spin" /> : <Sparkles className="mr-2" />}
                                Create terms with AI
                            </Button>
                        </CardContent>
                    </Card>

                    {flashcards.length > 0 && (
                        <div>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-lg font-semibold">Terms in this set ({flashcards.length})</h2>
                                <Button variant="link" className="text-destructive" onClick={handleClearAll}>Clear all</Button>
                            </div>
                            <div className="space-y-4">
                                {flashcards.map((card, index) => (
                                    <Card key={index}>
                                        <CardContent className="p-4 flex items-center gap-4">
                                            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <Textarea 
                                                    placeholder="Term"
                                                    value={card.front}
                                                    onChange={(e) => updateCard(index, 'front', e.target.value)}
                                                    className="resize-none"
                                                />
                                                <Textarea 
                                                    placeholder="Definition"
                                                    value={card.back}
                                                    onChange={(e) => updateCard(index, 'back', e.target.value)}
                                                    className="resize-none"
                                                />
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={() => removeCard(index)}>
                                                <Trash2 className="text-muted-foreground" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </MainLayout>
    )
}

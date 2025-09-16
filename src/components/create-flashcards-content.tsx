
"use client";

import { generateFlashcardsAction, GenerateFlashcardsSambaOutput } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Loader2, PlusSquare, Wand2, Bot, User, Mic, Send, Sparkles, X, Palette, ListChecks, FileQuestion, BookOpen, BrainCircuit, MessageSquare, Code, BookCopy } from "lucide-react";
import React, { useState, useTransition, useEffect, useRef } from "react";
import { Flashcard } from "./flashcard";
import { ScrollArea } from "./ui/scroll-area";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { cn } from "@/lib/utils";
import { Input } from "./ui/input";
import { useRouter } from "next/navigation";

const stylePresets = [
    { id: 'colorful', name: 'Colorful', icon: <Palette className="w-5 h-5"/>, description: 'Bright and vibrant cards.' },
    { id: 'minimal', name: 'Minimal', icon: <BookOpen className="w-5 h-5"/>, description: 'Clean and simple design.' },
    { id: 'neon', name: 'Dark Neon', icon: <Sparkles className="w-5 h-5"/>, description: 'Glowing text on dark cards.' },
    { id: 'pastel', name: 'Aesthetic', icon: <BrainCircuit className="w-5 h-5"/>, description: 'Soft and pleasing colors.' },
];

const numOptions = [5, 10, 20];

export function CreateFlashcardsContent() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [step, setStep] = useState(0);
    const [userInput, setUserInput] = useState('');
    const [isListening, setIsListening] = useState(false);
    const [isProcessing, startProcessing] = useTransition();

    const [subject, setSubject] = useState('');
    const [topic, setTopic] = useState('');
    const [numCards, setNumCards] = useState(10);
    const [cardStyle, setCardStyle] = useState('colorful');

    const [generatedFlashcards, setGeneratedFlashcards] = useState<GenerateFlashcardsSambaOutput['flashcards'] | null>(null);
    const [isGenerating, startGenerating] = useTransition();

    const { toast } = useToast();
    const router = useRouter();
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            console.warn("Browser does not support SpeechRecognition.");
            return;
        }

        recognitionRef.current = new SpeechRecognition();
        const recognition = recognitionRef.current;
        recognition.continuous = false;
        recognition.interimResults = false;

        recognition.onstart = () => setIsListening(true);
        recognition.onend = () => setIsListening(false);
        recognition.onerror = (e: any) => toast({ title: "Voice Error", description: e.error, variant: 'destructive' });
        
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setUserInput(transcript);
        };
    }, [toast]);

    const handleStartListening = () => {
        if (isListening || !recognitionRef.current) return;
        recognitionRef.current.start();
    };

    const resetFlow = () => {
        setStep(0);
        setUserInput('');
        setSubject('');
        setTopic('');
        setIsDialogOpen(true);
    };

    const handleNextStep = () => {
        startProcessing(() => {
            if (step === 0) { // Greeting
                setStep(1);
                return;
            }
            if (step === 1) { // Subject
                if (!userInput.trim()) {
                    toast({ title: "Please enter a subject.", variant: "destructive" });
                    return;
                }
                setSubject(userInput);
                setUserInput('');
                setStep(2);
            } else if (step === 2) { // Topic
                if (!userInput.trim()) {
                    toast({ title: "Please enter a topic.", variant: "destructive" });
                    return;
                }
                setTopic(userInput);
                setUserInput('');
                setStep(3);
            } else if (step === 3) { // Number of cards (Handled by button click)
                 setStep(4);
            } else if (step === 4) { // Style (Handled by button click)
                setStep(5);
            } else if (step === 5) { // Confirmation
                setIsDialogOpen(false);
                handleGenerateFlashcards();
            }
        });
    };

    const handleGenerateFlashcards = () => {
        const content = `Subject: ${subject}. Topic: ${topic}. Please generate ${numCards} flashcards about this.`;
        
        startGenerating(async () => {
            const result = await generateFlashcardsAction({ content });
            if (result.error) {
                toast({ title: "Generation Failed", description: result.error, variant: "destructive" });
                setGeneratedFlashcards(null);
            } else {
                setGeneratedFlashcards(result.data?.flashcards ?? []);
                toast({ title: "Success!", description: "Your new flashcard deck is ready." });
            }
        });
    };
    
    const handlePlayQuiz = () => {
        if (!generatedFlashcards) return;
        const quizContent = `The flashcards are about ${subject}: ${topic}. Here are the questions and answers: ${generatedFlashcards.map(f => `${f.front}? ${f.back}`).join('\n')}`;
        try {
            localStorage.setItem('quizContent', quizContent);
            router.push('/quiz/options');
        } catch (e) {
             toast({
                title: "Could not start quiz",
                description: "There was an error preparing the quiz.",
                variant: "destructive",
            });
        }
    }


    const stepsContent = [
        {
            bot: "Hello! I'm here to help you create a new flashcard deck. Let's get started!",
            action: <Button onClick={handleNextStep}>Let's go! <Sparkles className="ml-2 w-4 h-4" /></Button>
        },
        {
            bot: "First, what's the subject of your new deck? (e.g., Biology, History, JavaScript)",
            input: true
        },
        {
            bot: "Great! Now, what specific topic within that subject do you want to focus on?",
            input: true
        },
        {
            bot: `Awesome choice. How many flashcards would you like me to generate for "${topic}"?`,
            action: (
                <div className="flex gap-2">
                    {numOptions.map(num => <Button key={num} variant="outline" onClick={() => { setNumCards(num); handleNextStep(); }}>{num}</Button>)}
                </div>
            )
        },
        {
            bot: `Got it, ${numCards} cards. Now, pick a style for your deck. Which one do you like?`,
            action: (
                <div className="grid grid-cols-2 gap-3">
                    {stylePresets.map(s => (
                        <Card key={s.id} className="hover:border-primary/80 hover:bg-primary/10 cursor-pointer transition-all" onClick={() => { setCardStyle(s.id); handleNextStep(); }}>
                            <CardContent className="p-4 text-center">
                                {s.icon}
                                <p className="font-semibold mt-1">{s.name}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )
        },
        {
            bot: (
                <div>
                  <p>Perfect! Here’s what I’ve got:</p>
                  <ul className="mt-2 list-disc list-inside bg-muted/50 p-3 rounded-lg">
                      <li><strong>Subject:</strong> {subject}</li>
                      <li><strong>Topic:</strong> {topic}</li>
                      <li><strong>Number of Cards:</strong> {numCards}</li>
                      <li><strong>Style:</strong> <span className="capitalize">{cardStyle}</span></li>
                  </ul>
                   <p className="mt-3">Does that look right?</p>
                </div>
            ),
            action: <Button onClick={handleNextStep}>Looks Good, Generate! <Wand2 className="ml-2 w-4 h-4" /></Button>
        },
    ];

    return (
        <div className="flex h-full flex-col bg-transparent">
             <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md bg-background/80 backdrop-blur-md border-primary/20">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-2"><Bot className="text-primary"/> Flashcard Assistant</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4 min-h-[20rem] flex flex-col justify-between">
                       <div className="prose prose-sm dark:prose-invert max-w-none">
                            {stepsContent[step]?.bot}
                       </div>
                       <div>
                            {stepsContent[step]?.input ? (
                                <div className="flex items-center gap-2 mt-4">
                                    <Input 
                                        value={userInput}
                                        onChange={(e) => setUserInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleNextStep()}
                                        placeholder="Type your answer..."
                                        disabled={isProcessing}
                                    />
                                    <Button size="icon" variant="ghost" onClick={handleStartListening} disabled={isListening}>
                                        <Mic className={cn("w-4 h-4", isListening && "text-primary animate-pulse")} />
                                    </Button>
                                    <Button size="icon" onClick={handleNextStep} disabled={isProcessing}>
                                        <Send className="w-4 h-4"/>
                                    </Button>
                                </div>
                            ) : stepsContent[step]?.action}
                       </div>
                    </div>
                </DialogContent>
            </Dialog>

            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-black/50 backdrop-blur-md px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Create Flashcards</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                {isGenerating ? (
                    <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
                        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                        <h2 className="text-2xl font-semibold text-foreground">Generating Your Deck...</h2>
                        <p>The AI is working its magic. This might take a moment.</p>
                    </div>
                ) : generatedFlashcards ? (
                    <div>
                         <div className="mb-6 text-center">
                            <h2 className="text-3xl font-bold">Your "{topic}" Deck is Ready!</h2>
                            <p className="text-muted-foreground">Click a card to flip it. What would you like to do next?</p>
                            <div className="mt-4 flex justify-center gap-4">
                                <Button variant="outline" onClick={resetFlow}>
                                    <PlusSquare className="mr-2 h-4 w-4" /> Create Another Deck
                                </Button>
                                <Button onClick={handlePlayQuiz}>
                                    <FileQuestion className="mr-2 h-4 w-4" /> Play Quiz Mode
                                </Button>
                            </div>
                        </div>
                        <ScrollArea className="h-[calc(100vh-20rem)]">
                            <div className="grid grid-cols-1 gap-4 pr-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                                {generatedFlashcards.map((card, i) => <Flashcard key={i} {...card} />)}
                            </div>
                        </ScrollArea>
                    </div>
                ) : (
                    <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5">
                        <div className="text-center p-8">
                            <BookCopy className="mx-auto h-16 w-16 text-muted-foreground" />
                            <h3 className="mt-4 text-2xl font-semibold">Create a New Flashcard Deck</h3>
                            <p className="mt-2 text-muted-foreground">
                                Click the button below to start a conversation with our AI assistant to build your deck.
                            </p>
                            <Button size="lg" className="mt-6" onClick={() => setIsDialogOpen(true)}>
                                <Sparkles className="mr-2 h-5 w-5" />
                                Start Creating
                            </Button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

    
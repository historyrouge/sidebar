"use client";

import type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, ChatWithTutorInput } from "@/app/actions";
import { analyzeContentAction, generateFlashcardsAction, generateQuizAction } from "@/app/actions";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Loader2, Wand2 } from "lucide-react";
import React, { useState, useTransition, useRef } from "react";
import { Flashcard } from "./flashcard";
import { SidebarTrigger } from "./ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { TutorChat } from "./tutor-chat";

export function MainContent() {
  const [content, setContent] = useState("");
  const [analysis, setAnalysis] = useState<AnalyzeContentOutput | null>(null);
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
  const [quiz, setQuiz] = useState<GenerateQuizzesOutput['quizzes'] | null>(null);
  
  const [activeTab, setActiveTab] = useState("analysis");
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isGeneratingFlashcards, startGeneratingFlashcards] = useTransition();
  const [isGeneratingQuiz, startGeneratingQuiz] = useTransition();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAnalyze = async () => {
    if (content.trim().length < 50) {
      toast({
        title: "Content too short",
        description: "Please provide more content for a better analysis.",
        variant: "destructive",
      });
      return;
    }
    startAnalyzing(async () => {
      const result = await analyzeContentAction(content);
      if (result.error) {
        toast({ title: "Analysis Failed", description: result.error, variant: "destructive" });
      } else {
        setAnalysis(result.data);
        setFlashcards(null);
        setQuiz(null);
        setActiveTab("analysis");
      }
    });
  };

  const handleGenerateFlashcards = async () => {
    startGeneratingFlashcards(async () => {
      const result = await generateFlashcardsAction(content);
      if (result.error) {
        toast({ title: "Flashcard Generation Failed", description: result.error, variant: "destructive" });
      } else {
        setFlashcards(result.data?.flashcards ?? []);
        setActiveTab("flashcards");
      }
    });
  };

  const handleGenerateQuiz = async () => {
    startGeneratingQuiz(async () => {
      const result = await generateQuizAction(content);
      if (result.error) {
        toast({ title: "Quiz Generation Failed", description: result.error, variant: "destructive" });
      } else {
        setQuiz(result.data?.quizzes ?? []);
        setActiveTab("quiz");
      }
    });
  };
  
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContent(text);
          toast({
            title: "File loaded",
            description: "The file content has been loaded into the text area.",
          });
        };
        reader.readAsText(file);
      } else {
        toast({
          title: "Invalid file type",
          description: "Please upload a .txt file.",
          variant: "destructive",
        });
      }
    }
  };

  const isLoading = isAnalyzing || isGeneratingFlashcards || isGeneratingQuiz;

  return (
    <div className="flex h-full flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold">Study Session</h1>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9 cursor-pointer">
              <AvatarImage src="https://placehold.co/100x100.png" alt="@user" />
              <AvatarFallback>SS</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Billing</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </header>
      <main className="flex-1 overflow-auto p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>Your Study Material</CardTitle>
              <CardDescription>Paste your text or upload a document to get started.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <Textarea
                placeholder="Paste your study content here... (min. 50 characters)"
                className="h-full min-h-[300px] resize-none"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </CardContent>
            <CardFooter className="flex-col items-stretch gap-2 sm:flex-row">
              <Button onClick={handleAnalyze} disabled={isLoading || content.trim().length < 50}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Analyze Content
              </Button>
              <Button variant="outline" onClick={handleFileUploadClick}>
                <FileUp className="mr-2 h-4 w-4" />
                Upload Document
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt"
              />
            </CardFooter>
          </Card>

          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle>AI-Powered Study Tools</CardTitle>
              <CardDescription>Generated concepts, flashcards, and quizzes will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {isLoading && !analysis ? (
                <div className="space-y-4">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : !analysis ? (
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed">
                  <p className="text-center text-muted-foreground">Your analysis will appear here.</p>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                    <TabsTrigger value="tutor">Tutor</TabsTrigger>
                  </TabsList>
                  <ScrollArea className="mt-4 flex-1">
                  <TabsContent value="analysis" className="h-full">
                      <div className="space-y-4 pr-4">
                        <div>
                          <h3 className="text-lg font-semibold">Key Concepts</h3>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {analysis.keyConcepts.map((concept, i) => <li key={i}>{concept}</li>)}
                          </ul>
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold">Potential Questions</h3>
                          <ul className="mt-2 list-disc space-y-1 pl-5">
                            {analysis.potentialQuestions.map((q, i) => <li key={i}>{q}</li>)}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="flashcards" className="h-full">
                      {isGeneratingFlashcards ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> <p>Generating flashcards...</p></div> : flashcards ? (
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                          {flashcards.map((card, i) => <Flashcard key={i} front={card.front} back={card.back} />)}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Button onClick={handleGenerateFlashcards}>Generate Flashcards</Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="quiz" className="h-full">
                       {isGeneratingQuiz ? <div className="flex items-center gap-2"><Loader2 className="animate-spin" /> <p>Generating quiz...</p></div> : quiz ? (
                        <Accordion type="single" collapsible className="w-full space-y-2 pr-4">
                          {quiz.map((q, i) => (
                            <AccordionItem value={`item-${i}`} key={i}>
                                <AccordionTrigger className="text-left font-medium">{i + 1}. {q.question}</AccordionTrigger>
                                <AccordionContent>
                                    <p className="text-muted-foreground">{q.answer}</p>
                                </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Button onClick={handleGenerateQuiz}>Generate Quiz</Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="tutor" className="h-full">
                      <TutorChat content={content} />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

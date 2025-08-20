
"use client";

import type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, AnalyzeImageContentOutput, SummarizeContentOutput } from "@/app/actions";
import { analyzeContentAction, analyzeImageContentAction, generateFlashcardsAction, generateQuizAction, textToSpeechAction, summarizeContentAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Loader2, Moon, Sun, Wand2, Save, Image as ImageIcon, X, Volume2, Pilcrow, CheckCircle2, Circle } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { Flashcard } from "./flashcard";
import { SidebarTrigger } from "./ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { TutorChat } from "./tutor-chat";
import { useTheme } from "next-themes";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import Image from "next/image";
import imageToDataUri from "image-to-data-uri";
import { cn } from "@/lib/utils";

export function StudyNowContent() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [analysis, setAnalysis] = useState<AnalyzeContentOutput | null>(null);
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
  const [quiz, setQuiz] = useState<GenerateQuizzesOutput['quizzes'] | null>(null);
  const [summary, setSummary] = useState<SummarizeContentOutput | null>(null);
  
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);


  const [activeTab, setActiveTab] = useState("analysis");
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isLoadingMaterial, startLoadingMaterial] = useTransition();
  const [isGeneratingFlashcards, startGeneratingFlashcards] = useTransition();
  const [isGeneratingQuiz, startGeneratingQuiz] = useTransition();
  const [isGeneratingSummary, startGeneratingSummary] = useTransition();
  const { theme, setTheme } = useTheme();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();


  const handleAnalyze = async () => {
    if (imageDataUri) {
      handleAnalyzeImage();
      return;
    }

    if (content.trim().length < 50) {
      toast({
        title: "Content too short",
        description: "Please provide at least 50 characters for a better analysis.",
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
        setSummary(null);
        setActiveTab("analysis");
      }
    });
  };

  const handleAnalyzeImage = async () => {
    if (!imageDataUri) return;
    startAnalyzing(async () => {
        const result = await analyzeImageContentAction({ imageDataUri: imageDataUri, prompt: content });
        if (result.error) {
            toast({ title: "Image Analysis Failed", description: result.error, variant: "destructive" });
        } else {
            setAnalysis(result.data as AnalyzeContentOutput);
            setFlashcards(null);
            setQuiz(null);
            setSummary(null);
            setActiveTab("analysis");
        }
    });
  };

  const handleGenerateFlashcards = async () => {
    if (!analysis) return;
    startGeneratingFlashcards(async () => {
      const flashcardContent = `Key Concepts: ${analysis.keyConcepts.join(', ')}. Questions: ${analysis.potentialQuestions.join(' ')}`;
      const result = await generateFlashcardsAction(flashcardContent);
      if (result.error) {
        toast({ title: "Flashcard Generation Failed", description: result.error, variant: "destructive" });
      } else {
        setFlashcards(result.data?.flashcards ?? []);
        setActiveTab("flashcards");
      }
    });
  };

  const handleGenerateQuiz = async () => {
    if (!analysis) return;
    startGeneratingQuiz(async () => {
      const quizContent = `Key Concepts: ${analysis.keyConcepts.join(', ')}. Questions: ${analysis.potentialQuestions.join(' ')}`;
      const result = await generateQuizAction({content: quizContent, numQuestions: 10});
      if (result.error) {
        toast({ title: "Quiz Generation Failed", description: result.error, variant: "destructive" });
      } else {
        setQuiz(result.data?.quizzes ?? []);
        setActiveTab("quiz");
      }
    });
  };

  const handleGenerateSummary = async () => {
    if (!content) return;
    startGeneratingSummary(async () => {
        const result = await summarizeContentAction({ content });
        if (result.error) {
            toast({ title: "Summarization Failed", description: result.error, variant: "destructive" });
        } else {
            setSummary(result.data);
            setActiveTab("summary");
        }
    });
};
  
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageUploadClick = () => {
    imageInputRef.current?.click();
  };

  const handleTextToSpeech = async (text: string, id: string) => {
    if (isSynthesizing === id) {
      setAudioDataUri(null);
      setIsSynthesizing(null);
      return;
    }
    setIsSynthesizing(id);
    setAudioDataUri(null);
    try {
      const result = await textToSpeechAction({ text });
      if (result.error) {
        toast({ title: 'Audio Generation Failed', description: result.error, variant: 'destructive' });
        setIsSynthesizing(null);
      } else if (result.data) {
        setAudioDataUri(result.data.audioDataUri);
      }
    } catch (e: any) {
      toast({ title: 'Error', description: e.message, variant: 'destructive' });
      setIsSynthesizing(null);
    }
  };


  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
          const text = e.target?.result as string;
          setContent(text);
          setTitle(file.name.replace('.txt', ''));
          setAnalysis(null);
          setFlashcards(null);
          setQuiz(null);
          setSummary(null);
          setImageDataUri(null);
          toast({
            title: "File loaded",
            description: "The file content has been loaded. Click Analyze to begin.",
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

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.type.startsWith("image/")) {
            try {
                const dataUri = await imageToDataUri(URL.createObjectURL(file));
                setImageDataUri(dataUri);
                setContent(""); // Clear text content
                setTitle(file.name);
                setAnalysis(null);
                setFlashcards(null);
                setQuiz(null);
                setSummary(null);
                toast({
                  title: "Image loaded",
                  description: "You can add a text prompt to guide the analysis.",
                });
            } catch (error) {
                toast({ title: "Image processing failed", description: "Could not read the image file.", variant: "destructive" });
            }
        } else {
            toast({
              title: "Invalid file type",
              description: "Please upload an image file (e.g., PNG, JPG).",
              variant: "destructive",
            });
        }
    }
  };

  const clearImage = () => {
    setImageDataUri(null);
    setTitle("");
    setContent("");
    setAnalysis(null);
    setFlashcards(null);
    setQuiz(null);
    setSummary(null);
    if(imageInputRef.current) imageInputRef.current.value = "";
  }

  const isLoading = isAnalyzing || isGeneratingFlashcards || isGeneratingQuiz || isGeneratingSummary;
  

  return (
    <div className="flex h-screen flex-col bg-muted/20">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <h1 className="text-xl font-semibold tracking-tight">Study Session</h1>
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
      <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
        <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          <Card className="flex flex-col @container">
            <CardHeader>
              <CardTitle>Your Study Material</CardTitle>
              <CardDescription>Paste text, upload a document, or upload an image.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <Input 
                placeholder="Enter a title for your material..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-lg font-semibold"
                disabled={isLoadingMaterial}
              />
              {isLoadingMaterial ? (
                <div className="flex flex-col flex-1 gap-4">
                    <Skeleton className="w-full h-full" />
                </div>
              ) : imageDataUri ? (
                <div className="relative flex-1">
                    <Image src={imageDataUri} alt="Uploaded content" layout="fill" objectFit="contain" className="rounded-md border" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={clearImage}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
              ) : (
                <Textarea
                    placeholder="Paste your study content here... (min. 50 characters)"
                    className="h-full min-h-[300px] resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
              )}
               {imageDataUri && (
                 <Textarea
                    placeholder="Add an optional prompt to guide the AI..."
                    className="h-24 resize-none"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                />
               )}
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2 @sm:flex-row">
              <Button onClick={handleAnalyze} disabled={isLoading || isLoadingMaterial || (!imageDataUri && content.trim().length < 50)}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Analyze
              </Button>
              <div className="flex items-stretch gap-2">
                <Button variant="outline" className="flex-1" onClick={handleFileUploadClick} disabled={isLoading || isLoadingMaterial}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Upload .txt
                </Button>
                <Button variant="outline" className="flex-1" onClick={handleImageUploadClick} disabled={isLoading || isLoadingMaterial}>
                    <ImageIcon className="mr-2 h-4 w-4" />
                    Upload Image
                </Button>
              </div>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".txt"
              />
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageFileChange}
                className="hidden"
                accept="image/*"
              />
            </CardFooter>
          </Card>

          <Card className="flex flex-col @container">
            <CardHeader>
              <CardTitle>AI-Powered Study Tools</CardTitle>
              <CardDescription>Generated concepts, flashcards, and quizzes will appear here.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {isAnalyzing && !analysis ? (
                <div className="space-y-4 p-1">
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-8 w-1/3" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : !analysis ? (
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                  <div className="text-center p-8">
                    <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Ready to Learn?</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Analyze your material to generate study tools.
                    </p>
                  </div>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="analysis">Analysis</TabsTrigger>
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="flashcards">Flashcards</TabsTrigger>
                    <TabsTrigger value="quiz">Quiz</TabsTrigger>
                    <TabsTrigger value="tutor">Tutor</TabsTrigger>
                  </TabsList>
                  <ScrollArea className="mt-4 flex-1">
                  <TabsContent value="analysis" className="h-full">
                      <div className="space-y-6 pr-4">
                        <div>
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Key Concepts</h3>
                             <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleTextToSpeech(analysis.keyConcepts.join('. '), 'key-concepts')}
                                disabled={!!isSynthesizing}
                            >
                                {isSynthesizing === 'key-concepts' ? <Loader2 className="animate-spin" /> : <Volume2 />}
                            </Button>
                          </div>
                          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                            {analysis.keyConcepts.map((concept, i) => <li key={i}>{concept}</li>)}
                          </ul>
                        </div>
                        <div>
                          <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Potential Questions</h3>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={() => handleTextToSpeech(analysis.potentialQuestions.join('. '), 'potential-questions')}
                                disabled={!!isSynthesizing}
                            >
                                {isSynthesizing === 'potential-questions' ? <Loader2 className="animate-spin" /> : <Volume2 />}
                            </Button>
                          </div>
                          <ul className="mt-2 list-disc space-y-2 pl-5 text-sm text-muted-foreground">
                            {analysis.potentialQuestions.map((q, i) => <li key={i}>{q}</li>)}
                          </ul>
                        </div>
                         {audioDataUri && isSynthesizing && (
                            <div className="mt-4">
                                <audio controls autoPlay src={audioDataUri} onEnded={() => { setAudioDataUri(null); setIsSynthesizing(null); }}>
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="summary" className="h-full">
                       {isGeneratingSummary ? <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> <p>Generating summary...</p></div> : summary ? (
                        <div className="space-y-4 pr-4">
                           <div className="flex justify-between items-center">
                                <h3 className="text-lg font-semibold">Summary</h3>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    onClick={() => handleTextToSpeech(summary.summary, 'summary')}
                                    disabled={!!isSynthesizing}
                                >
                                    {isSynthesizing === 'summary' ? <Loader2 className="animate-spin" /> : <Volume2 />}
                                </Button>
                            </div>
                           <p className="text-sm leading-relaxed text-muted-foreground">{summary.summary}</p>
                           {audioDataUri && isSynthesizing === 'summary' && (
                            <div className="mt-4">
                                <audio controls autoPlay src={audioDataUri} onEnded={() => { setAudioDataUri(null); setIsSynthesizing(null); }}>
                                    Your browser does not support the audio element.
                                </audio>
                            </div>
                        )}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                           <Button onClick={handleGenerateSummary} disabled={isGeneratingSummary || imageDataUri !== null}>
                             <Pilcrow className="mr-2 h-4 w-4" />
                            Generate Summary
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="flashcards" className="h-full">
                      {isGeneratingFlashcards ? <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> <p>Generating flashcards...</p></div> : flashcards ? (
                        <div className="grid grid-cols-1 gap-4 pr-4 @md:grid-cols-2">
                          {flashcards.map((card, i) => <Flashcard key={i} front={card.front} back={card.back} />)}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Button onClick={handleGenerateFlashcards} disabled={isGeneratingFlashcards}>
                            {isGeneratingFlashcards ? <Loader2 className="mr-2 animate-spin"/> : null}
                            Generate Flashcards
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="quiz" className="h-full">
                       {isGeneratingQuiz ? <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> <p>Generating quiz...</p></div> : quiz ? (
                        <Accordion type="single" collapsible className="w-full space-y-2 pr-4">
                          {quiz.map((q, i) => (
                            <AccordionItem value={`item-${i}`} key={q.question} className="rounded-md border bg-background px-4">
                                <AccordionTrigger className="py-4 text-left font-medium hover:no-underline">{i + 1}. {q.question}</AccordionTrigger>
                                <AccordionContent>
                                    <div className="space-y-2 pb-4">
                                        {q.options.map((option, optionIndex) => (
                                            <div key={optionIndex} className={cn("flex items-center gap-3 text-sm", option === q.answer ? "font-semibold text-primary" : "text-muted-foreground")}>
                                               {option === q.answer ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
                                               <span>{option}</span>
                                            </div>
                                        ))}
                                    </div>
                                </AccordionContent>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                           <Button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz}>
                            {isGeneratingQuiz ? <Loader2 className="mr-2 animate-spin"/> : null}
                            Generate Quiz
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="tutor" className="h-full">
                      <TutorChat content={analysis ? (imageDataUri ? `Image name: ${title}. Key Concepts from Image: ${analysis.keyConcepts.join(', ')}. Potential Questions from Image: ${analysis.potentialQuestions.join(' ')}` : content) : content} />
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

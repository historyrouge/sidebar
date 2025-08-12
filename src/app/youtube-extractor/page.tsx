
"use client";

import type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, SummarizeContentOutput } from "@/app/actions";
import { analyzeContentAction, generateFlashcardsAction, generateQuizAction, summarizeContentAction, textToSpeechAction, getYoutubeTranscriptAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, Circle, Link as LinkIcon, Loader2, Pilcrow, RefreshCw, Volume2, Wand2, Youtube } from "lucide-react";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Flashcard } from "@/components/flashcard";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { TutorChat } from "@/components/tutor-chat";

export default function YouTubeExtractorPage() {
    const [youtubeUrl, setYoutubeUrl] = useState("");
    const [transcript, setTranscript] = useState("");
    const [analysis, setAnalysis] = useState<AnalyzeContentOutput | null>(null);
    const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
    const [quiz, setQuiz] = useState<GenerateQuizzesOutput['quizzes'] | null>(null);
    const [summary, setSummary] = useState<SummarizeContentOutput | null>(null);
    
    const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
    const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);
    
    const [activeTab, setActiveTab] = useState("analysis");
    const [isProcessing, startProcessing] = useTransition(); // Single state for all loading

    const { toast } = useToast();

    const handleExtractAndAnalyze = () => {
        if (!youtubeUrl) {
            toast({ title: "Please enter a YouTube URL", variant: "destructive" });
            return;
        }
        startProcessing(async () => {
            // Reset all states
            setTranscript('');
            setAnalysis(null);
            setFlashcards(null);
            setQuiz(null);
            setSummary(null);
            setActiveTab("analysis");

            // 1. Extract Transcript
            const transcriptResult = await getYoutubeTranscriptAction({ videoUrl: youtubeUrl });
            if (transcriptResult.error || !transcriptResult.data) {
                toast({ title: "Extraction Failed", description: transcriptResult.error || "Unknown error", variant: "destructive" });
                return;
            }
            const newTranscript = transcriptResult.data.transcript;
            setTranscript(newTranscript);
            toast({ title: "Transcript extracted!", description: "Analyzing content..." });

            // 2. Analyze Content
            const analysisResult = await analyzeContentAction(newTranscript);
            if (analysisResult.error) {
                toast({ title: "Analysis Failed", description: analysisResult.error, variant: "destructive" });
            } else {
                setAnalysis(analysisResult.data);
            }
        });
    };
    
    const handleGenerateFlashcards = async () => {
        if (!transcript) return;
        startProcessing(async () => {
            setFlashcards(null);
            const result = await generateFlashcardsAction(transcript);
            if (result.error) {
                toast({ title: "Flashcard Generation Failed", description: result.error, variant: "destructive" });
            } else {
                setFlashcards(result.data?.flashcards ?? []);
                setActiveTab("flashcards");
            }
        });
    };

    const handleGenerateQuiz = async () => {
        if (!transcript) return;
        startProcessing(async () => {
            setQuiz(null);
            const result = await generateQuizAction(transcript);
            if (result.error) {
                toast({ title: "Quiz Generation Failed", description: result.error, variant: "destructive" });
            } else {
                setQuiz(result.data?.quizzes ?? []);
                setActiveTab("quiz");
            }
        });
    };

    const handleGenerateSummary = async () => {
        if (!transcript) return;
        startProcessing(async () => {
            setSummary(null);
            const result = await summarizeContentAction({ content: transcript });
            if (result.error) {
                toast({ title: "Summarization Failed", description: result.error, variant: "destructive" });
            } else {
                setSummary(result.data);
                setActiveTab("summary");
            }
        });
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

    return (
        <div className="flex flex-col h-screen bg-muted/20">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight">YouTube Tools</h1>
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <div className="grid h-full grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
                    <Card className="flex flex-col">
                        <CardHeader>
                            <CardTitle>Extract from YouTube</CardTitle>
                            <CardDescription>Paste a YouTube link to get the transcript and generate study materials.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col gap-4">
                            <div className="flex gap-2">
                                <Input 
                                    placeholder="https://www.youtube.com/watch?v=..." 
                                    value={youtubeUrl}
                                    onChange={(e) => setYoutubeUrl(e.target.value)}
                                    className="text-base"
                                    disabled={isProcessing}
                                />
                                <Button onClick={handleExtractAndAnalyze} disabled={isProcessing}>
                                    {isProcessing ? <Loader2 className="mr-2 animate-spin" /> : <LinkIcon className="mr-2" />}
                                    Extract & Analyze
                                </Button>
                            </div>
                            <ScrollArea className="flex-1 rounded-md border p-4 bg-muted/50">
                                {isProcessing && !transcript ? (
                                    <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
                                        <Loader2 className="animate-spin" /> <p>Extracting transcript...</p>
                                    </div>
                                ) : transcript ? (
                                    <p className="text-sm whitespace-pre-wrap">{transcript}</p>
                                ) : (
                                    <div className="flex h-full items-center justify-center text-center text-muted-foreground">
                                        <p>Video transcript will appear here...</p>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col @container">
                        <CardHeader>
                            <CardTitle>AI-Powered Study Tools</CardTitle>
                            <CardDescription>Generated concepts, flashcards, and quizzes will appear here.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                          {isProcessing && !analysis ? (
                             <div className="flex h-full items-center justify-center gap-2 text-muted-foreground">
                                <Loader2 className="animate-spin" /> <p>Analyzing content...</p>
                            </div>
                          ) : !analysis ? (
                             <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                                <div className="text-center p-8">
                                    <Youtube className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">Waiting for a video...</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                    Paste a YouTube link and click "Extract & Analyze" to begin.
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
                                  {isProcessing && !summary ? <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> <p>Generating summary...</p></div> : summary ? (
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
                                      <Button onClick={handleGenerateSummary} disabled={isProcessing}>
                                        <Pilcrow className="mr-2 h-4 w-4" />
                                        Generate Summary
                                      </Button>
                                    </div>
                                  )}
                                </TabsContent>
                                <TabsContent value="flashcards" className="h-full">
                                  {isProcessing && !flashcards ? <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> <p>Generating flashcards...</p></div> : flashcards ? (
                                    <>
                                        <div className="flex justify-end pr-4 mb-2">
                                            <Button variant="outline" size="sm" onClick={handleGenerateFlashcards} disabled={isProcessing}>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Regenerate
                                            </Button>
                                        </div>
                                        <div className="grid grid-cols-1 gap-4 pr-4 @md:grid-cols-2">
                                        {flashcards.map((card, i) => <Flashcard key={i} front={card.front} back={card.back} />)}
                                        </div>
                                    </>
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <Button onClick={handleGenerateFlashcards} disabled={isProcessing}>
                                        Generate Flashcards
                                      </Button>
                                    </div>
                                  )}
                                </TabsContent>
                                <TabsContent value="quiz" className="h-full">
                                  {isProcessing && !quiz ? <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> <p>Generating quiz...</p></div> : quiz ? (
                                    <>
                                        <div className="flex justify-end pr-4 mb-2">
                                            <Button variant="outline" size="sm" onClick={handleGenerateQuiz} disabled={isProcessing}>
                                                <RefreshCw className="mr-2 h-4 w-4" />
                                                Regenerate
                                            </Button>
                                        </div>
                                        <Accordion type="single" collapsible className="w-full space-y-2 pr-4">
                                        {quiz.map((q, i) => (
                                            <AccordionItem value={`item-${i}`} key={i} className="rounded-md border bg-background px-4">
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
                                    </>
                                  ) : (
                                    <div className="flex h-full items-center justify-center">
                                      <Button onClick={handleGenerateQuiz} disabled={isProcessing}>
                                        Generate Quiz
                                      </Button>
                                    </div>
                                  )}
                                </TabsContent>
                                <TabsContent value="tutor" className="h-full">
                                    <TutorChat content={transcript} />
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


"use client";

import type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, SummarizeContentOutput } from "@/app/actions";
import { analyzeContentAction, generateFlashcardsAction, generateQuizAction, summarizeContentAction, textToSpeechAction } from "@/app/actions";
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
import { ArrowLeft, CheckCircle2, Circle, Link as LinkIcon, Loader2, Pilcrow, Volume2, Wand2, Youtube } from "lucide-react";
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
    const [isExtracting, startExtracting] = useTransition();
    const [isAnalyzing, startAnalyzing] = useTransition();
    const [isGeneratingFlashcards, startGeneratingFlashcards] = useTransition();
    const [isGeneratingQuiz, startGeneratingQuiz] = useTransition();
    const [isGeneratingSummary, startGeneratingSummary] = useTransition();
    const { toast } = useToast();

    const handleExtract = () => {
        if (!youtubeUrl) {
            toast({ title: "Please enter a YouTube URL", variant: "destructive" });
            return;
        }
        startExtracting(() => {
            // Placeholder for actual YouTube transcript extraction
            // In a real app, you would use a library or API to fetch the transcript
            setTimeout(() => {
                const placeholderTranscript = "This is a placeholder transcript for the YouTube video. In a real application, this would be the full text extracted from the video's audio track. This allows students to quickly get the content of a video in text format, which can then be analyzed, summarized, and used to create study materials like flashcards and quizzes. The process involves taking a YouTube video URL, sending it to a backend service that can access YouTube's transcript API, and then returning the text content to the user for further processing with the AI tools available in ScholarSage.";
                setTranscript(placeholderTranscript);
                toast({ title: "Transcript extracted (Placeholder)", description: "You can now analyze the content." });
            }, 1500);
        });
    };

    const handleAnalyze = async () => {
        if (!transcript) return;
        startAnalyzing(async () => {
            const result = await analyzeContentAction(transcript);
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
            const result = await generateQuizAction(quizContent);
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
        startGeneratingSummary(async () => {
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
    
    const isLoading = isAnalyzing || isGeneratingFlashcards || isGeneratingQuiz || isGeneratingSummary;

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
                                />
                                <Button onClick={handleExtract} disabled={isExtracting}>
                                    {isExtracting ? <Loader2 className="mr-2 animate-spin" /> : <LinkIcon className="mr-2" />}
                                    Extract
                                </Button>
                            </div>
                            <Textarea
                                placeholder="Video transcript will appear here..."
                                className="h-full min-h-[300px] resize-none"
                                value={transcript}
                                readOnly
                            />
                        </CardContent>
                    </Card>

                    <Card className="flex flex-col @container">
                        <CardHeader className="flex flex-row items-start justify-between">
                            <div>
                                <CardTitle>AI-Powered Study Tools</CardTitle>
                                <CardDescription>Generated concepts, flashcards, and quizzes will appear here.</CardDescription>
                            </div>
                            <Button onClick={handleAnalyze} disabled={isLoading || !transcript} size="sm">
                                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Analyze
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1">
                          {!transcript ? (
                            <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                                <div className="text-center p-8">
                                    <Youtube className="mx-auto h-12 w-12 text-muted-foreground" />
                                    <h3 className="mt-4 text-lg font-semibold">Waiting for a video...</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">
                                    Paste a YouTube link and click "Extract" to begin.
                                    </p>
                                </div>
                            </div>
                          ) : isAnalyzing && !analysis ? (
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
                                  Click "Analyze" to generate study tools from the transcript.
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
                                      <Button onClick={handleGenerateSummary} disabled={isGeneratingSummary}>
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
                                    <TutorChat content={analysis ? `Transcript: ${transcript}. Key Concepts: ${analysis.keyConcepts.join(', ')}. Potential Questions: ${analysis.potentialQuestions.join(' ')}` : transcript} />
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

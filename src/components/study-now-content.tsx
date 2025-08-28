
"use client";

import type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, AnalyzeImageContentOutput, SummarizeContentOutput, GenerateImageOutput } from "@/app/actions";
import { analyzeContentAction, analyzeImageContentAction, generateFlashcardsAction, generateQuizAction, textToSpeechAction, generateImageAction, chatWithTutorAction } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Loader2, Moon, Sun, Wand2, Save, Image as ImageIcon, X, Volume2, Pilcrow, CheckCircle2, Circle, Camera, BrainCircuit, HelpCircle, BookCopy, ListTree, Code, Copy, Mic, MicOff } from "lucide-react";
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
import { BackButton } from "./back-button";
import { Progress } from "./ui/progress";

declare const puter: any;

const imageGenerationSteps = [
    "Warming up the AI...",
    "Analyzing concepts...",
    "Generating initial draft...",
    "Painting the pixels...",
    "Adding final touches...",
];

export function StudyNowContent() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [analysis, setAnalysis] = useState<AnalyzeContentOutput | AnalyzeImageContentOutput | null>(null);
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
  const [generatedImage, setGeneratedImage] = useState<GenerateImageOutput | null>(null);
  
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("analysis");
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isLoadingMaterial, startLoadingMaterial] = useTransition();
  const [isGeneratingFlashcards, startGeneratingFlashcards] = useTransition();
  const [isGeneratingQuiz, startGeneratingQuiz] = useTransition();
  const [isGeneratingImage, startGeneratingImage] = useTransition();
  const [imageGenerationProgress, setImageGenerationProgress] = useState(0);
  const [imageGenerationStep, setImageGenerationStep] = useState(0);
  const { theme, setTheme } = useTheme();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);


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
            let fullTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; ++i) {
                if (event.results[i].isFinal) {
                    fullTranscript += event.results[i][0].transcript;
                }
            }
            if (fullTranscript) {
                setContent(prev => prev + fullTranscript + ' ');
            }
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


  const handleAnalyze = useCallback(async () => {
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
        } else if (result.data) {
            setAnalysis(result.data ?? null);
            setFlashcards(null);
            setGeneratedImage(null);
            setActiveTab("analysis");
        }
    });
  }, [content, imageDataUri, toast]);

  const handleAnalyzeImage = useCallback(async () => {
    if (!imageDataUri) return;
    startAnalyzing(async () => {
        // Image analysis is always done by Gemini
        const result = await analyzeImageContentAction({ imageDataUri: imageDataUri, prompt: content });
        if (result.error) {
            toast({ title: "Image Analysis Failed", description: result.error, variant: "destructive" });
        } else {
            setAnalysis(result.data as AnalyzeImageContentOutput);
            setFlashcards(null);
            setGeneratedImage(null);
            setActiveTab("analysis");
        }
    });
  }, [imageDataUri, content, toast]);

  const handleGenerateFlashcards = useCallback(async () => {
    if (!analysis) return;
    startGeneratingFlashcards(async () => {
      const flashcardContent = `Key Concepts: ${analysis.keyConcepts.map(c => c.concept).join(', ')}. Questions: ${analysis.potentialQuestions.join(' ')}`;
      const result = await generateFlashcardsAction({content: flashcardContent});
      if (result.error) {
         toast({ title: "Flashcard Generation Failed", description: result.error, variant: "destructive" });
      } else {
        setFlashcards(result.data?.flashcards ?? []);
        setActiveTab("flashcards");
      }
    });
  }, [analysis, toast]);

  const handleGenerateQuiz = async () => {
    if (!analysis) return;
    try {
        const quizContent = `Key Concepts: ${analysis.keyConcepts.map(c => c.concept).join(', ')}. Questions: ${analysis.potentialQuestions.join(' ')}`;
        localStorage.setItem('quizContent', quizContent);
        router.push('/quiz/options');
    } catch (e) {
        toast({
            title: "Could not start quiz",
            description: "There was an error while preparing the quiz content.",
            variant: "destructive",
        });
    }
};

  const handleGenerateImage = useCallback(async () => {
    if (!analysis) return;
    
    // Reset progress for new generation
    setImageGenerationProgress(0);
    setImageGenerationStep(0);
    
    // Start the generation process
    startGeneratingImage(async () => {
        const prompt = `Based on the following concepts: ${analysis.keyConcepts.map(c => c.concept).join(", ")}.`;
        // Image generation is always done by Gemini
        const result = await generateImageAction({ prompt });
        
        // Ensure progress is 100% on completion
        setImageGenerationProgress(100);

        if (result.error) {
            toast({ title: "Image Generation Failed", description: result.error, variant: "destructive" });
        } else {
            setGeneratedImage(result.data ?? null);
            setActiveTab("image");
        }
    });
  }, [analysis, toast]);

  useEffect(() => {
    let progressInterval: NodeJS.Timeout | undefined;
    let stepInterval: NodeJS.Timeout | undefined;

    if (isGeneratingImage) {
        const totalDuration = 15000; // 15 seconds
        const stepDuration = totalDuration / imageGenerationSteps.length;

        // Interval to update the progress bar
        progressInterval = setInterval(() => {
            setImageGenerationProgress(prev => {
                if (prev >= 95) { // Don't let it reach 100% until it's actually done
                    clearInterval(progressInterval);
                    return prev;
                }
                return prev + 1;
            });
        }, totalDuration / 100);

        // Interval to update the text steps
        setImageGenerationStep(0); // Start at the first step
        stepInterval = setInterval(() => {
            setImageGenerationStep(prev => (prev + 1) % imageGenerationSteps.length);
        }, stepDuration);

    }

    return () => {
        clearInterval(progressInterval);
        clearInterval(stepInterval);
    };
  }, [isGeneratingImage]);


  
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

  const handleCopyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${type} Copied!`, description: `The ${type.toLowerCase()} has been copied to your clipboard.` });
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
          setGeneratedImage(null);
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
                setGeneratedImage(null);
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
    setGeneratedImage(null);
    if(imageInputRef.current) imageInputRef.current.value = "";
  }

  const handleTutorChat = async (history: any) => {
    const result = await chatWithTutorAction({ content, history });
    return result;
  }

  const isLoading = isAnalyzing || isGeneratingFlashcards || isGeneratingQuiz || isGeneratingImage;
  
  const TABS = [
    { value: "analysis", label: "Analysis", disabled: !analysis },
    { value: "flashcards", label: "Flashcards", disabled: !analysis },
    { value: "quiz", label: "Quiz", disabled: !analysis },
    { value: "tutor", label: "Tutor", disabled: !analysis },
    { value: "image", label: "Image", disabled: !analysis }
  ];


  return (
    <div className="flex h-screen flex-col bg-muted/20 dark:bg-transparent">
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="lg:hidden" />
            <BackButton />
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
      <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
        <div className="grid h-full grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-8">
          <Card className="flex flex-col @container">
            <CardHeader>
              <CardTitle>Your Study Material</CardTitle>
              <CardDescription>Paste text, upload a document, or upload an image. Analysis is done by SambaNova.</CardDescription>
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
                <div className="relative h-full">
                    <Textarea
                        placeholder="Paste your study content here... (min. 50 characters)"
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
              <div className="flex items-stretch gap-2 flex-1">
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
              <CardDescription>
                Tools are powered by their optimal AI models.
              </CardDescription>
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
                  <TabsList className="grid w-full grid-cols-3 sm:grid-cols-5">
                    {TABS.map(tab => <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled}>{tab.label}</TabsTrigger>)}
                  </TabsList>
                  <ScrollArea className="mt-4 flex-1">
                  <TabsContent value="analysis" className="h-full">
                    <Accordion type="multiple" defaultValue={['summary', 'key-concepts']} className="w-full space-y-3 pr-4">
                        <AccordionItem value="summary" className="rounded-md border bg-card px-4">
                            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base">
                                <div className="flex items-center gap-3"><Pilcrow />Summary</div>
                            </AccordionTrigger>
                            <AccordionContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                <div className="flex justify-end">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleTextToSpeech(analysis.summary, 'summary')}
                                        disabled={!!isSynthesizing}
                                        className="mb-2"
                                    >
                                        {isSynthesizing === 'summary' ? <Loader2 className="animate-spin" /> : <Volume2 />}
                                    </Button>
                                </div>
                                {audioDataUri && isSynthesizing === 'summary' && (
                                    <div className="mb-2">
                                        <audio controls autoPlay src={audioDataUri} className="w-full" onEnded={() => { setAudioDataUri(null); setIsSynthesizing(null); }}>
                                            Your browser does not support the audio element.
                                        </audio>
                                    </div>
                                )}
                                <p>{analysis.summary}</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="key-concepts" className="rounded-md border bg-card px-4">
                            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base">
                                <div className="flex items-center gap-3"><BrainCircuit/>Key Concepts</div>
                            </AccordionTrigger>
                            <AccordionContent className="prose prose-sm dark:prose-invert max-w-none">
                            {analysis.keyConcepts.map((concept, i) => 
                                <div key={i} className="py-2">
                                <p className="font-semibold !my-0">{concept.concept}</p>
                                <p className="text-muted-foreground !my-0">{concept.explanation}</p>
                                </div>
                            )}
                            </AccordionContent>
                        </AccordionItem>
                        {analysis.codeExamples && analysis.codeExamples.length > 0 && (
                            <AccordionItem value="code-examples" className="rounded-md border bg-card px-4">
                                <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base">
                                    <div className="flex items-center gap-3"><Code />Code Examples</div>
                                </AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                {analysis.codeExamples.map((example, i) => 
                                    <div key={i} className="space-y-2">
                                        <p className="text-sm text-muted-foreground">{example.explanation}</p>
                                        <div className="relative rounded-md bg-muted/50 p-4 font-mono text-xs">
                                            <Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleCopyToClipboard(example.code, "Code")}>
                                                <Copy className="h-4 w-4" />
                                            </Button>
                                            <pre className="whitespace-pre-wrap"><code>{example.code}</code></pre>
                                        </div>
                                    </div>
                                )}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        <AccordionItem value="potential-questions" className="rounded-md border bg-card px-4">
                            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base">
                                <div className="flex items-center gap-3"><HelpCircle />Potential Questions</div>
                            </AccordionTrigger>
                            <AccordionContent className="prose-sm dark:prose-invert max-w-none">
                            <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
                                {analysis.potentialQuestions.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="related-topics" className="rounded-md border bg-card px-4">
                            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base">
                                <div className="flex items-center gap-3"><ListTree />Related Topics</div>
                            </AccordionTrigger>
                            <AccordionContent className="prose-sm dark:prose-invert max-w-none">
                            <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">
                                {analysis.relatedTopics.map((q, i) => <li key={i}>{q}</li>)}
                            </ul>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                  </TabsContent>
                    <TabsContent value="flashcards" className="h-full">
                      {isGeneratingFlashcards ? <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> <p>Generating flashcards...</p></div> : flashcards ? (
                        <div className="grid grid-cols-1 gap-4 pr-4 @md:grid-cols-2">
                          {flashcards.map((card, i) => <Flashcard key={i} {...card} />)}
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Button onClick={handleGenerateFlashcards} disabled={isGeneratingFlashcards}>
                            <BookCopy className="mr-2 h-4 w-4" />
                            Generate Flashcards
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="quiz" className="h-full">
                       {isGeneratingQuiz ? <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> <p>Generating quiz...</p></div> : (
                        <div className="flex h-full items-center justify-center">
                           <Button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz}>
                             <HelpCircle className="mr-2 h-4 w-4" />
                            Generate Quiz & Start
                          </Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="tutor" className="h-full">
                      <TutorChat 
                        content={analysis ? (imageDataUri ? `Image name: ${title}. Key Concepts from Image: ${analysis.keyConcepts.map(c => c.concept).join(', ')}. Potential Questions from Image: ${analysis.potentialQuestions.join(' ')}` : content) : content} 
                        onSendMessage={handleTutorChat}
                      />
                    </TabsContent>
                    <TabsContent value="image" className="h-full">
                       {isGeneratingImage ? (
                         <div className="flex h-full flex-col items-center justify-center gap-4 text-muted-foreground">
                            <p className="text-sm font-medium">{imageGenerationSteps[imageGenerationStep]}</p>
                            <Progress value={imageGenerationProgress} className="w-3/4" />
                            <p className="text-xs text-muted-foreground">This can take up to 30 seconds...</p>
                         </div>
                       ) : generatedImage ? (
                        <div className="flex flex-col items-center justify-center h-full">
                          <Image src={generatedImage.imageDataUri} alt="Generated visual aid" width={400} height={400} className="rounded-lg border shadow-md" />
                          <p className="text-sm text-muted-foreground mt-4">A visual aid for your study material.</p>
                        </div>
                      ) : (
                        <div className="flex h-full items-center justify-center">
                           <Button onClick={handleGenerateImage} disabled={isGeneratingImage}>
                            <Camera className="mr-2 h-4 w-4" />
                            Generate Image
                          </Button>
                        </div>
                      )}
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

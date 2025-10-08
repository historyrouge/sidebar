
"use client";

import type { AnalyzeContentOutput, GenerateFlashcardsOutput, GenerateQuizzesOutput, AnalyzeImageContentOutput, SummarizeContentOutput } from "@/app/actions";
import { analyzeContentAction, analyzeImageContentAction, generateFlashcardsAction, generateQuizAction, textToSpeechAction, chatWithTutorAction, imageToTextAction, AnalyzeImageContentInput } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileUp, Loader2, Moon, Sun, Wand2, Save, Image as ImageIcon, X, Volume2, Pilcrow, CheckCircle2, Circle, Camera, BrainCircuit, HelpCircle, BookCopy, ListTree, Code, Copy, Mic, MicOff, MapPin, Calendar, Users, RefreshCw } from "lucide-react";
import React, { useState, useTransition, useRef, useEffect, useCallback } from "react";
import { Flashcard } from "./flashcard";
import { SidebarTrigger } from "./ui/sidebar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { TutorChat } from "./tutor-chat";
import { useRouter } from "next/navigation";
import { Input } from "./ui/input";
import Image from "next/image";
import imageToDataUri from "image-to-data-uri";
import { cn } from "@/lib/utils";
import { BackButton } from "./back-button";
import { Progress } from "./ui/progress";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogClose } from "./ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

declare const puter: any;

export function StudyNowContent() {
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [analysis, setAnalysis] = useState<AnalyzeContentOutput | AnalyzeImageContentOutput | null>(null);
  const [flashcards, setFlashcards] = useState<GenerateFlashcardsOutput['flashcards'] | null>(null);
  
  const [imageDataUri, setImageDataUri] = useState<string | null>(null);
  const [audioDataUri, setAudioDataUri] = useState<string | null>(null);
  const [isSynthesizing, setIsSynthesizing] = useState<string | null>(null);

  const [activeTab, setActiveTab] = useState("analysis");
  const [isAnalyzing, startAnalyzing] = useTransition();
  const [isLoadingMaterial, startLoadingMaterial] = useTransition();
  const [isGeneratingFlashcards, startGeneratingFlashcards] = useTransition();
  const [isGeneratingQuiz, startGeneratingQuiz] = useTransition();

  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isStreamReady, setIsStreamReady] = useState(false);

  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [currentDeviceId, setCurrentDeviceId] = useState<string | undefined>(undefined);
  const streamRef = useRef<MediaStream | null>(null);

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
            setActiveTab("analysis");
        }
    });
  }, [content, imageDataUri, toast]);

  const handleAnalyzeImage = useCallback(async () => {
    if (!imageDataUri) return;
    startAnalyzing(async () => {
        const result = await analyzeImageContentAction({ imageDataUri: imageDataUri, prompt: content });
        if (result.error) {
            toast({ title: "Image Analysis Failed", description: result.error, variant: "destructive" });
        } else {
            setAnalysis(result.data as AnalyzeImageContentOutput);
            setFlashcards(null);
            setActiveTab("analysis");
        }
    });
  }, [imageDataUri, content, toast]);

  const handleGenerateFlashcards = useCallback(async () => {
    if (!analysis) return;
    startGeneratingFlashcards(async () => {
      const flashcardContent = `Key Concepts: ${analysis.keyConcepts.map(c => c.concept).join(', ')}. Questions: ${analysis.potentialQuestions?.join(' ')}`;
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
        const quizContent = `Key Concepts: ${analysis.keyConcepts.map(c => c.concept).join(', ')}. Questions: ${analysis.potentialQuestions?.join(' ')}`;
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

  const handleFileUploadClick = () => fileInputRef.current?.click();
  const handleImageUploadClick = () => imageInputRef.current?.click();

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
          setAnalysis(null); setFlashcards(null); setImageDataUri(null);
          toast({ title: "File loaded", description: "The file content has been loaded. Click Analyze to begin." });
        };
        reader.readAsText(file);
      } else {
        toast({ title: "Invalid file type", description: "Please upload a .txt file.", variant: "destructive" });
      }
    }
  };

  const handleImageFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
        if (file.type.startsWith("image/")) {
            startLoadingMaterial(async () => {
                try {
                    const dataUri = await imageToDataUri(URL.createObjectURL(file));
                    setImageDataUri(dataUri);

                    const ocrResult = await imageToTextAction({ imageDataUri: dataUri });
                    if (ocrResult.error) {
                        throw new Error(ocrResult.error);
                    }

                    setContent(ocrResult.data?.text || "");
                    setTitle(file.name);
                    setAnalysis(null); 
                    setFlashcards(null); 
                    
                    toast({ title: "Image & Text Loaded!", description: "Text has been extracted via OCR. Click Analyze to begin." });
                } catch (error: any) {
                    toast({ title: "Image processing failed", description: error.message || "Could not read the image file or extract text.", variant: "destructive" });
                    setImageDataUri(null);
                }
            });
        } else {
            toast({ title: "Invalid file type", description: "Please upload an image file (e.g., PNG, JPG).", variant: "destructive" });
        }
    }
  };

  const clearImage = () => {
    setImageDataUri(null); setTitle(""); setContent(""); setAnalysis(null); setFlashcards(null);
    if(imageInputRef.current) imageInputRef.current.value = "";
  }

  const handleTutorChat = async (history: any) => await chatWithTutorAction({ content, history });

    const startCamera = useCallback(async (deviceId?: string) => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
        setIsStreamReady(false);
        
        const videoConstraints: MediaTrackConstraints = {
            facingMode: { ideal: "environment" }
        };
        if (deviceId) {
            videoConstraints.deviceId = { exact: deviceId };
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints });
            streamRef.current = stream;
            setHasCameraPermission(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => setIsStreamReady(true);
            }
        } catch (error) {
            console.error('Error accessing camera:', error);
            setHasCameraPermission(false);
        }
    }, []);

    useEffect(() => {
        const getDevicesAndStart = async () => {
            if (isCameraOpen) {
                try {
                    setHasCameraPermission(null);
                    const devices = await navigator.mediaDevices.enumerateDevices();
                    const videoDevs = devices.filter(d => d.kind === 'videoinput');
                    setVideoDevices(videoDevs);
    
                    let initialDeviceId = currentDeviceId;
                    if (!initialDeviceId && videoDevs.length > 0) {
                        const backCamera = videoDevs.find(d => d.label.toLowerCase().includes('back'));
                        initialDeviceId = backCamera ? backCamera.deviceId : videoDevs[0].deviceId;
                        setCurrentDeviceId(initialDeviceId);
                    }
    
                    await startCamera(initialDeviceId);
                } catch(e) {
                    console.error("Failed to enumerate devices:", e);
                    setHasCameraPermission(false);
                }
            }
        };

        getDevicesAndStart();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (videoRef.current) {
                videoRef.current.srcObject = null;
            }
        };
    }, [isCameraOpen, currentDeviceId, startCamera]);

    const handleSwitchCamera = () => {
        if (videoDevices.length > 1) {
            const currentIndex = videoDevices.findIndex(d => d.deviceId === currentDeviceId);
            const nextIndex = (currentIndex + 1) % videoDevices.length;
            setCurrentDeviceId(videoDevices[nextIndex].deviceId);
        }
    };


    const handleCaptureImage = () => {
        if (!videoRef.current) return;

        startLoadingMaterial(async () => {
            const canvas = document.createElement('canvas');
            canvas.width = videoRef.current!.videoWidth;
            canvas.height = videoRef.current!.videoHeight;
            const context = canvas.getContext('2d');
            if (!context) {
                toast({ title: "Capture failed", description: "Could not get canvas context.", variant: "destructive" });
                return;
            }
            context.drawImage(videoRef.current!, 0, 0, canvas.width, canvas.height);
            const dataUri = canvas.toDataURL('image/png');
            
            setIsCameraOpen(false);
            setImageDataUri(dataUri);

            try {
                const ocrResult = await imageToTextAction({ imageDataUri: dataUri });
                if (ocrResult.error) throw new Error(ocrResult.error);

                setContent(ocrResult.data?.text || "");
                setTitle("Camera Capture");
                setAnalysis(null);
                setFlashcards(null);

                toast({ title: "Image Captured & Text Extracted!", description: "The captured image is ready for analysis." });
            } catch (error: any) {
                toast({ title: "OCR Failed", description: error.message || "Could not extract text from the captured image.", variant: "destructive" });
                // Keep image but content will be empty
                setContent("");
            }
        });
    };

  const isLoading = isAnalyzing || isLoadingMaterial || isGeneratingFlashcards || isGeneratingQuiz;
  
  const TABS = [
    { value: "analysis", label: "Analysis", disabled: !analysis },
    { value: "flashcards", label: "Flashcards", disabled: !analysis },
    { value: "quiz", label: "Quiz", disabled: !analysis },
    { value: "tutor", label: "Tutor", disabled: !analysis }
  ];

  const analysisAsImageOutput = analysis as AnalyzeImageContentOutput;

  return (
    <div className="flex h-screen flex-col bg-muted/40">
        <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
            <DialogContent>
                <DialogHeader><DialogTitle>Capture from Camera</DialogTitle></DialogHeader>
                <div className="relative">
                    <video ref={videoRef} className="w-full aspect-video rounded-md bg-muted" autoPlay muted />
                    {hasCameraPermission === null && 
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                            <div className="text-center">
                                <Loader2 className="animate-spin h-8 w-8 mx-auto" />
                                <p className="mt-2 text-muted-foreground">Requesting camera access...</p>
                            </div>
                        </div>
                    }
                    {hasCameraPermission === false && (
                        <div className="absolute inset-0 flex items-center justify-center bg-background/80 p-4">
                            <Alert variant="destructive">
                                <AlertTitle>Camera Access Required</AlertTitle>
                                <AlertDescription>
                                    Please allow camera access in your browser settings to use this feature. You may need to reload the page after granting permission.
                                </AlertDescription>
                            </Alert>
                        </div>
                    )}
                </div>
                <DialogFooter className="flex justify-between w-full">
                    <div>
                         {videoDevices.length > 1 && (
                            <Button variant="outline" onClick={handleSwitchCamera}>
                                <RefreshCw className="mr-2 h-4 w-4" /> Switch Camera
                            </Button>
                        )}
                    </div>
                    <div className="flex gap-2">
                        <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                        <Button onClick={handleCaptureImage} disabled={!hasCameraPermission || !isStreamReady || isLoadingMaterial}>
                            {isLoadingMaterial ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : isStreamReady ? 'Capture & OCR' : 'Starting...'}
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
      <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
        <div className="flex items-center gap-2">
            <SidebarTrigger className="lg:hidden" />
            <BackButton />
            <h1 className="text-xl font-semibold tracking-tight">Study Session</h1>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-4xl space-y-8">
          <Card className="flex flex-col @container">
            <CardHeader>
              <CardTitle>Your Study Material</CardTitle>
              <CardDescription>Paste text, upload a document, or capture an image. Analysis is done by {imageDataUri ? 'Gemini' : 'Qwen'}.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col gap-4">
              <Input placeholder="Enter a title for your material..." value={title} onChange={(e) => setTitle(e.target.value)} className="text-lg font-semibold" disabled={isLoading} />
              {isLoadingMaterial ? <Skeleton className="w-full h-full min-h-[300px] flex-1" /> : imageDataUri ? (
                <div className="relative flex-1 min-h-[300px]">
                    <Image src={imageDataUri} alt="Uploaded content" layout="fill" objectFit="contain" className="rounded-md border" />
                    <Button variant="destructive" size="icon" className="absolute top-2 right-2 z-10 h-8 w-8" onClick={clearImage}><X className="h-4 w-4" /></Button>
                </div>
              ) : (
                <div className="relative h-full">
                    <Textarea placeholder="Paste your study content here... (min. 50 characters)" className="h-full min-h-[300px] resize-none pr-10" value={content} onChange={(e) => setContent(e.target.value)} />
                    <Button size="icon" variant={isRecording ? 'destructive' : 'ghost'} onClick={handleToggleRecording} className="absolute bottom-3 right-3">
                        {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
                        <span className="sr-only">{isRecording ? 'Stop recording' : 'Start recording'}</span>
                    </Button>
                </div>
              )}
               {imageDataUri && <Textarea placeholder="Text extracted via OCR will appear here. You can edit it before analysis." className="h-24 resize-none" value={content} onChange={(e) => setContent(e.target.value)} />}
            </CardContent>
            <CardFooter className="flex flex-col items-stretch gap-2 @sm:flex-row">
              <Button onClick={handleAnalyze} disabled={isLoading || (!imageDataUri && content.trim().length < 50)}>
                {isAnalyzing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                Analyze
              </Button>
              <div className="flex items-stretch gap-2 flex-1">
                <Button variant="outline" className="flex-1" onClick={handleFileUploadClick} disabled={isLoading}><FileUp className="mr-2 h-4 w-4" />.txt</Button>
                <Button variant="outline" className="flex-1" onClick={handleImageUploadClick} disabled={isLoading}><ImageIcon className="mr-2 h-4 w-4" />Image</Button>
                <Button variant="outline" className="flex-1" onClick={() => { setIsCameraOpen(true); }} disabled={isLoading}><Camera className="mr-2 h-4 w-4" />Capture</Button>
              </div>
              <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".txt" />
              <input type="file" ref={imageInputRef} onChange={handleImageFileChange} className="hidden" accept="image/*" />
            </CardFooter>
          </Card>

          <Card className="flex flex-col @container min-h-[400px]">
            <CardHeader>
              <CardTitle>AI-Powered Study Tools</CardTitle>
              <CardDescription>Tools are powered by their optimal AI models.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              {isAnalyzing && !analysis ? (
                <div className="space-y-4 p-1">
                  <Skeleton className="h-8 w-1/3" /><Skeleton className="h-20 w-full" /><Skeleton className="h-8 w-1/3" /><Skeleton className="h-20 w-full" />
                </div>
              ) : !analysis ? (
                <div className="flex h-full items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                  <div className="text-center p-8">
                    <Wand2 className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h3 className="mt-4 text-lg font-semibold">Ready to Learn?</h3>
                    <p className="mt-1 text-sm text-muted-foreground">Analyze your material to generate study tools.</p>
                  </div>
                </div>
              ) : (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex h-full flex-col">
                  <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                    {TABS.map(tab => <TabsTrigger key={tab.value} value={tab.value} disabled={tab.disabled}>{tab.label}</TabsTrigger>)}
                  </TabsList>
                  <ScrollArea className="mt-4 flex-1">
                  <TabsContent value="analysis" className="h-full">
                    <Accordion type="multiple" defaultValue={['summary', 'key-concepts']} className="w-full space-y-3 pr-4">
                        <AccordionItem value="summary" className="rounded-md border bg-card px-4">
                            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base"><div className="flex items-center gap-3"><Pilcrow />Summary</div></AccordionTrigger>
                            <AccordionContent className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
                                <div className="flex justify-end">
                                    <Button size="icon" variant="ghost" onClick={() => handleTextToSpeech(analysis.summary, 'summary')} disabled={!!isSynthesizing} className="mb-2">
                                        {isSynthesizing === 'summary' ? <Loader2 className="animate-spin" /> : <Volume2 />}
                                    </Button>
                                </div>
                                {audioDataUri && isSynthesizing === 'summary' && (
                                    <div className="mb-2">
                                        <audio controls autoPlay src={audioDataUri} className="w-full" onEnded={() => { setAudioDataUri(null); setIsSynthesizing(null); }} />
                                    </div>
                                )}
                                <p>{analysis.summary}</p>
                            </AccordionContent>
                        </AccordionItem>
                        <AccordionItem value="key-concepts" className="rounded-md border bg-card px-4">
                            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base"><div className="flex items-center gap-3"><BrainCircuit/>Key Concepts</div></AccordionTrigger>
                            <AccordionContent className="prose prose-sm dark:prose-invert max-w-none">
                            {analysis.keyConcepts?.map((concept, i) => <div key={i} className="py-2"><p className="font-semibold !my-0">{concept.concept}</p><p className="text-muted-foreground !my-0">{concept.explanation}</p></div>)}
                            </AccordionContent>
                        </AccordionItem>
                        {'entities' in analysis && (
                            <AccordionItem value="entities" className="rounded-md border bg-card px-4">
                                <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base"><div className="flex items-center gap-3"><ListTree />Entities</div></AccordionTrigger>
                                <AccordionContent className="space-y-3">
                                    {analysisAsImageOutput.entities.people.length > 0 && <div><h4 className="flex items-center gap-2 text-sm font-semibold mb-1"><Users className="size-4"/>People</h4><div className="flex flex-wrap gap-2">{analysisAsImageOutput.entities.people.map(p => <span key={p} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{p}</span>)}</div></div>}
                                    {analysisAsImageOutput.entities.places.length > 0 && <div><h4 className="flex items-center gap-2 text-sm font-semibold mb-1"><MapPin className="size-4"/>Places</h4><div className="flex flex-wrap gap-2">{analysisAsImageOutput.entities.places.map(p => <span key={p} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{p}</span>)}</div></div>}
                                    {analysisAsImageOutput.entities.dates.length > 0 && <div><h4 className="flex items-center gap-2 text-sm font-semibold mb-1"><Calendar className="size-4"/>Dates</h4><div className="flex flex-wrap gap-2">{analysisAsImageOutput.entities.dates.map(d => <span key={d} className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded-full">{d}</span>)}</div></div>}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        {'diagrams' in analysis && analysisAsImageOutput.diagrams.length > 0 && (
                            <AccordionItem value="diagrams" className="rounded-md border bg-card px-4">
                                <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base"><div className="flex items-center gap-3"><ListTree />Diagrams & Processes</div></AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                {analysisAsImageOutput.diagrams.map((d, i) => <div key={i}><h4 className="font-semibold">{d.title}</h4><p className="text-sm text-muted-foreground">{d.explanation}</p></div>)}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        {analysis.codeExamples?.length > 0 && (
                            <AccordionItem value="code-examples" className="rounded-md border bg-card px-4">
                                <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base"><div className="flex items-center gap-3"><Code />Code Examples</div></AccordionTrigger>
                                <AccordionContent className="space-y-4">
                                {analysis.codeExamples.map((example, i) => <div key={i} className="space-y-2"><p className="text-sm text-muted-foreground">{example.explanation}</p><div className="relative rounded-md bg-muted/50 p-4 font-mono text-xs"><Button size="icon" variant="ghost" className="absolute top-2 right-2 h-6 w-6" onClick={() => handleCopyToClipboard(example.code, "Code")}><Copy className="h-4 w-4" /></Button><pre className="whitespace-pre-wrap"><code>{example.code}</code></pre></div></div>)}
                                </AccordionContent>
                            </AccordionItem>
                        )}
                        <AccordionItem value="potential-questions" className="rounded-md border bg-card px-4">
                            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base"><div className="flex items-center gap-3"><HelpCircle />Potential Questions</div></AccordionTrigger>
                            <AccordionContent className="prose-sm dark:prose-invert max-w-none">
                            <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">{analysis.potentialQuestions?.map((q, i) => <li key={i}>{q}</li>)}</ul>
                            </AccordionContent>
                        </AccordionItem>
                         <AccordionItem value="related-topics" className="rounded-md border bg-card px-4">
                            <AccordionTrigger className="py-4 text-left font-medium hover:no-underline text-base"><div className="flex items-center gap-3"><ListTree />Related Topics</div></AccordionTrigger>
                            <AccordionContent className="prose-sm dark:prose-invert max-w-none">
                            <ul className="mt-2 list-disc space-y-2 pl-5 text-muted-foreground">{analysis.relatedTopics?.map((q, i) => <li key={i}>{q}</li>)}</ul>
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
                          <Button onClick={handleGenerateFlashcards} disabled={isGeneratingFlashcards}><BookCopy className="mr-2 h-4 w-4" />Generate Flashcards</Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="quiz" className="h-full">
                       {isGeneratingQuiz ? <div className="flex h-full items-center justify-center gap-2 text-muted-foreground"><Loader2 className="animate-spin" /> <p>Generating quiz...</p></div> : (
                        <div className="flex h-full items-center justify-center">
                           <Button onClick={handleGenerateQuiz} disabled={isGeneratingQuiz}><HelpCircle className="mr-2 h-4 w-4" />Generate Quiz & Start</Button>
                        </div>
                      )}
                    </TabsContent>
                    <TabsContent value="tutor" className="h-full">
                      <TutorChat content={analysis ? (imageDataUri ? `Image name: ${title}. Key Concepts from Image: ${analysis.keyConcepts.map(c => c.concept).join(', ')}. Potential Questions from Image: ${analysis.potentialQuestions?.join(' ')}` : content) : content} onSendMessage={handleTutorChat}/>
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

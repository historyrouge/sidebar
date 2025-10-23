
"use client";

import { useState, useTransition, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, UploadCloud, X, Palette, Sun, Bot, FileText, ScanText, Tag } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import * as cocoSsd from "@tensorflow-models/coco-ssd";
import * as tf from "@tensorflow/tfjs";
import Tesseract from 'tesseract.js';
import { Progress } from "./ui/progress";

type LocalAnalysis = {
    dominantColors: { hex: string; name: string }[];
    brightness: number;
    objects: cocoSsd.DetectedObject[];
    text: string;
}

type AnalysisHistoryItem = {
    id: string;
    imageUrl: string;
    analysis: LocalAnalysis;
    timestamp: Date;
}

const AnalysisCard = ({ title, icon, children, className }: { title: string, icon: React.ReactNode, children: React.ReactNode, className?: string }) => (
    <motion.div 
        className={`bg-neutral-800/50 border border-neutral-700/80 rounded-2xl p-4 backdrop-blur-sm ${className}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
    >
        <h3 className="text-sm font-semibold text-neutral-300 flex items-center gap-2 mb-2">{icon}{title}</h3>
        <div className="text-sm text-neutral-200">{children}</div>
    </motion.div>
);

let modelPromise: Promise<cocoSsd.ObjectDetection> | null = null;

const loadModel = () => {
  if (!modelPromise) {
    modelPromise = tf.ready().then(() => cocoSsd.load());
  }
  return modelPromise;
};

export function AnalyzerContent() {
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [isAnalyzing, startAnalyzing] = useTransition();
    const [analysisResult, setAnalysisResult] = useState<LocalAnalysis | null>(null);
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [analysisProgress, setAnalysisProgress] = useState(0);
    const [analysisStatus, setAnalysisStatus] = useState("");

    const { toast } = useToast();
    const imageRef = useRef<HTMLImageElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);

    const getLocalAnalysis = async (dataUri: string): Promise<LocalAnalysis> => {
        const imageElement = imageRef.current;
        if (!imageElement) throw new Error("Image element not ready");

        // 1. Color and Brightness Analysis
        setAnalysisStatus("Analyzing colors...");
        setAnalysisProgress(10);
        const colorAndBrightness = await new Promise<Pick<LocalAnalysis, 'dominantColors' | 'brightness'>>((resolve, reject) => {
            const canvas = canvasRef.current;
            const ctx = canvas?.getContext('2d', { willReadFrequently: true });
            if (!canvas || !ctx) return reject('Canvas not ready');

            const img = new window.Image();
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                const canvasWidth = 100;
                const canvasHeight = 100 / aspectRatio;
                canvas.width = canvasWidth;
                canvas.height = canvasHeight;
                ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);
                try {
                    const imageData = ctx.getImageData(0, 0, canvasWidth, canvasHeight).data;
                    const colorCount: { [key: string]: number } = {};
                    let totalBrightness = 0;
                    for (let i = 0; i < imageData.length; i += 4) {
                        const [r, g, b] = [imageData[i], imageData[i + 1], imageData[i + 2]];
                        totalBrightness += (r * 299 + g * 587 + b * 114) / 1000;
                        const hex = `#${(1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1)}`;
                        colorCount[hex] = (colorCount[hex] || 0) + 1;
                    }
                    const dominantColors = Object.entries(colorCount).sort(([, a], [, b]) => b - a).slice(0, 5).map(([hex]) => ({ hex, name: hex }));
                    const averageBrightness = Math.round((totalBrightness / (imageData.length / 4)) / 2.55);
                    resolve({ dominantColors, brightness: averageBrightness });
                } catch (e) {
                    reject('Could not process image data.');
                }
            };
            img.onerror = () => reject('Failed to load image for color analysis');
            img.src = dataUri;
        });
        setAnalysisProgress(33);

        // 2. Object Detection
        setAnalysisStatus("Detecting objects...");
        const model = await loadModel();
        const objects = await model.detect(imageElement);
        setAnalysisProgress(66);

        // 3. Text Extraction (OCR)
        setAnalysisStatus("Extracting text...");
        const { data: { text } } = await Tesseract.recognize(dataUri, 'eng', {
            logger: m => {
                if (m.status === 'recognizing text') {
                    setAnalysisProgress(66 + Math.round(m.progress * 34));
                }
            }
        });
        setAnalysisProgress(100);

        return { ...colorAndBrightness, objects, text };
    };

    const handleAnalyze = (dataUri: string) => {
        setAnalysisResult(null);
        startAnalyzing(async () => {
            try {
                const result = await getLocalAnalysis(dataUri);
                setAnalysisResult(result);
                 const newHistoryItem: AnalysisHistoryItem = {
                    id: new Date().toISOString(),
                    imageUrl: dataUri,
                    analysis: result,
                    timestamp: new Date()
                };
                setHistory(prev => [newHistoryItem, ...prev.slice(0, 5)]);
                toast({ title: "Analysis Complete!" });
            } catch (error: any) {
                 toast({ title: "Analysis Failed", description: error.toString(), variant: "destructive" });
            } finally {
                setAnalysisStatus("");
                setAnalysisProgress(0);
            }
        });
    };


    const handleFileChange = (files: FileList | null) => {
        const file = files?.[0];
        if (file && file.type.startsWith("image/")) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result as string;
                setImageDataUri(result);
                handleAnalyze(result);
            };
            reader.readAsDataURL(file);
        } else {
            toast({ title: "Invalid File", description: "Please upload an image.", variant: "destructive" });
        }
    };

    const handleClear = () => {
        setImageDataUri(null);
        setAnalysisResult(null);
    };

    const handleDragEvents = (e: React.DragEvent<HTMLDivElement>, isEntering: boolean) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(isEntering);
    }
    
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        handleDragEvents(e, false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            handleFileChange(files);
        }
    };
    
    const handleSelectFromHistory = (item: AnalysisHistoryItem) => {
        setImageDataUri(item.imageUrl);
        setAnalysisResult(item.analysis);
    }

    return (
        <div className="flex h-full flex-col bg-[#1A1A1A] text-neutral-200" style={{'--warm-g-start': '#2d2d2d', '--warm-g-end': '#1a1a1a'} as React.CSSProperties}>
            <canvas ref={canvasRef} className="hidden"></canvas>
            {imageDataUri && <img ref={imageRef} src={imageDataUri} alt="hidden analysis target" className="hidden" />}
            <div 
                className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
            />
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-neutral-800 bg-transparent px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Local Photo Analyzer</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 relative z-10">
                <div className="mx-auto max-w-7xl">
                    {!imageDataUri ? (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center"
                        >
                            <Card 
                                className={`bg-neutral-900/50 border-2 border-dashed border-neutral-700 p-8 md:p-12 text-center transition-all duration-300 ${isDragging ? 'border-primary scale-105' : ''}`}
                                onDragEnter={(e) => handleDragEvents(e, true)}
                                onDragLeave={(e) => handleDragEvents(e, false)}
                                onDragOver={(e) => e.preventDefault()}
                                onDrop={handleDrop}
                            >
                                <UploadCloud className="mx-auto h-16 w-16 text-neutral-500 mb-4" />
                                <CardTitle className="text-2xl font-bold">Upload Your Image</CardTitle>
                                <CardDescription className="text-neutral-400 mt-2">Drag & drop an image here, or click to select a file.</CardDescription>
                                <input type="file" id="file-upload" className="hidden" accept="image/*" onChange={(e) => handleFileChange(e.target.files)} />
                                <Button size="lg" className="mt-6" onClick={() => document.getElementById('file-upload')?.click()}>
                                    <ImageIcon className="mr-2 h-5 w-5" /> Select Image
                                </Button>
                            </Card>
                        </motion.div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                             <Card className="bg-neutral-900/50 border-neutral-800 sticky top-24">
                                <CardHeader className="flex flex-row items-center justify-between">
                                    <CardTitle>Your Image</CardTitle>
                                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleClear}><X className="h-4 w-4" /></Button>
                                </CardHeader>
                                <CardContent>
                                    <div className="relative aspect-video w-full rounded-lg overflow-hidden">
                                        <Image src={imageDataUri} alt="Uploaded" fill className="object-contain" />
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="space-y-6">
                                <h2 className="text-2xl font-semibold">Local AI Analysis</h2>
                                {isAnalyzing ? (
                                    <div className="flex flex-col items-center gap-4 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                        <p className="font-semibold">{analysisStatus}</p>
                                        <Progress value={analysisProgress} className="w-full max-w-sm" />
                                    </div>
                                ) : analysisResult && (
                                     <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                                        <AnalysisCard title="Dominant Colors" icon={<Palette />} className="lg:col-span-2">
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.dominantColors.map(color => <div key={color.hex} className="flex items-center gap-2 text-xs"><div className="h-4 w-4 rounded-full border border-neutral-600" style={{backgroundColor: color.hex}}></div> {color.name}</div>)}
                                            </div>
                                        </AnalysisCard>
                                        <AnalysisCard title="Brightness" icon={<Sun />}>
                                            <p className="text-3xl font-bold">{analysisResult.brightness}%</p>
                                        </AnalysisCard>
                                        <AnalysisCard title="Detected Objects" icon={<Bot />} className="lg:col-span-3">
                                            {analysisResult.objects.length > 0 ? (
                                                <div className="flex flex-wrap gap-2">
                                                    {analysisResult.objects.map((obj, i) => <div key={i} className="flex items-center gap-2 text-xs bg-neutral-700/60 px-2 py-1 rounded-full"><Tag className="w-3 h-3" /> {obj.class} <span className="text-neutral-400">({Math.round(obj.score * 100)}%)</span></div>)}
                                                </div>
                                            ) : <p className="text-xs text-neutral-400">No objects detected.</p>}
                                        </AnalysisCard>
                                        <AnalysisCard title="Extracted Text (OCR)" icon={<ScanText />} className="lg:col-span-3">
                                            {analysisResult.text ? (
                                                <p className="text-xs text-neutral-300 whitespace-pre-wrap font-mono max-h-32 overflow-y-auto">{analysisResult.text}</p>
                                            ) : <p className="text-xs text-neutral-400">No text found in the image.</p>}
                                        </AnalysisCard>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                    
                    {history.length > 0 && (
                        <div className="mt-12">
                            <h3 className="text-xl font-semibold mb-4 text-center">Analysis History</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                                {history.map(item => (
                                    <motion.div key={item.id} whileHover={{scale: 1.05}}>
                                        <Card 
                                            className="overflow-hidden cursor-pointer group"
                                            onClick={() => handleSelectFromHistory(item)}
                                        >
                                            <div className="relative aspect-square">
                                                <Image src={item.imageUrl} alt="History item" fill className="object-cover" />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <p className="text-white text-xs text-center font-semibold">View</p>
                                                </div>
                                            </div>
                                        </Card>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}


"use client";

import { useState, useTransition, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Image as ImageIcon, UploadCloud, X, Palette, Shapes, Smile, Sparkles, BrainCircuit, Droplets } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { analyzeImageContentAction } from "@/app/actions";
import { AnalyzeImageContentOutput } from "@/lib/image-analysis-types";
import { Skeleton } from "./ui/skeleton";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

type AnalysisHistoryItem = {
    id: string;
    imageUrl: string;
    analysis: AnalyzeImageContentOutput;
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

export function AnalyzerContent() {
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [isAnalyzing, startAnalyzing] = useTransition();
    const [analysisResult, setAnalysisResult] = useState<AnalyzeImageContentOutput | null>(null);
    const [history, setHistory] = useState<AnalysisHistoryItem[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const { toast } = useToast();

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

    const handleAnalyze = (dataUri: string) => {
        setAnalysisResult(null);
        startAnalyzing(async () => {
            const result = await analyzeImageContentAction({ imageDataUri: dataUri });
            if (result.error) {
                toast({ title: "Analysis Failed", description: result.error, variant: "destructive" });
            } else if (result.data) {
                setAnalysisResult(result.data);
                const newHistoryItem = {
                    id: new Date().toISOString(),
                    imageUrl: dataUri,
                    analysis: result.data,
                    timestamp: new Date()
                };
                setHistory(prev => [newHistoryItem, ...prev.slice(0, 5)]); // Keep history to 6 items
                toast({ title: "Analysis Complete!" });
            }
        });
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
            <div 
                className="absolute inset-0 z-0 opacity-40 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.3),rgba(255,255,255,0))]"
            />
            <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center justify-between border-b border-neutral-800 bg-transparent px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Photo Analyzer</h1>
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
                                <h2 className="text-2xl font-semibold">AI Analysis</h2>
                                {isAnalyzing ? (
                                    <div className="space-y-4">
                                        <Skeleton className="h-24 w-full" />
                                        <div className="grid grid-cols-2 gap-4">
                                            <Skeleton className="h-32 w-full" />
                                            <Skeleton className="h-32 w-full" />
                                        </div>
                                        <Skeleton className="h-40 w-full" />
                                    </div>
                                ) : analysisResult && (
                                     <div className="bento-grid">
                                        <AnalysisCard title="Description" icon={<Sparkles />} className="bento-main">
                                            <p>{analysisResult.description}</p>
                                        </AnalysisCard>
                                        <AnalysisCard title="Mood & Tone" icon={<Smile />}>
                                            <p className="capitalize">{analysisResult.mood.join(', ')}</p>
                                        </AnalysisCard>
                                        <AnalysisCard title="Key Objects" icon={<Shapes />}>
                                            <ul className="list-disc list-inside">
                                                {analysisResult.objects.map((obj, i) => <li key={i}>{obj}</li>)}
                                            </ul>
                                        </AnalysisCard>
                                        <AnalysisCard title="Dominant Colors" icon={<Palette />}>
                                            <div className="flex flex-wrap gap-2">
                                                {analysisResult.colors.map(color => <div key={color.hex} className="flex items-center gap-2 text-xs"><div className="h-4 w-4 rounded-full border border-neutral-600" style={{backgroundColor: color.hex}}></div> {color.name}</div>)}
                                            </div>
                                        </AnalysisCard>
                                        <AnalysisCard title="Composition" icon={<BrainCircuit />}>
                                            <p>{analysisResult.composition.join(', ')}</p>
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
            <style jsx>{`
                .bento-grid {
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: 1rem;
                }
                .bento-main {
                    grid-column: span 2;
                }
            `}</style>
        </div>
    );
}

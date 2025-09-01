
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, BrainCircuit, Share2, CornerDownRight, AlertTriangle } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { generateMindMapAction, GenerateMindMapOutput } from "@/app/actions";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { cn } from "@/lib/utils";

type MindMapNode = GenerateMindMapOutput['mainNodes'][0];

const NodeComponent: React.FC<{ node: MindMapNode; isLastChild: boolean; isRoot?: boolean }> = ({ node, isLastChild, isRoot = false }) => {
    return (
        <div className="relative flex items-start">
            <div className="flex flex-col items-center mr-4">
                {!isRoot && (
                    <>
                        <div className={cn("w-px h-6", isLastChild ? 'bg-transparent' : 'bg-border')}></div>
                        <div className="w-6 h-px bg-border"></div>
                    </>
                )}
            </div>
            <div className="flex-1">
                <div className={cn("p-3 rounded-lg flex-1", isRoot ? "bg-primary/10 border-primary/20 border" : "bg-card border")}>
                    <p className={cn("font-medium", isRoot ? "text-primary font-semibold" : "text-foreground")}>{node.title}</p>
                </div>
                 {node.children && node.children.length > 0 && (
                    <div className="mt-2 pl-6 border-l-2 border-dashed border-border/50">
                        <div className="space-y-2">
                           {node.children.map((child, index) => (
                                <NodeComponent
                                    key={index}
                                    node={child}
                                    isLastChild={index === node.children.length - 1}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};


export function MindMapContent() {
    const [content, setContent] = useState("");
    const [mindMap, setMindMap] = useState<GenerateMindMapOutput | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isGenerating, startGenerating] = useTransition();
    const { toast } = useToast();

    const handleGenerate = () => {
        if (content.trim().length < 50) {
            toast({
                title: "Content too short",
                description: "Please provide at least 50 characters to generate a mind map.",
                variant: "destructive",
            });
            return;
        }
        setError(null);
        setMindMap(null);
        startGenerating(async () => {
            const result = await generateMindMapAction({ content });
            if (result.error) {
                setError(result.error);
                toast({ title: "Mind Map Generation Failed", description: "Please check the panel for details.", variant: "destructive" });
            } else {
                setMindMap(result.data ?? null);
                toast({ title: "Mind Map Generated!", description: "Your mind map is ready for review." });
            }
        });
    };

    return (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Mind Map Creator</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2 h-full items-start">
                    <Card className="flex flex-col h-full">
                        <CardHeader>
                            <CardTitle>Enter Your Content</CardTitle>
                            <CardDescription>Paste your study material below to generate a structured mind map using Qwen.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col">
                            <Textarea
                                placeholder="Paste your content here..."
                                className="h-full min-h-[400px] resize-none"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                            />
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleGenerate} disabled={isGenerating || content.trim().length < 50}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Generate Mind Map
                            </Button>
                        </CardFooter>
                    </Card>
                    <Card className="h-full">
                        <CardHeader>
                            <CardTitle>Generated Mind Map</CardTitle>
                            <CardDescription>Explore your content in a visual, hierarchical structure.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <ScrollArea className="h-[520px] w-full">
                                {isGenerating ? (
                                    <div className="space-y-6 pr-4">
                                        <div className="space-y-2">
                                            <Skeleton className="h-8 w-1/2" />
                                            <Skeleton className="h-5 w-3/4" />
                                        </div>
                                         <div className="space-y-4 pl-4">
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                            <Skeleton className="h-10 w-full" />
                                        </div>
                                    </div>
                                ) : error ? (
                                     <Alert variant="destructive">
                                        <AlertTriangle className="h-4 w-4" />
                                        <AlertTitle>Generation Failed</AlertTitle>
                                        <AlertDescription>
                                            The AI model could not generate a mind map. This might be due to an invalid API key or a network issue. Please check your configuration and try again.
                                            <p className="text-xs font-mono mt-2 bg-destructive/10 p-2 rounded">Error: {error}</p>
                                        </AlertDescription>
                                    </Alert>
                                ) : mindMap ? (
                                     <div className="pr-4 space-y-4">
                                        <div className="p-4 rounded-lg bg-primary/10 border-2 border-dashed border-primary/50 text-center">
                                            <h2 className="text-xl font-bold text-primary">{mindMap.centralTopic}</h2>
                                        </div>
                                        <div className="space-y-2">
                                            {mindMap.mainNodes.map((node, index) => (
                                                <NodeComponent
                                                    key={index}
                                                    node={node}
                                                    isRoot
                                                    isLastChild={index === mindMap.mainNodes.length - 1}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                                        <div className="text-center p-8">
                                            <BrainCircuit className="mx-auto h-12 w-12 text-muted-foreground" />
                                            <h3 className="mt-4 text-lg font-semibold">Your mind map will appear here</h3>
                                            <p className="mt-1 text-sm text-muted-foreground">
                                                Enter some content and click "Generate" to begin.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </ScrollArea>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

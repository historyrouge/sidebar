
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, BrainCircuit, AlertTriangle } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { generateMindMapAction, GenerateMindMapOutput } from "@/app/actions";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { Badge } from "./ui/badge";

type MindMapNode = GenerateMindMapOutput['mainNodes'][0];

const NodeCard: React.FC<{ node: MindMapNode }> = ({ node }) => (
    <Card className="flex flex-col h-full bg-card/50">
        <CardHeader className="p-4">
            <CardTitle className="text-base flex items-center gap-2">
                <span className="text-2xl">{node.emoji}</span>
                {node.title}
            </CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0 space-y-3 text-sm flex-1">
            {node.content?.map((item, idx) => (
                <div key={idx}>
                    <p className="font-semibold text-foreground">{item.heading}:</p>
                    <ul className="list-disc pl-5 text-muted-foreground">
                        {item.points.map((point, pIdx) => <li key={pIdx}>{point}</li>)}
                    </ul>
                </div>
            ))}
        </CardContent>
    </Card>
);

const MainNode: React.FC<{ node: MindMapNode }> = ({ node }) => (
    <div className="flex flex-col items-center gap-4">
        {/* Connector Line */}
        <div className="w-px h-8 bg-border"></div>

        {/* Main Node Card */}
        <div className="w-full max-w-sm mx-auto">
             <NodeCard node={node} />
        </div>
       
        {/* Children Connector */}
        {node.children && node.children.length > 0 && (
            <div className="w-full flex justify-center">
                <div className="w-px h-8 bg-border"></div>
            </div>
        )}

        {/* Children Grid */}
        {node.children && node.children.length > 0 && (
             <div className="w-full h-px bg-border"></div>
        )}
        <div className="w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
            {node.children?.map((child, idx) => (
                 <div key={idx} className="flex flex-col items-center">
                    <div className="w-px h-8 bg-border"></div>
                    <NodeCard node={child} />
                 </div>
            ))}
        </div>
    </div>
);


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
                <div className="grid grid-cols-1 gap-8 xl:grid-cols-3 h-full items-start">
                    <Card className="flex flex-col h-full xl:col-span-1">
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
                    <div className="xl:col-span-2 h-full">
                         <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Generated Mind Map</CardTitle>
                                <CardDescription>Explore your content in a visual, hierarchical structure.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[calc(100vh-20rem)] w-full">
                                    {isGenerating ? (
                                        <div className="space-y-6 pr-4">
                                            <div className="space-y-2 text-center">
                                                <Skeleton className="h-20 w-1/2 mx-auto" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                <Skeleton className="h-48 w-full" />
                                                <Skeleton className="h-48 w-full" />
                                                <Skeleton className="h-48 w-full" />
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
                                            <Card className="p-6 bg-primary/10 border-2 border-dashed border-primary/50 text-center">
                                                <h2 className="text-2xl font-bold text-primary flex items-center justify-center gap-3">
                                                    <span className="text-4xl">{mindMap.centralTopic.emoji}</span>
                                                    {mindMap.centralTopic.title}
                                                </h2>
                                            </Card>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                               {mindMap.mainNodes.map((node, index) => (
                                                    <div key={index} className="flex flex-col items-center">
                                                        <div className="w-px h-8 bg-border"></div>
                                                        <NodeCard node={node} />
                                                        {node.children && node.children.length > 0 && (
                                                            <div className="w-full flex flex-col items-center mt-4 space-y-4">
                                                                 <div className="w-px h-4 bg-border"></div>
                                                                 <div className="w-full grid grid-cols-1 gap-4">
                                                                     {node.children.map((child, childIdx) => (
                                                                         <div key={childIdx} className="flex items-start gap-4">
                                                                            <div className="flex flex-col items-center">
                                                                                 <div className="w-px h-5 bg-border"></div>
                                                                                 <div className="w-5 h-px bg-border -ml-2"></div>
                                                                            </div>
                                                                            <div className="flex-1 pt-1">
                                                                                <NodeCard node={child} />
                                                                            </div>
                                                                         </div>
                                                                     ))}
                                                                 </div>
                                                            </div>
                                                        )}
                                                    </div>
                                               ))}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
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
                </div>
            </main>
        </div>
    );
}

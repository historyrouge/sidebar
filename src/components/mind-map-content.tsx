
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { ScrollArea } from "./ui/scroll-area";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";
import { cn } from "@/lib/utils";

type MindMapNode = GenerateMindMapOutput['mainNodes'][0];

const NodeComponent: React.FC<{ node: MindMapNode, level: number }> = ({ node, level }) => {
    const hasChildren = node.children && node.children.length > 0;
    const paddingLeft = `${level * 1.5}rem`;

    if (!hasChildren) {
        return (
            <div className="flex items-start" style={{ paddingLeft }}>
                 <CornerDownRight className="h-4 w-4 mr-2 mt-1 flex-shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">{node.title}</p>
            </div>
        )
    }

    return (
        <AccordionItem value={node.title} className="border-b-0">
            <AccordionTrigger 
                className="py-2 text-left font-medium hover:no-underline [&>svg]:hidden"
                style={{ paddingLeft }}
            >
                <div className="flex items-center gap-2">
                    <span className={cn(level === 0 ? "font-semibold text-base" : "font-medium text-sm")}>{node.title}</span>
                </div>
            </AccordionTrigger>
            <AccordionContent className="pb-0 pl-4 border-l-2 border-dashed ml-2">
                {node.children.map((child, index) => (
                    <NodeComponent key={`${child.title}-${index}`} node={child} level={level + 1} />
                ))}
            </AccordionContent>
        </AccordionItem>
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
                            <CardDescription>Paste your study material below to generate a structured mind map.</CardDescription>
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
                                     <div className="pr-4">
                                        <div className="mb-4 rounded-lg border bg-primary/10 p-4 text-center">
                                            <h2 className="text-xl font-bold text-primary">{mindMap.centralTopic}</h2>
                                            <p className="text-sm text-primary/80">Central Topic</p>
                                        </div>
                                        <Accordion type="multiple" className="w-full space-y-2">
                                            {mindMap.mainNodes.map((node, index) => (
                                                <div key={`${node.title}-${index}`} className="rounded-md border bg-card">
                                                    <NodeComponent node={node} level={0} />
                                                </div>
                                            ))}
                                        </Accordion>
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

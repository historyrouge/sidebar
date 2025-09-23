
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { Brush, Wand2, Loader2, Copy } from "lucide-react";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { generateEditedContentAction } from "@/app/actions";
import { Skeleton } from "./ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function AiEditorContent({ embedded }: { embedded?: boolean }) {
    const [instruction, setInstruction] = useState("");
    const [inputContent, setInputContent] = useState("");
    const [outputContent, setOutputContent] = useState("");
    const [isGenerating, startGenerating] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();

    const handleGenerate = () => {
        if (!instruction.trim()) {
            toast({ title: "Instruction missing", description: "Please provide an instruction for the AI.", variant: "destructive" });
            return;
        }

        setError(null);
        setOutputContent("");
        startGenerating(async () => {
            const result = await generateEditedContentAction({ instruction, content: inputContent });

            if (result.error) {
                setError(result.error);
            } else if (result.data) {
                setOutputContent(result.data.editedContent);
            }
        });
    };
    
    const handleCopyToClipboard = () => {
        if (!outputContent) return;
        navigator.clipboard.writeText(outputContent);
        toast({ title: "Copied!", description: "The generated content has been copied." });
    };

    const header = !embedded && (
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="md:hidden" />
                <BackButton />
                <h1 className="text-xl font-semibold tracking-tight">AI Editor</h1>
            </div>
        </header>
    );

    return (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            {header}
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="h-full w-full space-y-4">
                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">1. Your Instruction</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            <Textarea
                                placeholder="e.g., 'Fix grammar and spelling', 'Write a Python function that returns a list of prime numbers up to n', or 'Convert this to a professional email'"
                                value={instruction}
                                onChange={(e) => setInstruction(e.target.value)}
                                className="h-24 resize-none"
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="p-4">
                            <CardTitle className="text-base">2. Input Content (Optional)</CardTitle>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                             <Textarea
                                placeholder="Paste your text or code here for the AI to edit or analyze..."
                                value={inputContent}
                                onChange={(e) => setInputContent(e.target.value)}
                                className="h-40 resize-none"
                            />
                        </CardContent>
                    </Card>
                    
                    <Button onClick={handleGenerate} disabled={isGenerating || !instruction.trim()} className="w-full">
                        {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                        Generate
                    </Button>

                     <Card className="flex-1">
                        <CardHeader className="p-4 flex-row items-center justify-between">
                            <CardTitle className="text-base">3. AI Generated Output</CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleCopyToClipboard} disabled={!outputContent}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="p-4 pt-0">
                            {isGenerating ? (
                                <Skeleton className="h-40 w-full" />
                            ) : error ? (
                                <Alert variant="destructive">
                                    <AlertTitle>Generation Failed</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            ) : (
                                <Textarea
                                    placeholder="The AI's response will appear here..."
                                    value={outputContent}
                                    readOnly
                                    className="h-40 resize-none bg-muted/50"
                                />
                            )}
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

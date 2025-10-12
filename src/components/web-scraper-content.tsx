
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Wand2, Link as LinkIcon, BookOpen } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { answerWithSourcesAction, AnswerWithSourcesOutput } from "@/app/actions";
import { Skeleton } from "./ui/skeleton";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function WebScraperContent() {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<AnswerWithSourcesOutput | null>(null);
    const [isSearching, startSearching] = useTransition();
    const { toast } = useToast();

    const handleSearch = () => {
        if (!query.trim()) {
            toast({
                title: "Question is empty",
                description: "Please enter a question to search the web.",
                variant: "destructive",
            });
            return;
        }
        setResult(null);
        startSearching(async () => {
            const searchResult = await answerWithSourcesAction({ query });
            if (searchResult.error) {
                toast({ title: "Search Failed", description: searchResult.error, variant: "destructive" });
            } else if (searchResult.data) {
                setResult(searchResult.data);
            }
        });
    };

    return (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Web Scraper Agent</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-3xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Ask the Web</CardTitle>
                            <CardDescription>Enter your question below. The AI will search the web, read the content, and provide an answer with sources.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex w-full items-center space-x-2">
                                <Input
                                    placeholder="e.g., What is the capital of Australia?"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                                    disabled={isSearching}
                                />
                                <Button onClick={handleSearch} disabled={isSearching || !query.trim()}>
                                    {isSearching ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Ask
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {isSearching ? (
                        <Card>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <Skeleton className="h-6 w-3/4" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-full" />
                                    <Skeleton className="h-4 w-5/6" />
                                    <div className="pt-4">
                                        <Skeleton className="h-5 w-1/4" />
                                        <Skeleton className="h-8 w-full mt-2" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ) : result && (
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-primary" /> AI-Generated Answer</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="prose dark:prose-invert max-w-none">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]}>{result.answer}</ReactMarkdown>
                                </div>
                                <div>
                                    <h3 className="font-semibold mb-2">Source</h3>
                                    <a href={result.source} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 p-3 rounded-md border bg-muted/50 hover:bg-muted transition-colors">
                                        <LinkIcon className="h-4 w-4" />
                                        <span className="text-sm text-primary underline truncate">{result.source}</span>
                                    </a>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </main>
        </div>
    );
}

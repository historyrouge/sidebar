
"use client";

import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card";
import { KeyRound, Copy, Plus, AlertTriangle, Loader2 } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { Input } from "./ui/input";
import { Alert, AlertTitle, AlertDescription } from "./ui/alert";

export function SettingsApiContent() {
    const { toast } = useToast();
    const [apiKey, setApiKey] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    const generateApiKey = () => {
        setIsGenerating(true);
        // Simulate a network request
        setTimeout(() => {
            const newKey = `sk-${[...Array(32)].map(() => Math.random().toString(36)[2]).join('')}`;
            setApiKey(newKey);
            setIsGenerating(false);
            toast({
                title: "API Key Generated",
                description: "Your new API key is ready to use.",
            });
        }, 1000);
    };

    const copyToClipboard = () => {
        if (!apiKey) return;
        navigator.clipboard.writeText(apiKey);
        toast({
            title: "Copied!",
            description: "API key has been copied to your clipboard.",
        });
    };

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">API Keys</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4"/>
                        <AlertTitle>Developer Preview</AlertTitle>
                        <AlertDescription>
                            The SearnAI API is currently in a preview state. This is a mock interface for generating keys.
                        </AlertDescription>
                    </Alert>

                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><KeyRound className="w-5 h-5"/> API Keys</CardTitle>
                            <CardDescription>Manage your API keys to integrate with external services.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                           {apiKey ? (
                                <div className="space-y-2">
                                    <p className="text-sm font-medium">Your new API Key:</p>
                                    <div className="flex gap-2">
                                        <Input readOnly value={apiKey} className="font-mono text-xs"/>
                                        <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                            <Copy className="w-4 h-4" />
                                        </Button>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        Please save this key securely. You will not be able to see it again.
                                    </p>
                                </div>
                           ) : (
                                <div className="flex flex-col items-center justify-center text-center text-muted-foreground p-8 border-2 border-dashed rounded-lg">
                                    <KeyRound className="w-12 h-12 mb-4" />
                                    <h3 className="text-lg font-semibold text-foreground">No API Keys</h3>
                                    <p className="text-sm">
                                        You have not generated any API keys yet.
                                    </p>
                                </div>
                           )}
                        </CardContent>
                        <CardFooter>
                            <Button onClick={generateApiKey} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Plus className="w-4 h-4 mr-2" />}
                                Generate New API Key
                            </Button>
                        </CardFooter>
                    </Card>
                </div>
            </main>
        </div>
    );
}

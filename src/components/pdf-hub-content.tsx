
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileUp, Paperclip } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";

export function PdfHubContent() {
    const [file, setFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile && selectedFile.type === 'application/pdf') {
            setFile(selectedFile);
        } else {
            toast({ title: 'Invalid File', description: 'Please select a PDF file.', variant: 'destructive' });
        }
    };

    const handleUpload = () => {
        if (!file) {
            toast({ title: 'No file selected', description: 'Please choose a PDF file to upload.', variant: 'destructive' });
            return;
        }
        
        setIsLoading(true);
        toast({ title: 'Coming Soon!', description: 'PDF processing and study features will be implemented in a future step.'});
        // Simulate a network request
        setTimeout(() => {
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">PDF Study Hub</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Upload Your PDF</CardTitle>
                            <CardDescription>Upload a PDF document to extract its text and create a study session.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div 
                                className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-muted-foreground/30 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => document.getElementById('pdf-upload')?.click()}
                            >
                                <FileUp className="w-12 h-12 text-muted-foreground" />
                                {file ? (
                                    <p className="mt-4 font-semibold text-foreground">{file.name}</p>
                                ) : (
                                    <>
                                        <p className="mt-4 font-semibold">Click to upload or drag and drop</p>
                                        <p className="text-sm text-muted-foreground">PDF (max 5MB)</p>
                                    </>
                                )}
                                <Input 
                                    id="pdf-upload"
                                    type="file" 
                                    className="hidden" 
                                    accept="application/pdf"
                                    onChange={handleFileChange}
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Button className="w-full" size="lg" disabled={!file || isLoading} onClick={handleUpload}>
                        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        Create Study Session
                    </Button>
                </div>
            </main>
        </div>
    );
}

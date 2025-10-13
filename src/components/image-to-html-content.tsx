
"use client";

import { useState, useTransition, useRef } from "react";
import { generateHtmlFromImageAction, GenerateHtmlFromImageOutput } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Wand2, Image as ImageIcon, UploadCloud, Copy, Code, Eye, AlertTriangle } from "lucide-react";
import Image from "next/image";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function ImageToHtmlContent() {
    const [imageDataUri, setImageDataUri] = useState<string | null>(null);
    const [generatedCode, setGeneratedCode] = useState<GenerateHtmlFromImageOutput | null>(null);
    const [isGenerating, startGenerating] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.type.startsWith("image/")) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    setImageDataUri(e.target?.result as string);
                    setGeneratedCode(null);
                    setError(null);
                };
                reader.readAsDataURL(file);
            } else {
                toast({ title: "Invalid File", description: "Please select an image file.", variant: "destructive" });
            }
        }
    };

    const handleGenerate = () => {
        if (!imageDataUri) {
            toast({ title: "No Image Selected", description: "Please upload an image to convert.", variant: "destructive" });
            return;
        }

        startGenerating(async () => {
            setGeneratedCode(null);
            setError(null);
            const result = await generateHtmlFromImageAction({ imageDataUri });
            if (result.error) {
                setError(result.error);
                toast({ title: "Conversion Failed", description: result.error, variant: "destructive" });
            } else if (result.data) {
                setGeneratedCode(result.data);
                toast({ title: "Conversion Successful!", description: "HTML and CSS have been generated." });
            }
        });
    };

    const handleCopyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: "Copied to clipboard!" });
    }

    return (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Image to HTML</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                    <div className="space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload Your Image</CardTitle>
                                <CardDescription>Select an image of a UI or website layout to convert into HTML and CSS.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div
                                    className="flex flex-col items-center justify-center p-8 rounded-lg border-2 border-dashed border-muted-foreground/30 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    {imageDataUri ? (
                                        <Image src={imageDataUri} alt="Uploaded preview" width={200} height={200} className="rounded-md object-contain" />
                                    ) : (
                                        <>
                                            <UploadCloud className="w-12 h-12 text-muted-foreground" />
                                            <p className="mt-4 font-semibold">Click to upload or drag and drop</p>
                                            <p className="text-sm text-muted-foreground">PNG, JPG, GIF up to 10MB</p>
                                        </>
                                    )}
                                    <input
                                        ref={fileInputRef}
                                        id="image-upload"
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={handleFileChange}
                                    />
                                </div>
                            </CardContent>
                            <CardFooter>
                                <Button onClick={handleGenerate} disabled={isGenerating || !imageDataUri}>
                                    {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                    Generate Code
                                </Button>
                            </CardFooter>
                        </Card>

                        {error && (
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Generation Failed</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    
                    <Tabs defaultValue="preview" className="w-full">
                        <TabsList className="grid w-full grid-cols-3">
                            <TabsTrigger value="preview"><Eye className="mr-2 h-4 w-4"/>Preview</TabsTrigger>
                            <TabsTrigger value="html"><Code className="mr-2 h-4 w-4"/>HTML</TabsTrigger>
                            <TabsTrigger value="css"><Code className="mr-2 h-4 w-4"/>CSS</TabsTrigger>
                        </TabsList>
                        <TabsContent value="preview">
                            <Card className="h-[70vh]">
                                <CardHeader>
                                    <CardTitle>Live Preview</CardTitle>
                                </CardHeader>
                                <CardContent className="h-full pb-6">
                                    <div className="w-full h-full bg-background rounded-lg border">
                                        {isGenerating ? (
                                            <div className="flex h-full items-center justify-center text-muted-foreground"><Loader2 className="h-8 w-8 animate-spin" /></div>
                                        ) : generatedCode ? (
                                            <iframe
                                                srcDoc={`<html><head><style>${generatedCode.css}</style></head><body class="bg-background">${generatedCode.html}</body></html>`}
                                                title="HTML Preview"
                                                className="w-full h-full border-0 rounded-b-lg"
                                            />
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground">Preview will appear here.</div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                        <TabsContent value="html">
                             <Card className="h-[70vh]">
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle>HTML Code</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(generatedCode?.html || '')} disabled={!generatedCode}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="h-full pb-10">
                                    <pre className="text-xs font-mono bg-muted p-4 rounded-md overflow-auto h-full">{generatedCode?.html || "HTML code will appear here..."}</pre>
                                </CardContent>
                            </Card>
                        </TabsContent>
                         <TabsContent value="css">
                             <Card className="h-[70vh]">
                                <CardHeader className="flex-row items-center justify-between">
                                    <CardTitle>CSS Code</CardTitle>
                                    <Button variant="ghost" size="icon" onClick={() => handleCopyToClipboard(generatedCode?.css || '')} disabled={!generatedCode}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </CardHeader>
                                <CardContent className="h-full pb-10">
                                    <pre className="text-xs font-mono bg-muted p-4 rounded-md overflow-auto h-full">{generatedCode?.css || "CSS code will appear here..."}</pre>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </div>
            </main>
        </div>
    );
}

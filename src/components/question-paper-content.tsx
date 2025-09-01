
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, FileText, Wand2, Printer, AlertTriangle } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { BackButton } from "./back-button";
import { generateQuestionPaperAction, GenerateQuestionPaperOutput } from "@/app/actions";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";

export function QuestionPaperContent() {
    const [className, setClassName] = useState("");
    const [subject, setSubject] = useState("");
    const [topic, setTopic] = useState("");
    const [paper, setPaper] = useState<GenerateQuestionPaperOutput | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [isGenerating, startGenerating] = useTransition();
    const { toast } = useToast();

    const handleGenerate = () => {
        if (!className || !subject || !topic) {
            toast({
                title: "Missing Information",
                description: "Please fill in all fields to generate a paper.",
                variant: "destructive",
            });
            return;
        }
        setError(null);
        setPaper(null);
        startGenerating(async () => {
            const result = await generateQuestionPaperAction({ className, subject, topic });
            if (result.error) {
                setError(result.error);
                toast({ title: "Generation Failed", description: result.error, variant: "destructive" });
            } else {
                setPaper(result.data ?? null);
                toast({ title: "Question Paper Generated!", description: "Your paper is ready for review." });
            }
        });
    };

    const handlePrint = () => {
        const printContent = document.getElementById("printable-paper")?.innerHTML;
        if (!printContent) return;

        const printWindow = window.open('', '', 'height=800,width=800');
        if (printWindow) {
            printWindow.document.write('<html><head><title>Print Question Paper</title>');
            printWindow.document.write('<style>body{font-family:sans-serif;padding:2rem}h1,h2,h3{margin-bottom:0.5rem}ul{padding-left:1.5rem;margin-bottom:1rem}.question{margin-bottom:1rem}.marks{float:right;font-weight:bold;}</style>');
            printWindow.document.write('</head><body>');
            printWindow.document.write(printContent);
            printWindow.document.write('</body></html>');
            printWindow.document.close();
            printWindow.print();
        }
    };

    return (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Question Paper Generator</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <Card className="lg:sticky lg:top-24">
                        <CardHeader>
                            <CardTitle>Paper Details</CardTitle>
                            <CardDescription>Provide the details for your question paper.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="class">Class</Label>
                                <Input id="class" placeholder="e.g., 10th, 12th" value={className} onChange={e => setClassName(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="subject">Subject</Label>
                                <Input id="subject" placeholder="e.g., Physics" value={subject} onChange={e => setSubject(e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="topic">Topic / Chapter</Label>
                                <Input id="topic" placeholder="e.g., Light and Optics" value={topic} onChange={e => setTopic(e.target.value)} />
                            </div>
                        </CardContent>
                        <CardFooter>
                            <Button onClick={handleGenerate} disabled={isGenerating}>
                                {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
                                Generate Paper
                            </Button>
                        </CardFooter>
                    </Card>
                    <div className="lg:col-span-2">
                         <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Generated Paper</CardTitle>
                                    <CardDescription>Review the AI-generated question paper below.</CardDescription>
                                </div>
                                <Button variant="outline" size="icon" onClick={handlePrint} disabled={!paper}>
                                    <Printer className="h-4 w-4" />
                                    <span className="sr-only">Print</span>
                                </Button>
                            </CardHeader>
                            <CardContent>
                                <ScrollArea className="h-[calc(100vh-22rem)] w-full">
                                    <div id="printable-paper" className="pr-4">
                                        {isGenerating ? (
                                            <div className="flex h-full min-h-96 items-center justify-center">
                                                <div className="text-center">
                                                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                                    <p className="mt-2 text-muted-foreground">Generating your paper...</p>
                                                </div>
                                            </div>
                                        ) : error ? (
                                             <Alert variant="destructive">
                                                <AlertTriangle className="h-4 w-4" />
                                                <AlertTitle>Generation Failed</AlertTitle>
                                                <AlertDescription>{error}</AlertDescription>
                                            </Alert>
                                        ) : paper ? (
                                            <div className="space-y-6">
                                                <div className="text-center space-y-2">
                                                    <h2 className="text-2xl font-bold">{paper.title}</h2>
                                                    <h3>Class: {className} | Subject: {subject}</h3>
                                                </div>
                                                <Separator />
                                                <div>
                                                    <h3 className="font-semibold mb-2">General Instructions:</h3>
                                                    <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                                                        {paper.generalInstructions.map((inst, i) => <li key={i}>{inst}</li>)}
                                                    </ul>
                                                </div>
                                                <Separator />
                                                {paper.sectionA?.length > 0 && <div className="space-y-4">
                                                    <h3 className="font-bold text-lg text-center">Section A</h3>
                                                    {paper.sectionA.map((q, i) => <div key={i} className="question"><p>{i+1}. {q.question}<span className="marks">({q.marks})</span></p></div>)}
                                                </div>}
                                                {paper.sectionB?.length > 0 && <div className="space-y-4">
                                                    <h3 className="font-bold text-lg text-center">Section B</h3>
                                                    {paper.sectionB.map((q, i) => <div key={i} className="question"><p>{i+1}. {q.question}<span className="marks">({q.marks})</span></p></div>)}
                                                </div>}
                                                {paper.sectionC?.length > 0 && <div className="space-y-4">
                                                    <h3 className="font-bold text-lg text-center">Section C</h3>
                                                    {paper.sectionC.map((q, i) => <div key={i} className="question"><p>{i+1}. {q.question}<span className="marks">({q.marks})</span></p></div>)}
                                                </div>}
                                                {paper.sectionD?.length > 0 && <div className="space-y-4">
                                                    <h3 className="font-bold text-lg text-center">Section D</h3>
                                                    {paper.sectionD.map((q, i) => <div key={i} className="question"><p>{i+1}. {q.question}<span className="marks">({q.marks})</span></p></div>)}
                                                </div>}
                                                {paper.sectionE?.length > 0 && <div className="space-y-4">
                                                    <h3 className="font-bold text-lg text-center">Section E</h3>
                                                    {paper.sectionE.map((c, i) => <div key={i} className="question space-y-2">
                                                        <p className="font-semibold">{i+1}. Case Study:</p>
                                                        <p className="text-sm text-muted-foreground border-l-2 pl-4 italic">{c.case}</p>
                                                        {c.questions.map((q, qi) => <p key={qi} className="pl-4">{String.fromCharCode(97 + qi)}) {q.question}<span className="marks">({q.marks})</span></p>)}
                                                    </div>)}
                                                </div>}
                                            </div>
                                        ) : (
                                            <div className="flex h-full min-h-[400px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
                                                <div className="text-center p-8">
                                                    <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                                                    <h3 className="mt-4 text-lg font-semibold">Your question paper will appear here</h3>
                                                    <p className="mt-1 text-sm text-muted-foreground">Fill in the details and click "Generate" to start.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </ScrollArea>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    );
}

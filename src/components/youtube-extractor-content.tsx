
"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { getYoutubeTranscriptAction } from "@/app/actions";
import { Loader2, Youtube, Wand2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { BackButton } from "./back-button";

export function YouTubeExtractorContent() {
    const [videoUrl, setVideoUrl] = useState("");
    const [transcript, setTranscript] = useState("");
    const [isExtracting, startExtracting] = useTransition();
    const [isSaving, startSaving] = useTransition();
    const { toast } = useToast();
    const router = useRouter();

    const handleExtractTranscript = () => {
        if (!videoUrl.trim()) {
            toast({ title: "Please enter a YouTube URL", variant: 'destructive' });
            return;
        }

        startExtracting(async () => {
            const result = await getYoutubeTranscriptAction({ videoUrl });
            if (result.error) {
                toast({ title: "Failed to get transcript", description: result.error, variant: 'destructive' });
            } else if (result.data) {
                setTranscript(result.data.transcript);
                toast({ title: "Transcript extracted successfully!" });
            }
        });
    };

    const handleCopyToClipboard = () => {
        if (!transcript.trim()) {
            toast({ title: "No transcript to copy", description: "Please extract a transcript first.", variant: 'destructive' });
            return;
        }
        navigator.clipboard.writeText(transcript);
        toast({ title: "Copied to clipboard!" });
    }

    return (
        <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl space-y-6">
                 <div className="flex items-center gap-2">
                    <BackButton />
                    <h1 className="text-2xl font-semibold tracking-tight">YouTube Tools</h1>
                </div>
                <Card>
                    <CardHeader>
                        <CardTitle>YouTube Transcript Extractor</CardTitle>
                        <CardDescription>Paste a YouTube video URL to get its full transcript.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex w-full items-center space-x-2">
                            <Input 
                                placeholder="https://www.youtube.com/watch?v=..."
                                value={videoUrl}
                                onChange={(e) => setVideoUrl(e.target.value)}
                                disabled={isExtracting}
                            />
                            <Button onClick={handleExtractTranscript} disabled={isExtracting || !videoUrl.trim()}>
                                {isExtracting ? <Loader2 className="mr-2 animate-spin" /> : <Wand2 className="mr-2" />}
                                Extract
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Extracted Transcript</CardTitle>
                        <CardDescription>The transcript will appear below. You can copy it to use in other tools.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Textarea 
                            placeholder="Transcript will appear here..."
                            className="h-64 resize-none"
                            value={transcript}
                            readOnly
                        />
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleCopyToClipboard} disabled={isSaving || !transcript.trim()}>
                            {isSaving ? <Loader2 className="mr-2 animate-spin" /> : <Save className="mr-2"/>}
                            Copy Transcript
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}

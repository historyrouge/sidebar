

"use client";

import { Button } from "@/components/ui/button";
import { Copy, FlaskConical, PlayCircle, Trash2, Edit } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import { ChatContent } from "./chat-content";
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from "./ui/resizable";
import { Textarea } from "./ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { useRouter } from "next/navigation";


export function PlaygroundContent() {
    const { toast } = useToast();
    const router = useRouter();
    const [canvasContent, setCanvasContent] = useState("");
    const chatRef = useRef<{ handleReceiveCanvasContent: (content: string) => void }>(null);

    const handleCopyCanvas = () => {
        navigator.clipboard.writeText(canvasContent);
        toast({ title: "Canvas Copied", description: "Content copied to clipboard." });
    };
    
    const handleClearCanvas = () => {
        setCanvasContent("");
        toast({ title: "Canvas Cleared" });
    };

    const handleOpenInEditor = () => {
        if (!canvasContent) {
            toast({ title: "Canvas is empty", description: "There is nothing to edit.", variant: 'destructive'});
            return;
        }
        localStorage.setItem('aiEditorContent', canvasContent);
        router.push('/ai-editor');
    }
    
    const handleReceiveCanvasContent = (content: string) => {
        setCanvasContent(content);
        if (chatRef.current) {
            chatRef.current.handleReceiveCanvasContent(content);
        }
    };
    
    return (
         <div className="flex h-full flex-col">
             <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Playground</h1>
                </div>
            </header>
            <main className="flex-1 overflow-hidden">
                <ResizablePanelGroup direction="horizontal" className="h-full">
                    <ResizablePanel defaultSize={50}>
                    <ChatContent ref={chatRef} isPlayground={true} onCanvasContent={handleReceiveCanvasContent} />
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={50}>
                        <div className="flex flex-col h-full">
                            <div className="p-2 border-b flex items-center justify-between bg-muted/50">
                                <p className="text-sm font-semibold flex items-center gap-2"><FlaskConical className="h-4 w-4"/> Canvas</p>
                                <div className="flex items-center gap-1">
                                    <Button variant="ghost" size="sm" onClick={handleOpenInEditor}><Edit className="h-4 w-4 mr-2"/>Run in Editor</Button>
                                    <Button variant="ghost" size="sm" onClick={handleCopyCanvas}><Copy className="h-4 w-4 mr-2"/>Copy</Button>
                                    <Button variant="ghost" size="sm" onClick={handleClearCanvas}><Trash2 className="h-4 w-4 mr-2"/>Clear</Button>
                                </div>
                            </div>
                            <div className="flex-1 p-4 bg-background">
                                <Textarea 
                                    placeholder="The AI's generated code or content will appear here. You can also use it as a scratchpad." 
                                    className="h-full w-full resize-none border-0 focus-visible:ring-0 p-0 bg-transparent font-mono text-sm"
                                    value={canvasContent}
                                    onChange={(e) => setCanvasContent(e.target.value)}
                                />
                            </div>
                        </div>
                    </ResizablePanel>
                </ResizablePanelGroup>
            </main>
        </div>
    );
}

    

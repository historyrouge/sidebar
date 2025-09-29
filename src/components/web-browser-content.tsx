
"use client";

import { useState, useRef, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, ArrowRight, RotateCw, Home, Lock, Globe } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { cn } from "@/lib/utils";

export function WebBrowserContent() {
    const [url, setUrl] = useState("https://www.google.com");
    const [displayUrl, setDisplayUrl] = useState("https://www.google.com");
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        let finalUrl = url;
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
            finalUrl = 'https://' + url;
        }
        setDisplayUrl(finalUrl);
    };

    const handleGoBack = () => {
        iframeRef.current?.contentWindow?.history.back();
    };

    const handleGoForward = () => {
        iframeRef.current?.contentWindow?.history.forward();
    };

    const handleRefresh = () => {
        iframeRef.current?.contentWindow?.location.reload();
    };
    
    const handleGoHome = () => {
        setDisplayUrl("https://www.google.com");
        setUrl("https://www.google.com");
    }

    const isSecure = displayUrl.startsWith("https://");

    return (
        <div className="flex h-full flex-col">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-1">
                    <SidebarTrigger className="md:hidden -ml-2" />
                    <Button variant="ghost" size="icon" onClick={handleGoBack}><ArrowLeft className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={handleGoForward}><ArrowRight className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={handleRefresh}><RotateCw className="h-5 w-5" /></Button>
                    <Button variant="ghost" size="icon" onClick={handleGoHome}><Home className="h-5 w-5" /></Button>
                </div>
                <form onSubmit={handleSubmit} className="flex-1 mx-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            {isSecure ? <Lock className="h-4 w-4 text-green-500"/> : <Globe className="h-4 w-4 text-muted-foreground"/>}
                        </div>
                        <Input
                            type="text"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            className="w-full pl-10"
                            placeholder="Search Google or type a URL"
                        />
                    </div>
                </form>
            </header>
            <main className="flex-1 bg-muted">
                <iframe
                    ref={iframeRef}
                    src={displayUrl}
                    className="w-full h-full border-0"
                    title="Web Browser"
                    sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
                    onLoad={() => {
                        try {
                           const newUrl = iframeRef.current?.contentWindow?.location.href;
                           // Check if it's not a "blocked" or "about:blank" page
                           if(newUrl && !newUrl.startsWith('about:')) {
                               setUrl(newUrl);
                           }
                        } catch (e) {
                            // Cross-origin error, can't access location.href. This is expected.
                            // We can't update the URL bar, but navigation still works.
                        }
                    }}
                />
            </main>
        </div>
    );
}

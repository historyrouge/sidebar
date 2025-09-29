
"use client";

import { useState, useRef, FormEvent, useEffect } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ArrowLeft, ArrowRight, RotateCw, Home, Lock, Globe, X } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { useRouter } from "next/navigation";

export function WebBrowserContent() {
    const [url, setUrl] = useState("https://duckduckgo.com");
    const [displayUrl, setDisplayUrl] = useState("https://duckduckgo.com");
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const router = useRouter();

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
        const homeUrl = "https://duckduckgo.com";
        setDisplayUrl(homeUrl);
        setUrl(homeUrl);
    }
    
    useEffect(() => {
        handleGoHome();
    }, []);

    const isSecure = displayUrl.startsWith("https://");
    const proxiedUrl = `/api/proxy?url=${encodeURIComponent(displayUrl)}`;

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
                            placeholder="Search with DuckDuckGo or type a URL"
                        />
                    </div>
                </form>
                <Button variant="ghost" size="icon" onClick={() => router.back()}><X className="h-5 w-5" /></Button>
            </header>
            <main className="flex-1 bg-muted">
                <iframe
                    ref={iframeRef}
                    src={proxiedUrl}
                    className="w-full h-full border-0"
                    title="Web Browser"
                    sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                    onLoad={() => {
                        // We can no longer read the URL due to the proxy. This is expected.
                    }}
                />
            </main>
        </div>
    );
}

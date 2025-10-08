
"use client";

import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";

type BrowserViewProps = {
    initialUrl: string;
};

export function BrowserView({ initialUrl }: BrowserViewProps) {
    const [iframeError, setIframeError] = useState(false);
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const handleIframeError = () => {
        setIframeError(true);
    };

    return (
        <div className="w-full h-full bg-muted">
            {iframeError ? (
                <div className="h-full flex items-center justify-center p-4">
                    <Card className="max-w-md text-center">
                        <CardHeader>
                            <CardTitle>Content Cannot Be Displayed</CardTitle>
                            <CardDescription>This website has security policies that prevent it from being loaded inside another app.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground">
                                This is a common security feature (called X-Frame-Options) used by many sites. You can try opening it in a new tab instead.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <iframe
                    ref={iframeRef}
                    src={initialUrl}
                    className="w-full h-full border-0"
                    title="Web Browser"
                    sandbox="allow-scripts allow-forms allow-popups allow-same-origin"
                    onError={handleIframeError}
                />
            )}
        </div>
    );
}

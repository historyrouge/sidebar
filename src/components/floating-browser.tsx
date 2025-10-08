
"use client";

import { BrowserView } from "./browser-view";
import { useChatStore } from "./chat-content";
import { Card, CardContent, CardHeader } from "./ui/card";
import { Button } from "./ui/button";
import { X, ExternalLink, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import React, { useState } from "react";
import { motion, PanInfo } from "framer-motion";

export function FloatingBrowser() {
    const { activeBrowserUrl, activeBrowserTitle, setActiveBrowserUrl, setShowBrowser } = useChatStore();
    const [isMinimized, setIsMinimized] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    if (!activeBrowserUrl) return null;

    const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
        setPosition({ x: position.x + info.offset.x, y: position.y + info.offset.y });
    };

    return (
        <motion.div
            drag
            dragMomentum={false}
            onDragEnd={handleDragEnd}
            className={cn(
                "fixed z-50 rounded-xl shadow-2xl border bg-background/80 backdrop-blur-lg",
                isMinimized ? "bottom-4 right-4 w-80 h-16" : "bottom-1/4 right-1/4 w-[60vw] h-[70vh] max-w-4xl"
            )}
            style={{ x: position.x, y: position.y }}
        >
            <Card className="h-full w-full flex flex-col p-0 border-0 bg-transparent">
                <motion.div
                    dragControls={undefined}
                    dragListener={false}
                    className="flex items-center justify-between p-2 border-b cursor-move"
                >
                    <p className="text-sm font-semibold truncate flex-1 ml-2">{activeBrowserTitle || "Browser"}</p>
                    <div className="flex items-center">
                        <a href={activeBrowserUrl} target="_blank" rel="noopener noreferrer">
                           <Button variant="ghost" size="icon" className="h-7 w-7"><ExternalLink className="h-4 w-4" /></Button>
                        </a>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setIsMinimized(!isMinimized)}>
                            <Minus className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => {
                            setActiveBrowserUrl(null, null);
                            setShowBrowser(false);
                        }}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </motion.div>
                {!isMinimized && (
                    <div className="flex-1 overflow-hidden rounded-b-xl">
                        <BrowserView initialUrl={activeBrowserUrl} />
                    </div>
                )}
            </Card>
        </motion.div>
    );
}

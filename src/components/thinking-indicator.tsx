
"use client";

import { Bot, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { TypewriterText } from "./typewriter-text";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

const customThinkingText = `At its core, this topic is a knot of cause and consequence: simple mechanics meet human meaning. On the factual layer, the parts interact because of predictable laws and patterns — we can trace inputs to outputs, which gives us control. On the human layer, those same patterns are refracted through hope, fear, habit and imagination — that’s where outcomes feel personal. Historically, what looks new is usually a remix of older survival strategies and social tools; context changes, but the motives often repeat. Technologically, today's tools amplify scale and speed: opportunities become risks, and private choices turn public quickly. Ethically, that creates responsibility — to use knowledge in ways that enlarge dignity rather than erode it.

**Quick takeaway:** this isn’t just a problem to solve or a fact to file — it’s a mirror that shows how we think, what we value, and what future we’re choosing to build.`;

export function ThinkingIndicator({ text, duration }: { text: string | null, duration: number | null }) {
    const [isAnimating, setIsAnimating] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const displayText = text || customThinkingText;

    const handleAnimationComplete = () => {
        setTimeout(() => {
            setIsAnimating(false);
        }, 3000); // Wait 3 seconds after typing completes
    };
    
    const previewLines = displayText.split('\n').slice(0, 3).join('\n');

    if (text === null) {
        return (
            <div className="flex items-center justify-center p-4">
                <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>The AI is thinking...</span>
                </div>
            </div>
        )
    }

    return (
        <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5">
                <Bot className="h-3 w-3"/> 
                DeepThink {duration && `(${duration.toFixed(1)}s)`}
            </p>
            <div className="relative pl-5">
                <div className="absolute left-2 top-1 bottom-1 w-px bg-border"></div>
                {isAnimating ? (
                    <TypewriterText text={displayText} onComplete={handleAnimationComplete} />
                ) : (
                    <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                        <div className="font-mono text-xs whitespace-pre-wrap">
                            {isExpanded ? displayText : previewLines}
                        </div>
                         <CollapsibleTrigger asChild>
                            <Button variant="link" className="p-0 h-auto text-xs mt-2">
                               {isExpanded ? 'Show less' : 'Show more'}
                               <ChevronDown className={cn("h-3 w-3 ml-1 transition-transform", isExpanded && "rotate-180")}/>
                            </Button>
                        </CollapsibleTrigger>
                    </Collapsible>
                )}
            </div>
        </div>
    );
}

    
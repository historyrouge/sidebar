
"use client";

import { Bot, ChevronDown } from "lucide-react";
import { useEffect, useState } from "react";
import { TypewriterText } from "./typewriter-text";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";

export function ThinkingIndicator({ text }: { text: string }) {
    const [isAnimating, setIsAnimating] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleAnimationComplete = () => {
        setIsAnimating(false);
    };
    
    const previewLines = text.split('\n').slice(0, 3).join('\n');

    return (
        <div className="p-3 rounded-lg bg-muted/50 mb-4">
            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1.5"><Bot className="h-3 w-3"/> DeepThink</p>
            {isAnimating ? (
                <TypewriterText text={text} onComplete={handleAnimationComplete} />
            ) : (
                <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
                    <div className="font-mono text-xs whitespace-pre-wrap">
                        {isExpanded ? text : previewLines}
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
    );
}

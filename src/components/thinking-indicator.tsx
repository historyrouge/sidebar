
"use client";

import { Bot, ChevronDown, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { TypewriterText } from "./typewriter-text";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "./ui/collapsible";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "./ui/avatar";

const customThinkingText = `Wait, let me think... okay, starting from the beginning. No, wait, I think I've got the main concept. The user is asking for a simple explanation... or should I go deeper? Let me think one more time to be sure. Okay, I've got it. Let's dive into the core of the topic.`;

export function ThinkingIndicator({ text, duration }: { text: string | null, duration: number | null }) {
    const [isAnimating, setIsAnimating] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);

    const displayText = text || customThinkingText;

    const handleAnimationComplete = () => {
        // This function will be called when the typewriter effect finishes.
        // We no longer need a fixed timeout here.
    };

    useEffect(() => {
      // This effect runs when the component mounts or `duration` changes.
      // It sets a timeout to stop the animation only after the real duration has passed.
      if (duration !== null) {
        const totalDuration = (duration * 1000) + 500; // Add a small buffer
        const timer = setTimeout(() => {
          setIsAnimating(false);
        }, totalDuration);

        return () => clearTimeout(timer);
      } else {
        // If duration isn't passed (e.g., for the initial "isTyping" state), keep animating.
        setIsAnimating(true);
      }
    }, [duration]);
    
    const previewLines = displayText.split('\n').slice(0, 3).join('\n');

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

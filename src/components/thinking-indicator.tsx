
"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const thinkingLines = [
    "Hmm… the first thing that pops into my mind feels too simple, maybe I should look deeper.",
    "Wait, what if I flip the question instead of answering it directly?",
    "Sometimes the answer hides in the negative space, not the obvious details.",
    "Okay, let me step back—what’s the core principle hiding under all this noise?",
    "If I zoom out, the pattern feels clearer, but zooming in reveals tiny contradictions.",
    "Maybe the real trick isn’t solving it, but reframing it in a better way.",
    "Hold on… does this remind me of something completely unrelated that secretly connects?",
    "What looks random often has a rhythm—just not the rhythm we expect.",
    "The simplest path is tempting, but the elegant path usually hides a twist.",
    "What if instead of answering what, I answer why first?",
    "Sometimes I feel like I’m not solving the problem, the problem is solving me.",
    "Pause… if this were upside-down, would it still make sense?",
    "Alright, I think the truth is somewhere in between the obvious and the absurd.",
];

export function ThinkingIndicator() {
    const [visibleLine, setVisibleLine] = useState(0);

    useEffect(() => {
        setVisibleLine(0); 
        const interval = setInterval(() => {
            setVisibleLine(prev => {
                if (prev < thinkingLines.length - 1) {
                    return prev + 1;
                }
                // Loop back to the start
                return 0;
            });
        }, 1200);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin shrink-0" />
            <div className="relative h-5 w-56">
                <AnimatePresence>
                    <motion.p
                        key={visibleLine}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.3 }}
                        className="absolute inset-0"
                    >
                        {thinkingLines[visibleLine]}
                    </motion.p>
                </AnimatePresence>
            </div>
        </div>
    );
}

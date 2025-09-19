
"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const thinkingLines = [
    "Analyzing the request...",
    "Consulting knowledge base...",
    "Formulating response...",
    "Cross-referencing data points...",
    "Finalizing the answer...",
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

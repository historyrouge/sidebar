
"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const thinkingLines = [
    "🌀 **Mega-Unpredictable Fake Thinking Style**",
    "“Hmm okay, let me think… first reaction in my head is X, but that feels too quick. Wait, pause — maybe I should slow down. If I treat this like a math puzzle 🧩, step one is clear: analyze the base info. Step two? Eliminate the noise. But oh, my brain just jumped to another angle — what if I approach this like Sherlock 🔍, focusing on tiny clues? Hmm, interesting…",
    "No no, hold on… professor mode activated 👩‍🏫. If I explain this logically, it breaks into principle → example → conclusion. But wait, my flow state brain 🌊 is like: nah bro, just let it ride, idea after idea. First path says Y, second path says Z, third path? Oof, feels messy, but the messy ones sometimes click best.",
    "Quick mental simulation 🤖: Input = your question, Processing = test variables A, B, C… Output = the result. But ah! My curious explorer self 🧭 says, what if I walk down all three paths just to be sure? Left path dead ends, right path loops back, middle path goes straight.",
    "Reflecting deeper 🪞, philosophically, this isn’t just about solving — it’s about pattern recognition. The essence is bigger than the details. But yo, my instinct ⚡ still whispers: stick to X, it makes sense. Double-check puzzle mode: piece 1 fits with piece 3, piece 2 doesn’t matter. Final snap together = clarity.",
    "Okay okay, let’s chill ☕… imagine me casually sipping chai, replaying everything in my head. Yup, after this rollercoaster of thoughts, the final vibe is… about to be delivered.”"
];

export function ThinkingIndicator() {
    const [visibleLines, setVisibleLines] = useState(0);

    useEffect(() => {
        setVisibleLines(0); 
        const interval = setInterval(() => {
            setVisibleLines(prev => {
                if (prev < thinkingLines.length) {
                    return prev + 1;
                }
                clearInterval(interval);
                return prev;
            });
        }, 800); // Adjust speed of line appearance here

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin shrink-0 mt-1" />
            <div className="prose prose-sm dark:prose-invert">
                <AnimatePresence>
                    {thinkingLines.slice(0, visibleLines).map((line, index) => (
                        <motion.p
                            key={index}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                            className="!my-0"
                        >
                            {line}
                        </motion.p>
                    ))}
                </AnimatePresence>
            </div>
        </div>
    );
}


"use client";

import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const thinkingLines = [
    "Okay, the user mentioned \"electro chemestry,\" which I think is a typo for \"electrochemistry.\"",
    "Let me start by confirming that. Electrochemistry is a branch of chemistry dealing with the interconversion of electrical and chemical energy.",
    "I should provide a clear, concise answer first.",
    "The user might be a student looking for an overview or key concepts. I need to structure the response with a direct answer followed by an in-depth explanation.",
    "Use bullet points for key concepts like redox reactions, galvanic cells, electrolytic cells, Nernst equation, and applications.",
    "Also, mention common applications like batteries and corrosion.",
    "I should check if there are any common mistakes or areas where students usually struggle. For example, understanding the difference between galvanic and electrolytic cells.",
    "Including a table comparing them could help. Also, the Nernst equation is crucial for calculating cell potential under non-standard conditions.",
    "After the explanation, I should ask a follow-up question to engage the user further. Maybe ask if they want examples or a quiz.",
    "Need to keep the tone friendly and encouraging. Make sure to use proper formatting with headings and bold text for clarity.",
    "Avoid jargon where possible, but since it's a technical topic, some terms are necessary. Double-check the spelling of \"electrochemistry\" to avoid confusion.",
    "Alright, time to put it all together."
];

export function ThinkingIndicator() {
    const [visibleLines, setVisibleLines] = useState<string[]>([]);

    useEffect(() => {
        setVisibleLines([]);
        let index = 0;
        const interval = setInterval(() => {
            if (index < thinkingLines.length) {
                setVisibleLines(prev => [...prev, thinkingLines[index]]);
                index++;
            } else {
                clearInterval(interval);
            }
        }, 800); // Adjust delay as needed

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="flex items-start gap-3 text-sm text-muted-foreground">
            <Loader2 className="size-4 animate-spin shrink-0 mt-1" />
            <div className="flex flex-col">
                <AnimatePresence>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="font-mono text-xs"
                    >
                       <p className="text-gray-500">&lt;think&gt;</p>
                       <div className="pl-4">
                            {visibleLines.map((line, i) => (
                                <motion.p
                                    key={i}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3, delay: i * 0.1 }}
                                >
                                    {line}
                                </motion.p>
                            ))}
                        </div>
                        <p className="text-gray-500">&lt;/think&gt;</p>
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}

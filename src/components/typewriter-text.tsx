
"use client";

import { useEffect, useState } from "react";

type TypewriterTextProps = {
    text: string;
    className?: string;
    onComplete?: () => void;
};

export function TypewriterText({ text, className, onComplete }: TypewriterTextProps) {
    const [displayedText, setDisplayedText] = useState("");
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        setDisplayedText("");
        setIsComplete(false);
        let i = 0;
        const intervalId = setInterval(() => {
            if (i < text.length) {
                setDisplayedText(text.substring(0, i + 1));
                i++;
            } else {
                clearInterval(intervalId);
                setIsComplete(true);
                onComplete?.();
            }
        }, 20); // Adjust speed as needed

        return () => clearInterval(intervalId);
    }, [text, onComplete]);

    return (
        <div className={className}>
            <p className="font-mono text-xs whitespace-pre-wrap">
                {displayedText}
                {!isComplete && <span className="animate-ping">▋</span>}
            </p>
        </div>
    );
}

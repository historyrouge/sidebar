
"use client";

import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 5) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        setDisplayText(''); // Reset when text changes
        if (text) {
            let i = 0;
            const timer = setInterval(() => {
                if (i < text.length) {
                    setDisplayText(prev => prev + text.charAt(i));
                    i++;
                } else {
                    clearInterval(timer);
                }
            }, speed);

            return () => {
                clearInterval(timer);
            };
        }
    }, [text, speed]);

    return displayText;
};

    
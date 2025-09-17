
"use client";

import { useState, useEffect } from 'react';

export const useTypewriter = (text: string, speed: number = 120) => {
    const [displayText, setDisplayText] = useState('');

    useEffect(() => {
        setDisplayText(''); // Reset when text changes
        if (text) {
            const words = text.split(' ');
            let i = 0;

            const timer = setInterval(() => {
                if (i < words.length) {
                    setDisplayText(prev => prev + words[i] + ' ');
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

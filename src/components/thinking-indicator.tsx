
"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const messages = [
  "Ayy gotcha 🔥 Let me cook...",
  "Hmm okay, let me think… first reaction is X, but that feels too quick.",
  "Wait, pause — maybe I should slow down. Treating this like a puzzle 🧩...",
  "Hold on… professor mode activated 👩‍🏫. Let's break this down.",
  "My brain just jumped to another angle — what if I approach this like Sherlock 🔍?",
  "Quick mental simulation 🤖: Input = your question... Processing...",
  "Reflecting deeper 🪞... this isn’t just about solving, it’s about the pattern.",
  "Okay okay, let’s chill ☕… replaying everything in my head.",
  "First thought: Y. Wait no, discard. Algorithm says Z... getting there.",
  "Honestly, first I thought it’s X. Then I overcomplicated it. It's clicking now...",
];

export function ThinkingIndicator() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 2500); // Change message every 2.5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex items-center gap-2">
      <Loader2 className="size-4 animate-spin" />
      <AnimatePresence mode="wait">
        <motion.span
          key={index}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.3 }}
        >
          {messages[index]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}

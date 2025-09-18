
"use client";

import { Loader2 } from "lucide-react";

export function ThinkingIndicator() {
  return (
    <div className="flex items-start gap-2 text-sm text-muted-foreground">
      <Loader2 className="size-4 animate-spin shrink-0 mt-1" />
      <div className="prose prose-sm dark:prose-invert">
        <p className="!my-0">
          🌀 **Mega-Unpredictable Fake Thinking Style**
        </p>
        <p className="!my-0">
          “Hmm okay, let me think… first reaction in my head is X, but that feels too quick. Wait, pause — maybe I should slow down. If I treat this like a math puzzle 🧩, step one is clear: analyze the base info. Step two? Eliminate the noise. But oh, my brain just jumped to another angle — what if I approach this like Sherlock 🔍, focusing on tiny clues? Hmm, interesting…
        </p>
        <p className="!my-0">
          No no, hold on… professor mode activated 👩‍🏫. If I explain this logically, it breaks into principle → example → conclusion. But wait, my flow state brain 🌊 is like: nah bro, just let it ride, idea after idea. First path says Y, second path says Z, third path? Oof, feels messy, but the messy ones sometimes click best.
        </p>
        <p className="!my-0">
          *Quick mental simulation 🤖*: Input = your question, Processing = test variables A, B, C… Output = the result. But ah! My curious explorer self 🧭 says, what if I walk down all three paths just to be sure? Left path dead ends, right path loops back, middle path goes straight.
        </p>
        <p className="!my-0">
          Reflecting deeper 🪞, philosophically, this isn’t just about solving — it’s about pattern recognition. The essence is bigger than the details. But yo, my instinct ⚡ still whispers: stick to X, it makes sense. Double-check puzzle mode: piece 1 fits with piece 3, piece 2 doesn’t matter. Final snap together = clarity.
        </p>
        <p className="!my-0">
          Okay okay, let’s chill ☕… imagine me casually sipping chai, replaying everything in my head. Yup, after this rollercoaster of thoughts, the final vibe is… about to be delivered.”
        </p>
      </div>
    </div>
  );
}

  
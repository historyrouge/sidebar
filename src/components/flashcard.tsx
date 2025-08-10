"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

interface FlashcardProps {
  front: string;
  back: string;
}

export function Flashcard({ front, back }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div
      className="group h-48 w-full [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <Card
        className={cn(
          "relative h-full w-full cursor-pointer rounded-lg shadow-md transition-transform duration-700 [transform-style:preserve-3d]",
          isFlipped && "[transform:rotateY(180deg)]"
        )}
      >
        <CardContent className="absolute flex h-full w-full flex-col items-center justify-center p-4 [backface-visibility:hidden]">
          <p className="text-center text-sm font-medium">{front}</p>
        </CardContent>
        <CardContent className="absolute flex h-full w-full flex-col items-center justify-center bg-secondary p-4 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <p className="text-center text-sm">{back}</p>
        </CardContent>
        <div className="absolute bottom-2 right-2 opacity-20 transition-opacity group-hover:opacity-80">
          <RotateCcw className="h-4 w-4" />
        </div>
      </Card>
    </div>
  );
}

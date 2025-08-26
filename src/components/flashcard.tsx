
"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Tag } from "lucide-react";
import { Badge } from "./ui/badge";

type ColorVariants = {
  [key: string]: {
    background: string;
    border: string;
    text: string;
  };
};

const colorVariants: ColorVariants = {
  blue: { background: "bg-blue-100 dark:bg-blue-900/50", border: "border-blue-300 dark:border-blue-700", text: "text-blue-800 dark:text-blue-200" },
  green: { background: "bg-green-100 dark:bg-green-900/50", border: "border-green-300 dark:border-green-700", text: "text-green-800 dark:text-green-200" },
  purple: { background: "bg-purple-100 dark:bg-purple-900/50", border: "border-purple-300 dark:border-purple-700", text: "text-purple-800 dark:text-purple-200" },
  orange: { background: "bg-orange-100 dark:bg-orange-900/50", border: "border-orange-300 dark:border-orange-700", text: "text-orange-800 dark:text-orange-200" },
  red: { background: "bg-red-100 dark:bg-red-900/50", border: "border-red-300 dark:border-red-700", text: "text-red-800 dark:text-red-200" },
  yellow: { background: "bg-yellow-100 dark:bg-yellow-900/50", border: "border-yellow-300 dark:border-yellow-700", text: "text-yellow-800 dark:text-yellow-200" },
  pink: { background: "bg-pink-100 dark:bg-pink-900/50", border: "border-pink-300 dark:border-pink-700", text: "text-pink-800 dark:text-pink-200" },
  teal: { background: "bg-teal-100 dark:bg-teal-900/50", border: "border-teal-300 dark:border-teal-700", text: "text-teal-800 dark:text-teal-200" },
  gray: { background: "bg-gray-100 dark:bg-gray-900/50", border: "border-gray-300 dark:border-gray-700", text: "text-gray-800 dark:text-gray-200" },
  default: { background: "bg-muted", border: "border-border", text: "text-foreground" },
};


interface FlashcardProps {
  front: string;
  back: string;
  category: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'yellow' | 'pink' | 'teal' | 'gray';
}

export function Flashcard({ front, back, category, color }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);
  const colors = colorVariants[color] || colorVariants.default;

  return (
    <div
      className="group w-full [perspective:1000px]"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <Card
        className={cn(
          "relative h-64 w-full cursor-pointer rounded-xl shadow-lg transition-all duration-700 [transform-style:preserve-3d]",
          "border-2",
          isFlipped ? "[transform:rotateY(180deg)]" : "",
          isFlipped ? colors.border : "border-border"
        )}
      >
        {/* Front of the card */}
        <CardContent className="absolute flex h-full w-full flex-col justify-between p-4 [backface-visibility:hidden] bg-card rounded-xl">
          <div>
            <Badge variant="outline" className="flex items-center gap-1.5 w-fit">
                <Tag className="h-3 w-3" />
                {category}
            </Badge>
          </div>
          <p className="text-center text-lg font-semibold">{front}</p>
          <div className="flex justify-end opacity-20 transition-opacity group-hover:opacity-80">
            <RotateCcw className="h-4 w-4" />
          </div>
        </CardContent>

        {/* Back of the card */}
        <CardContent className={cn(
            "absolute flex h-full w-full flex-col justify-center items-center p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl",
            colors.background,
            colors.text
        )}>
            <div className="flex-grow overflow-y-auto pr-2 flex justify-center items-center">
                 <p className="text-base text-center">{back}</p>
            </div>
        </CardContent>
      </Card>
    </div>
  );
}


"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw, Tag, Link as LinkIcon } from "lucide-react";
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
  default: { background: "bg-muted", border: "border-border", text: "text-foreground" },
};


interface FlashcardProps {
  front: string;
  back: string;
  category: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red';
  relatedTopics: string[];
}

export function Flashcard({ front, back, category, color, relatedTopics }: FlashcardProps) {
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
            "absolute flex h-full w-full flex-col justify-between p-4 [backface-visibility:hidden] [transform:rotateY(180deg)] rounded-xl",
            colors.background,
            colors.text
        )}>
            <div className="flex-grow overflow-y-auto pr-2">
                 <p className="text-base">{back}</p>
            </div>
            {relatedTopics && relatedTopics.length > 0 && (
                <div className="mt-4 pt-2 border-t border-current/20">
                    <h4 className="font-semibold text-sm mb-1 flex items-center gap-1.5"><LinkIcon className="h-4 w-4" /> Related Topics</h4>
                    <div className="flex flex-wrap gap-1">
                        {relatedTopics.map(topic => (
                            <Badge key={topic} variant="secondary" className="text-xs">{topic}</Badge>
                        ))}
                    </div>
                </div>
            )}
        </CardContent>
      </Card>
    </div>
  );
}

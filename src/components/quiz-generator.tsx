
"use client";

import { generateQuizAction, GenerateQuizzesOutput } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2, Circle, FileQuestion, Loader2, Wand2 } from "lucide-react";
import React, { useState, useTransition } from "react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "./ui/accordion";
import { cn } from "@/lib/utils";

export function QuizGenerator() {
  const [content, setContent] = useState("");
  const [quiz, setQuiz] = useState<GenerateQuizzesOutput['quizzes'] | null>(null);
  const [isGenerating, startGenerating] = useTransition();
  const { toast } = useToast();

  const handleGenerateQuiz = async () => {
    if (content.trim().length < 50) {
      toast({
        title: "Content too short",
        description: "Please provide at least 50 characters to generate a quiz.",
        variant: "destructive",
      });
      return;
    }
    startGenerating(async () => {
      const result = await generateQuizAction(content);
      if (result.error) {
        toast({ title: "Quiz Generation Failed", description: result.error, variant: "destructive" });
      } else {
        setQuiz(result.data?.quizzes ?? []);
        toast({ title: "Quiz Generated!", description: "Your new quiz is ready."});
      }
    });
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle>Generate a Quiz</CardTitle>
          <CardDescription>Paste your study material below to create a multiple-choice quiz.</CardDescription>
        </CardHeader>
        <CardContent className="flex-1">
          <Textarea
            placeholder="Paste your content here..."
            className="h-full min-h-[300px] resize-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </CardContent>
        <CardFooter>
          <Button onClick={handleGenerateQuiz} disabled={isGenerating || content.trim().length < 50}>
            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Quiz
          </Button>
        </CardFooter>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Your Quiz</CardTitle>
          <CardDescription>Review the generated questions and answers.</CardDescription>
        </CardHeader>
        <CardContent>
          {isGenerating ? (
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : quiz ? (
            <Accordion type="single" collapsible className="w-full space-y-2">
                {quiz.map((q, i) => (
                <AccordionItem value={`item-${i}`} key={q.question} className="rounded-md border bg-background px-4">
                    <AccordionTrigger className="py-4 text-left font-medium hover:no-underline">{i + 1}. {q.question}</AccordionTrigger>
                    <AccordionContent>
                        <div className="space-y-2 pb-4">
                            {q.options.map((option, optionIndex) => (
                                <div key={optionIndex} className={cn("flex items-center gap-3 text-sm", option === q.answer ? "font-semibold text-primary" : "text-muted-foreground")}>
                                   {option === q.answer ? <CheckCircle2 className="h-4 w-4 text-primary" /> : <Circle className="h-4 w-4" />}
                                   <span>{option}</span>
                                </div>
                            ))}
                        </div>
                    </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="flex h-full min-h-[300px] items-center justify-center rounded-lg border-2 border-dashed border-muted bg-muted/50">
              <div className="text-center p-8">
                <FileQuestion className="mx-auto h-12 w-12 text-muted-foreground" />
                <h3 className="mt-4 text-lg font-semibold">Your quiz will appear here</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  Paste your content and click "Generate Quiz" to start.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

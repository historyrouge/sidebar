
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { FileQuestion, Wand2 } from "lucide-react";
import React, { useState } from "react";
import { useRouter } from 'next/navigation';

export function QuizGenerator() {
  const [content, setContent] = useState("");
  const { toast } = useToast();
  const router = useRouter();

  const handleProceedToOptions = () => {
    if (content.trim().length < 50) {
      toast({
        title: "Content too short",
        description: "Please provide at least 50 characters to generate a quiz.",
        variant: "destructive",
      });
      return;
    }
    // We will store the content in localStorage to pass it to the next page.
    // This is simpler than passing potentially very long text in a URL.
    try {
        localStorage.setItem('quizContent', content);
        router.push('/quiz/options');
    } catch (e) {
        toast({
            title: "Could not save content",
            description: "There was an error while trying to proceed. Please try again.",
            variant: "destructive",
        });
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <Card className="flex flex-col lg:col-span-2">
        <CardHeader>
          <CardTitle>Generate a Quiz</CardTitle>
          <CardDescription>Paste your study material below to begin creating your quiz.</CardDescription>
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
          <Button onClick={handleProceedToOptions} disabled={content.trim().length < 50}>
            <Wand2 className="mr-2 h-4 w-4" />
            Proceed to Quiz Options
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

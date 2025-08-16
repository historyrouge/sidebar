
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BookOpen, Hash, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

type QuizInterfaceProps = {
  subject?: string;
  durationSec?: number;
  currentQuestion?: number;
  totalQuestions?: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
  questionText?: string;
  options?: string[];
  selectedAnswer?: string;
  onAnswer?: (answer: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
  onSubmit?: () => void;
  isDemo?: boolean;
};

const formatTime = (sec: number) => {
  const m = Math.floor(sec / 60)
    .toString()
    .padStart(2, "0");
  const s = Math.floor(sec % 60)
    .toString()
    .padStart(2, "0");
  return `${m}:${s}`;
};

export default function QuizInterface(props: QuizInterfaceProps) {
  const {
    subject = "Mathematics",
    totalQuestions = 20,
    currentQuestion = 1,
    durationSec = 15 * 60,
    autoStart = true,
    questionText = "What is 2 + 2?",
    options = ["2", "3", "4", "5"],
    selectedAnswer,
    onAnswer,
    onTimeUp,
    onNext,
    onPrev,
    onSubmit,
    isDemo = false,
  } = props;


  const [remaining, setRemaining] = useState(durationSec);
  const [running, setRunning] = useState(autoStart);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    setRemaining(durationSec);
    setRunning(autoStart);
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, [durationSec, autoStart]);

  useEffect(() => {
    if (!running || remaining <= 0) return;
    intervalRef.current = window.setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          window.clearInterval(intervalRef.current!);
          intervalRef.current = null;
          onTimeUp?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [running, remaining, onTimeUp]);

  const progress = useMemo(() => {
    const used = durationSec - remaining;
    return Math.max(0, Math.min(100, (used / durationSec) * 100));
  }, [durationSec, remaining]);

  const questionProgress = useMemo(() => {
    return Math.max(0, Math.min(100, (currentQuestion / totalQuestions) * 100));
  }, [currentQuestion, totalQuestions]);

  const isLastQuestion = currentQuestion === totalQuestions;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="sticky top-0 z-50 backdrop-blur bg-background/80 border-b">
        <div className="mx-auto max-w-5xl px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" aria-hidden />
            <div className="font-semibold tabular-nums">{formatTime(remaining)}</div>
            <div className="flex items-center gap-2 ml-2">
              <Button
                size="sm"
                variant={running ? "secondary" : "default"}
                onClick={() => setRunning((s) => !s)}
                className="rounded-full px-4"
              >
                {running ? "Pause" : "Resume"}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-2 capitalize">
            <BookOpen className="w-5 h-5" aria-hidden />
            <span className="px-3 py-1 rounded-full bg-muted text-sm font-medium">
              {subject}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5" aria-hidden />
            <div className="text-sm font-semibold">
              Q {currentQuestion} <span className="text-muted-foreground">/ {totalQuestions}</span>
            </div>
          </div>
        </div>
        <div className="h-1 w-full bg-muted">
          <Progress value={progress} className="h-1 rounded-none bg-primary" />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="rounded-2xl shadow-lg border-0 bg-card">
              <CardContent className="p-8">
                <h2 className="text-xl font-semibold mb-2">Question {currentQuestion}</h2>
                <p className="text-foreground/90 mb-8 text-lg">{questionText}</p>

                <div className="space-y-4">
                  {options.map((opt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className={cn(
                        "w-full h-auto py-4 justify-start rounded-xl text-base border-border/50 hover:bg-primary/10 hover:border-primary",
                        selectedAnswer === opt && "bg-primary/20 border-primary"
                        )}
                      onClick={() => onAnswer?.(opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>

              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-8 flex justify-between items-center">
            <Button onClick={onPrev} variant="secondary" disabled={currentQuestion === 1}>
                <ArrowLeft className="mr-2" />
                Previous
            </Button>

             {isLastQuestion ? (
                <Button onClick={onSubmit} size="lg" className="bg-green-600 hover:bg-green-700">
                    Submit Quiz
                </Button>
            ) : (
                <Button onClick={onNext}>
                    Next
                    <ArrowRight className="ml-2" />
                </Button>
            )}
        </div>

        <div className="mt-8">
          <div className="flex justify-between text-sm text-muted-foreground mb-2">
            <span>Question Progress</span>
            <span>
              {currentQuestion} / {totalQuestions}
            </span>
          </div>
          <Progress value={questionProgress} className="h-2 rounded-full" />
        </div>
      </main>
    </div>
  );
}

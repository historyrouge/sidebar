
"use client";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, BookOpen, Hash, ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

type QuizInterfaceProps = {
  subject?: string;
  durationSec?: number;
  currentQuestion?: number;
  totalQuestions?: number;
  onTimeUp?: () => void;
  autoStart?: boolean;
  questionText?: string;
  options?: string[];
  onAnswer?: (answer: string) => void;
  onNext?: () => void;
  onPrev?: () => void;
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
    onAnswer,
    onTimeUp,
    onNext,
    onPrev,
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

  return (
    <div className="min-h-screen bg-muted/20 text-foreground">
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
                className="rounded-2xl"
              >
                {running ? "Pause" : "Resume"}
              </Button>
              {isDemo && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setRemaining(durationSec)}
                  className="rounded-2xl"
                >
                  Reset
                </Button>
              )}
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
        <div className="mx-auto max-w-5xl px-4 pb-3">
          <Progress value={progress} className="h-2 rounded-full" />
        </div>
      </div>

      <main className="mx-auto max-w-5xl px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="rounded-2xl shadow-sm">
              <CardContent className="p-6">
                <h2 className="text-lg font-semibold mb-3">Question {currentQuestion}</h2>
                <p className="text-foreground/90 mb-6 font-medium">{questionText}</p>

                <div className="space-y-3">
                  {options.map((opt, idx) => (
                    <Button
                      key={idx}
                      variant="outline"
                      className="w-full h-auto py-3 justify-start rounded-xl"
                      onClick={() => onAnswer?.(opt)}
                    >
                      {opt}
                    </Button>
                  ))}
                </div>

                {isDemo && (
                  <div className="flex items-center gap-3 mt-6">
                    <Button onClick={onPrev} variant="secondary" className="rounded-2xl">
                      <ArrowLeft className="mr-2" />
                      Previous
                    </Button>
                    <Button onClick={onNext} className="rounded-2xl">
                      Next
                      <ArrowRight className="ml-2" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>

        <div className="mt-6">
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

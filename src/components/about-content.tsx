
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { Button } from "./ui/button";

export function AboutContent() {
  return (
    <div className="flex flex-col items-center justify-center p-4 md:p-8 bg-muted/40 min-h-full">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <Avatar className="h-28 w-28 border-4 border-primary shadow-md">
              <AvatarImage src="https://placehold.co/100x100.png" alt="Harsh" data-ai-hint="profile picture" />
              <AvatarFallback>H</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-3xl font-bold">A Message from the Developer</CardTitle>
          <CardDescription>The story behind ScholarSage.</CardDescription>
        </CardHeader>
        <CardContent className="prose prose-lg dark:prose-invert max-w-none mx-auto text-left px-4 sm:px-8 py-6">
            <p className="lead text-center">Hey there, fellow learners! 👋</p>
            <p>
                I&apos;m Harsh, a 9th-grade student from Sri Chaitanya School, and I&apos;m super excited to introduce my very own app: <strong>ScholarSage</strong>! 🚀 As someone who&apos;s always juggling schoolwork, exams, and a bit of fun, I know how tough it can be to stay organized and motivated while studying. That&apos;s why I built ScholarSage – an app designed specifically to make learning easier, smarter, and way more enjoyable.
            </p>
            <p>
                Here&apos;s what makes ScholarSage your ultimate study buddy:
            </p>
            <ul className="list-disc pl-5 space-y-2">
                <li><strong>Smart Flashcards</strong>: Create custom decks for any subject, with AI-powered hints to help you remember tricky concepts.</li>
                <li><strong>AI Study Tools</strong>: Generate quizzes, summaries, and get help from an AI tutor, all from your study material.</li>
                <li><strong>YouTube Transcript Extractor</strong>: Instantly get transcripts from educational videos to study from.</li>
                <li><strong>AI Code Agent</strong>: Get help with your coding homework and projects.</li>
            </ul>
            <p>
                I poured my heart into this during late-night coding sessions (while still acing my classes 😉). Whether you&apos;re prepping for boards or just wanting to level up your grades, ScholarSage is here to spark that love for learning!
            </p>
            <p>
                What do you think? Drop your feedback – I&apos;d love to hear from you!
            </p>
            <p className="text-right font-semibold mt-8">
                Cheers,
                <br />
                Harsh
                <br />
                (9th Grader &amp; Aspiring Developer @ Sri Chaitanya)
            </p>
        </CardContent>
      </Card>
    </div>
  );
}

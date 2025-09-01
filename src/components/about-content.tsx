
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";

export function AboutContent() {
  return (
    <div className="flex flex-col h-full bg-muted/40">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <BackButton />
                <h1 className="text-xl font-semibold tracking-tight">About Us</h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center">
              <Card className="w-full max-w-3xl shadow-lg overflow-hidden border-0 relative">
                <div className="bg-card p-8 text-center items-center">
                    <Avatar className="mx-auto h-32 w-32 border-4 border-primary shadow-lg">
                      <AvatarImage src="https://placehold.co/128x128.png" alt="Harsh" data-ai-hint="profile picture" />
                      <AvatarFallback>H</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-4xl font-bold mt-6">A Message from the Developer</CardTitle>
                    <CardDescription className="text-xl text-muted-foreground mt-2">&mdash; The story behind Easy Learn AI &mdash;</CardDescription>
                </div>
                <CardContent className="prose prose-lg dark:prose-invert max-w-none mx-auto text-left px-4 sm:px-8 py-8 bg-background">
                    <p className="lead text-center text-2xl font-semibold !mt-0">Hey there, fellow learners! 👋</p>
                    <p>
                        I&apos;m Harsh, a 9th-grade student from Sri Chaitanya School, and I&apos;m super excited to introduce my very own app: <strong>Easy Learn AI</strong>! 🚀 As someone who&apos;s always juggling schoolwork, exams, and a bit of fun, I know how tough it can be to stay organized and motivated while studying. That&apos;s why I built Easy Learn AI – an app designed specifically to make learning easier, smarter, and way more enjoyable.
                    </p>
                    <p>
                        Here&apos;s what makes Easy Learn AI your ultimate study buddy:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Smart Flashcards</strong>: Create custom decks for any subject, with AI-powered hints to help you remember tricky concepts.</li>
                        <li><strong>AI Study Tools</strong>: Generate quizzes, summaries, and get help from an AI tutor, all from your study material.</li>
                        <li><strong>YouTube Transcript Extractor</strong>: Instantly get transcripts from educational videos to study from.</li>
                        <li><strong>AI Image Generation</strong>: Create visual aids for your notes based on the study material.</li>
                    </ul>
                    <p>
                        I poured my heart into this during late-night coding sessions (while still acing my classes 😉). Whether you&apos;re prepping for boards or just wanting to level up your grades, Easy Learn AI is here to spark that love for learning!
                    </p>
                    <p>
                        What do you think? Drop your feedback – I&apos;d love to hear from you!
                    </p>
                    <p className="text-right font-semibold mt-12 text-lg">
                        Cheers,
                        <br />
                        <span className="text-primary font-bold">Harsh</span>
                        <br />
                        <span className="text-sm font-normal text-muted-foreground">(9th Grader &amp; Aspiring Developer @ Sri Chaitanya)</span>
                    </p>
                </CardContent>
              </Card>
            </div>
        </main>
    </div>
  );
}

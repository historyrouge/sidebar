
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
                    <CardTitle className="text-4xl font-bold mt-6">A Message from the Developers</CardTitle>
                    <CardDescription className="text-xl text-muted-foreground mt-2">&mdash; The story behind SearnAI &mdash;</CardDescription>
                </div>
                <CardContent className="prose prose-lg dark:prose-invert max-w-none mx-auto text-left px-4 sm:px-8 py-8 bg-background">
                    <p className="lead text-center text-2xl font-semibold !mt-0">Hey there, fellow learners! 👋</p>
                    <p>
                        We're a group of students from Sri Chaitanya School, led by Harsh, and we're super excited to introduce our app: <strong>SearnAI</strong>! 🚀 As people who are always juggling schoolwork, exams, and a bit of fun, we know how tough it can be to stay organized and motivated while studying. That's why we built SearnAI – an app designed specifically to make learning easier, smarter, and way more enjoyable.
                    </p>
                    <p>
                        Here's what makes SearnAI your ultimate study buddy:
                    </p>
                    <ul className="list-disc pl-5 space-y-2">
                        <li><strong>Canvas Drawing</strong>: Draw diagrams and sketches that AI can analyze, just like ChatGPT!</li>
                        <li><strong>Web Browsing & Scraping</strong>: Browse any website and let AI analyze web content in real-time.</li>
                        <li><strong>YouTube Analysis</strong>: Get full transcripts and AI summaries of any video.</li>
                        <li><strong>Code Execution</strong>: Run JavaScript code safely and see results instantly.</li>
                        <li><strong>Advanced Calculator</strong>: Solve complex math with trigonometry, logarithms, and more.</li>
                        <li><strong>Web Search</strong>: Real-time internet search integrated into AI responses.</li>
                        <li><strong>9 AI Models</strong>: Access to multiple cutting-edge AI models with automatic fallback.</li>
                        <li><strong>Voice Input & TTS</strong>: Talk to AI and have it read answers back to you.</li>
                        <li><strong>Music Player</strong>: Search and play YouTube music videos right in the chat.</li>
                        <li><strong>Smart Flashcards & Quizzes</strong>: AI-generated study materials from any content.</li>
                        <li><strong>Mind Maps & Presentations</strong>: Create visual learning aids automatically.</li>
                        <li><strong>PDF Analysis</strong>: Upload and chat with your PDF documents.</li>
                    </ul>
                    <p>
                        We poured our hearts into this during late-night coding sessions (while still acing our classes 😉). With <strong>40+ advanced features</strong> that rival and exceed ChatGPT, SearnAI is now one of the most powerful AI learning platforms available – and it's completely free! Whether you're prepping for boards or just wanting to level up your grades, SearnAI is here to spark that love for learning!
                    </p>
                    <p>
                        What do you think? Drop your feedback – we'd love to hear from you!
                    </p>
                    <p className="text-right font-semibold mt-12 text-base">
                        Cheers,
                        <br />
                        <span className="text-primary font-bold">Harsh & the Sri Chaitanya Team</span>
                        <br />
                        <span className="text-xs font-normal text-muted-foreground">(Aspiring Developers @ Sri Chaitanya)</span>
                    </p>
                </CardContent>
              </Card>
            </div>
        </main>
    </div>
  );
}

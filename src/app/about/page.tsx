
"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft, BadgeCheck } from "lucide-react";
import Link from "next/link";
import { MainLayout } from "@/components/main-layout";

function AboutContent() {
    return (
        <div className="flex flex-col h-screen bg-muted/20">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft />
                        </Link>
                    </Button>
                    <h1 className="text-xl font-semibold tracking-tight">About StudySpark</h1>
                </div>
            </header>
            <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                <Card className="max-w-3xl mx-auto">
                    <CardHeader>
                        <CardTitle>A Message from the Developer</CardTitle>
                        <CardDescription>Meet the mind behind the app.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4 text-muted-foreground">
                        <p className="font-semibold">Hey there, fellow learners! 👋</p>
                        <p>I'm Harsh, a 9th-grade student from Sri Chaitanya School, and I'm super excited to introduce my very own app: <strong>StudySpark</strong>! 🚀 As someone who's always juggling schoolwork, exams, and a bit of fun, I know how tough it can be to stay organized and motivated while studying. That's why I built StudySpark – an app designed specifically to make learning easier, smarter, and way more enjoyable.</p>
                        
                        <div className="space-y-2 py-2">
                            <h4 className="font-semibold text-foreground">Here's what makes StudySpark your ultimate study buddy:</h4>
                            <ul className="space-y-2 list-inside">
                                <li className="flex items-start gap-2">
                                    <BadgeCheck className="text-primary mt-1 size-4 shrink-0" />
                                    <span><strong>Smart Flashcards</strong>: Create custom decks for any subject, with AI-powered hints to help you remember tricky concepts.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <BadgeCheck className="text-primary mt-1 size-4 shrink-0" />
                                    <span><strong>Pomodoro Timer</strong>: Study in focused bursts with built-in breaks to keep burnout at bay.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <BadgeCheck className="text-primary mt-1 size-4 shrink-0" />
                                    <span><strong>Progress Tracker</strong>: Visualize your daily wins with charts and streaks – because who doesn't love seeing their hard work pay off?</span>
                                </li>
                                 <li className="flex items-start gap-2">
                                    <BadgeCheck className="text-primary mt-1 size-4 shrink-0" />
                                    <span><strong>Subject-Specific Tools</strong>: From math solvers to history timelines, it's all in one place, tailored for students like us.</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <BadgeCheck className="text-primary mt-1 size-4 shrink-0" />
                                    <span><strong>Community Challenges</strong>: Join study groups, compete with friends, and earn badges for consistent effort.</span>
                                </li>
                            </ul>
                        </div>

                        <p>I poured my heart into this during late-night coding sessions (while still acing my classes 😉), using simple tools to make it user-friendly for everyone. Whether you're prepping for boards or just wanting to level up your grades, StudySpark is here to spark that love for learning!</p>
                        
                        <div className="flex gap-4 pt-4">
                            <Button disabled>Download on the App Store</Button>
                            <Button disabled>Get it on Google Play</Button>
                        </div>
                        
                        <p>What do you think? Drop your feedback – I'd love to hear from you!</p>

                        <div>
                            <p className="font-semibold">Cheers, <br />Harsh</p>
                            <p className="text-sm">(9th Grader & Aspiring Developer @ Sri Chaitanya)</p>
                        </div>

                    </CardContent>
                </Card>
            </main>
        </div>
    );
}


export default function AboutPage() {
    return (
        <MainLayout>
            <AboutContent />
        </MainLayout>
    );
}

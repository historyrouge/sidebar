
"use client";

import { MainLayout } from "@/components/main-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { HelpChatbot } from '@/components/help-chatbot';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export default function HelpPage() {
    return (
        <MainLayout>
            <div className="flex flex-col h-screen bg-muted/20">
                <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="md:hidden" />
                        <Button variant="ghost" size="icon" asChild>
                            <Link href="/">
                                <ArrowLeft />
                            </Link>
                        </Button>
                        <h1 className="text-xl font-semibold tracking-tight">Help & Support</h1>
                    </div>
                </header>
                <main className="flex-1 overflow-auto p-4 md:p-6 lg:p-8">
                    <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Frequently Asked Questions</CardTitle>
                                <CardDescription>Find answers to common questions about ScholarSage.</CardDescription>
                            </CardHeader>
                            <CardContent>
                               <Accordion type="single" collapsible className="w-full">
                                    <AccordionItem value="item-1">
                                        <AccordionTrigger>How do I analyze content?</AccordionTrigger>
                                        <AccordionContent>
                                        Paste your study material into the text area on the "Study Now" page, or upload a .txt file or image. Then click the "Analyze" button. The AI will identify key concepts and potential questions.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-2">
                                        <AccordionTrigger>How do I generate flashcards or quizzes?</AccordionTrigger>
                                        <AccordionContent>
                                        After analyzing your content on the "Study Now" page, tabs for "Flashcards" and "Quiz" will appear. Click on the respective tab and then click the "Generate" button.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-3">
                                        <AccordionTrigger>How do I use the AI Tutor?</AccordionTrigger>
                                        <AccordionContent>
                                        After analyzing content, go to the "Tutor" tab. You can ask questions about the material you provided, and the AI will provide explanations and guidance.
                                        </AccordionContent>
                                    </AccordionItem>
                                    <AccordionItem value="item-4">
                                        <AccordionTrigger>Where can I find my saved materials?</AccordionTrigger>
                                        <AccordionContent>
                                            All of your saved study materials can be found on the "Your Material" page, accessible from the sidebar. You can click on any material to load it back into the "Study Now" page.
                                        </AccordionContent>
                                    </AccordionItem>
                                </Accordion>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>AI Help Assistant</CardTitle>
                                <CardDescription>Ask our AI assistant anything about the app.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <HelpChatbot />
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        </MainLayout>
    );
}

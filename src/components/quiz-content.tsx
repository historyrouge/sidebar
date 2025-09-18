
"use client";

import { Button } from "@/components/ui/button";
import { Moon, Sun } from "lucide-react";
import { SidebarTrigger } from "./ui/sidebar";
import { QuizGenerator } from "./quiz-generator";
import { BackButton } from "./back-button";

export function QuizContent() {

    return (
        <div className="flex h-full flex-col bg-muted/20 dark:bg-transparent">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="md:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Quiz</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <QuizGenerator />
            </main>
        </div>
    );
}

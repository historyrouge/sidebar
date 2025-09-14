
"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Check, Moon, Sun } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { cn } from "@/lib/utils";

const accentColors = [
    { name: 'default', color: 'hsl(217 91% 60%)' },
    { name: 'rose', color: 'hsl(347 77% 55%)' },
    { name: 'orange', color: 'hsl(25 95% 53%)' },
    { name: 'green', color: 'hsl(142 71% 45%)' },
];

export function SettingsContent() {
  const { setTheme, theme, accentColor, setAccentColor } = useTheme();

  return (
    <div className="flex flex-col h-full bg-muted/40">
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <BackButton />
                <h1 className="text-xl font-semibold tracking-tight">Settings</h1>
            </div>
            <div className="flex items-center gap-4">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setTheme(theme === "light" ? "dark" : "light")}
                >
                    <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                    <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Appearance</CardTitle>
                        <CardDescription>Customize the look and feel of the app.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex items-center justify-between">
                            <Label>Theme</Label>
                            <div className="flex items-center gap-2 rounded-lg border p-1">
                                <Button variant={theme === 'light' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme("light")}><Sun /></Button>
                                <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme("dark")}><Moon /></Button>
                            </div>
                        </div>
                         <div className="flex items-center justify-between">
                            <Label>Accent Color</Label>
                             <div className="flex items-center gap-2">
                                {accentColors.map((item) => (
                                    <Button
                                        key={item.name}
                                        variant="outline"
                                        size="icon"
                                        onClick={() => setAccentColor(item.name)}
                                        className={cn("h-8 w-8 rounded-full", accentColor === item.name && "border-2 border-foreground")}
                                        style={{ backgroundColor: item.color }}
                                    >
                                        {accentColor === item.name && <Check className="h-4 w-4 text-white" />}
                                        <span className="sr-only">{item.name}</span>
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
                 <Card>
                    <CardHeader>
                        <CardTitle>AI Settings</CardTitle>
                        <CardDescription>The AI models for each feature have been preset for optimal performance and quality.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li className="flex items-center justify-between"><span>Chat & Image Generation</span><span className="font-medium text-foreground">Gemini</span></li>
                            <li className="flex items-center justify-between"><span>Analysis, Quizzes, & eBooks</span><span className="font-medium text-foreground">Qwen</span></li>
                             <li className="flex items-center justify-between"><span>Code Analysis & Question Papers</span><span className="font-medium text-foreground">SambaNova</span></li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}

    


"use client";

import { useTheme } from "@/components/theme-provider";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Check, Moon, Sun, Paintbrush, Palette } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { cn } from "@/lib/utils";

export function SettingsAppearanceContent() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex flex-col h-full bg-muted/40">
       <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <BackButton />
                <h1 className="text-xl font-semibold tracking-tight">Appearance</h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="mx-auto max-w-2xl space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Paintbrush className="w-5 h-5"/> Theme</CardTitle>
                        <CardDescription>Select the theme for the application.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 gap-4">
                            <Button 
                                variant={theme === 'light' ? 'default' : 'outline'}
                                onClick={() => setTheme('light')}
                                className="h-24 flex flex-col gap-2"
                            >
                                <Sun className="w-6 h-6"/>
                                Light Mode
                            </Button>
                            <Button 
                                variant={theme === 'dark' ? 'default' : 'outline'}
                                onClick={() => setTheme('dark')}
                                className="h-24 flex flex-col gap-2"
                            >
                                <Moon className="w-6 h-6"/>
                                Dark Mode
                            </Button>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><Palette className="w-5 h-5"/> Accent Color</CardTitle>
                        <CardDescription>The application now uses a consistent gray accent color.</CardDescription>
                    </CardHeader>
                    <CardContent>
                       <div className="flex flex-wrap gap-3">
                            <div
                                className="h-10 w-10 rounded-full border-2 border-foreground flex items-center justify-center"
                                style={{ backgroundColor: 'hsl(0 0% 50%)' }}
                            >
                                <Check className="w-5 h-5 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </main>
    </div>
  );
}


"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Globe, Check } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

const languages = [
    { code: 'en', name: 'English (United States)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
];

export function SettingsLanguageContent() {
    const [selectedLanguage, setSelectedLanguage] = useState("en");

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Language</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5"/> Language</CardTitle>
                            <CardDescription>Choose the language for the application interface.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a language" />
                                </SelectTrigger>
                                <SelectContent>
                                    {languages.map(lang => (
                                        <SelectItem key={lang.code} value={lang.code}>
                                            {lang.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground mt-2">
                                Note: This is a demonstration. The application content is currently only available in English.
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

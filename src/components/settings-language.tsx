
"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Globe } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { useToast } from "@/hooks/use-toast";

const languages = [
    { code: 'en', name: 'English (United States)' },
    { code: 'hi', name: 'हिन्दी (Hindi)' },
    { code: 'bn', name: 'বাংলা (Bengali)' },
    { code: 'te', name: 'తెలుగు (Telugu)' },
];

const translations: Record<string, { title: string; description: string; note: string }> = {
    en: {
        title: "Language",
        description: "Choose the language for the application interface.",
        note: "Note: This is a proof-of-concept. Full app translation is coming soon."
    },
    hi: {
        title: "भाषा",
        description: "एप्लिकेशन इंटरफ़ेस के लिए भाषा चुनें।",
        note: "ध्यान दें: यह एक अवधारणा का प्रमाण है। पूर्ण ऐप अनुवाद जल्द ही आ रहा है।"
    },
    bn: {
        title: "ভাষা",
        description: "অ্যাপ্লিকেশন ইন্টারফেসের জন্য ভাষা নির্বাচন করুন।",
        note: "দ্রষ্টব্য: এটি একটি ধারণা-প্রমাণ। সম্পূর্ণ অ্যাপ অনুবাদ শীঘ্রই আসছে।"
    },
    te: {
        title: "భాష",
        description: "అప్లికేషన్ ఇంటర్‌ఫేస్ కోసం భాషను ఎంచుకోండి.",
        note: "గమనిక: ఇది ఒక భావన-రుజువు. పూర్తి అనువర్తన అనువాదం త్వరలో వస్తుంది."
    },
};


export function SettingsLanguageContent() {
    const [selectedLanguage, setSelectedLanguage] = useState("en");
    const { toast } = useToast();

    const handleLanguageChange = (langCode: string) => {
        setSelectedLanguage(langCode);
        toast({
            title: "Language Updated",
            description: `Interface language set to ${languages.find(l => l.code === langCode)?.name}.`
        });
    }

    const { title, description, note } = translations[selectedLanguage] || translations.en;

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">{title}</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Globe className="w-5 h-5"/> {title}</CardTitle>
                            <CardDescription>{description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
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
                            <p className="text-xs text-muted-foreground mt-4">
                                {note}
                            </p>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

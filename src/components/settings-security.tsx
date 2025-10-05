
"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Lock, Share2 } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { useToast } from "@/hooks/use-toast";

export function SettingsSecurityContent() {
    const { toast } = useToast();
    const [shareData, setShareData] = useState(true);

    useEffect(() => {
        try {
            const savedSetting = localStorage.getItem("shareUsageData");
            if (savedSetting !== null) {
                setShareData(JSON.parse(savedSetting));
            }
        } catch (e) {
            console.warn("Could not retrieve security settings from localStorage.");
        }
    }, []);

    const handleSettingChange = (value: boolean) => {
        setShareData(value);
        try {
            localStorage.setItem("shareUsageData", JSON.stringify(value));
            toast({
                title: "Privacy Setting Updated",
                description: `Usage data sharing has been ${value ? 'enabled' : 'disabled'}.`,
            });
        } catch (e) {
            toast({
                title: "Error",
                description: "Could not save your privacy setting.",
                variant: "destructive",
            });
        }
    };

    return (
        <div className="flex flex-col h-full bg-muted/40">
            <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
                <div className="flex items-center gap-2">
                    <SidebarTrigger className="lg:hidden" />
                    <BackButton />
                    <h1 className="text-xl font-semibold tracking-tight">Security & Privacy</h1>
                </div>
            </header>
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
                <div className="mx-auto max-w-2xl space-y-8">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5"/> Security & Privacy</CardTitle>
                            <CardDescription>Manage your data privacy and application security settings.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between p-4 rounded-lg border">
                                <div className="space-y-1">
                                    <Label htmlFor="share-data" className="font-semibold flex items-center gap-2">
                                        <Share2 className="w-4 h-4 text-primary" />
                                        Share Anonymous Usage Data
                                    </Label>
                                    <p className="text-xs text-muted-foreground">Help us improve SearnAI by sharing anonymous usage data. We never collect personal information.</p>
                                </div>
                                <Switch
                                    id="share-data"
                                    checked={shareData}
                                    onCheckedChange={handleSettingChange}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}

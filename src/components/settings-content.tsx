
"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Moon, Sun, Bot } from "lucide-react";
import { BackButton } from "./back-button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "./ui/select";
import { useModelSettings } from "@/hooks/use-model-settings";

export function SettingsContent() {
  const { setTheme, theme } = useTheme();
  const { model, setModel } = useModelSettings();

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-muted/40">
        <div className="mx-auto max-w-2xl space-y-6">
            <div className="flex items-center gap-2">
                <BackButton />
                <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Appearance</CardTitle>
                    <CardDescription>Customize the look and feel of the app.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <div className="flex items-center justify-between">
                        <Label>Theme</Label>
                        <div className="flex items-center gap-2 rounded-lg border p-1">
                            <Button variant={theme === 'light' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme("light")}><Sun /></Button>
                            <Button variant={theme === 'dark' ? 'secondary' : 'ghost'} size="icon" onClick={() => setTheme("dark")}><Moon /></Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>AI Settings</CardTitle>
                    <CardDescription>Manage your AI model preferences.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="model-select" className="flex items-center gap-2">
                            <Bot className="h-5 w-5" />
                            <span>Text Model</span>
                        </Label>
                        <Select value={model} onValueChange={setModel}>
                            <SelectTrigger id="model-select" className="w-[180px]">
                                <SelectValue placeholder="Select a model" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="deepseek">DeepSeek (Free)</SelectItem>
                                <SelectItem value="openai">OpenAI (Free)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

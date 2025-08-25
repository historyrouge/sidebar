
"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Moon, Sun } from "lucide-react";
import { BackButton } from "./back-button";
import { useModelSettings, ModelKey } from "@/hooks/use-model-settings";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

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
                    <CardDescription>Configure the AI model used for generating content.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <Label className="font-semibold">AI Model</Label>
                        <RadioGroup defaultValue={model} value={model} onValueChange={(value) => setModel(value as ModelKey)} className="flex flex-col sm:flex-row gap-4">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="gemini" id="gemini" />
                                <Label htmlFor="gemini">Gemini</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="samba" id="samba" />
                                <Label htmlFor="samba">SambaNova</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="puter" id="puter" />
                                <Label htmlFor="puter">Puter.js</Label>
                            </div>
                        </RadioGroup>
                        <p className="text-xs text-muted-foreground">
                            SambaNova requires an API key and base URL to be set. Puter.js runs in your browser and requires no setup.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

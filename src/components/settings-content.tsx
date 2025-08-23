
"use client";

import { useTheme } from "next-themes";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Moon, Sun, Bot, BrainCircuit } from "lucide-react";
import { BackButton } from "./back-button";
import { useModel } from "@/hooks/use-model";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

export function SettingsContent() {
  const { setTheme, theme } = useTheme();
  const { model, setModel } = useModel();

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
                    <CardTitle>Model Selection</CardTitle>
                    <CardDescription>Choose the AI model to power your experience.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <RadioGroup value={model} onValueChange={setModel} className="space-y-2">
                        <Label className="flex items-center gap-4 rounded-lg border p-4 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                            <RadioGroupItem value="gemini" id="gemini" />
                            <div className="flex-1">
                                <div className="font-semibold flex items-center gap-2"><Bot /> Gemini</div>
                                <p className="text-sm text-muted-foreground">Google's powerful and versatile model. Best for image analysis and standard tasks.</p>
                            </div>
                        </Label>
                        <Label className="flex items-center gap-4 rounded-lg border p-4 cursor-pointer has-[:checked]:bg-primary/10 has-[:checked]:border-primary">
                             <RadioGroupItem value="deepseek" id="deepseek" />
                            <div className="flex-1">
                                <div className="font-semibold flex items-center gap-2"><BrainCircuit /> DeepSeek</div>
                                <p className="text-sm text-muted-foreground">A high-performance model via OpenRouter. Great for creative and complex text generation.</p>
                            </div>
                        </Label>
                    </RadioGroup>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}

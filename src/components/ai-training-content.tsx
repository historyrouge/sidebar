
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";

const Section = ({ title, emoji, children }: { title: string, emoji: string, children: React.ReactNode }) => (
    <div className="border-t pt-4">
        <h3 className="text-xl font-semibold mb-2">{emoji} {title}</h3>
        <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground space-y-2">
            {children}
        </div>
    </div>
)

export function AiTrainingContent() {
  return (
    <div className="flex flex-col h-full bg-muted/40">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <BackButton />
                <h1 className="text-xl font-semibold tracking-tight">AI Training Explained</h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center">
              <Card className="w-full max-w-3xl shadow-lg overflow-hidden border-0 relative">
                <div className="bg-card p-8 text-center items-center">
                    <Cpu className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-3xl font-bold mt-6">How AI Models Are Trained</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        Good question, Harshita 🌸. Models like Google Gemini, OpenAI’s DALL·E, and others are the result of massive training. Let's break it down.
                    </CardDescription>
                </div>
                <CardContent className="mx-auto text-left px-4 sm:px-8 py-8 bg-background space-y-6">
                    <Section title="How Much Training Is Needed?" emoji="🏗️">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card className="p-4 bg-background">
                                <h4 className="font-semibold">1. Small Beginner Model</h4>
                                <p><strong>Dataset size:</strong> ~10,000–100,000 images.</p>
                                <p><strong>Compute:</strong> A free GPU on Google Colab or a single mid-range GPU.</p>
                                <p><strong>Training time:</strong> A few hours to 1–2 days.</p>
                                <p><strong>Result:</strong> Simple images (digits, small objects).</p>
                            </Card>
                             <Card className="p-4 bg-background">
                                <h4 className="font-semibold">2. Medium Research Model</h4>
                                <p><strong>Dataset size:</strong> ~1M–50M images with captions.</p>
                                <p><strong>Compute:</strong> Multiple powerful GPUs (e.g., NVIDIA A100).</p>
                                <p><strong>Training time:</strong> Weeks to a month.</p>
                                <p><strong>Result:</strong> Decent realistic images, but not state-of-the-art.</p>
                            </Card>
                             <Card className="p-4 bg-background">
                                <h4 className="font-semibold">3. Industry-Scale Model (Gemini, DALL·E)</h4>
                                <p><strong>Dataset size:</strong> Billions of image–text pairs.</p>
                                <p><strong>Compute:</strong> Thousands of GPUs/TPUs in parallel.</p>
                                <p><strong>Training cost:</strong> Millions of dollars 💰.</p>
                                <p><strong>Training time:</strong> Several months.</p>
                                <p><strong>Result:</strong> Photorealism and complex reasoning.</p>
                            </Card>
                             <Card className="p-4 bg-background">
                                <h4 className="font-semibold">4. Optimized / “Nano” Models</h4>
                                <p>Big models are often compressed into smaller ones like “Stable Diffusion Turbo”. They can run on laptops or phones but start from a huge base model.</p>
                            </Card>
                        </div>
                    </Section>

                    <Section title="The Good News" emoji="⚡">
                        <p>✅ So, if you want Google-level image generation, it’s not realistic for one person to train from scratch — the data and compute are enormous.</p>
                        <p>But the good news is you don’t need to train from zero. You can use pre-trained models (like Stable Diffusion) and fine-tune them with just a few hundred images to create your own custom generator!</p>
                    </Section>
                </CardContent>
              </Card>
            </div>
        </main>
    </div>
  );
}

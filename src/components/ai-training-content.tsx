
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Atom } from "lucide-react";
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
                <h1 className="text-xl font-semibold tracking-tight">Chemical Decomposition</h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center">
              <Card className="w-full max-w-3xl shadow-lg overflow-hidden border-0 relative">
                <div className="bg-card p-8 text-center items-center">
                    <Atom className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-3xl font-bold mt-6">Chemical Decomposition Explained</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        Got it 🌸 Harshita! Here’s a detailed description of chemical decomposition that will help you for exams.
                    </CardDescription>
                </div>
                <CardContent className="mx-auto text-left px-4 sm:px-8 py-8 bg-background space-y-6">
                    <Section title="Definition" emoji="🔬">
                        <p>Chemical decomposition (also called analysis reaction) is a type of chemical reaction in which a single compound breaks down into two or more simpler substances, which may be elements or smaller compounds.</p>
                        <p>It is the opposite of chemical combination (synthesis reaction).</p>
                        <p className="font-mono text-center text-base p-2 bg-muted rounded-md">AB → A + B</p>
                    </Section>

                    <Section title="Types of Chemical Decomposition" emoji="⚡">
                        <p>Decomposition usually requires an external source of energy because bonds inside compounds are strong and need energy to break. The common energy sources are:</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card className="p-4 bg-background">
                                <h4 className="font-semibold">1. Thermal Decomposition</h4>
                                <p>Compound breaks down by heating.</p>
                                <p className="font-mono text-sm p-1 bg-muted rounded-md">CaCO₃ → CaO + CO₂</p>
                            </Card>
                             <Card className="p-4 bg-background">
                                <h4 className="font-semibold">2. Electrolytic Decomposition</h4>
                                <p>Compound decomposes by passing electricity through it.</p>
                                <p className="font-mono text-sm p-1 bg-muted rounded-md">2H₂O → 2H₂ + O₂</p>
                            </Card>
                             <Card className="p-4 bg-background">
                                <h4 className="font-semibold">3. Photodecomposition</h4>
                                <p>Compound breaks down in the presence of light.</p>
                                <p className="font-mono text-sm p-1 bg-muted rounded-md">2AgCl → 2Ag + Cl₂</p>
                            </Card>
                        </div>
                    </Section>

                     <Section title="Flowchart for Revision" emoji="✅">
                        <Card className="bg-muted/50 p-4">
                            <pre className="font-mono text-xs whitespace-pre-wrap break-words text-center">
{`CHEMICAL DECOMPOSITION
      |
-----------------------------------
|                 |                |
THERMAL           ELECTROLYTIC     PHOTODECOMPOSITION
(by heating)       (by electricity)     (by sunlight)
      |                 |                |
Example:           Example:           Example:
CaCO3 → CaO+CO2    H2O → H2+O2       AgCl → Ag+Cl2`}
                            </pre>
                        </Card>
                    </Section>

                    <Section title="Importance of Decomposition" emoji="🌍">
                        <ul className="list-disc pl-5">
                            <li><strong>Industrial applications:</strong> Extraction of metals, cement production.</li>
                            <li><strong>Daily life:</strong> Decomposition of food waste produces biogas. Firecrackers involve rapid decomposition reactions.</li>
                            <li><strong>Environmental cycles:</strong> Natural decomposition of organic matter recycles nutrients into soil.</li>
                        </ul>
                    </Section>
                </CardContent>
              </Card>
            </div>
        </main>
    </div>
  );
}


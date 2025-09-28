
"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Cpu, Database, ToyBrick, LineChart, RefreshCw, Milestone } from "lucide-react";
import { BackButton } from "./back-button";
import { SidebarTrigger } from "./ui/sidebar";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Checkbox } from "./ui/checkbox";
import { Button } from "./ui/button";

const Section = ({ title, emoji, children, defaultOpen = false }: { title: string, emoji: React.ReactNode, children: React.ReactNode, defaultOpen?: boolean }) => (
    <Card className="bg-card/50">
        <CardHeader>
            <CardTitle className="flex items-center gap-3 text-xl">
                {emoji}
                {title}
            </CardTitle>
        </CardHeader>
        <CardContent>
            {children}
        </CardContent>
    </Card>
)

export function AiTrainingContent() {
  return (
    <div className="flex flex-col h-full bg-muted/40">
        <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 sm:px-6">
            <div className="flex items-center gap-2">
                <SidebarTrigger className="lg:hidden" />
                <BackButton />
                <h1 className="text-xl font-semibold tracking-tight">Improving SearnAI</h1>
            </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
            <div className="flex flex-col items-center justify-center">
              <Card className="w-full max-w-4xl shadow-lg overflow-hidden border-0 relative">
                <CardHeader className="bg-card p-8 text-center items-center">
                    <Cpu className="mx-auto h-12 w-12 text-primary" />
                    <CardTitle className="text-3xl font-bold mt-6">Detailed Guide to Improving SearnAI</CardTitle>
                    <CardDescription className="text-lg text-muted-foreground mt-2">
                        How to make me more useful: a technical overview.
                    </CardDescription>
                </CardHeader>
                <CardContent className="mx-auto text-left px-4 sm:px-8 py-8 bg-background space-y-6">
                    <Section title="Data-Centric Enhancements" emoji={<Database className="text-blue-400" />}>
                       <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Aspect</TableHead>
                                    <TableHead>What to Do</TableHead>
                                    <TableHead>Why It Helps</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Diverse Corpus</TableCell>
                                    <TableCell>Add high-quality text from varied domains (science, literature, tech, culture).</TableCell>
                                    <TableCell>Broadens knowledge base and reduces blind spots.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Noise Reduction</TableCell>
                                    <TableCell>Remove duplicated, contradictory, or low-quality sentences.</TableCell>
                                    <TableCell>Improves factual accuracy and consistency.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Balanced Representation</TableCell>
                                    <TableCell>Ensure equal coverage of different perspectives, languages, and cultural contexts.</TableCell>
                                    <TableCell>Prevents bias and improves relevance for global users.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Annotation Quality</TableCell>
                                    <TableCell>Use expert annotators for labeling intents, entities, and correct answers.</TableCell>
                                    <TableCell>Enhances supervised fine-tuning signals.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Section>

                    <Section title="Model Fine-Tuning Strategies" emoji={<ToyBrick className="text-green-400" />}>
                        <div className="prose prose-base dark:prose-invert max-w-none space-y-4">
                            <div>
                                <h4 className="font-semibold">Domain-Specific Fine-Tuning</h4>
                                <p>Gather a curated dataset for the target domain (e.g., Indian history, programming). Use a low learning rate (e.g., 1x10⁻⁵) to preserve general knowledge while adapting specifics.</p>
                            </div>
                             <div>
                                <h4 className="font-semibold">Instruction-Tuning</h4>
                                <p>Train on a mixture of prompts and high-quality responses that follow the “direct-then-detail” style you expect. Include meta-instructions like “always start with a concise answer”.</p>
                            </div>
                             <div>
                                <h4 className="font-semibold">Reinforcement Learning from Human Feedback (RLHF)</h4>
                                <p>Collect preference rankings from real users (good vs. bad responses). Optimize the model to maximize the reward model’s score, leading to more helpful outputs.</p>
                            </div>
                        </div>
                    </Section>
                    
                    <Section title="Evaluation & Monitoring" emoji={<LineChart className="text-yellow-400" />}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Metric</TableHead>
                                    <TableHead>How to Measure</TableHead>
                                    <TableHead>Target</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableRow>
                                    <TableCell>Accuracy</TableCell>
                                    <TableCell>Benchmark against curated Q&A sets (e.g., MMLU).</TableCell>
                                    <TableCell>&ge; 90% on core subjects.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Response Length</TableCell>
                                    <TableCell>Average token count for “concise first” compliance.</TableCell>
                                    <TableCell>&le; 30 tokens for the first sentence.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>User Satisfaction</TableCell>
                                    <TableCell>Collect thumbs-up/down and NPS scores.</TableCell>
                                    <TableCell>&ge; 4.5/5 average rating.</TableCell>
                                </TableRow>
                                <TableRow>
                                    <TableCell>Latency</TableCell>
                                    <TableCell>Time from request to response.</TableCell>
                                    <TableCell>&le; 800 ms for typical queries.</TableCell>
                                </TableRow>
                            </TableBody>
                        </Table>
                    </Section>

                     <Section title="Quick Checklist for Your Next Iteration" emoji={<Milestone className="text-purple-400" />}>
                        <div className="space-y-3 text-sm">
                            <div className="flex items-center gap-3">
                                <Checkbox id="c1" />
                                <label htmlFor="c1">Expand the corpus with at least 10% new high-quality documents.</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox id="c2" />
                                <label htmlFor="c2">Run a pilot RLHF round with 100 user-rated samples.</label>
                            </div>
                            <div className="flex items-center gap-3">
                                <Checkbox id="c3" />
                                <label htmlFor="c3">Verify LaTeX rendering in a test set of math questions.</label>
                            </div>
                             <div className="flex items-center gap-3">
                                <Checkbox id="c4" />
                                <label htmlFor="c4">Deploy a monitoring dashboard for latency and satisfaction metrics.</label>
                            </div>
                        </div>
                    </Section>

                    <div className="text-center pt-6">
                        <p className="font-semibold text-lg">Mate, would you like a mind-map of this improvement workflow or a sample prompt template to get you started?</p>
                        <div className="flex gap-4 justify-center mt-4">
                            <Button>Show Mind-Map</Button>
                            <Button variant="outline">Show Prompt Template</Button>
                        </div>
                    </div>

                </CardContent>
              </Card>
            </div>
        </main>
    </div>
  );
}

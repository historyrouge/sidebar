"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Palette, Globe, Youtube, Calculator, Code2, Search, Brain, Mic, Music, FileText, Zap, Sparkles } from "lucide-react";

const features = [
  {
    icon: Palette,
    title: "Canvas Drawing",
    description: "Draw diagrams and sketches that AI can analyze",
    color: "text-purple-500"
  },
  {
    icon: Globe,
    title: "Web Scraping",
    description: "Extract and analyze content from any webpage",
    color: "text-blue-500"
  },
  {
    icon: Youtube,
    title: "YouTube Analyzer",
    description: "Get transcripts and summaries of any video",
    color: "text-red-500"
  },
  {
    icon: Calculator,
    title: "Advanced Calculator",
    description: "Perform complex mathematical calculations",
    color: "text-green-500"
  },
  {
    icon: Code2,
    title: "Code Execution",
    description: "Run JavaScript code safely in sandbox",
    color: "text-yellow-500"
  },
  {
    icon: Search,
    title: "Web Search",
    description: "Real-time web search with DuckDuckGo",
    color: "text-cyan-500"
  },
  {
    icon: Brain,
    title: "DeepThink Mode",
    description: "Advanced reasoning with powerful AI models",
    color: "text-pink-500"
  },
  {
    icon: Mic,
    title: "Voice Input",
    description: "Speak to AI with continuous recognition",
    color: "text-indigo-500"
  },
  {
    icon: Music,
    title: "Music Player",
    description: "Search and play YouTube music videos",
    color: "text-orange-500"
  },
  {
    icon: FileText,
    title: "Multi-file Support",
    description: "Upload images, text files, and drawings",
    color: "text-teal-500"
  },
  {
    icon: Zap,
    title: "9 AI Models",
    description: "Multiple models with automatic fallback",
    color: "text-amber-500"
  },
  {
    icon: Sparkles,
    title: "40+ Features",
    description: "Educational tools, PDF analysis, and more",
    color: "text-rose-500"
  }
];

export function FeaturesShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {features.map((feature, index) => {
        const Icon = feature.icon;
        return (
          <Card key={index} className="border-border/50 hover:border-primary/50 transition-colors">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-lg bg-muted ${feature.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription>{feature.description}</CardDescription>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

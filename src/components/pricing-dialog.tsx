"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "./ui/card";
import { Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "./ui/badge";

interface PricingDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const tiers = [
    {
        name: "Free",
        price: "₹0",
        priceDetails: "INR / month",
        description: "Explore how AI can help you with everyday tasks",
        buttonText: "Your current plan",
        buttonVariant: "secondary",
        disabled: true,
        features: [
            "Access to GPT-5",
            "Standard voice mode",
            "Real-time data from the web with search",
            "Limited access to file uploads, advanced data analysis, and image generation",
            "Use custom GPTs",
        ]
    },
    {
        name: "Go",
        price: "₹399",
        priceDetails: "INR / month (inclusive of GST)",
        description: "Get more access to our most popular features",
        buttonText: "Upgrade to Go",
        buttonVariant: "default",
        recommended: true,
        features: [
            "Everything in Free",
            "Extended access to our flagship model GPT-5",
            "Extended access to image generation",
            "Extended access to file uploads",
            "Extended access to advanced data analysis",
            "Longer memory for more personalized responses",
        ]
    },
    {
        name: "Plus",
        price: "₹1,999",
        priceDetails: "INR / month (inclusive of GST)",
        description: "Level up productivity and creativity with expanded access",
        buttonText: "Get Plus",
        buttonVariant: "outline",
        features: [
            "Everything in Free",
            "Extended limits on GPT-5, our flagship model",
            "Standard and advanced voice mode",
            "Access to ChatGPT agent",
            "Create and use tasks, shared projects, and custom GPTs",
            "Limited access to Sora video generation",
            "Opportunities to test new features",
            "Access to a research preview of Codex agent",
        ]
    },
    {
        name: "Pro",
        price: "₹19,900",
        priceDetails: "INR / month (inclusive of GST)",
        description: "Get the best of OpenAI with the highest level of access",
        buttonText: "Get Pro",
        buttonVariant: "outline",
        features: [
            "Everything in Plus",
            "Unlimited access to GPT-5",
            "Unlimited access to advanced voice",
            "Extended access to deep research",
            "Access to GPT-5 pro",
            "Extended access to ChatGPT agent",
            "Extended access to Sora video generation",
        ]
    }
];

export function PricingDialog({ isOpen, onOpenChange }: PricingDialogProps) {
    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-7xl bg-black border-neutral-800 text-white p-8">
                <DialogHeader className="text-center mb-8">
                    <DialogTitle className="text-3xl font-semibold">Recommended plan for you</DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {tiers.map((tier) => (
                        <Card key={tier.name} className={cn(
                            "flex flex-col bg-neutral-900 border-neutral-800",
                            tier.recommended && "border-primary/50 ring-2 ring-primary/50"
                        )}>
                            <CardHeader>
                                <div className="flex justify-between items-center">
                                    <CardTitle className="text-xl font-medium">{tier.name}</CardTitle>
                                    {tier.name === 'Go' && <Badge variant="outline" className="border-blue-400 text-blue-400">NEW</Badge>}
                                </div>
                                <div className="flex items-baseline gap-2">
                                    <span className="text-4xl font-bold">{tier.price}</span>
                                    <span className="text-sm text-neutral-400">{tier.priceDetails}</span>
                                </div>
                                <CardDescription className="text-neutral-300 h-10">{tier.description}</CardDescription>
                            </CardHeader>
                            <CardContent className="flex-1 space-y-3 pt-4">
                                <Button className="w-full" variant={tier.buttonVariant as any} disabled={tier.disabled}>
                                    {tier.buttonText}
                                </Button>
                                <ul className="space-y-2 text-sm text-neutral-300">
                                    {tier.features.map((feature, i) => (
                                        <li key={i} className="flex items-start gap-2">
                                            <Check className="h-4 w-4 mt-1 text-green-400 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                            </CardContent>
                        </Card>
                    ))}
                </div>
                 <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={() => onOpenChange(false)}>
                    <X />
                </Button>
            </DialogContent>
        </Dialog>
    );
}

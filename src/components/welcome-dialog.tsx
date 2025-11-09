
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { PartyPopper } from "lucide-react";
import { Separator } from "./ui/separator";
import { cn } from "@/lib/utils";

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [name, setName] = useState("");

  useEffect(() => {
    try {
        const hasSeenPopup = localStorage.getItem("hasSeenWelcomePopup");
        if (!hasSeenPopup) {
            setIsOpen(true);
        }
    } catch (error) {
        console.error("Could not access localStorage", error);
    }
  }, []);

  const handleNameSubmit = () => {
    try {
        localStorage.setItem("hasSeenWelcomePopup", "true");
        if (name.trim()) {
            localStorage.setItem("userName", name.trim());
        }
    } catch (error) {
        console.error("Could not write to localStorage", error);
    }
    setStep(2); // Move to the "What's New" step
  };

  const handleClose = () => {
    setIsOpen(false);
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent 
        className={cn("transition-all duration-300", step === 1 ? "max-w-md" : "max-w-lg")}
        onEscapeKeyDown={handleClose} 
        onPointerDownOutside={handleClose}
        >
        {step === 1 && (
            <>
                <DialogHeader className="text-center space-y-2">
                    <DialogTitle className="text-2xl font-bold">Welcome to SearnAI!</DialogTitle>
                    <DialogDescription className="text-muted-foreground !mt-2">Your smart study buddy. 🚀</DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-2">
                    <Label htmlFor="name-input">What should we call you?</Label>
                    <Input 
                        id="name-input"
                        placeholder="Enter your name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="h-11 text-base"
                    />
                </div>
                <DialogFooter className="mt-2">
                    <Button onClick={handleNameSubmit} className="w-full">Get Started</Button>
                </DialogFooter>
            </>
        )}
        {step === 2 && (
            <>
                 <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center gap-2">
                        <PartyPopper className="h-6 w-6 text-primary" /> What's New?
                    </DialogTitle>
                 </DialogHeader>
                <div className="space-y-4 text-sm text-muted-foreground pt-2">
                    <p>Here are the latest updates to make your study sessions even better:</p>
                    <ul className="space-y-2 list-disc pl-5">
                        <li><strong>AI Playground</strong>: A new split-screen view to chat with the AI and see generative content appear in a separate canvas. Perfect for drafting essays, code, and more!</li>
                        <li><strong>Smarter Chat Routing</strong>: The AI now knows when you're in the Playground and sends content to the right place.</li>
                        <li><strong>Agent is now Web Agent</strong>: The "Agent" feature in the sidebar is now the "Web Agent" for interacting with web pages.</li>
                    </ul>
                     <p className="pt-2">
                        Thank you for being part of this journey!
                        <br />
                        - Harsh & the Sri Chaitanya Team
                    </p>
                </div>
                 <DialogFooter className="mt-4">
                    <Button onClick={handleClose} className="w-full">Awesome!</Button>
                </DialogFooter>
            </>
        )}
      </DialogContent>
    </Dialog>
  );
}

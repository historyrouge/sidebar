
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { PartyPopper } from "lucide-react";
import { Separator } from "./ui/separator";

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);
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

  const handleClose = () => {
    try {
        localStorage.setItem("hasSeenWelcomePopup", "true");
        if (name.trim()) {
            localStorage.setItem("userName", name.trim());
        }
    } catch (error) {
        console.error("Could not write to localStorage", error);
    }
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg p-8" onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
        <DialogHeader className="text-center space-y-2">
            <DialogTitle className="text-2xl font-bold">Hello everyone! 👋</DialogTitle>
            <DialogDescription className="text-muted-foreground !mt-2">We warmly welcome you to <strong>SearnAI</strong> – your smart study buddy! 🚀</DialogDescription>
        </DialogHeader>
        <div className="text-sm text-center text-muted-foreground space-y-4 py-4">
            <p>
                Here, you can easily generate quizzes, create flashcards, and explore AI-powered study tools to make learning fun and stress-free. If you ever face any issues or have suggestions, feel free to reach out to us at <a href="mailto:harshrishabh@proton.me" className="text-primary underline">harshrishabh@proton.me</a>.
            </p>
        </div>

        <div className="space-y-2">
            <Label htmlFor="name-input">What should we call you?</Label>
            <Input 
                id="name-input"
                placeholder="Enter your name..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 text-base"
            />
        </div>

        <Separator className="my-6" />

        <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2"><PartyPopper className="h-5 w-5 text-primary" /> What's New?</h3>
            <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                <li><strong>AI Playground</strong>: A new split-screen view to chat with the AI and see generative content appear in a separate canvas. Perfect for drafting essays, code, and more!</li>
                <li><strong>Smarter Chat Routing</strong>: The AI now knows when you're in the Playground and sends content to the right place.</li>
                <li><strong>Agent is now Web Agent</strong>: The "Agent" feature in the sidebar is now the "Web Agent" for interacting with web pages.</li>
            </ul>
        </div>
        
        <div className="text-sm mt-6">
             <p>Thank you for being part of this journey!</p>
             <p className="mt-2">
                Regards,
                <br />
                <strong>Harsh & the Sri Chaitanya Team</strong>
            </p>
        </div>
        
        <DialogFooter className="mt-6">
          <Button onClick={handleClose} className="w-full">Get Started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

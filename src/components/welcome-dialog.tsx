
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

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
      <DialogContent className="max-w-lg" onEscapeKeyDown={handleClose} onPointerDownOutside={handleClose}>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">Hello everyone! 👋</DialogTitle>
        </DialogHeader>
        <div className="prose prose-sm dark:prose-invert max-w-none text-left py-4 space-y-4">
             <p>We warmly welcome you to <strong>SearnAI</strong> – your smart study buddy! 🚀</p>
            <p>
                Here, you can easily generate quizzes, create flashcards, and explore AI-powered study tools to make learning fun and stress-free. If you ever face any issues or have suggestions, feel free to reach out to us at <a href="mailto:harshrishabh@proton.me">harshrishabh@proton.me</a>.
            </p>
            <div className="space-y-2 not-prose">
                <Label htmlFor="name-input">What should we call you?</Label>
                <Input 
                    id="name-input"
                    placeholder="Enter your name..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>
             <p className="!mb-0">Thank you for being part of this journey!</p>
             <p className="!mt-2 text-sm">
                Regards,
                <br />
                <strong>Harsh & the Sri Chaitanya Team</strong>
                <br />
                <span className="text-xs text-muted-foreground">Developers of SearnAI</span>
            </p>
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Get Started</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

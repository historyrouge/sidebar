
"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";

export function WelcomeDialog() {
  const [isOpen, setIsOpen] = useState(false);

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
        <div className="prose prose-sm dark:prose-invert max-w-none text-left py-4">
             <p>My name is Harsh, and I warmly welcome you to <strong>Easy Learn AI</strong> – your smart study buddy! 🚀</p>
            <p>
                Here, you can easily generate quizzes, create flashcards, and explore AI-powered study tools to make learning fun and stress-free. If you ever face any issues or have suggestions, feel free to reach out to me directly at <a href="mailto:harshrishabh@proton.me">harshrishabh@proton.me</a>.
            </p>
             <p className="!mb-0">Thank you for being part of this journey!</p>
             <p className="!mt-2 text-sm">
                Regards,
                <br />
                <strong>Harsh</strong>
                <br />
                <span className="text-xs text-muted-foreground">Developer of Easy Learn AI</span>
            </p>
        </div>
        <DialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}


"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";

interface LimitExhaustedDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}


export function LimitExhaustedDialog({ isOpen, onOpenChange }: LimitExhaustedDialogProps) {

    const handleReload = () => {
        window.location.reload();
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive"/>
                        Message Limit Reached
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        You have exhausted your message limits for all available AI models. To continue using the app, you can upgrade, try again after a minute, or come back tomorrow.
                        <br/><br/>
                        Sorry for the inconvenience.
                        <br/><br/>
                        Regards,
                        <br/>
                        Harsh
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <Button onClick={handleReload}>Try Again</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

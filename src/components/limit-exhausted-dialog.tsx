
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle, ExternalLink } from "lucide-react";

interface LimitExhaustedDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}


export function LimitExhaustedDialog({ isOpen, onOpenChange }: LimitExhaustedDialogProps) {

    const handleReload = () => {
        window.location.reload();
    }

    const handleOpenGoogleCloud = () => {
        window.open('https://console.cloud.google.com/apis/credentials', '_blank', 'width=1200,height=800,scrollbars=yes');
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive"/>
                        API Limit Reached
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        You have exhausted the free API limits. To continue, please create a new Google API key and add it to your environment variables.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <p className="text-sm">Click the button below to open the Google Cloud Console and generate a new key. You will need to add this key to your project's `.env` file.</p>
                </div>
                <DialogFooter className="sm:justify-between gap-2">
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                    <div className="flex gap-2">
                        <Button variant="secondary" onClick={handleReload}>I've added a key</Button>
                        <Button onClick={handleOpenGoogleCloud}>
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Create API Key
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

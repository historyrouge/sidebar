
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface LimitExhaustedDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const API_KEY_URL = "https://aistudio.google.com/api-keys";

export function LimitExhaustedDialog({ isOpen, onOpenChange }: LimitExhaustedDialogProps) {
    const { toast } = useToast();
    const [apiKey, setApiKey] = useState("");

    const handleCreateKey = () => {
        window.open(API_KEY_URL, '_blank');
    };
    
    const handleSaveAndReload = () => {
        if (!apiKey.trim()) {
            toast({ title: "API Key is empty", description: "Please paste your new API key.", variant: "destructive" });
            return;
        }
        // In a real app, you would securely save this key.
        // For this demo, we'll just reload the page as a placeholder for re-initializing the app with a new key.
        toast({ title: "New Key Ready", description: "Reloading the application with the new key."});
        window.location.reload();
    };

    const handleClose = () => {
        onOpenChange(false);
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-lg">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <AlertTriangle className="text-destructive"/>
                        API Limit Reached
                    </DialogTitle>
                    <DialogDescription className="pt-2">
                        You have exhausted the free API limits for the current key. Please create a new Google AI API key to continue.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4 space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2">Instructions:</h3>
                        <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
                            <li>Click "Create API Key" to open Google AI Studio in a **new browser tab**.</li>
                            <li>Follow the on-screen instructions to create a new API key.</li>
                            <li>Copy the new key to your clipboard.</li>
                            <li>Return to this dialog and paste your new key below to continue.</li>
                        </ol>
                         <Button onClick={handleCreateKey} className="w-full mt-4">
                            Create API Key in New Tab
                        </Button>
                    </div>

                    <div className="space-y-2">
                        <label htmlFor="api-key-input" className="font-semibold">Paste New API Key:</label>
                        <Input 
                            id="api-key-input"
                            type="password" 
                            placeholder="Paste your new API key here (AIza...)" 
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="bg-muted/50 rounded-b-lg p-4 -m-6 mt-6">
                    <Button variant="outline" onClick={handleClose}>Cancel</Button>
                    <Button onClick={handleSaveAndReload} disabled={!apiKey.trim()}>Save and Reload</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}


"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { Button } from "./ui/button";
import { AlertTriangle, ArrowLeft } from "lucide-react";
import { useState } from "react";
import { BrowserView } from "./browser-view";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface LimitExhaustedDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const API_KEY_URL = "https://aistudio.google.com/api-keys";

export function LimitExhaustedDialog({ isOpen, onOpenChange }: LimitExhaustedDialogProps) {
    const { toast } = useToast();
    const [view, setView] = useState<'initial' | 'browser' | 'paste'>('initial');
    const [newApiKey, setNewApiKey] = useState("");

    const handleBack = () => {
        setView('initial');
    };
    
    const handlePasteAndReload = () => {
        if (!newApiKey.trim()) {
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
        setTimeout(() => setView('initial'), 300); // Reset view after closing
    }

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
                {view === 'initial' && (
                    <>
                        <DialogHeader className="p-6">
                            <DialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="text-destructive"/>
                                API Limit Reached
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                You have exhausted the free API limits for the current key. Please create a new Google AI API key to continue.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="px-6 py-4 flex-1">
                            <h3 className="font-semibold mb-2">Instructions:</h3>
                            <ol className="list-decimal list-inside text-sm space-y-2 text-muted-foreground">
                                <li>Click "Create API Key" to open Google AI Studio in an in-app browser.</li>
                                <li>Follow the on-screen instructions to create a new API key.</li>
                                <li>Copy the new key to your clipboard.</li>
                                <li>Return to this dialog and paste your new key to continue.</li>
                            </ol>
                        </div>
                        <DialogFooter className="p-6 bg-muted/50 rounded-b-lg">
                            <Button variant="outline" onClick={handleClose}>Close</Button>
                            <Button onClick={() => setView('browser')}>
                                Create API Key
                            </Button>
                        </DialogFooter>
                    </>
                )}

                {view === 'browser' && (
                    <div className="h-full flex flex-col">
                        <div className="flex items-center gap-2 p-2 border-b">
                            <Button variant="ghost" size="icon" onClick={handleBack}><ArrowLeft className="h-4 w-4"/></Button>
                            <h3 className="font-semibold text-sm flex-1">Create your Google AI API Key</h3>
                             <Button size="sm" onClick={() => setView('paste')}>I have my key</Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                           <BrowserView initialUrl={API_KEY_URL} />
                        </div>
                    </div>
                )}
                
                 {view === 'paste' && (
                     <>
                        <DialogHeader className="p-6">
                            <DialogTitle className="flex items-center gap-2">
                                Paste your new API Key
                            </DialogTitle>
                            <DialogDescription className="pt-2">
                                Paste the key you just created below. This key will be used for future requests.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="px-6 py-4 flex-1">
                            <Input 
                                type="password" 
                                placeholder="AIza..." 
                                value={newApiKey}
                                onChange={(e) => setNewApiKey(e.target.value)}
                            />
                        </div>
                        <DialogFooter className="p-6 bg-muted/50 rounded-b-lg">
                            <Button variant="outline" onClick={handleBack}>Back</Button>
                            <Button onClick={handlePasteAndReload}>Save and Reload</Button>
                        </DialogFooter>
                    </>
                )}

            </DialogContent>
        </Dialog>
    )
}

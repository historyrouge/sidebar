
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./ui/dialog";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { useState } from "react";
import { ModelKey } from "@/app/actions";
import { WifiOff } from "lucide-react";

interface ModelSwitcherDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentModel: ModelKey;
  onModelSelect: (model: ModelKey) => void;
}

const ALL_MODELS: { key: ModelKey; name: string; description: string }[] = [
    { key: "gemini", name: "Gemini", description: "Google's powerful and versatile model." },
    { key: "samba", name: "SambaNova", description: "High-performance model for specific tasks." },
    { key: "puter", name: "Puter.js", description: "Runs directly and privately in your browser." },
];

export function ModelSwitcherDialog({ isOpen, onOpenChange, currentModel, onModelSelect }: ModelSwitcherDialogProps) {
    const [selectedModel, setSelectedModel] = useState<ModelKey | null>(null);

    const availableModels = ALL_MODELS.filter(m => m.key !== currentModel);

    const handleSubmit = () => {
        if (selectedModel) {
            onModelSelect(selectedModel);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <WifiOff className="text-destructive"/>
                        API Limit Reached
                    </DialogTitle>
                    <DialogDescription>
                        The free API limit for the '{currentModel}' model has been reached. Please switch to another model to continue.
                    </DialogDescription>
                </DialogHeader>
                <div className="py-4">
                    <RadioGroup onValueChange={(value) => setSelectedModel(value as ModelKey)}>
                        {availableModels.map(model => (
                            <Label key={model.key} htmlFor={model.key} className="flex items-start gap-4 space-x-2 border rounded-md p-4 hover:bg-accent has-[:checked]:bg-accent has-[:checked]:border-primary">
                                <RadioGroupItem value={model.key} id={model.key} className="mt-1"/>
                                <div className="flex flex-col">
                                    <span className="font-semibold">{model.name}</span>
                                    <span className="text-sm text-muted-foreground">{model.description}</span>
                                </div>
                            </Label>
                        ))}
                    </RadioGroup>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                    <Button onClick={handleSubmit} disabled={!selectedModel}>Switch and Retry</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

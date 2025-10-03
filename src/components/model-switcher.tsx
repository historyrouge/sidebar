

"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button";
import { BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";
import { AVAILABLE_MODELS } from "@/lib/models";

interface ModelSwitcherProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    disabled?: boolean;
}

export function ModelSwitcher({ selectedModel, onModelChange, disabled }: ModelSwitcherProps) {

    const currentModelDetails = AVAILABLE_MODELS.find(m => m.id === selectedModel);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    type="button" 
                    variant="ghost" 
                    className="flex-shrink-0 h-9 gap-2 text-muted-foreground"
                    disabled={disabled}
                >
                    {currentModelDetails?.logo ? <span className="text-lg">{currentModelDetails.logo}</span> : <BrainCircuit className="h-4 w-4" />}
                    <span className="hidden sm:inline">{currentModelDetails?.name || selectedModel}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuRadioGroup value={selectedModel} onValueChange={onModelChange}>
                    {AVAILABLE_MODELS.map(model => (
                        <DropdownMenuRadioItem key={model.id} value={model.id}>
                           <div className="flex items-center gap-2">
                               {model.logo && <span className="text-lg">{model.logo}</span>}
                               <div>
                                    <p className="font-medium">{model.name}</p>
                                    <p className="text-xs text-muted-foreground">{model.description}</p>
                               </div>
                           </div>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

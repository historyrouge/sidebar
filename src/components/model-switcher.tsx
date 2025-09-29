
"use client";

import { DropdownMenu, DropdownMenuContent, DropdownMenuRadioGroup, DropdownMenuRadioItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "./ui/button";
import { BrainCircuit } from "lucide-react";
import { cn } from "@/lib/utils";

const models = [
    { id: 'gpt-oss-120b', name: 'GPT-OSS (120B)', description: 'Most powerful, for complex reasoning.' },
    { id: 'Qwen3-32B', name: 'Qwen3 (32B)', description: 'Fast and efficient for general chat.' },
    { id: 'Llama-4-Maverick-17B-128E-Instruct', name: 'Maverick (17B)', description: 'Balanced performance and vision.' },
    { id: 'Meta-Llama-3.3-70B-Instruct', name: 'Llama 3.3 (70B)', description: 'Newest large-scale Llama model.' },
    { id: 'Meta-Llama-3.1-8B-Instruct', name: 'Llama 3.1 (8B)', description: 'Fast and lightweight for quick tasks.' },
];

interface ModelSwitcherProps {
    selectedModel: string;
    onModelChange: (modelId: string) => void;
    disabled?: boolean;
}

export function ModelSwitcher({ selectedModel, onModelChange, disabled }: ModelSwitcherProps) {

    const getModelName = (id: string) => {
        return models.find(m => m.id === id)?.name || id;
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button 
                    type="button" 
                    size="sm" 
                    variant="ghost" 
                    className="flex-shrink-0 h-9 gap-2 text-muted-foreground"
                    disabled={disabled}
                >
                    <BrainCircuit className="h-4 w-4" />
                    <span className="hidden sm:inline">{getModelName(selectedModel)}</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                <DropdownMenuRadioGroup value={selectedModel} onValueChange={onModelChange}>
                    {models.map(model => (
                        <DropdownMenuRadioItem key={model.id} value={model.id}>
                           <div>
                                <p className="font-medium">{model.name}</p>
                                <p className="text-xs text-muted-foreground">{model.description}</p>
                           </div>
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}

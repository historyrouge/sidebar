
"use client";

import { Construction } from "lucide-react";

export function ImageGenerationContent() {
    return (
        <div className="flex flex-1 items-center justify-center bg-muted/40 p-4 md:p-8">
            <div className="text-center">
                <Construction className="mx-auto h-12 w-12 text-muted-foreground" />
                <h2 className="mt-4 text-2xl font-semibold">Feature Removed</h2>
                <p className="mt-2 text-muted-foreground">The image generation feature has been removed.</p>
            </div>
        </div>
    );
}

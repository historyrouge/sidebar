
"use client";

import { useRouter } from "next/navigation";
import { Button } from "./ui/button";
import { ArrowLeft } from "lucide-react";

export function BackButton({ className }: { className?: string }) {
    const router = useRouter();

    return (
        <Button variant="ghost" size="icon" onClick={() => router.back()} className={className}>
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Go back</span>
        </Button>
    )
}

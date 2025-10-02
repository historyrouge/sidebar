
"use client";

import { Button } from "./ui/button";
import { Globe, ExternalLink } from "lucide-react";
import Link from "next/link";

type WebsiteChatCardProps = {
    websiteData: {
        url: string;
        title?: string;
        snippet?: string;
    };
};

export function WebsiteChatCard({ websiteData }: WebsiteChatCardProps) {
    const { url, title, snippet } = websiteData;
    const displayUrl = new URL(url).hostname;

    return (
        <div className="w-full max-w-sm rounded-xl border bg-card/50 overflow-hidden">
            <div className="p-4">
                <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                        <Globe className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                        <p className="font-semibold text-sm line-clamp-2">{title || "Web Search Result"}</p>
                        <p className="text-xs text-green-500 dark:text-green-400">{displayUrl}</p>
                    </div>
                </div>
                {snippet && (
                    <p className="mt-3 text-xs text-muted-foreground line-clamp-3">
                        {snippet}
                    </p>
                )}
                <div className="mt-4 flex gap-2">
                     <Link href={url} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="outline" size="sm" className="w-full">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Visit Site
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

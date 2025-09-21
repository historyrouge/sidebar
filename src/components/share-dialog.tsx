
"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Copy, Share2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface ShareDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  content: string;
}

const XIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
);

const FacebookIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
    </svg>
);

const LinkedinIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
      <rect width="4" height="12" x="2" y="9"/>
      <circle cx="4" cy="4" r="2"/>
    </svg>
);

export function ShareDialog({ isOpen, onOpenChange, content }: ShareDialogProps) {
  const { toast } = useToast();
  const [shareUrl, setShareUrl] = useState("");

  useEffect(() => {
    // In a real app, you might generate a unique URL for the content.
    // For this demo, we'll just use the current window location.
    setShareUrl(window.location.href);
  }, [isOpen]);

  const handleCopyToClipboard = (text: string, type: 'link' | 'text') => {
    navigator.clipboard.writeText(text);
    toast({ title: `Copied to clipboard!`, description: `The ${type} has been copied.` });
  };

  const createShareLink = (platform: 'twitter' | 'facebook' | 'linkedin') => {
    const text = `Check out this response from SearnAI: "${content.substring(0, 100)}..."`;
    const encodedText = encodeURIComponent(text);
    const encodedUrl = encodeURIComponent(shareUrl);
  
    switch (platform) {
      case 'twitter':
        return `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
      case 'facebook':
        return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}&quote=${encodedText}`;
      case 'linkedin':
        return `https://www.linkedin.com/shareArticle?mini=true&url=${encodedUrl}&title=Response%20from%20SearnAI&summary=${encodedText}`;
    }
  };


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share this response</DialogTitle>
          <DialogDescription>
            Anyone with the link will be able to view this conversation.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex space-x-2">
            <Input value={shareUrl} readOnly />
            <Button size="icon" onClick={() => handleCopyToClipboard(shareUrl, 'link')} disabled>
                <Copy className="h-4 w-4" />
                <span className="sr-only">Copy Link</span>
            </Button>
            <Button size="icon" onClick={() => handleCopyToClipboard(content, 'text')}>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-clipboard-type h-4 w-4"><path d="M12 5H9.5a2.5 2.5 0 0 0 0 5h7a2.5 2.5 0 0 1 0 5h-7a2.5 2.5 0 0 0 0 5H12"/><rect width="10" height="14" x="8" y="3" rx="2"/><path d="M8 7H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3.5"/></svg>
                <span className="sr-only">Copy Text</span>
            </Button>
          </div>
          <div className="flex justify-center space-x-2">
            <Button asChild variant="outline" size="icon">
                <a href={createShareLink('twitter')} target="_blank" rel="noopener noreferrer">
                    <XIcon className="h-5 w-5" />
                </a>
            </Button>
            <Button asChild variant="outline" size="icon">
                <a href={createShareLink('facebook')} target="_blank" rel="noopener noreferrer">
                    <FacebookIcon className="h-5 w-5" />
                </a>
            </Button>
             <Button asChild variant="outline" size="icon">
                <a href={createShareLink('linkedin')} target="_blank" rel="noopener noreferrer">
                    <LinkedinIcon className="h-5 w-5" />
                </a>
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

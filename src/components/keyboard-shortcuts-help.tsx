"use client";

import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { HelpCircle, Keyboard } from 'lucide-react';
import { useKeyboardShortcutsHelp } from '@/hooks/use-keyboard-shortcuts';

export function KeyboardShortcutsHelp() {
  const [open, setOpen] = useState(false);
  const shortcuts = useKeyboardShortcutsHelp();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className="transition-smooth hover:bg-primary/10 focus-ring"
          aria-label="Show keyboard shortcuts"
          data-help-dialog
        >
          <HelpCircle className="h-5 w-5" aria-hidden="true" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          {shortcuts.map((shortcut, index) => (
            <div key={index} className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">
                {shortcut.description}
              </span>
              <kbd className="px-2 py-1 text-xs font-mono bg-muted rounded border">
                {shortcut.keys}
              </kbd>
            </div>
          ))}
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            Press <kbd className="px-1 py-0.5 text-xs font-mono bg-muted rounded border">?</kbd> anytime to show this help.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
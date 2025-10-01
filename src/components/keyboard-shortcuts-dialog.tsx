"use client";

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { KeyboardShortcut, formatShortcut, groupShortcutsByCategory } from '@/hooks/use-keyboard-shortcuts';
import { Keyboard } from 'lucide-react';

interface KeyboardShortcutsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  shortcuts: KeyboardShortcut[];
}

export function KeyboardShortcutsDialog({
  isOpen,
  onOpenChange,
  shortcuts,
}: KeyboardShortcutsDialogProps) {
  const groupedShortcuts = groupShortcutsByCategory(shortcuts);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Keyboard className="h-5 w-5" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate and interact with SearnAI more efficiently.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {Object.entries(groupedShortcuts).map(([category, categoryShortcuts]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                {category}
              </h3>
              
              <div className="space-y-2">
                {categoryShortcuts.map((shortcut, index) => (
                  <div
                    key={`${category}-${index}`}
                    className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm">{shortcut.description}</span>
                    <Badge variant="outline" className="font-mono text-xs">
                      {formatShortcut(shortcut)}
                    </Badge>
                  </div>
                ))}
              </div>
              
              {Object.keys(groupedShortcuts).indexOf(category) < Object.keys(groupedShortcuts).length - 1 && (
                <Separator />
              )}
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 bg-muted/50 rounded-lg">
          <p className="text-xs text-muted-foreground">
            <strong>Tip:</strong> Keyboard shortcuts are disabled when typing in input fields. 
            Press <Badge variant="outline" className="mx-1 text-xs">Escape</Badge> to close this dialog.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage keyboard shortcuts dialog
export function useKeyboardShortcutsDialog(shortcuts: KeyboardShortcut[]) {
  const [isOpen, setIsOpen] = React.useState(false);

  const openDialog = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeDialog = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  // Add escape key handler
  React.useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        closeDialog();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, closeDialog]);

  const dialog = (
    <KeyboardShortcutsDialog
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      shortcuts={shortcuts}
    />
  );

  return {
    isOpen,
    openDialog,
    closeDialog,
    dialog,
  };
}
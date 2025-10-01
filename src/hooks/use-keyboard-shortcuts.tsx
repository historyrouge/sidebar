"use client";

import { useEffect, useCallback } from 'react';

export interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: () => void;
  description: string;
  category?: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[], enabled: boolean = true) {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!enabled) return;

    // Don't trigger shortcuts when typing in input fields
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey &&
        !!shortcut.metaKey === event.metaKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts, enabled]);

  useEffect(() => {
    if (enabled) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [handleKeyDown, enabled]);
}

// Common keyboard shortcuts
export const createCommonShortcuts = (actions: {
  newChat?: () => void;
  toggleSidebar?: () => void;
  focusInput?: () => void;
  toggleTheme?: () => void;
  openSettings?: () => void;
  openHelp?: () => void;
  copy?: () => void;
  paste?: () => void;
  undo?: () => void;
  redo?: () => void;
  search?: () => void;
  save?: () => void;
}): KeyboardShortcut[] => {
  const shortcuts: KeyboardShortcut[] = [];

  if (actions.newChat) {
    shortcuts.push({
      key: 'n',
      ctrlKey: true,
      action: actions.newChat,
      description: 'Start new chat',
      category: 'Chat',
    });
  }

  if (actions.toggleSidebar) {
    shortcuts.push({
      key: 'b',
      ctrlKey: true,
      action: actions.toggleSidebar,
      description: 'Toggle sidebar',
      category: 'Navigation',
    });
  }

  if (actions.focusInput) {
    shortcuts.push({
      key: '/',
      action: actions.focusInput,
      description: 'Focus chat input',
      category: 'Chat',
    });
  }

  if (actions.toggleTheme) {
    shortcuts.push({
      key: 'd',
      ctrlKey: true,
      action: actions.toggleTheme,
      description: 'Toggle dark mode',
      category: 'Appearance',
    });
  }

  if (actions.openSettings) {
    shortcuts.push({
      key: ',',
      ctrlKey: true,
      action: actions.openSettings,
      description: 'Open settings',
      category: 'Navigation',
    });
  }

  if (actions.openHelp) {
    shortcuts.push({
      key: '?',
      shiftKey: true,
      action: actions.openHelp,
      description: 'Show help',
      category: 'Help',
    });
  }

  if (actions.copy) {
    shortcuts.push({
      key: 'c',
      ctrlKey: true,
      action: actions.copy,
      description: 'Copy',
      category: 'Edit',
    });
  }

  if (actions.paste) {
    shortcuts.push({
      key: 'v',
      ctrlKey: true,
      action: actions.paste,
      description: 'Paste',
      category: 'Edit',
    });
  }

  if (actions.undo) {
    shortcuts.push({
      key: 'z',
      ctrlKey: true,
      action: actions.undo,
      description: 'Undo',
      category: 'Edit',
    });
  }

  if (actions.redo) {
    shortcuts.push({
      key: 'y',
      ctrlKey: true,
      action: actions.redo,
      description: 'Redo',
      category: 'Edit',
    });
  }

  if (actions.search) {
    shortcuts.push({
      key: 'k',
      ctrlKey: true,
      action: actions.search,
      description: 'Search',
      category: 'Navigation',
    });
  }

  if (actions.save) {
    shortcuts.push({
      key: 's',
      ctrlKey: true,
      action: actions.save,
      description: 'Save',
      category: 'File',
    });
  }

  return shortcuts;
};

// Format shortcut for display
export function formatShortcut(shortcut: KeyboardShortcut): string {
  const keys: string[] = [];
  
  if (shortcut.ctrlKey) keys.push('Ctrl');
  if (shortcut.metaKey) keys.push('Cmd');
  if (shortcut.altKey) keys.push('Alt');
  if (shortcut.shiftKey) keys.push('Shift');
  
  keys.push(shortcut.key.toUpperCase());
  
  return keys.join(' + ');
}

// Group shortcuts by category
export function groupShortcutsByCategory(shortcuts: KeyboardShortcut[]): Record<string, KeyboardShortcut[]> {
  return shortcuts.reduce((groups, shortcut) => {
    const category = shortcut.category || 'General';
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(shortcut);
    return groups;
  }, {} as Record<string, KeyboardShortcut[]>);
}
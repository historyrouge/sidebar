"use client";

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  metaKey?: boolean;
  shiftKey?: boolean;
  altKey?: boolean;
  action: () => void;
  description: string;
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcut[]) {
  const router = useRouter();

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const matchingShortcut = shortcuts.find(shortcut => {
      return (
        shortcut.key.toLowerCase() === event.key.toLowerCase() &&
        !!shortcut.ctrlKey === event.ctrlKey &&
        !!shortcut.metaKey === event.metaKey &&
        !!shortcut.shiftKey === event.shiftKey &&
        !!shortcut.altKey === event.altKey
      );
    });

    if (matchingShortcut) {
      event.preventDefault();
      matchingShortcut.action();
    }
  }, [shortcuts]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

// Common shortcuts for the app
export function useAppKeyboardShortcuts() {
  const router = useRouter();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: 'k',
      metaKey: true,
      action: () => {
        // Focus search or chat input
        const chatInput = document.querySelector('[data-chat-input]') as HTMLInputElement;
        if (chatInput) {
          chatInput.focus();
        }
      },
      description: 'Focus chat input'
    },
    {
      key: 'n',
      metaKey: true,
      action: () => {
        // New chat
        localStorage.removeItem('chatHistory');
        sessionStorage.removeItem('chatScrollPosition');
        window.location.reload();
      },
      description: 'Start new chat'
    },
    {
      key: '1',
      metaKey: true,
      action: () => router.push('/'),
      description: 'Go to home'
    },
    {
      key: '2',
      metaKey: true,
      action: () => router.push('/study-now'),
      description: 'Go to study session'
    },
    {
      key: '3',
      metaKey: true,
      action: () => router.push('/quiz'),
      description: 'Go to quiz'
    },
    {
      key: '4',
      metaKey: true,
      action: () => router.push('/create-flashcards'),
      description: 'Go to flashcards'
    },
    {
      key: ',',
      metaKey: true,
      action: () => router.push('/settings'),
      description: 'Open settings'
    },
    {
      key: '?',
      action: () => {
        // Show keyboard shortcuts help
        const helpDialog = document.querySelector('[data-help-dialog]') as HTMLElement;
        if (helpDialog) {
          helpDialog.click();
        }
      },
      description: 'Show keyboard shortcuts'
    }
  ];

  useKeyboardShortcuts(shortcuts);
}

// Hook to show keyboard shortcuts help
export function useKeyboardShortcutsHelp() {
  const shortcuts = [
    { keys: '⌘K', description: 'Focus chat input' },
    { keys: '⌘N', description: 'Start new chat' },
    { keys: '⌘1', description: 'Go to home' },
    { keys: '⌘2', description: 'Go to study session' },
    { keys: '⌘3', description: 'Go to quiz' },
    { keys: '⌘4', description: 'Go to flashcards' },
    { keys: '⌘,', description: 'Open settings' },
    { keys: '?', description: 'Show keyboard shortcuts' },
  ];

  return shortcuts;
}
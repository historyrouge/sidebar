"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import {
  Search,
  Hash,
  FileText,
  Settings,
  User,
  Home,
  BookOpen,
  Code,
  FileQuestion,
  Youtube,
  Rss,
  Volume2,
  Cpu,
  BrainCircuit,
  Layers,
  Presentation,
  Globe,
  GraduationCap,
  Brush,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface CommandItem {
  id: string;
  title: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  category: string;
  keywords: string[];
}

interface CommandPaletteProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ isOpen, onOpenChange }: CommandPaletteProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const router = useRouter();

  // Define all available commands
  const commands: CommandItem[] = useMemo(() => [
    // Navigation
    {
      id: 'home',
      title: 'Go to Home',
      description: 'Navigate to the main chat interface',
      icon: <Home className="h-4 w-4" />,
      action: () => router.push('/'),
      category: 'Navigation',
      keywords: ['home', 'chat', 'main'],
    },
    {
      id: 'settings',
      title: 'Open Settings',
      description: 'Configure your preferences',
      icon: <Settings className="h-4 w-4" />,
      action: () => router.push('/settings'),
      category: 'Navigation',
      keywords: ['settings', 'preferences', 'config'],
    },
    {
      id: 'about',
      title: 'About SearnAI',
      description: 'Learn more about the application',
      icon: <User className="h-4 w-4" />,
      action: () => router.push('/about'),
      category: 'Navigation',
      keywords: ['about', 'info', 'help'],
    },

    // Study Tools
    {
      id: 'study-session',
      title: 'Start Study Session',
      description: 'Begin a focused study session',
      icon: <GraduationCap className="h-4 w-4" />,
      action: () => router.push('/study-now'),
      category: 'Study Tools',
      keywords: ['study', 'session', 'focus', 'learn'],
    },
    {
      id: 'ai-editor',
      title: 'AI Editor',
      description: 'Use AI-powered text editing tools',
      icon: <Brush className="h-4 w-4" />,
      action: () => router.push('/ai-editor'),
      category: 'Study Tools',
      keywords: ['editor', 'ai', 'text', 'writing'],
    },
    {
      id: 'code-analyzer',
      title: 'Code Analyzer',
      description: 'Analyze and understand code',
      icon: <Code className="h-4 w-4" />,
      action: () => router.push('/code-analyzer'),
      category: 'Study Tools',
      keywords: ['code', 'analyze', 'programming', 'debug'],
    },
    {
      id: 'flashcards',
      title: 'Create Flashcards',
      description: 'Generate flashcards for studying',
      icon: <Layers className="h-4 w-4" />,
      action: () => router.push('/create-flashcards'),
      category: 'Study Tools',
      keywords: ['flashcards', 'memory', 'study', 'cards'],
    },
    {
      id: 'quiz',
      title: 'Take Quiz',
      description: 'Test your knowledge with quizzes',
      icon: <FileQuestion className="h-4 w-4" />,
      action: () => router.push('/quiz'),
      category: 'Study Tools',
      keywords: ['quiz', 'test', 'assessment', 'knowledge'],
    },
    {
      id: 'mind-map',
      title: 'Mind Map',
      description: 'Create visual mind maps',
      icon: <BrainCircuit className="h-4 w-4" />,
      action: () => router.push('/mind-map'),
      category: 'Study Tools',
      keywords: ['mind map', 'visual', 'diagram', 'brainstorm'],
    },
    {
      id: 'question-paper',
      title: 'Question Paper',
      description: 'Generate question papers',
      icon: <FileText className="h-4 w-4" />,
      action: () => router.push('/question-paper'),
      category: 'Study Tools',
      keywords: ['question', 'paper', 'exam', 'test'],
    },
    {
      id: 'presentation',
      title: 'Presentation Maker',
      description: 'Create presentations',
      icon: <Presentation className="h-4 w-4" />,
      action: () => router.push('/presentation-maker'),
      category: 'Study Tools',
      keywords: ['presentation', 'slides', 'powerpoint'],
    },

    // Resources
    {
      id: 'web-browser',
      title: 'Web Browser',
      description: 'Browse the web within the app',
      icon: <Globe className="h-4 w-4" />,
      action: () => router.push('/web-browser'),
      category: 'Resources',
      keywords: ['web', 'browser', 'internet', 'search'],
    },
    {
      id: 'youtube-tools',
      title: 'YouTube Tools',
      description: 'Extract content from YouTube videos',
      icon: <Youtube className="h-4 w-4" />,
      action: () => router.push('/youtube-extractor'),
      category: 'Resources',
      keywords: ['youtube', 'video', 'extract', 'transcript'],
    },
    {
      id: 'news',
      title: 'News',
      description: 'Stay updated with latest news',
      icon: <Rss className="h-4 w-4" />,
      action: () => router.push('/news'),
      category: 'Resources',
      keywords: ['news', 'updates', 'current', 'events'],
    },
    {
      id: 'ebooks',
      title: 'eBooks',
      description: 'Access digital books and resources',
      icon: <BookOpen className="h-4 w-4" />,
      action: () => router.push('/ebooks'),
      category: 'Resources',
      keywords: ['ebooks', 'books', 'reading', 'library'],
    },
    {
      id: 'text-to-speech',
      title: 'Text-to-Speech',
      description: 'Convert text to audio',
      icon: <Volume2 className="h-4 w-4" />,
      action: () => router.push('/text-to-speech'),
      category: 'Resources',
      keywords: ['tts', 'speech', 'audio', 'voice'],
    },
    {
      id: 'ai-training',
      title: 'AI Training',
      description: 'Train and customize AI models',
      icon: <Cpu className="h-4 w-4" />,
      action: () => router.push('/ai-training'),
      category: 'Resources',
      keywords: ['ai', 'training', 'model', 'machine learning'],
    },

    // Actions
    {
      id: 'new-chat',
      title: 'New Chat',
      description: 'Start a new conversation',
      icon: <Hash className="h-4 w-4" />,
      action: () => {
        localStorage.removeItem('chatHistory');
        sessionStorage.removeItem('chatScrollPosition');
        window.location.reload();
      },
      category: 'Actions',
      keywords: ['new', 'chat', 'conversation', 'fresh'],
    },
  ], [router]);

  // Filter commands based on search
  const filteredCommands = useMemo(() => {
    if (!search.trim()) return commands;

    const searchLower = search.toLowerCase();
    return commands.filter(command => 
      command.title.toLowerCase().includes(searchLower) ||
      command.description?.toLowerCase().includes(searchLower) ||
      command.keywords.some(keyword => keyword.toLowerCase().includes(searchLower)) ||
      command.category.toLowerCase().includes(searchLower)
    );
  }, [commands, search]);

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, CommandItem[]> = {};
    filteredCommands.forEach(command => {
      if (!groups[command.category]) {
        groups[command.category] = [];
      }
      groups[command.category].push(command);
    });
    return groups;
  }, [filteredCommands]);

  // Reset selection when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev < filteredCommands.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => 
            prev > 0 ? prev - 1 : filteredCommands.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          if (filteredCommands[selectedIndex]) {
            filteredCommands[selectedIndex].action();
            onOpenChange(false);
          }
          break;
        case 'Escape':
          onOpenChange(false);
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onOpenChange]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden">
        <div className="flex items-center border-b px-4 py-3">
          <Search className="h-4 w-4 mr-2 text-muted-foreground" />
          <Input
            placeholder="Search commands..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border-0 shadow-none focus-visible:ring-0 text-base"
            autoFocus
          />
          <Badge variant="outline" className="ml-2 text-xs">
            {filteredCommands.length}
          </Badge>
        </div>

        <ScrollArea className="max-h-96">
          {Object.keys(groupedCommands).length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No commands found</p>
              <p className="text-sm">Try a different search term</p>
            </div>
          ) : (
            <div className="p-2">
              {Object.entries(groupedCommands).map(([category, categoryCommands]) => (
                <div key={category} className="mb-4 last:mb-0">
                  <div className="px-2 py-1 text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    {category}
                  </div>
                  {categoryCommands.map((command, index) => {
                    const globalIndex = filteredCommands.indexOf(command);
                    return (
                      <button
                        key={command.id}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors",
                          "hover:bg-muted/50 focus:bg-muted/50 focus:outline-none",
                          globalIndex === selectedIndex && "bg-muted"
                        )}
                        onClick={() => {
                          command.action();
                          onOpenChange(false);
                        }}
                      >
                        <div className="flex-shrink-0">
                          {command.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm">
                            {command.title}
                          </div>
                          {command.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {command.description}
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="border-t px-4 py-2 text-xs text-muted-foreground">
          Use <Badge variant="outline" className="mx-1">↑↓</Badge> to navigate,
          <Badge variant="outline" className="mx-1">Enter</Badge> to select,
          <Badge variant="outline" className="mx-1">Esc</Badge> to close
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Hook to manage command palette
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);

  const openPalette = React.useCallback(() => {
    setIsOpen(true);
  }, []);

  const closePalette = React.useCallback(() => {
    setIsOpen(false);
  }, []);

  // Add Ctrl+K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        setIsOpen(prev => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const palette = (
    <CommandPalette
      isOpen={isOpen}
      onOpenChange={setIsOpen}
    />
  );

  return {
    isOpen,
    openPalette,
    closePalette,
    palette,
  };
}
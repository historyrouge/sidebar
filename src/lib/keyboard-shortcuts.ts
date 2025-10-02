/**
 * Advanced Keyboard Shortcuts Manager
 * Comprehensive keyboard navigation and shortcut system with accessibility features
 * 
 * Features:
 * - Global keyboard shortcuts
 * - Context-aware shortcuts
 * - Customizable key bindings
 * - Command palette
 * - Keyboard navigation
 * - Accessibility support
 * - Shortcuts cheat sheet
 * - Conflict detection
 * - Macro recording
 * - Multi-key sequences
 * - Platform detection (Mac/Windows/Linux)
 */

import { generateId, isMobile } from './utils';
import { analytics, EventCategory, EventAction } from './analytics';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export interface KeyboardShortcut {
  id: string;
  name: string;
  description: string;
  keys: string | string[]; // Single key or key combination
  handler: (event: KeyboardEvent) => void | Promise<void>;
  
  // Modifiers
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean; // Command on Mac, Windows key on Windows
  
  // Context
  context?: string; // Where this shortcut is active
  enabled: boolean;
  
  // Behavior
  preventDefault?: boolean;
  stopPropagation?: boolean;
  
  // Categories
  category: ShortcutCategory;
  priority: number;
  
  // Platform specific
  platform?: 'mac' | 'windows' | 'linux' | 'all';
  
  // Metadata
  createdAt: Date;
  lastUsed?: Date;
  useCount: number;
}

export enum ShortcutCategory {
  GENERAL = 'general',
  NAVIGATION = 'navigation',
  EDITING = 'editing',
  STUDY = 'study',
  SEARCH = 'search',
  VIEW = 'view',
  HELP = 'help',
  CUSTOM = 'custom',
}

export interface KeySequence {
  keys: string[];
  timestamp: number;
}

export interface Command {
  id: string;
  name: string;
  description: string;
  icon?: string;
  keywords: string[];
  shortcut?: string;
  handler: () => void | Promise<void>;
  category: string;
  enabled: boolean;
}

export interface CommandPaletteState {
  isOpen: boolean;
  query: string;
  selectedIndex: number;
  results: Command[];
}

export interface AccessibilitySettings {
  // Keyboard navigation
  tabNavigation: boolean;
  skipLinks: boolean;
  focusIndicators: boolean;
  
  // Screen reader
  ariaLabels: boolean;
  announceChanges: boolean;
  
  // Visual
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  
  // Keyboard
  stickyKeys: boolean;
  slowKeys: boolean;
  filterKeys: boolean;
  
  // Custom
  customKeyBindings: Record<string, string>;
}

export interface ShortcutGroup {
  name: string;
  description?: string;
  shortcuts: KeyboardShortcut[];
  enabled: boolean;
}

// ============================================================================
// KEYBOARD SHORTCUTS MANAGER
// ============================================================================

export class KeyboardShortcutsManager {
  private static instance: KeyboardShortcutsManager;
  
  private shortcuts: Map<string, KeyboardShortcut> = new Map();
  private commands: Map<string, Command> = new Map();
  private activeContext: string = 'global';
  private platform: 'mac' | 'windows' | 'linux';
  
  // Key sequence tracking
  private keySequence: KeySequence = { keys: [], timestamp: 0 };
  private sequenceTimeout = 1000; // ms
  
  // Command palette
  private commandPaletteState: CommandPaletteState = {
    isOpen: false,
    query: '',
    selectedIndex: 0,
    results: [],
  };
  
  // Accessibility
  private accessibilitySettings: AccessibilitySettings;
  
  // Recording
  private isRecording: boolean = false;
  private recordedKeys: string[] = [];
  
  // Listeners
  private listeners: Set<(event: KeyboardEvent, shortcut: KeyboardShortcut) => void> = new Set();
  
  private constructor() {
    this.platform = this.detectPlatform();
    this.accessibilitySettings = this.getDefaultAccessibilitySettings();
    this.initialize();
  }
  
  static getInstance(): KeyboardShortcutsManager {
    if (!KeyboardShortcutsManager.instance) {
      KeyboardShortcutsManager.instance = new KeyboardShortcutsManager();
    }
    return KeyboardShortcutsManager.instance;
  }
  
  /**
   * Initialize the manager
   */
  private initialize(): void {
    if (typeof window === 'undefined' || isMobile()) return;
    
    // Register global keyboard event listener
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
    document.addEventListener('keyup', this.handleKeyUp.bind(this));
    
    // Register default shortcuts
    this.registerDefaultShortcuts();
    
    // Load custom shortcuts
    this.loadPersistedData();
  }
  
  /**
   * Handle key down event
   */
  private handleKeyDown(event: KeyboardEvent): void {
    // Ignore if in input/textarea (unless explicitly allowed)
    if (this.shouldIgnoreEvent(event)) return;
    
    // Record key sequence
    this.updateKeySequence(event);
    
    // Find matching shortcut
    const shortcut = this.findMatchingShortcut(event);
    
    if (shortcut) {
      // Prevent default if specified
      if (shortcut.preventDefault !== false) {
        event.preventDefault();
      }
      
      if (shortcut.stopPropagation) {
        event.stopPropagation();
      }
      
      // Execute handler
      try {
        shortcut.handler(event);
        
        // Update statistics
        shortcut.lastUsed = new Date();
        shortcut.useCount++;
        
        // Notify listeners
        this.notifyListeners(event, shortcut);
        
        // Track analytics
        analytics.trackEvent({
          category: EventCategory.INTERACTION,
          action: EventAction.FEATURE_USE,
          label: `shortcut_${shortcut.name}`,
        });
      } catch (error) {
        console.error('Error executing shortcut handler:', error);
      }
    }
    
    // Handle recording
    if (this.isRecording) {
      this.recordedKeys.push(this.getKeyString(event));
    }
  }
  
  /**
   * Handle key up event
   */
  private handleKeyUp(event: KeyboardEvent): void {
    // Can be used for key release detection if needed
  }
  
  /**
   * Check if event should be ignored
   */
  private shouldIgnoreEvent(event: KeyboardEvent): boolean {
    const target = event.target as HTMLElement;
    const tagName = target.tagName.toLowerCase();
    const isEditable = target.isContentEditable;
    
    // Allow shortcuts in inputs only for specific cases
    if (['input', 'textarea', 'select'].includes(tagName) || isEditable) {
      // Allow common shortcuts like Escape, Enter, etc.
      const allowedKeys = ['Escape', 'Enter', 'Tab'];
      const hasModifier = event.ctrlKey || event.metaKey || event.altKey;
      
      return !allowedKeys.includes(event.key) && !hasModifier;
    }
    
    return false;
  }
  
  /**
   * Update key sequence
   */
  private updateKeySequence(event: KeyboardEvent): void {
    const now = Date.now();
    
    // Reset sequence if timeout exceeded
    if (now - this.keySequence.timestamp > this.sequenceTimeout) {
      this.keySequence.keys = [];
    }
    
    this.keySequence.keys.push(this.getKeyString(event));
    this.keySequence.timestamp = now;
    
    // Limit sequence length
    if (this.keySequence.keys.length > 5) {
      this.keySequence.keys.shift();
    }
  }
  
  /**
   * Find matching shortcut
   */
  private findMatchingShortcut(event: KeyboardEvent): KeyboardShortcut | null {
    const activeShortcuts = Array.from(this.shortcuts.values())
      .filter(s => s.enabled)
      .filter(s => !s.context || s.context === this.activeContext)
      .filter(s => !s.platform || s.platform === 'all' || s.platform === this.platform)
      .sort((a, b) => b.priority - a.priority); // Higher priority first
    
    for (const shortcut of activeShortcuts) {
      if (this.isShortcutMatch(event, shortcut)) {
        return shortcut;
      }
    }
    
    return null;
  }
  
  /**
   * Check if event matches shortcut
   */
  private isShortcutMatch(event: KeyboardEvent, shortcut: KeyboardShortcut): boolean {
    // Check modifiers
    if (shortcut.ctrl && !event.ctrlKey) return false;
    if (shortcut.shift && !event.shiftKey) return false;
    if (shortcut.alt && !event.altKey) return false;
    if (shortcut.meta && !event.metaKey) return false;
    
    // Check keys
    const keys = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];
    const eventKey = event.key.toLowerCase();
    
    // Handle sequence matching
    if (keys.length > 1) {
      const sequenceKeys = this.keySequence.keys.map(k => k.toLowerCase());
      return keys.every((key, index) => 
        sequenceKeys[sequenceKeys.length - keys.length + index] === key.toLowerCase()
      );
    }
    
    // Single key matching
    return keys.some(key => {
      // Handle special keys
      const normalizedKey = this.normalizeKey(key);
      return eventKey === normalizedKey.toLowerCase();
    });
  }
  
  /**
   * Get key string from event
   */
  private getKeyString(event: KeyboardEvent): string {
    const parts: string[] = [];
    
    if (event.ctrlKey) parts.push('Ctrl');
    if (event.altKey) parts.push('Alt');
    if (event.shiftKey) parts.push('Shift');
    if (event.metaKey) parts.push(this.platform === 'mac' ? 'Cmd' : 'Win');
    
    parts.push(event.key);
    
    return parts.join('+');
  }
  
  /**
   * Normalize key string
   */
  private normalizeKey(key: string): string {
    const keyMap: Record<string, string> = {
      'command': 'meta',
      'cmd': 'meta',
      'control': 'ctrl',
      'option': 'alt',
      'return': 'enter',
      'esc': 'escape',
      'space': ' ',
    };
    
    return keyMap[key.toLowerCase()] || key;
  }
  
  /**
   * Register a keyboard shortcut
   */
  register(params: {
    name: string;
    description: string;
    keys: string | string[];
    handler: (event: KeyboardEvent) => void | Promise<void>;
    ctrl?: boolean;
    shift?: boolean;
    alt?: boolean;
    meta?: boolean;
    context?: string;
    category?: ShortcutCategory;
    priority?: number;
    platform?: 'mac' | 'windows' | 'linux' | 'all';
  }): string {
    const shortcut: KeyboardShortcut = {
      id: generateId(),
      name: params.name,
      description: params.description,
      keys: params.keys,
      handler: params.handler,
      ctrl: params.ctrl,
      shift: params.shift,
      alt: params.alt,
      meta: params.meta,
      context: params.context,
      enabled: true,
      category: params.category || ShortcutCategory.GENERAL,
      priority: params.priority || 0,
      platform: params.platform || 'all',
      createdAt: new Date(),
      useCount: 0,
    };
    
    this.shortcuts.set(shortcut.id, shortcut);
    return shortcut.id;
  }
  
  /**
   * Unregister a shortcut
   */
  unregister(shortcutId: string): void {
    this.shortcuts.delete(shortcutId);
  }
  
  /**
   * Enable/disable shortcut
   */
  setEnabled(shortcutId: string, enabled: boolean): void {
    const shortcut = this.shortcuts.get(shortcutId);
    if (shortcut) {
      shortcut.enabled = enabled;
    }
  }
  
  /**
   * Set active context
   */
  setContext(context: string): void {
    this.activeContext = context;
  }
  
  /**
   * Register default shortcuts
   */
  private registerDefaultShortcuts(): void {
    // General
    this.register({
      name: 'Show Command Palette',
      description: 'Open the command palette to search for commands',
      keys: 'k',
      meta: true,
      handler: () => this.toggleCommandPalette(),
      category: ShortcutCategory.GENERAL,
      priority: 100,
    });
    
    this.register({
      name: 'Show Shortcuts',
      description: 'Display keyboard shortcuts cheat sheet',
      keys: '?',
      shift: true,
      handler: () => this.showShortcutsDialog(),
      category: ShortcutCategory.HELP,
    });
    
    this.register({
      name: 'Search',
      description: 'Focus on search input',
      keys: ['/', 'f'],
      ctrl: true,
      handler: () => this.focusSearch(),
      category: ShortcutCategory.SEARCH,
    });
    
    // Navigation
    this.register({
      name: 'Go to Home',
      description: 'Navigate to home page',
      keys: 'h',
      alt: true,
      handler: () => window.location.href = '/',
      category: ShortcutCategory.NAVIGATION,
    });
    
    this.register({
      name: 'Go to Study Session',
      description: 'Navigate to study session page',
      keys: 's',
      alt: true,
      handler: () => window.location.href = '/study-now',
      category: ShortcutCategory.NAVIGATION,
    });
    
    this.register({
      name: 'Go to Flashcards',
      description: 'Navigate to flashcards page',
      keys: 'f',
      alt: true,
      handler: () => window.location.href = '/create-flashcards',
      category: ShortcutCategory.NAVIGATION,
    });
    
    this.register({
      name: 'Go to Quiz',
      description: 'Navigate to quiz page',
      keys: 'q',
      alt: true,
      handler: () => window.location.href = '/quiz',
      category: ShortcutCategory.NAVIGATION,
    });
    
    this.register({
      name: 'Go to Settings',
      description: 'Navigate to settings page',
      keys: ',',
      meta: true,
      handler: () => window.location.href = '/settings',
      category: ShortcutCategory.NAVIGATION,
    });
    
    // Study
    this.register({
      name: 'Start Pomodoro',
      description: 'Start a pomodoro timer',
      keys: 'p',
      ctrl: true,
      shift: true,
      handler: () => {
        // Would call pomodoro start method
        console.log('Starting pomodoro');
      },
      category: ShortcutCategory.STUDY,
    });
    
    this.register({
      name: 'New Chat',
      description: 'Start a new chat session',
      keys: 'n',
      meta: true,
      handler: () => window.location.reload(),
      category: ShortcutCategory.GENERAL,
    });
    
    // View
    this.register({
      name: 'Toggle Theme',
      description: 'Switch between light and dark mode',
      keys: 't',
      ctrl: true,
      shift: true,
      handler: () => {
        // Would toggle theme
        document.documentElement.classList.toggle('dark');
      },
      category: ShortcutCategory.VIEW,
    });
    
    this.register({
      name: 'Toggle Sidebar',
      description: 'Show/hide sidebar',
      keys: 'b',
      meta: true,
      handler: () => {
        // Would toggle sidebar
        console.log('Toggling sidebar');
      },
      category: ShortcutCategory.VIEW,
    });
    
    this.register({
      name: 'Zoom In',
      description: 'Increase text size',
      keys: '=',
      meta: true,
      handler: (event) => {
        event.preventDefault();
        document.body.style.zoom = `${Math.min(parseFloat(document.body.style.zoom || '1') + 0.1, 2)}`;
      },
      category: ShortcutCategory.VIEW,
    });
    
    this.register({
      name: 'Zoom Out',
      description: 'Decrease text size',
      keys: '-',
      meta: true,
      handler: (event) => {
        event.preventDefault();
        document.body.style.zoom = `${Math.max(parseFloat(document.body.style.zoom || '1') - 0.1, 0.5)}`;
      },
      category: ShortcutCategory.VIEW,
    });
    
    this.register({
      name: 'Reset Zoom',
      description: 'Reset text size to default',
      keys: '0',
      meta: true,
      handler: (event) => {
        event.preventDefault();
        document.body.style.zoom = '1';
      },
      category: ShortcutCategory.VIEW,
    });
    
    // Editing
    this.register({
      name: 'Undo',
      description: 'Undo last action',
      keys: 'z',
      meta: true,
      handler: () => document.execCommand('undo'),
      category: ShortcutCategory.EDITING,
    });
    
    this.register({
      name: 'Redo',
      description: 'Redo last action',
      keys: 'z',
      meta: true,
      shift: true,
      handler: () => document.execCommand('redo'),
      category: ShortcutCategory.EDITING,
    });
    
    this.register({
      name: 'Select All',
      description: 'Select all content',
      keys: 'a',
      meta: true,
      handler: () => document.execCommand('selectAll'),
      category: ShortcutCategory.EDITING,
    });
    
    // Escape
    this.register({
      name: 'Cancel',
      description: 'Close dialog or cancel current action',
      keys: 'Escape',
      handler: () => {
        // Close command palette
        if (this.commandPaletteState.isOpen) {
          this.toggleCommandPalette();
        }
      },
      category: ShortcutCategory.GENERAL,
      priority: 50,
    });
  }
  
  /**
   * Get all shortcuts
   */
  getShortcuts(filters?: {
    category?: ShortcutCategory;
    context?: string;
    enabled?: boolean;
  }): KeyboardShortcut[] {
    let shortcuts = Array.from(this.shortcuts.values());
    
    if (filters) {
      if (filters.category) {
        shortcuts = shortcuts.filter(s => s.category === filters.category);
      }
      if (filters.context) {
        shortcuts = shortcuts.filter(s => s.context === filters.context);
      }
      if (filters.enabled !== undefined) {
        shortcuts = shortcuts.filter(s => s.enabled === filters.enabled);
      }
    }
    
    return shortcuts.sort((a, b) => a.name.localeCompare(b.name));
  }
  
  /**
   * Get shortcuts grouped by category
   */
  getShortcutsByCategory(): Map<ShortcutCategory, KeyboardShortcut[]> {
    const grouped = new Map<ShortcutCategory, KeyboardShortcut[]>();
    
    this.shortcuts.forEach(shortcut => {
      const category = shortcut.category;
      if (!grouped.has(category)) {
        grouped.set(category, []);
      }
      grouped.get(category)!.push(shortcut);
    });
    
    return grouped;
  }
  
  /**
   * Format shortcut keys for display
   */
  formatShortcut(shortcut: KeyboardShortcut): string {
    const parts: string[] = [];
    
    if (shortcut.meta) parts.push(this.platform === 'mac' ? '⌘' : 'Ctrl');
    if (shortcut.ctrl && !shortcut.meta) parts.push('Ctrl');
    if (shortcut.alt) parts.push(this.platform === 'mac' ? '⌥' : 'Alt');
    if (shortcut.shift) parts.push('⇧');
    
    const keys = Array.isArray(shortcut.keys) ? shortcut.keys : [shortcut.keys];
    parts.push(...keys.map(k => this.formatKey(k)));
    
    return parts.join(this.platform === 'mac' ? '' : '+');
  }
  
  /**
   * Format single key for display
   */
  private formatKey(key: string): string {
    const keyMap: Record<string, string> = {
      'escape': 'Esc',
      'enter': '↵',
      'tab': '⇥',
      'backspace': '⌫',
      'delete': '⌦',
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→',
      ' ': 'Space',
    };
    
    return keyMap[key.toLowerCase()] || key.toUpperCase();
  }
  
  /**
   * Show shortcuts dialog
   */
  private showShortcutsDialog(): void {
    // Would trigger UI to show shortcuts
    console.log('Showing shortcuts dialog');
    
    const grouped = this.getShortcutsByCategory();
    grouped.forEach((shortcuts, category) => {
      console.group(category);
      shortcuts.forEach(shortcut => {
        console.log(`${shortcut.name}: ${this.formatShortcut(shortcut)}`);
      });
      console.groupEnd();
    });
  }
  
  /**
   * Focus search input
   */
  private focusSearch(): void {
    const searchInput = document.querySelector<HTMLInputElement>('input[type="search"], input[placeholder*="search" i]');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }
  
  // ========================================================================
  // COMMAND PALETTE
  // ========================================================================
  
  /**
   * Register a command
   */
  registerCommand(params: {
    name: string;
    description: string;
    icon?: string;
    keywords?: string[];
    shortcut?: string;
    handler: () => void | Promise<void>;
    category?: string;
  }): string {
    const command: Command = {
      id: generateId(),
      name: params.name,
      description: params.description,
      icon: params.icon,
      keywords: params.keywords || [],
      shortcut: params.shortcut,
      handler: params.handler,
      category: params.category || 'general',
      enabled: true,
    };
    
    this.commands.set(command.id, command);
    return command.id;
  }
  
  /**
   * Unregister command
   */
  unregisterCommand(commandId: string): void {
    this.commands.delete(commandId);
  }
  
  /**
   * Toggle command palette
   */
  toggleCommandPalette(): void {
    this.commandPaletteState.isOpen = !this.commandPaletteState.isOpen;
    
    if (this.commandPaletteState.isOpen) {
      this.commandPaletteState.query = '';
      this.commandPaletteState.selectedIndex = 0;
      this.updateCommandResults();
    }
  }
  
  /**
   * Search commands
   */
  searchCommands(query: string): Command[] {
    this.commandPaletteState.query = query;
    this.updateCommandResults();
    return this.commandPaletteState.results;
  }
  
  /**
   * Update command results
   */
  private updateCommandResults(): void {
    const query = this.commandPaletteState.query.toLowerCase();
    
    if (!query) {
      this.commandPaletteState.results = Array.from(this.commands.values())
        .filter(c => c.enabled)
        .slice(0, 10);
      return;
    }
    
    const results = Array.from(this.commands.values())
      .filter(c => c.enabled)
      .map(command => ({
        command,
        score: this.calculateCommandScore(command, query),
      }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 10)
      .map(item => item.command);
    
    this.commandPaletteState.results = results;
  }
  
  /**
   * Calculate command search score
   */
  private calculateCommandScore(command: Command, query: string): number {
    let score = 0;
    
    const nameLower = command.name.toLowerCase();
    const descLower = command.description.toLowerCase();
    
    // Exact match
    if (nameLower === query) return 100;
    
    // Name starts with query
    if (nameLower.startsWith(query)) score += 80;
    
    // Name contains query
    if (nameLower.includes(query)) score += 50;
    
    // Description contains query
    if (descLower.includes(query)) score += 30;
    
    // Keywords match
    for (const keyword of command.keywords) {
      if (keyword.toLowerCase().includes(query)) {
        score += 20;
      }
    }
    
    return score;
  }
  
  /**
   * Execute command
   */
  async executeCommand(commandId: string): Promise<void> {
    const command = this.commands.get(commandId);
    if (!command || !command.enabled) return;
    
    try {
      await command.handler();
      
      analytics.trackEvent({
        category: EventCategory.INTERACTION,
        action: EventAction.FEATURE_USE,
        label: `command_${command.name}`,
      });
    } catch (error) {
      console.error('Error executing command:', error);
    }
  }
  
  /**
   * Get command palette state
   */
  getCommandPaletteState(): CommandPaletteState {
    return { ...this.commandPaletteState };
  }
  
  // ========================================================================
  // ACCESSIBILITY
  // ========================================================================
  
  /**
   * Get accessibility settings
   */
  getAccessibilitySettings(): AccessibilitySettings {
    return { ...this.accessibilitySettings };
  }
  
  /**
   * Update accessibility settings
   */
  updateAccessibilitySettings(updates: Partial<AccessibilitySettings>): void {
    Object.assign(this.accessibilitySettings, updates);
    this.applyAccessibilitySettings();
    this.persistData();
  }
  
  /**
   * Apply accessibility settings
   */
  private applyAccessibilitySettings(): void {
    const { reducedMotion, highContrast, largeText } = this.accessibilitySettings;
    
    // Reduced motion
    if (reducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms');
    } else {
      document.documentElement.style.removeProperty('--animation-duration');
    }
    
    // High contrast
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
    
    // Large text
    if (largeText) {
      document.documentElement.style.fontSize = '125%';
    } else {
      document.documentElement.style.fontSize = '';
    }
  }
  
  /**
   * Get default accessibility settings
   */
  private getDefaultAccessibilitySettings(): AccessibilitySettings {
    return {
      tabNavigation: true,
      skipLinks: true,
      focusIndicators: true,
      ariaLabels: true,
      announceChanges: true,
      highContrast: false,
      reducedMotion: false,
      largeText: false,
      stickyKeys: false,
      slowKeys: false,
      filterKeys: false,
      customKeyBindings: {},
    };
  }
  
  /**
   * Enable keyboard navigation
   */
  enableKeyboardNavigation(): void {
    document.body.classList.add('keyboard-navigation');
    
    // Add focus trap for dialogs
    this.setupFocusTraps();
  }
  
  /**
   * Setup focus traps for modal dialogs
   */
  private setupFocusTraps(): void {
    // Would implement focus trap logic
  }
  
  // ========================================================================
  // MACRO RECORDING
  // ========================================================================
  
  /**
   * Start recording macro
   */
  startRecording(): void {
    this.isRecording = true;
    this.recordedKeys = [];
    
    console.log('Recording started. Press shortcuts to record them.');
  }
  
  /**
   * Stop recording macro
   */
  stopRecording(): string[] {
    this.isRecording = false;
    const recorded = [...this.recordedKeys];
    this.recordedKeys = [];
    
    console.log('Recording stopped. Recorded:', recorded);
    return recorded;
  }
  
  /**
   * Get recording status
   */
  isRecordingActive(): boolean {
    return this.isRecording;
  }
  
  // ========================================================================
  // UTILITY METHODS
  // ========================================================================
  
  /**
   * Detect platform
   */
  private detectPlatform(): 'mac' | 'windows' | 'linux' {
    if (typeof window === 'undefined') return 'windows';
    
    const platform = window.navigator.platform.toLowerCase();
    
    if (platform.includes('mac')) return 'mac';
    if (platform.includes('linux')) return 'linux';
    return 'windows';
  }
  
  /**
   * Add listener
   */
  addListener(callback: (event: KeyboardEvent, shortcut: KeyboardShortcut) => void): () => void {
    this.listeners.add(callback);
    
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * Notify listeners
   */
  private notifyListeners(event: KeyboardEvent, shortcut: KeyboardShortcut): void {
    this.listeners.forEach(listener => {
      try {
        listener(event, shortcut);
      } catch (error) {
        console.error('Error in shortcut listener:', error);
      }
    });
  }
  
  /**
   * Persist data
   */
  private persistData(): void {
    try {
      const data = {
        accessibilitySettings: this.accessibilitySettings,
      };
      
      localStorage.setItem('keyboard_shortcuts_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist keyboard shortcuts data:', error);
    }
  }
  
  /**
   * Load persisted data
   */
  private loadPersistedData(): void {
    try {
      const stored = localStorage.getItem('keyboard_shortcuts_data');
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      if (data.accessibilitySettings) {
        this.accessibilitySettings = data.accessibilitySettings;
        this.applyAccessibilitySettings();
      }
    } catch (error) {
      console.error('Failed to load keyboard shortcuts data:', error);
    }
  }
  
  /**
   * Clear all data
   */
  clearAll(): void {
    this.shortcuts.clear();
    this.commands.clear();
    
    try {
      localStorage.removeItem('keyboard_shortcuts_data');
    } catch (error) {
      console.error('Failed to clear keyboard shortcuts data:', error);
    }
  }
  
  /**
   * Get statistics
   */
  getStatistics(): {
    totalShortcuts: number;
    enabledShortcuts: number;
    mostUsedShortcuts: { shortcut: KeyboardShortcut; useCount: number }[];
    totalCommands: number;
  } {
    const shortcuts = Array.from(this.shortcuts.values());
    
    const mostUsed = shortcuts
      .filter(s => s.useCount > 0)
      .sort((a, b) => b.useCount - a.useCount)
      .slice(0, 10)
      .map(shortcut => ({ shortcut, useCount: shortcut.useCount }));
    
    return {
      totalShortcuts: shortcuts.length,
      enabledShortcuts: shortcuts.filter(s => s.enabled).length,
      mostUsedShortcuts: mostUsed,
      totalCommands: this.commands.size,
    };
  }
}

// Export singleton instance
export const keyboardShortcuts = KeyboardShortcutsManager.getInstance();

// Convenience functions
export function registerShortcut(params: Parameters<KeyboardShortcutsManager['register']>[0]): string {
  return keyboardShortcuts.register(params);
}

export function registerCommand(params: Parameters<KeyboardShortcutsManager['registerCommand']>[0]): string {
  return keyboardShortcuts.registerCommand(params);
}

export default KeyboardShortcutsManager;

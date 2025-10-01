import { useEffect, useCallback, useState } from 'react';

export interface AccessibilitySettings {
  highContrast: boolean;
  largeText: boolean;
  reducedMotion: boolean;
  screenReaderOptimized: boolean;
  voiceNavigation: boolean;
  keyboardNavigation: boolean;
  focusIndicators: boolean;
  colorBlindSupport: 'none' | 'protanopia' | 'deuteranopia' | 'tritanopia';
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  lineHeight: 'normal' | 'relaxed' | 'loose';
  letterSpacing: 'normal' | 'wide' | 'wider';
}

export interface VoiceCommand {
  command: string;
  aliases: string[];
  action: () => void;
  description: string;
  category: string;
}

export class AccessibilityManager {
  private settings: AccessibilitySettings;
  private voiceRecognition: SpeechRecognition | null = null;
  private speechSynthesis: SpeechSynthesis;
  private isListening = false;
  private commands: VoiceCommand[] = [];
  private focusHistory: HTMLElement[] = [];
  private currentFocusIndex = -1;

  constructor() {
    this.settings = this.loadSettings();
    this.speechSynthesis = window.speechSynthesis;
    this.initializeVoiceRecognition();
    this.setupKeyboardNavigation();
    this.applySettings();
  }

  // Settings Management
  getSettings(): AccessibilitySettings {
    return { ...this.settings };
  }

  updateSettings(newSettings: Partial<AccessibilitySettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    this.saveSettings();
    this.applySettings();
  }

  private loadSettings(): AccessibilitySettings {
    const saved = localStorage.getItem('accessibility-settings');
    if (saved) {
      try {
        return { ...this.getDefaultSettings(), ...JSON.parse(saved) };
      } catch (error) {
        console.error('Failed to load accessibility settings:', error);
      }
    }
    return this.getDefaultSettings();
  }

  private saveSettings(): void {
    localStorage.setItem('accessibility-settings', JSON.stringify(this.settings));
  }

  private getDefaultSettings(): AccessibilitySettings {
    return {
      highContrast: false,
      largeText: false,
      reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
      screenReaderOptimized: false,
      voiceNavigation: false,
      keyboardNavigation: true,
      focusIndicators: true,
      colorBlindSupport: 'none',
      fontSize: 'medium',
      lineHeight: 'normal',
      letterSpacing: 'normal',
    };
  }

  private applySettings(): void {
    const root = document.documentElement;

    // High contrast
    root.classList.toggle('high-contrast', this.settings.highContrast);

    // Large text
    root.classList.toggle('large-text', this.settings.largeText);

    // Reduced motion
    root.classList.toggle('reduced-motion', this.settings.reducedMotion);

    // Screen reader optimization
    root.classList.toggle('screen-reader-optimized', this.settings.screenReaderOptimized);

    // Color blind support
    root.className = root.className.replace(/colorblind-\w+/g, '');
    if (this.settings.colorBlindSupport !== 'none') {
      root.classList.add(`colorblind-${this.settings.colorBlindSupport}`);
    }

    // Font size
    root.className = root.className.replace(/font-size-\w+/g, '');
    root.classList.add(`font-size-${this.settings.fontSize}`);

    // Line height
    root.className = root.className.replace(/line-height-\w+/g, '');
    root.classList.add(`line-height-${this.settings.lineHeight}`);

    // Letter spacing
    root.className = root.className.replace(/letter-spacing-\w+/g, '');
    root.classList.add(`letter-spacing-${this.settings.letterSpacing}`);

    // Focus indicators
    root.classList.toggle('enhanced-focus', this.settings.focusIndicators);

    // Update CSS custom properties
    this.updateCSSProperties();
  }

  private updateCSSProperties(): void {
    const root = document.documentElement;

    // Font size multipliers
    const fontSizeMultipliers = {
      small: 0.875,
      medium: 1,
      large: 1.125,
      'extra-large': 1.25,
    };

    root.style.setProperty(
      '--accessibility-font-scale',
      fontSizeMultipliers[this.settings.fontSize].toString()
    );

    // Line height values
    const lineHeightValues = {
      normal: '1.5',
      relaxed: '1.625',
      loose: '1.75',
    };

    root.style.setProperty(
      '--accessibility-line-height',
      lineHeightValues[this.settings.lineHeight]
    );

    // Letter spacing values
    const letterSpacingValues = {
      normal: '0',
      wide: '0.025em',
      wider: '0.05em',
    };

    root.style.setProperty(
      '--accessibility-letter-spacing',
      letterSpacingValues[this.settings.letterSpacing]
    );
  }

  // Voice Navigation
  private initializeVoiceRecognition(): void {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      this.voiceRecognition = new SpeechRecognition();
      
      this.voiceRecognition.continuous = true;
      this.voiceRecognition.interimResults = false;
      this.voiceRecognition.lang = 'en-US';

      this.voiceRecognition.onresult = (event) => {
        const lastResult = event.results[event.results.length - 1];
        if (lastResult.isFinal) {
          const command = lastResult[0].transcript.toLowerCase().trim();
          this.processVoiceCommand(command);
        }
      };

      this.voiceRecognition.onerror = (event) => {
        console.error('Voice recognition error:', event.error);
        this.isListening = false;
      };

      this.voiceRecognition.onend = () => {
        this.isListening = false;
        if (this.settings.voiceNavigation) {
          // Restart listening if voice navigation is enabled
          setTimeout(() => this.startListening(), 1000);
        }
      };
    }
  }

  startListening(): void {
    if (this.voiceRecognition && !this.isListening) {
      try {
        this.voiceRecognition.start();
        this.isListening = true;
        this.announce('Voice navigation activated');
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  }

  stopListening(): void {
    if (this.voiceRecognition && this.isListening) {
      this.voiceRecognition.stop();
      this.isListening = false;
      this.announce('Voice navigation deactivated');
    }
  }

  registerVoiceCommand(command: VoiceCommand): void {
    this.commands.push(command);
  }

  private processVoiceCommand(spokenText: string): void {
    const matchedCommand = this.commands.find(cmd => 
      cmd.command.toLowerCase() === spokenText ||
      cmd.aliases.some(alias => alias.toLowerCase() === spokenText)
    );

    if (matchedCommand) {
      this.announce(`Executing ${matchedCommand.description}`);
      matchedCommand.action();
    } else {
      // Try partial matching
      const partialMatch = this.commands.find(cmd =>
        spokenText.includes(cmd.command.toLowerCase()) ||
        cmd.aliases.some(alias => spokenText.includes(alias.toLowerCase()))
      );

      if (partialMatch) {
        this.announce(`Executing ${partialMatch.description}`);
        partialMatch.action();
      } else {
        this.announce('Command not recognized. Say "help" for available commands.');
      }
    }
  }

  // Screen Reader Support
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);

    // Also use speech synthesis if available
    if (this.settings.screenReaderOptimized && this.speechSynthesis) {
      this.speak(message);
    }
  }

  speak(text: string, options: SpeechSynthesisUtteranceOptions = {}): void {
    if (!this.speechSynthesis) return;

    // Cancel any ongoing speech
    this.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = options.rate || 1;
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
    utterance.lang = options.lang || 'en-US';

    this.speechSynthesis.speak(utterance);
  }

  // Keyboard Navigation
  private setupKeyboardNavigation(): void {
    document.addEventListener('keydown', this.handleKeyboardNavigation.bind(this));
    document.addEventListener('focusin', this.handleFocusChange.bind(this));
  }

  private handleKeyboardNavigation(event: KeyboardEvent): void {
    if (!this.settings.keyboardNavigation) return;

    // Skip navigation
    if (event.key === 'Tab' && event.shiftKey && event.ctrlKey) {
      event.preventDefault();
      this.skipToMainContent();
      return;
    }

    // Focus history navigation
    if (event.altKey) {
      if (event.key === 'ArrowLeft') {
        event.preventDefault();
        this.navigateFocusHistory(-1);
      } else if (event.key === 'ArrowRight') {
        event.preventDefault();
        this.navigateFocusHistory(1);
      }
    }

    // Landmark navigation
    if (event.ctrlKey && event.altKey) {
      switch (event.key) {
        case 'h':
          event.preventDefault();
          this.navigateToNextHeading();
          break;
        case 'l':
          event.preventDefault();
          this.navigateToNextLink();
          break;
        case 'b':
          event.preventDefault();
          this.navigateToNextButton();
          break;
        case 'f':
          event.preventDefault();
          this.navigateToNextForm();
          break;
        case 'm':
          event.preventDefault();
          this.navigateToMain();
          break;
      }
    }
  }

  private handleFocusChange(event: FocusEvent): void {
    const target = event.target as HTMLElement;
    if (target && target !== document.body) {
      this.addToFocusHistory(target);
      
      // Announce focused element for screen readers
      if (this.settings.screenReaderOptimized) {
        this.announceFocusedElement(target);
      }
    }
  }

  private addToFocusHistory(element: HTMLElement): void {
    // Remove element if it already exists in history
    this.focusHistory = this.focusHistory.filter(el => el !== element);
    
    // Add to end of history
    this.focusHistory.push(element);
    
    // Limit history size
    if (this.focusHistory.length > 50) {
      this.focusHistory.shift();
    }
    
    this.currentFocusIndex = this.focusHistory.length - 1;
  }

  private navigateFocusHistory(direction: number): void {
    const newIndex = this.currentFocusIndex + direction;
    
    if (newIndex >= 0 && newIndex < this.focusHistory.length) {
      const element = this.focusHistory[newIndex];
      if (element && document.contains(element)) {
        element.focus();
        this.currentFocusIndex = newIndex;
      }
    }
  }

  private skipToMainContent(): void {
    const main = document.querySelector('main, [role="main"], #main-content');
    if (main && main instanceof HTMLElement) {
      main.focus();
      this.announce('Skipped to main content');
    }
  }

  private navigateToNextHeading(): void {
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    const currentFocus = document.activeElement;
    const currentIndex = headings.indexOf(currentFocus as Element);
    const nextHeading = headings[currentIndex + 1] as HTMLElement;
    
    if (nextHeading) {
      nextHeading.focus();
      this.announce(`Heading level ${nextHeading.tagName.charAt(1)}: ${nextHeading.textContent}`);
    }
  }

  private navigateToNextLink(): void {
    const links = Array.from(document.querySelectorAll('a[href]'));
    const currentFocus = document.activeElement;
    const currentIndex = links.indexOf(currentFocus as Element);
    const nextLink = links[currentIndex + 1] as HTMLElement;
    
    if (nextLink) {
      nextLink.focus();
      this.announce(`Link: ${nextLink.textContent}`);
    }
  }

  private navigateToNextButton(): void {
    const buttons = Array.from(document.querySelectorAll('button, input[type="button"], input[type="submit"]'));
    const currentFocus = document.activeElement;
    const currentIndex = buttons.indexOf(currentFocus as Element);
    const nextButton = buttons[currentIndex + 1] as HTMLElement;
    
    if (nextButton) {
      nextButton.focus();
      this.announce(`Button: ${nextButton.textContent || nextButton.getAttribute('aria-label')}`);
    }
  }

  private navigateToNextForm(): void {
    const formElements = Array.from(document.querySelectorAll('input, select, textarea'));
    const currentFocus = document.activeElement;
    const currentIndex = formElements.indexOf(currentFocus as Element);
    const nextElement = formElements[currentIndex + 1] as HTMLElement;
    
    if (nextElement) {
      nextElement.focus();
      const label = this.getElementLabel(nextElement);
      this.announce(`Form field: ${label}`);
    }
  }

  private navigateToMain(): void {
    const main = document.querySelector('main, [role="main"]') as HTMLElement;
    if (main) {
      main.focus();
      this.announce('Main content');
    }
  }

  private announceFocusedElement(element: HTMLElement): void {
    const tagName = element.tagName.toLowerCase();
    const role = element.getAttribute('role');
    const label = this.getElementLabel(element);
    
    let announcement = '';
    
    if (role) {
      announcement = `${role}: ${label}`;
    } else {
      switch (tagName) {
        case 'button':
          announcement = `Button: ${label}`;
          break;
        case 'a':
          announcement = `Link: ${label}`;
          break;
        case 'input':
          const type = element.getAttribute('type') || 'text';
          announcement = `${type} input: ${label}`;
          break;
        case 'select':
          announcement = `Select: ${label}`;
          break;
        case 'textarea':
          announcement = `Text area: ${label}`;
          break;
        default:
          if (label) {
            announcement = label;
          }
      }
    }
    
    if (announcement) {
      this.announce(announcement);
    }
  }

  private getElementLabel(element: HTMLElement): string {
    // Try aria-label first
    const ariaLabel = element.getAttribute('aria-label');
    if (ariaLabel) return ariaLabel;
    
    // Try aria-labelledby
    const labelledBy = element.getAttribute('aria-labelledby');
    if (labelledBy) {
      const labelElement = document.getElementById(labelledBy);
      if (labelElement) return labelElement.textContent || '';
    }
    
    // Try associated label
    if (element.id) {
      const label = document.querySelector(`label[for="${element.id}"]`);
      if (label) return label.textContent || '';
    }
    
    // Try parent label
    const parentLabel = element.closest('label');
    if (parentLabel) return parentLabel.textContent || '';
    
    // Try placeholder
    const placeholder = element.getAttribute('placeholder');
    if (placeholder) return placeholder;
    
    // Try title
    const title = element.getAttribute('title');
    if (title) return title;
    
    // Try text content
    const textContent = element.textContent?.trim();
    if (textContent) return textContent;
    
    // Try alt text for images
    const alt = element.getAttribute('alt');
    if (alt) return alt;
    
    return 'Unlabeled element';
  }

  // Focus Management
  createFocusTrap(container: HTMLElement): () => void {
    const focusableElements = this.getFocusableElements(container);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    };

    container.addEventListener('keydown', handleKeyDown);
    firstElement?.focus();

    // Return cleanup function
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }

  private getFocusableElements(container: HTMLElement): HTMLElement[] {
    const selector = [
      'a[href]',
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');

    return Array.from(container.querySelectorAll(selector)) as HTMLElement[];
  }

  // Color Blind Support
  simulateColorBlindness(type: 'protanopia' | 'deuteranopia' | 'tritanopia'): void {
    this.updateSettings({ colorBlindSupport: type });
  }

  // High Contrast Mode
  toggleHighContrast(): void {
    this.updateSettings({ highContrast: !this.settings.highContrast });
  }

  // Text Scaling
  adjustFontSize(size: 'small' | 'medium' | 'large' | 'extra-large'): void {
    this.updateSettings({ fontSize: size });
  }

  // Motion Preferences
  toggleReducedMotion(): void {
    this.updateSettings({ reducedMotion: !this.settings.reducedMotion });
  }

  // Utility Methods
  isScreenReaderActive(): boolean {
    // Detect if screen reader is likely active
    return (
      this.settings.screenReaderOptimized ||
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.speechSynthesis?.speaking ||
      false
    );
  }

  getAccessibilityReport(): {
    issues: Array<{ element: Element; issue: string; severity: 'error' | 'warning' | 'info' }>;
    score: number;
  } {
    const issues: Array<{ element: Element; issue: string; severity: 'error' | 'warning' | 'info' }> = [];

    // Check for missing alt text
    document.querySelectorAll('img:not([alt])').forEach(img => {
      issues.push({
        element: img,
        issue: 'Image missing alt text',
        severity: 'error'
      });
    });

    // Check for missing form labels
    document.querySelectorAll('input:not([aria-label]):not([aria-labelledby])').forEach(input => {
      const id = input.getAttribute('id');
      if (!id || !document.querySelector(`label[for="${id}"]`)) {
        issues.push({
          element: input,
          issue: 'Form input missing label',
          severity: 'error'
        });
      }
    });

    // Check for missing headings structure
    const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
    let lastLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.charAt(1));
      if (level > lastLevel + 1) {
        issues.push({
          element: heading,
          issue: `Heading level skipped (h${lastLevel} to h${level})`,
          severity: 'warning'
        });
      }
      lastLevel = level;
    });

    // Check for low contrast (simplified)
    document.querySelectorAll('*').forEach(element => {
      const styles = window.getComputedStyle(element);
      const color = styles.color;
      const backgroundColor = styles.backgroundColor;
      
      // This is a simplified check - in production, use a proper contrast ratio calculator
      if (color === 'rgb(128, 128, 128)' && backgroundColor === 'rgb(255, 255, 255)') {
        issues.push({
          element: element,
          issue: 'Potentially low contrast text',
          severity: 'warning'
        });
      }
    });

    // Calculate score (simplified)
    const totalElements = document.querySelectorAll('*').length;
    const errorCount = issues.filter(i => i.severity === 'error').length;
    const warningCount = issues.filter(i => i.severity === 'warning').length;
    
    const score = Math.max(0, 100 - (errorCount * 10) - (warningCount * 5));

    return { issues, score };
  }
}

// React Hooks
export function useAccessibility() {
  const [manager] = useState(() => new AccessibilityManager());
  const [settings, setSettings] = useState(manager.getSettings());

  const updateSettings = useCallback((newSettings: Partial<AccessibilitySettings>) => {
    manager.updateSettings(newSettings);
    setSettings(manager.getSettings());
  }, [manager]);

  const announce = useCallback((message: string, priority?: 'polite' | 'assertive') => {
    manager.announce(message, priority);
  }, [manager]);

  const speak = useCallback((text: string, options?: SpeechSynthesisUtteranceOptions) => {
    manager.speak(text, options);
  }, [manager]);

  return {
    settings,
    updateSettings,
    announce,
    speak,
    manager,
  };
}

export function useFocusTrap(containerRef: React.RefObject<HTMLElement>, active: boolean = true) {
  useEffect(() => {
    if (!active || !containerRef.current) return;

    const manager = new AccessibilityManager();
    const cleanup = manager.createFocusTrap(containerRef.current);

    return cleanup;
  }, [containerRef, active]);
}

export function useVoiceCommands(commands: VoiceCommand[]) {
  const [manager] = useState(() => new AccessibilityManager());

  useEffect(() => {
    commands.forEach(command => {
      manager.registerVoiceCommand(command);
    });
  }, [manager, commands]);

  const startListening = useCallback(() => {
    manager.startListening();
  }, [manager]);

  const stopListening = useCallback(() => {
    manager.stopListening();
  }, [manager]);

  return {
    startListening,
    stopListening,
  };
}

// Global accessibility manager instance
let globalAccessibilityManager: AccessibilityManager | null = null;

export function getAccessibilityManager(): AccessibilityManager {
  if (!globalAccessibilityManager) {
    globalAccessibilityManager = new AccessibilityManager();
  }
  return globalAccessibilityManager;
}
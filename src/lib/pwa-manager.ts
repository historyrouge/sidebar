import { StorageManager, localStorage } from './storage';

export interface PWAInstallPrompt {
  prompt(): Promise<{ outcome: 'accepted' | 'dismissed' }>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAUpdateInfo {
  available: boolean;
  waiting: ServiceWorker | null;
  installing: ServiceWorker | null;
}

export interface OfflineCapability {
  isOnline: boolean;
  hasOfflineData: boolean;
  lastSync: number;
  pendingActions: number;
}

export interface PushNotificationOptions {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  tag?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
  data?: any;
}

export class PWAManager {
  private storage: StorageManager;
  private installPrompt: PWAInstallPrompt | null = null;
  private registration: ServiceWorkerRegistration | null = null;
  private isOnline = navigator.onLine;
  private syncQueue: Array<{ action: string; data: any; timestamp: number }> = [];

  constructor() {
    this.storage = localStorage;
    this.setupEventListeners();
    this.initializeServiceWorker();
    this.loadSyncQueue();
  }

  // Installation Management
  async checkInstallability(): Promise<{
    canInstall: boolean;
    isInstalled: boolean;
    platform: 'ios' | 'android' | 'desktop' | 'unknown';
  }> {
    const isInstalled = this.isAppInstalled();
    const platform = this.detectPlatform();
    
    // Check if install prompt is available
    const canInstall = !!this.installPrompt || this.canInstallOnIOS();

    return {
      canInstall,
      isInstalled,
      platform,
    };
  }

  async promptInstall(): Promise<boolean> {
    if (this.installPrompt) {
      try {
        const result = await this.installPrompt.prompt();
        const choice = await this.installPrompt.userChoice;
        this.installPrompt = null;
        
        return choice.outcome === 'accepted';
      } catch (error) {
        console.error('Install prompt failed:', error);
        return false;
      }
    }
    
    // For iOS, show custom install instructions
    if (this.canInstallOnIOS()) {
      this.showIOSInstallInstructions();
      return false;
    }
    
    return false;
  }

  private isAppInstalled(): boolean {
    // Check if running in standalone mode
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone === true ||
           document.referrer.includes('android-app://');
  }

  private detectPlatform(): 'ios' | 'android' | 'desktop' | 'unknown' {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (/iphone|ipad|ipod/.test(userAgent)) return 'ios';
    if (/android/.test(userAgent)) return 'android';
    if (/windows|macintosh|linux/.test(userAgent)) return 'desktop';
    
    return 'unknown';
  }

  private canInstallOnIOS(): boolean {
    const isIOS = /iphone|ipad|ipod/.test(navigator.userAgent.toLowerCase());
    const isInStandaloneMode = (window.navigator as any).standalone;
    const isInSafari = /safari/.test(navigator.userAgent.toLowerCase()) && 
                      !/chrome|crios|fxios/.test(navigator.userAgent.toLowerCase());
    
    return isIOS && !isInStandaloneMode && isInSafari;
  }

  private showIOSInstallInstructions(): void {
    // This would typically show a modal with iOS installation instructions
    const event = new CustomEvent('pwa-ios-install-prompt', {
      detail: {
        instructions: [
          'Tap the Share button at the bottom of the screen',
          'Scroll down and tap "Add to Home Screen"',
          'Tap "Add" to install SearnAI',
        ]
      }
    });
    window.dispatchEvent(event);
  }

  // Service Worker Management
  private async initializeServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register('/sw.js', {
          scope: '/',
          updateViaCache: 'none',
        });

        // Handle updates
        this.registration.addEventListener('updatefound', () => {
          this.handleServiceWorkerUpdate();
        });

        // Check for updates periodically
        setInterval(() => {
          this.registration?.update();
        }, 60000); // Check every minute

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  private handleServiceWorkerUpdate(): void {
    if (!this.registration?.installing) return;

    const installingWorker = this.registration.installing;
    
    installingWorker.addEventListener('statechange', () => {
      if (installingWorker.state === 'installed') {
        if (navigator.serviceWorker.controller) {
          // New update available
          this.notifyUpdateAvailable();
        }
      }
    });
  }

  private notifyUpdateAvailable(): void {
    const event = new CustomEvent('pwa-update-available', {
      detail: {
        registration: this.registration,
      }
    });
    window.dispatchEvent(event);
  }

  async applyUpdate(): Promise<void> {
    if (this.registration?.waiting) {
      this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      
      // Listen for controlling change
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
      });
    }
  }

  // Offline Capabilities
  getOfflineCapability(): OfflineCapability {
    return {
      isOnline: this.isOnline,
      hasOfflineData: this.hasOfflineData(),
      lastSync: this.getLastSyncTime(),
      pendingActions: this.syncQueue.length,
    };
  }

  private hasOfflineData(): boolean {
    // Check if we have cached data for offline use
    return this.storage.keys().then(keys => 
      keys.some(key => key.startsWith('offline_'))
    ).then(result => result).catch(() => false) as any;
  }

  private getLastSyncTime(): number {
    const lastSync = localStorage.getItem('last_sync_time');
    return lastSync ? parseInt(lastSync) : 0;
  }

  async cacheForOffline(key: string, data: any): Promise<void> {
    await this.storage.set(`offline_${key}`, {
      data,
      timestamp: Date.now(),
    });
  }

  async getOfflineData<T>(key: string): Promise<T | null> {
    const cached = await this.storage.get<{ data: T; timestamp: number }>(`offline_${key}`);
    return cached?.data || null;
  }

  // Background Sync
  async addToSyncQueue(action: string, data: any): Promise<void> {
    const syncItem = {
      action,
      data,
      timestamp: Date.now(),
    };

    this.syncQueue.push(syncItem);
    await this.saveSyncQueue();

    // Try to sync immediately if online
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  private async loadSyncQueue(): Promise<void> {
    const queue = await this.storage.get<typeof this.syncQueue>('sync_queue');
    if (queue) {
      this.syncQueue = queue;
    }
  }

  private async saveSyncQueue(): Promise<void> {
    await this.storage.set('sync_queue', this.syncQueue);
  }

  private async processSyncQueue(): Promise<void> {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const itemsToProcess = [...this.syncQueue];
    this.syncQueue = [];

    for (const item of itemsToProcess) {
      try {
        await this.processSyncItem(item);
      } catch (error) {
        console.error('Sync item failed:', error);
        // Re-add failed items to queue
        this.syncQueue.push(item);
      }
    }

    await this.saveSyncQueue();
    
    if (this.syncQueue.length === 0) {
      localStorage.setItem('last_sync_time', Date.now().toString());
    }
  }

  private async processSyncItem(item: { action: string; data: any; timestamp: number }): Promise<void> {
    switch (item.action) {
      case 'send_message':
        await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        break;
      
      case 'save_preferences':
        await fetch('/api/user/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item.data),
        });
        break;
      
      case 'track_event':
        await fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ events: [item.data] }),
        });
        break;
      
      default:
        console.warn('Unknown sync action:', item.action);
    }
  }

  // Push Notifications
  async requestNotificationPermission(): Promise<NotificationPermission> {
    if (!('Notification' in window)) {
      return 'denied';
    }

    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }

    return Notification.permission;
  }

  async subscribeToPushNotifications(): Promise<PushSubscription | null> {
    if (!this.registration) {
      console.error('Service Worker not registered');
      return null;
    }

    try {
      const subscription = await this.registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: this.urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || ''
        ),
      });

      // Send subscription to server
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription),
      });

      return subscription;
    } catch (error) {
      console.error('Push subscription failed:', error);
      return null;
    }
  }

  async showNotification(options: PushNotificationOptions): Promise<void> {
    if (!this.registration) {
      // Fallback to browser notification
      if (Notification.permission === 'granted') {
        new Notification(options.title, {
          body: options.body,
          icon: options.icon,
          badge: options.badge,
          image: options.image,
          tag: options.tag,
          requireInteraction: options.requireInteraction,
          data: options.data,
        });
      }
      return;
    }

    await this.registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/badge-72x72.png',
      image: options.image,
      tag: options.tag,
      requireInteraction: options.requireInteraction,
      actions: options.actions,
      data: options.data,
    });
  }

  // File Handling
  async handleSharedFiles(files: FileList): Promise<void> {
    const event = new CustomEvent('pwa-files-shared', {
      detail: { files: Array.from(files) }
    });
    window.dispatchEvent(event);
  }

  // App Shortcuts
  async updateDynamicShortcuts(shortcuts: Array<{
    name: string;
    shortName: string;
    description: string;
    url: string;
    iconUrl: string;
  }>): Promise<void> {
    if ('shortcuts' in navigator) {
      try {
        await (navigator as any).shortcuts.update(shortcuts);
      } catch (error) {
        console.error('Failed to update shortcuts:', error);
      }
    }
  }

  // Native Features
  async shareContent(data: {
    title?: string;
    text?: string;
    url?: string;
    files?: File[];
  }): Promise<boolean> {
    if ('share' in navigator) {
      try {
        await navigator.share(data);
        return true;
      } catch (error) {
        if ((error as Error).name !== 'AbortError') {
          console.error('Share failed:', error);
        }
        return false;
      }
    }

    // Fallback: copy to clipboard
    if (data.url || data.text) {
      try {
        await navigator.clipboard.writeText(data.url || data.text || '');
        return true;
      } catch (error) {
        console.error('Clipboard write failed:', error);
        return false;
      }
    }

    return false;
  }

  async requestPersistentStorage(): Promise<boolean> {
    if ('storage' in navigator && 'persist' in navigator.storage) {
      try {
        const granted = await navigator.storage.persist();
        return granted;
      } catch (error) {
        console.error('Persistent storage request failed:', error);
        return false;
      }
    }
    return false;
  }

  // Event Listeners
  private setupEventListeners(): void {
    // Install prompt
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      this.installPrompt = event as any;
      
      const customEvent = new CustomEvent('pwa-install-available');
      window.dispatchEvent(customEvent);
    });

    // App installed
    window.addEventListener('appinstalled', () => {
      this.installPrompt = null;
      const event = new CustomEvent('pwa-installed');
      window.dispatchEvent(event);
    });

    // Online/offline status
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
      
      const event = new CustomEvent('pwa-online');
      window.dispatchEvent(event);
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      
      const event = new CustomEvent('pwa-offline');
      window.dispatchEvent(event);
    });

    // Service Worker messages
    navigator.serviceWorker?.addEventListener('message', (event) => {
      const { type, payload } = event.data;
      
      switch (type) {
        case 'CACHE_UPDATED':
          const cacheEvent = new CustomEvent('pwa-cache-updated', {
            detail: payload
          });
          window.dispatchEvent(cacheEvent);
          break;
          
        case 'BACKGROUND_SYNC':
          this.processSyncQueue();
          break;
      }
    });
  }

  // Utility Methods
  private urlBase64ToUint8Array(base64String: string): Uint8Array {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
}

// React Hook
export function usePWA() {
  const [manager] = React.useState(() => new PWAManager());
  const [installable, setInstallable] = React.useState(false);
  const [installed, setInstalled] = React.useState(false);
  const [updateAvailable, setUpdateAvailable] = React.useState(false);
  const [offline, setOffline] = React.useState(!navigator.onLine);

  React.useEffect(() => {
    const checkInstallability = async () => {
      const info = await manager.checkInstallability();
      setInstallable(info.canInstall);
      setInstalled(info.isInstalled);
    };

    checkInstallability();

    const handleInstallAvailable = () => setInstallable(true);
    const handleInstalled = () => {
      setInstalled(true);
      setInstallable(false);
    };
    const handleUpdateAvailable = () => setUpdateAvailable(true);
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);

    window.addEventListener('pwa-install-available', handleInstallAvailable);
    window.addEventListener('pwa-installed', handleInstalled);
    window.addEventListener('pwa-update-available', handleUpdateAvailable);
    window.addEventListener('pwa-online', handleOnline);
    window.addEventListener('pwa-offline', handleOffline);

    return () => {
      window.removeEventListener('pwa-install-available', handleInstallAvailable);
      window.removeEventListener('pwa-installed', handleInstalled);
      window.removeEventListener('pwa-update-available', handleUpdateAvailable);
      window.removeEventListener('pwa-online', handleOnline);
      window.removeEventListener('pwa-offline', handleOffline);
    };
  }, [manager]);

  const install = React.useCallback(async () => {
    const success = await manager.promptInstall();
    return success;
  }, [manager]);

  const update = React.useCallback(async () => {
    await manager.applyUpdate();
    setUpdateAvailable(false);
  }, [manager]);

  const share = React.useCallback(async (data: Parameters<PWAManager['shareContent']>[0]) => {
    return await manager.shareContent(data);
  }, [manager]);

  return {
    manager,
    installable,
    installed,
    updateAvailable,
    offline,
    install,
    update,
    share,
  };
}

// Global PWA manager instance
let globalPWAManager: PWAManager | null = null;

export function getPWAManager(): PWAManager {
  if (!globalPWAManager) {
    globalPWAManager = new PWAManager();
  }
  return globalPWAManager;
}

// React import for hooks
import React from 'react';
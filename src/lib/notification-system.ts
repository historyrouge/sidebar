/**
 * Advanced Notification System
 * Comprehensive notification management with multiple channels and smart delivery
 * 
 * Features:
 * - Toast notifications
 * - Push notifications
 * - Email notifications
 * - In-app notifications
 * - Notification center
 * - Smart scheduling
 * - Notification grouping
 * - Action buttons
 * - Rich media support
 * - Priority levels
 * - Do Not Disturb mode
 * - Notification preferences
 * - Analytics tracking
 */

import { generateId, formatRelativeTime } from './utils';
import { trackEvent, EventCategory, EventAction } from './analytics';

// ============================================================================
// TYPES AND INTERFACES
// ============================================================================

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  REMINDER = 'reminder',
  ACHIEVEMENT = 'achievement',
  SOCIAL = 'social',
  SYSTEM = 'system',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationChannel {
  TOAST = 'toast',
  PUSH = 'push',
  EMAIL = 'email',
  IN_APP = 'in_app',
  SMS = 'sms',
}

export interface Notification {
  id: string;
  type: NotificationType;
  priority: NotificationPriority;
  
  // Content
  title: string;
  message: string;
  icon?: string;
  image?: string;
  
  // Metadata
  createdAt: Date;
  expiresAt?: Date;
  read: boolean;
  dismissed: boolean;
  
  // Actions
  actions?: NotificationAction[];
  primaryAction?: string;
  
  // Grouping
  group?: string;
  tag?: string;
  
  // Delivery
  channels: NotificationChannel[];
  deliveredChannels: NotificationChannel[];
  
  // Tracking
  clicked: boolean;
  clickedAt?: Date;
  
  // User context
  userId?: string;
  
  // Custom data
  data?: Record<string, any>;
}

export interface NotificationAction {
  id: string;
  label: string;
  action: () => void | Promise<void>;
  type?: 'primary' | 'secondary' | 'danger';
  icon?: string;
}

export interface NotificationPreferences {
  userId: string;
  
  // Global settings
  enabled: boolean;
  doNotDisturb: boolean;
  quietHours?: {
    start: number; // Hour (0-23)
    end: number;   // Hour (0-23)
  };
  
  // Channel preferences
  channels: {
    toast: boolean;
    push: boolean;
    email: boolean;
    inApp: boolean;
    sms: boolean;
  };
  
  // Type preferences
  types: {
    info: boolean;
    success: boolean;
    warning: boolean;
    error: boolean;
    reminder: boolean;
    achievement: boolean;
    social: boolean;
    system: boolean;
  };
  
  // Frequency
  maxPerHour: number;
  maxPerDay: number;
  
  // Grouping
  groupSimilar: boolean;
  
  // Sounds
  soundEnabled: boolean;
  vibrationEnabled: boolean;
}

export interface NotificationGroup {
  id: string;
  tag: string;
  notifications: Notification[];
  summary: string;
  count: number;
  latestTimestamp: Date;
  expanded: boolean;
}

export interface NotificationSchedule {
  id: string;
  notification: Omit<Notification, 'id' | 'createdAt'>;
  scheduledFor: Date;
  recurring?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    days?: number[]; // For weekly: 0=Sunday, 1=Monday, etc.
    time?: { hour: number; minute: number };
  };
  sent: boolean;
}

// ============================================================================
// NOTIFICATION SERVICE
// ============================================================================

export class NotificationService {
  private static instance: NotificationService;
  
  private notifications: Map<string, Notification> = new Map();
  private groups: Map<string, NotificationGroup> = new Map();
  private schedules: Map<string, NotificationSchedule> = new Map();
  private preferences: Map<string, NotificationPreferences> = new Map();
  
  private listeners: Set<(notification: Notification) => void> = new Set();
  private maxNotifications = 100;
  
  private constructor() {
    this.initializeService();
  }
  
  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }
  
  /**
   * Initialize service
   */
  private initializeService(): void {
    // Request push notification permission
    this.requestPermission();
    
    // Start schedule checker
    this.startScheduleChecker();
    
    // Load persisted notifications
    this.loadPersistedData();
  }
  
  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return false;
    }
    
    if (Notification.permission === 'granted') {
      return true;
    }
    
    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    
    return false;
  }
  
  /**
   * Show notification
   */
  async show(params: {
    title: string;
    message: string;
    type?: NotificationType;
    priority?: NotificationPriority;
    channels?: NotificationChannel[];
    actions?: NotificationAction[];
    icon?: string;
    image?: string;
    duration?: number;
    group?: string;
    tag?: string;
    data?: Record<string, any>;
  }): Promise<Notification> {
    const notification: Notification = {
      id: generateId(),
      type: params.type || NotificationType.INFO,
      priority: params.priority || NotificationPriority.NORMAL,
      title: params.title,
      message: params.message,
      icon: params.icon,
      image: params.image,
      createdAt: new Date(),
      read: false,
      dismissed: false,
      actions: params.actions,
      group: params.group,
      tag: params.tag,
      channels: params.channels || [NotificationChannel.TOAST, NotificationChannel.IN_APP],
      deliveredChannels: [],
      clicked: false,
      data: params.data,
    };
    
    // Check preferences
    const userId = this.getCurrentUserId();
    if (userId) {
      const prefs = this.getPreferences(userId);
      if (!this.shouldShowNotification(notification, prefs)) {
        return notification;
      }
    }
    
    // Store notification
    this.notifications.set(notification.id, notification);
    
    // Handle grouping
    if (notification.group) {
      this.addToGroup(notification);
    }
    
    // Deliver through channels
    await this.deliverNotification(notification);
    
    // Auto-dismiss after duration
    if (params.duration) {
      setTimeout(() => {
        this.dismiss(notification.id);
      }, params.duration);
    }
    
    // Notify listeners
    this.notifyListeners(notification);
    
    // Track analytics
    trackEvent(EventCategory.INTERACTION, EventAction.FEATURE_USE, 'notification_shown');
    
    // Persist
    this.persistData();
    
    return notification;
  }
  
  /**
   * Show toast notification (convenience method)
   */
  toast(params: {
    title: string;
    message: string;
    type?: NotificationType;
    duration?: number;
    actions?: NotificationAction[];
  }): Promise<Notification> {
    return this.show({
      ...params,
      channels: [NotificationChannel.TOAST],
      duration: params.duration || 5000,
    });
  }
  
  /**
   * Show success notification
   */
  success(title: string, message: string, duration: number = 5000): Promise<Notification> {
    return this.toast({
      title,
      message,
      type: NotificationType.SUCCESS,
      duration,
    });
  }
  
  /**
   * Show error notification
   */
  error(title: string, message: string, duration: number = 8000): Promise<Notification> {
    return this.toast({
      title,
      message,
      type: NotificationType.ERROR,
      duration,
    });
  }
  
  /**
   * Show warning notification
   */
  warning(title: string, message: string, duration: number = 6000): Promise<Notification> {
    return this.toast({
      title,
      message,
      type: NotificationType.WARNING,
      duration,
    });
  }
  
  /**
   * Show info notification
   */
  info(title: string, message: string, duration: number = 5000): Promise<Notification> {
    return this.toast({
      title,
      message,
      type: NotificationType.INFO,
      duration,
    });
  }
  
  /**
   * Schedule notification
   */
  schedule(params: {
    notification: Omit<Notification, 'id' | 'createdAt'>;
    scheduledFor: Date;
    recurring?: NotificationSchedule['recurring'];
  }): string {
    const schedule: NotificationSchedule = {
      id: generateId(),
      notification: params.notification,
      scheduledFor: params.scheduledFor,
      recurring: params.recurring,
      sent: false,
    };
    
    this.schedules.set(schedule.id, schedule);
    this.persistData();
    
    return schedule.id;
  }
  
  /**
   * Cancel scheduled notification
   */
  cancelSchedule(scheduleId: string): void {
    this.schedules.delete(scheduleId);
    this.persistData();
  }
  
  /**
   * Deliver notification through channels
   */
  private async deliverNotification(notification: Notification): Promise<void> {
    for (const channel of notification.channels) {
      try {
        switch (channel) {
          case NotificationChannel.TOAST:
            await this.deliverToast(notification);
            break;
          case NotificationChannel.PUSH:
            await this.deliverPush(notification);
            break;
          case NotificationChannel.EMAIL:
            await this.deliverEmail(notification);
            break;
          case NotificationChannel.IN_APP:
            await this.deliverInApp(notification);
            break;
          case NotificationChannel.SMS:
            await this.deliverSMS(notification);
            break;
        }
        notification.deliveredChannels.push(channel);
      } catch (error) {
        console.error(`Failed to deliver notification via ${channel}:`, error);
      }
    }
  }
  
  /**
   * Deliver toast notification
   */
  private async deliverToast(notification: Notification): Promise<void> {
    // This would integrate with a toast component
    // For now, just mark as delivered
    console.log('Toast notification:', notification.title, notification.message);
  }
  
  /**
   * Deliver push notification
   */
  private async deliverPush(notification: Notification): Promise<void> {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      return;
    }
    
    if (Notification.permission !== 'granted') {
      return;
    }
    
    const pushNotification = new Notification(notification.title, {
      body: notification.message,
      icon: notification.icon || '/logo.png',
      image: notification.image,
      tag: notification.tag,
      requireInteraction: notification.priority === NotificationPriority.URGENT,
      data: notification.data,
    });
    
    pushNotification.onclick = () => {
      this.markAsClicked(notification.id);
      window.focus();
      pushNotification.close();
    };
  }
  
  /**
   * Deliver email notification
   */
  private async deliverEmail(notification: Notification): Promise<void> {
    // Would integrate with email service (SendGrid, AWS SES, etc.)
    console.log('Email notification:', notification.title);
  }
  
  /**
   * Deliver in-app notification
   */
  private async deliverInApp(notification: Notification): Promise<void> {
    // Just store in notifications list
    // UI components will display this
  }
  
  /**
   * Deliver SMS notification
   */
  private async deliverSMS(notification: Notification): Promise<void> {
    // Would integrate with SMS service (Twilio, AWS SNS, etc.)
    console.log('SMS notification:', notification.title);
  }
  
  /**
   * Mark notification as read
   */
  markAsRead(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.read = true;
      this.persistData();
    }
  }
  
  /**
   * Mark all as read
   */
  markAllAsRead(): void {
    this.notifications.forEach(notification => {
      notification.read = true;
    });
    this.persistData();
  }
  
  /**
   * Mark as clicked
   */
  markAsClicked(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.clicked = true;
      notification.clickedAt = new Date();
      this.markAsRead(notificationId);
      
      trackEvent(EventCategory.INTERACTION, EventAction.BUTTON_CLICK, 'notification_clicked');
    }
  }
  
  /**
   * Dismiss notification
   */
  dismiss(notificationId: string): void {
    const notification = this.notifications.get(notificationId);
    if (notification) {
      notification.dismissed = true;
      this.persistData();
    }
  }
  
  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications.forEach(notification => {
      notification.dismissed = true;
    });
    this.persistData();
  }
  
  /**
   * Delete notification
   */
  delete(notificationId: string): void {
    this.notifications.delete(notificationId);
    this.persistData();
  }
  
  /**
   * Get all notifications
   */
  getAll(filters?: {
    type?: NotificationType;
    read?: boolean;
    dismissed?: boolean;
  }): Notification[] {
    let notifications = Array.from(this.notifications.values());
    
    if (filters) {
      if (filters.type !== undefined) {
        notifications = notifications.filter(n => n.type === filters.type);
      }
      if (filters.read !== undefined) {
        notifications = notifications.filter(n => n.read === filters.read);
      }
      if (filters.dismissed !== undefined) {
        notifications = notifications.filter(n => n.dismissed === filters.dismissed);
      }
    }
    
    return notifications.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }
  
  /**
   * Get unread count
   */
  getUnreadCount(): number {
    return this.getAll({ read: false, dismissed: false }).length;
  }
  
  /**
   * Add to notification group
   */
  private addToGroup(notification: Notification): void {
    if (!notification.group) return;
    
    let group = this.groups.get(notification.group);
    
    if (!group) {
      group = {
        id: generateId(),
        tag: notification.group,
        notifications: [],
        summary: '',
        count: 0,
        latestTimestamp: notification.createdAt,
        expanded: false,
      };
      this.groups.set(notification.group, group);
    }
    
    group.notifications.push(notification);
    group.count = group.notifications.length;
    group.latestTimestamp = notification.createdAt;
    group.summary = this.generateGroupSummary(group);
  }
  
  /**
   * Generate group summary
   */
  private generateGroupSummary(group: NotificationGroup): string {
    const count = group.count;
    if (count === 0) return '';
    if (count === 1) return group.notifications[0].message;
    return `${count} notifications`;
  }
  
  /**
   * Get notification groups
   */
  getGroups(): NotificationGroup[] {
    return Array.from(this.groups.values())
      .sort((a, b) => b.latestTimestamp.getTime() - a.latestTimestamp.getTime());
  }
  
  /**
   * Toggle group expansion
   */
  toggleGroupExpansion(groupId: string): void {
    const group = this.groups.get(groupId);
    if (group) {
      group.expanded = !group.expanded;
    }
  }
  
  /**
   * Check if notification should be shown based on preferences
   */
  private shouldShowNotification(
    notification: Notification,
    prefs: NotificationPreferences
  ): boolean {
    // Check if notifications are enabled
    if (!prefs.enabled) return false;
    
    // Check do not disturb
    if (prefs.doNotDisturb) return false;
    
    // Check quiet hours
    if (prefs.quietHours) {
      const now = new Date();
      const currentHour = now.getHours();
      const { start, end } = prefs.quietHours;
      
      if (start < end) {
        if (currentHour >= start && currentHour < end) return false;
      } else {
        if (currentHour >= start || currentHour < end) return false;
      }
    }
    
    // Check type preference
    if (!prefs.types[notification.type]) return false;
    
    // Check frequency limits
    const recentNotifications = this.getAll()
      .filter(n => {
        const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
        return n.createdAt > hourAgo;
      });
    
    if (recentNotifications.length >= prefs.maxPerHour) return false;
    
    const todayNotifications = this.getAll()
      .filter(n => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return n.createdAt >= today;
      });
    
    if (todayNotifications.length >= prefs.maxPerDay) return false;
    
    return true;
  }
  
  /**
   * Get user preferences
   */
  getPreferences(userId: string): NotificationPreferences {
    let prefs = this.preferences.get(userId);
    
    if (!prefs) {
      prefs = this.createDefaultPreferences(userId);
      this.preferences.set(userId, prefs);
    }
    
    return prefs;
  }
  
  /**
   * Update user preferences
   */
  updatePreferences(
    userId: string,
    updates: Partial<NotificationPreferences>
  ): void {
    const prefs = this.getPreferences(userId);
    Object.assign(prefs, updates);
    this.persistData();
  }
  
  /**
   * Create default preferences
   */
  private createDefaultPreferences(userId: string): NotificationPreferences {
    return {
      userId,
      enabled: true,
      doNotDisturb: false,
      channels: {
        toast: true,
        push: true,
        email: true,
        inApp: true,
        sms: false,
      },
      types: {
        info: true,
        success: true,
        warning: true,
        error: true,
        reminder: true,
        achievement: true,
        social: true,
        system: true,
      },
      maxPerHour: 10,
      maxPerDay: 50,
      groupSimilar: true,
      soundEnabled: true,
      vibrationEnabled: true,
    };
  }
  
  /**
   * Start schedule checker
   */
  private startScheduleChecker(): void {
    setInterval(() => {
      this.checkSchedules();
    }, 60000); // Check every minute
  }
  
  /**
   * Check and send scheduled notifications
   */
  private checkSchedules(): void {
    const now = new Date();
    
    this.schedules.forEach(async (schedule) => {
      if (schedule.sent) return;
      
      if (schedule.scheduledFor <= now) {
        // Send notification
        await this.show({
          ...schedule.notification,
          title: schedule.notification.title,
          message: schedule.notification.message,
        });
        
        // Mark as sent
        schedule.sent = true;
        
        // Handle recurring
        if (schedule.recurring) {
          const nextSchedule = this.calculateNextSchedule(schedule);
          if (nextSchedule) {
            this.schedules.set(generateId(), nextSchedule);
          }
        }
        
        this.persistData();
      }
    });
  }
  
  /**
   * Calculate next recurring schedule
   */
  private calculateNextSchedule(schedule: NotificationSchedule): NotificationSchedule | null {
    if (!schedule.recurring) return null;
    
    const { frequency, days, time } = schedule.recurring;
    const nextDate = new Date(schedule.scheduledFor);
    
    switch (frequency) {
      case 'daily':
        nextDate.setDate(nextDate.getDate() + 1);
        break;
      case 'weekly':
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case 'monthly':
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
    }
    
    if (time) {
      nextDate.setHours(time.hour, time.minute, 0, 0);
    }
    
    return {
      id: generateId(),
      notification: schedule.notification,
      scheduledFor: nextDate,
      recurring: schedule.recurring,
      sent: false,
    };
  }
  
  /**
   * Add event listener
   */
  addListener(callback: (notification: Notification) => void): () => void {
    this.listeners.add(callback);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }
  
  /**
   * Notify all listeners
   */
  private notifyListeners(notification: Notification): void {
    this.listeners.forEach(listener => {
      try {
        listener(notification);
      } catch (error) {
        console.error('Error in notification listener:', error);
      }
    });
  }
  
  /**
   * Get current user ID (placeholder)
   */
  private getCurrentUserId(): string | null {
    // Would get from auth service
    return null;
  }
  
  /**
   * Persist data to localStorage
   */
  private persistData(): void {
    try {
      const data = {
        notifications: Array.from(this.notifications.values()).slice(-this.maxNotifications),
        schedules: Array.from(this.schedules.values()),
        preferences: Array.from(this.preferences.values()),
      };
      
      localStorage.setItem('notification_data', JSON.stringify(data));
    } catch (error) {
      console.error('Failed to persist notification data:', error);
    }
  }
  
  /**
   * Load persisted data
   */
  private loadPersistedData(): void {
    try {
      const stored = localStorage.getItem('notification_data');
      if (!stored) return;
      
      const data = JSON.parse(stored);
      
      // Load notifications
      if (data.notifications) {
        data.notifications.forEach((n: any) => {
          this.notifications.set(n.id, {
            ...n,
            createdAt: new Date(n.createdAt),
            clickedAt: n.clickedAt ? new Date(n.clickedAt) : undefined,
            expiresAt: n.expiresAt ? new Date(n.expiresAt) : undefined,
          });
        });
      }
      
      // Load schedules
      if (data.schedules) {
        data.schedules.forEach((s: any) => {
          this.schedules.set(s.id, {
            ...s,
            scheduledFor: new Date(s.scheduledFor),
          });
        });
      }
      
      // Load preferences
      if (data.preferences) {
        data.preferences.forEach((p: any) => {
          this.preferences.set(p.userId, p);
        });
      }
    } catch (error) {
      console.error('Failed to load notification data:', error);
    }
  }
  
  /**
   * Clear all data
   */
  clear(): void {
    this.notifications.clear();
    this.groups.clear();
    this.schedules.clear();
    
    try {
      localStorage.removeItem('notification_data');
    } catch (error) {
      console.error('Failed to clear notification data:', error);
    }
  }
}

// Export singleton instance
export const notificationService = NotificationService.getInstance();

// Convenience exports
export const notify = {
  show: (params: Parameters<NotificationService['show']>[0]) => 
    notificationService.show(params),
  success: (title: string, message: string) => 
    notificationService.success(title, message),
  error: (title: string, message: string) => 
    notificationService.error(title, message),
  warning: (title: string, message: string) => 
    notificationService.warning(title, message),
  info: (title: string, message: string) => 
    notificationService.info(title, message),
};

export default NotificationService;

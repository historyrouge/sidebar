"use client";

import React, { createContext, useContext, useState, useCallback } from 'react';
import { Toast, ToastProvider, ToastViewport } from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, XCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  description?: string;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface NotificationContextType {
  showNotification: (notification: Omit<Notification, 'id'>) => void;
  showSuccess: (title: string, description?: string) => void;
  showError: (title: string, description?: string) => void;
  showInfo: (title: string, description?: string) => void;
  showWarning: (title: string, description?: string) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback((notification: Omit<Notification, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const newNotification = { ...notification, id };
    
    setNotifications(prev => [...prev, newNotification]);
    
    // Auto remove after duration
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, notification.duration || 5000);
  }, []);

  const showSuccess = useCallback((title: string, description?: string) => {
    showNotification({ type: 'success', title, description });
  }, [showNotification]);

  const showError = useCallback((title: string, description?: string) => {
    showNotification({ type: 'error', title, description });
  }, [showNotification]);

  const showInfo = useCallback((title: string, description?: string) => {
    showNotification({ type: 'info', title, description });
  }, [showNotification]);

  const showWarning = useCallback((title: string, description?: string) => {
    showNotification({ type: 'warning', title, description });
  }, [showNotification]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const contextValue: NotificationContextType = {
    showNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
      <ToastProvider>
        {notifications.map((notification) => (
          <Toast
            key={notification.id}
            className={cn(
              "border-l-4",
              {
                "border-green-500 bg-green-50 dark:bg-green-950": notification.type === 'success',
                "border-red-500 bg-red-50 dark:bg-red-950": notification.type === 'error',
                "border-blue-500 bg-blue-50 dark:bg-blue-950": notification.type === 'info',
                "border-yellow-500 bg-yellow-50 dark:bg-yellow-950": notification.type === 'warning',
              }
            )}
          >
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                {notification.type === 'success' && <CheckCircle className="h-5 w-5 text-green-600" />}
                {notification.type === 'error' && <XCircle className="h-5 w-5 text-red-600" />}
                {notification.type === 'info' && <Info className="h-5 w-5 text-blue-600" />}
                {notification.type === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm">{notification.title}</div>
                {notification.description && (
                  <div className="text-sm text-muted-foreground mt-1">
                    {notification.description}
                  </div>
                )}
                {notification.action && (
                  <button
                    onClick={notification.action.onClick}
                    className="text-sm text-primary hover:text-primary/80 mt-2 font-medium"
                  >
                    {notification.action.label}
                  </button>
                )}
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </Toast>
        ))}
        <ToastViewport />
      </ToastProvider>
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
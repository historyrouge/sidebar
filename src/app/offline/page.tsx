"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WifiOff, RefreshCw, Home, MessageSquare, BookOpen } from 'lucide-react';
import Link from 'next/link';

export default function OfflinePage() {
  const [isOnline, setIsOnline] = useState(false);
  const [lastSync, setLastSync] = useState<string>('');

  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };

    const handleOnline = () => {
      setIsOnline(true);
      // Automatically redirect when back online
      setTimeout(() => {
        window.location.href = '/';
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    // Set initial status
    updateOnlineStatus();

    // Load last sync time
    const lastSyncTime = localStorage.getItem('last_sync_time');
    if (lastSyncTime) {
      const date = new Date(parseInt(lastSyncTime));
      setLastSync(date.toLocaleString());
    }

    // Listen for online/offline events
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-6">
        {/* Status Icon */}
        <div className="text-center">
          <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
            <WifiOff className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-2xl font-bold">You're Offline</h1>
          <p className="text-muted-foreground mt-2">
            {isOnline 
              ? "Connection restored! Redirecting..." 
              : "Check your internet connection and try again."
            }
          </p>
        </div>

        {/* Connection Status */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Connection Status</CardTitle>
            <CardDescription>
              Current network status and last sync information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Network Status</span>
              <div className="flex items-center gap-2">
                <div 
                  className={`w-2 h-2 rounded-full ${
                    isOnline ? 'bg-green-500' : 'bg-red-500'
                  }`} 
                />
                <span className={isOnline ? 'text-green-600' : 'text-red-600'}>
                  {isOnline ? 'Online' : 'Offline'}
                </span>
              </div>
            </div>
            
            {lastSync && (
              <div className="flex items-center justify-between">
                <span>Last Sync</span>
                <span className="text-sm text-muted-foreground">{lastSync}</span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">What you can do</CardTitle>
            <CardDescription>
              Some features are available offline
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <MessageSquare className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">View Chat History</p>
                <p className="text-sm text-muted-foreground">
                  Access your recent conversations
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
              <BookOpen className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-medium">Offline Study Materials</p>
                <p className="text-sm text-muted-foreground">
                  Review cached content and notes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Button 
            onClick={handleRetry} 
            className="w-full" 
            disabled={isOnline}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            {isOnline ? 'Connecting...' : 'Try Again'}
          </Button>
          
          <Button 
            onClick={handleGoHome} 
            variant="outline" 
            className="w-full"
          >
            <Home className="w-4 h-4 mr-2" />
            Go to Home
          </Button>
        </div>

        {/* Offline Tips */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Offline Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>• Check your WiFi or mobile data connection</li>
              <li>• Try moving to a location with better signal</li>
              <li>• Restart your router if using WiFi</li>
              <li>• Your data will sync when connection is restored</li>
            </ul>
          </CardContent>
        </Card>

        {/* App Info */}
        <div className="text-center text-sm text-muted-foreground">
          <p>SearnAI • Progressive Web App</p>
          <p>Some features work offline</p>
        </div>
      </div>
    </div>
  );
}
import { EventEmitter } from 'events';

export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: number;
  userId?: string;
  sessionId?: string;
}

export interface TypingIndicator {
  userId: string;
  userName: string;
  isTyping: boolean;
  timestamp: number;
}

export interface PresenceInfo {
  userId: string;
  userName: string;
  status: 'online' | 'away' | 'busy' | 'offline';
  lastSeen: number;
  currentPage?: string;
}

export interface CollaborationEvent {
  type: 'cursor_move' | 'selection_change' | 'content_change' | 'user_join' | 'user_leave';
  userId: string;
  data: any;
  timestamp: number;
}

export class WebSocketManager extends EventEmitter {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private messageQueue: WebSocketMessage[] = [];
  private sessionId: string;
  private userId: string;

  constructor(userId: string) {
    super();
    this.userId = userId;
    this.sessionId = this.generateSessionId();
  }

  connect(url?: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || (this.ws && this.ws.readyState === WebSocket.CONNECTING)) {
        return;
      }

      this.isConnecting = true;
      const wsUrl = url || this.getWebSocketUrl();

      try {
        this.ws = new WebSocket(wsUrl);
        
        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.processMessageQueue();
          this.emit('connected');
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketMessage = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected', event);
          
          if (!event.wasClean && this.reconnectAttempts < this.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', error);
          reject(error);
        };

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
    this.stopHeartbeat();
    this.emit('disconnected');
  }

  send(type: string, payload: any): void {
    const message: WebSocketMessage = {
      type,
      payload,
      timestamp: Date.now(),
      userId: this.userId,
      sessionId: this.sessionId,
    };

    if (this.isConnected()) {
      this.ws!.send(JSON.stringify(message));
    } else {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
    }
  }

  isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }

  // Real-time collaboration features
  sendTypingIndicator(isTyping: boolean, context?: string): void {
    this.send('typing', {
      isTyping,
      context,
      timestamp: Date.now(),
    });
  }

  sendPresenceUpdate(status: 'online' | 'away' | 'busy', currentPage?: string): void {
    this.send('presence', {
      status,
      currentPage,
      timestamp: Date.now(),
    });
  }

  sendCursorPosition(x: number, y: number, context?: string): void {
    this.send('cursor', {
      x,
      y,
      context,
      timestamp: Date.now(),
    });
  }

  sendContentChange(change: any, context?: string): void {
    this.send('content_change', {
      change,
      context,
      timestamp: Date.now(),
    });
  }

  // Live chat features
  sendChatMessage(message: string, conversationId: string): void {
    this.send('chat_message', {
      message,
      conversationId,
      timestamp: Date.now(),
    });
  }

  sendReaction(messageId: string, reaction: string): void {
    this.send('reaction', {
      messageId,
      reaction,
      timestamp: Date.now(),
    });
  }

  // Study session features
  joinStudySession(sessionId: string): void {
    this.send('join_study_session', {
      sessionId,
      timestamp: Date.now(),
    });
  }

  leaveStudySession(sessionId: string): void {
    this.send('leave_study_session', {
      sessionId,
      timestamp: Date.now(),
    });
  }

  shareScreen(sessionId: string, screenData: any): void {
    this.send('screen_share', {
      sessionId,
      screenData,
      timestamp: Date.now(),
    });
  }

  // Notification features
  sendNotification(targetUserId: string, notification: any): void {
    this.send('notification', {
      targetUserId,
      notification,
      timestamp: Date.now(),
    });
  }

  // Private methods
  private handleMessage(message: WebSocketMessage): void {
    switch (message.type) {
      case 'typing':
        this.emit('typing', message.payload as TypingIndicator);
        break;
      
      case 'presence':
        this.emit('presence', message.payload as PresenceInfo);
        break;
      
      case 'cursor':
        this.emit('cursor', message.payload);
        break;
      
      case 'content_change':
        this.emit('content_change', message.payload);
        break;
      
      case 'chat_message':
        this.emit('chat_message', message.payload);
        break;
      
      case 'reaction':
        this.emit('reaction', message.payload);
        break;
      
      case 'user_joined':
        this.emit('user_joined', message.payload);
        break;
      
      case 'user_left':
        this.emit('user_left', message.payload);
        break;
      
      case 'notification':
        this.emit('notification', message.payload);
        break;
      
      case 'heartbeat':
        // Respond to server heartbeat
        this.send('heartbeat_response', { timestamp: Date.now() });
        break;
      
      default:
        this.emit('message', message);
        break;
    }
  }

  private getWebSocketUrl(): string {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    return `${protocol}//${host}/api/ws`;
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected()) {
        this.send('heartbeat', { timestamp: Date.now() });
      }
    }, 30000); // Send heartbeat every 30 seconds
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    setTimeout(() => {
      if (!this.isConnected()) {
        this.connect().catch(error => {
          console.error('Reconnection failed:', error);
        });
      }
    }, delay);
  }

  private processMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected()) {
      const message = this.messageQueue.shift();
      if (message) {
        this.ws!.send(JSON.stringify(message));
      }
    }
  }
}

// Singleton instance for global use
let wsManagerInstance: WebSocketManager | null = null;

export function getWebSocketManager(userId?: string): WebSocketManager {
  if (!wsManagerInstance && userId) {
    wsManagerInstance = new WebSocketManager(userId);
  }
  return wsManagerInstance!;
}

// React hook for WebSocket functionality
export function useWebSocket(userId: string) {
  const [isConnected, setIsConnected] = React.useState(false);
  const [connectionStatus, setConnectionStatus] = React.useState<'connecting' | 'connected' | 'disconnected' | 'error'>('disconnected');
  const wsManager = React.useMemo(() => getWebSocketManager(userId), [userId]);

  React.useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setConnectionStatus('connected');
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setConnectionStatus('disconnected');
    };

    const handleError = () => {
      setConnectionStatus('error');
    };

    wsManager.on('connected', handleConnected);
    wsManager.on('disconnected', handleDisconnected);
    wsManager.on('error', handleError);

    // Auto-connect
    if (!wsManager.isConnected()) {
      setConnectionStatus('connecting');
      wsManager.connect().catch(() => {
        setConnectionStatus('error');
      });
    }

    return () => {
      wsManager.off('connected', handleConnected);
      wsManager.off('disconnected', handleDisconnected);
      wsManager.off('error', handleError);
    };
  }, [wsManager]);

  return {
    wsManager,
    isConnected,
    connectionStatus,
  };
}

// React import for hooks
import React from 'react';
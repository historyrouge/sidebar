// Core application types and interfaces

export interface User {
  id: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model' | 'tool';
  content: {
    text: string;
    image?: string | null;
  };
  timestamp?: string;
  metadata?: Record<string, any>;
}

export interface ChatState {
  history: Message[];
  isTyping: boolean;
  currentModel: string;
  activeButton: 'deepthink' | 'music' | 'search' | 'agent' | null;
}

export interface VideoPlayerState {
  activeVideoId: string | null;
  activeVideoTitle: string | null;
  isPlaying: boolean;
  showPlayer: boolean;
}

export interface FileUpload {
  content: string | null;
  name: string | null;
  type: 'text' | 'image';
  dataUri?: string | null;
}

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface GeneralChatInput {
  history: Array<{
    role: 'user' | 'model' | 'tool';
    content: string;
  }>;
  fileContent?: string | null;
  imageDataUri?: string | null;
  model: string;
  isMusicMode?: boolean;
}

export interface GenerateQuestionPaperOutput {
  title: string;
  subject: string;
  duration: string;
  totalMarks: number;
  instructions: string[];
  sections: Array<{
    title: string;
    questions: Array<{
      id: string;
      question: string;
      marks: number;
      type: 'short' | 'long' | 'mcq' | 'fill';
      options?: string[];
      answer?: string;
    }>;
  }>;
}

export interface StudyTool {
  name: string;
  icon: React.ReactNode;
  href: string;
  description?: string;
  category: 'study' | 'resource' | 'utility';
}

export interface NavigationItem {
  name: string;
  icon: React.ReactNode;
  href: string;
  isActive?: boolean;
  badge?: string | number;
}

export interface ThemeConfig {
  theme: 'light' | 'dark' | 'system';
  primaryColor: string;
  fontSize: 'sm' | 'base' | 'lg';
  animations: boolean;
}

export interface UserPreferences {
  theme: ThemeConfig;
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    sound: boolean;
  };
  privacy: {
    analytics: boolean;
    cookies: boolean;
  };
}

// Utility types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';

export type ComponentProps<T = {}> = T & {
  className?: string;
  children?: React.ReactNode;
};

export type AsyncFunction<T = any, R = any> = (args: T) => Promise<R>;

export type EventHandler<T = any> = (event: T) => void;

// Form types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'textarea' | 'select' | 'checkbox' | 'radio';
  required?: boolean;
  placeholder?: string;
  options?: Array<{ label: string; value: string }>;
  validation?: {
    min?: number;
    max?: number;
    pattern?: RegExp;
    custom?: (value: any) => boolean | string;
  };
}

export interface FormState<T = Record<string, any>> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
}

// API types
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export interface SearchParams {
  query?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

// Error types
export interface AppError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}

export type ErrorBoundaryState = {
  hasError: boolean;
  error?: Error;
};

// Storage types
export interface StorageItem<T = any> {
  key: string;
  value: T;
  expiresAt?: number;
}

export type StorageType = 'localStorage' | 'sessionStorage' | 'indexedDB';

// Hook types
export interface UseAsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  execute: (...args: any[]) => Promise<void>;
  reset: () => void;
}

export interface UseFormReturn<T> {
  values: T;
  errors: Partial<Record<keyof T, string>>;
  touched: Partial<Record<keyof T, boolean>>;
  isSubmitting: boolean;
  isValid: boolean;
  handleChange: (name: keyof T, value: any) => void;
  handleBlur: (name: keyof T) => void;
  handleSubmit: (onSubmit: (values: T) => void | Promise<void>) => (e: React.FormEvent) => void;
  reset: () => void;
  setFieldValue: (name: keyof T, value: any) => void;
  setFieldError: (name: keyof T, error: string) => void;
}

// Component-specific types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export interface ToastOptions {
  title: string;
  description?: string;
  variant?: 'default' | 'destructive' | 'success' | 'warning';
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export interface TableColumn<T = any> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: any, row: T) => React.ReactNode;
  width?: string | number;
  align?: 'left' | 'center' | 'right';
}

export interface TableProps<T = any> {
  data: T[];
  columns: TableColumn<T>[];
  loading?: boolean;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    onPageChange: (page: number) => void;
  };
  sorting?: {
    key: string;
    order: 'asc' | 'desc';
    onSort: (key: string, order: 'asc' | 'desc') => void;
  };
  selection?: {
    selectedIds: string[];
    onSelectionChange: (ids: string[]) => void;
  };
}

// Constants
export const SUPPORTED_FILE_TYPES = {
  IMAGE: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  TEXT: ['text/plain', 'text/markdown'],
  DOCUMENT: ['application/pdf', 'application/msword'],
} as const;

export const API_ENDPOINTS = {
  AUTH: '/api/auth',
  CHAT: '/api/chat',
  TTS: '/api/tts',
  UPLOAD: '/api/upload',
  NEWS: '/api/news',
} as const;

export const STORAGE_KEYS = {
  CHAT_HISTORY: 'chatHistory',
  USER_PREFERENCES: 'userPreferences',
  THEME: 'theme',
  AUTH_TOKEN: 'authToken',
} as const;
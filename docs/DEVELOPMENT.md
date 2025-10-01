# Development Guide

This document provides detailed information for developers working on SearnAI.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Code Organization](#code-organization)
- [Component Guidelines](#component-guidelines)
- [State Management](#state-management)
- [API Integration](#api-integration)
- [Testing Strategy](#testing-strategy)
- [Performance Optimization](#performance-optimization)
- [Security Considerations](#security-considerations)
- [Deployment Process](#deployment-process)

## Architecture Overview

SearnAI follows a modern React architecture with Next.js App Router:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Client Side   │    │   Server Side   │    │  External APIs  │
│                 │    │                 │    │                 │
│ React Components│◄──►│ Next.js API     │◄──►│ OpenAI API      │
│ Zustand Store   │    │ Routes          │    │ Firebase        │
│ Custom Hooks    │    │ Server Actions  │    │ Google AI       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Key Architectural Decisions

1. **App Router**: Using Next.js 13+ App Router for better performance and developer experience
2. **TypeScript**: Strict typing throughout the application
3. **Component Composition**: Reusable components with clear separation of concerns
4. **Custom Hooks**: Business logic abstracted into reusable hooks
5. **Error Boundaries**: Comprehensive error handling at component level
6. **Security First**: Input validation and sanitization at every layer

## Development Setup

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Git
- Firebase CLI (for deployment)

### Environment Setup

1. **Clone and install**:
   ```bash
   git clone <repo-url>
   cd searnai
   npm install
   ```

2. **Environment variables**:
   Copy `.env.example` to `.env.local` and fill in the values:
   ```env
   # Required for development
   NEXT_PUBLIC_FIREBASE_API_KEY=
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=
   OPENAI_API_KEY=
   GOOGLE_AI_API_KEY=
   ```

3. **Development server**:
   ```bash
   npm run dev
   ```

### Development Tools

- **VS Code Extensions**:
  - TypeScript and JavaScript Language Features
  - Tailwind CSS IntelliSense
  - ES7+ React/Redux/React-Native snippets
  - Prettier - Code formatter
  - ESLint

- **Browser Extensions**:
  - React Developer Tools
  - Redux DevTools (for Zustand)

## Code Organization

### Directory Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth-related pages
│   ├── (dashboard)/       # Main app pages
│   ├── api/               # API routes
│   ├── globals.css        # Global styles
│   └── layout.tsx         # Root layout
├── components/            # React components
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── forms/            # Form components
│   ├── layouts/          # Layout components
│   └── features/         # Feature-specific components
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── types/                # TypeScript definitions
├── styles/               # Additional styles
└── utils/                # Helper functions
```

### File Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with `use` prefix (`useAuth.ts`)
- **Utilities**: camelCase (`formatDate.ts`)
- **Types**: PascalCase (`UserTypes.ts`)
- **Constants**: UPPER_SNAKE_CASE (`API_ENDPOINTS.ts`)

### Import Organization

```typescript
// 1. React and Next.js imports
import React from 'react';
import { useRouter } from 'next/navigation';

// 2. Third-party libraries
import { z } from 'zod';
import { toast } from 'sonner';

// 3. Internal imports (absolute paths)
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

// 4. Relative imports
import './component.css';
```

## Component Guidelines

### Component Structure

```typescript
// ComponentName.tsx
import React from 'react';
import { ComponentProps } from '@/types';

interface ComponentNameProps extends ComponentProps {
  // Specific props
  title: string;
  onAction?: () => void;
}

export function ComponentName({ 
  title, 
  onAction, 
  className,
  children,
  ...props 
}: ComponentNameProps) {
  // Hooks at the top
  const [state, setState] = React.useState();
  
  // Event handlers
  const handleClick = React.useCallback(() => {
    onAction?.();
  }, [onAction]);
  
  // Render
  return (
    <div className={cn('base-styles', className)} {...props}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}

// Default export for lazy loading
export default ComponentName;
```

### Component Best Practices

1. **Single Responsibility**: Each component should have one clear purpose
2. **Composition over Inheritance**: Use composition patterns
3. **Props Interface**: Always define TypeScript interfaces for props
4. **Default Props**: Use default parameters instead of defaultProps
5. **Memoization**: Use React.memo for expensive components
6. **Error Boundaries**: Wrap components that might fail

### Styling Guidelines

1. **Tailwind First**: Use Tailwind CSS classes for styling
2. **Component Variants**: Use `class-variance-authority` for component variants
3. **Responsive Design**: Mobile-first approach with responsive classes
4. **Dark Mode**: Support both light and dark themes
5. **Custom CSS**: Only when Tailwind is insufficient

```typescript
// Example with variants
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-9 rounded-md px-3',
        lg: 'h-11 rounded-md px-8',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);
```

## State Management

### Zustand Store Structure

```typescript
// stores/useAppStore.ts
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface AppState {
  // State
  user: User | null;
  theme: 'light' | 'dark';
  
  // Actions
  setUser: (user: User | null) => void;
  setTheme: (theme: 'light' | 'dark') => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        user: null,
        theme: 'dark',
        
        // Actions
        setUser: (user) => set({ user }),
        setTheme: (theme) => set({ theme }),
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({ theme: state.theme }), // Only persist theme
      }
    )
  )
);
```

### State Management Best Practices

1. **Slice Pattern**: Separate stores for different domains
2. **Computed Values**: Use selectors for derived state
3. **Async Actions**: Handle loading and error states
4. **Persistence**: Only persist necessary state
5. **DevTools**: Enable in development for debugging

## API Integration

### API Route Structure

```typescript
// app/api/example/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateRequestBody } from '@/lib/validation';
import { handleError } from '@/lib/error-handler';

const requestSchema = z.object({
  message: z.string().min(1).max(1000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = validateRequestBody(requestSchema)(body);
    
    // Process request
    const result = await processRequest(validatedData);
    
    return NextResponse.json({ data: result });
  } catch (error) {
    const handledError = handleError(error);
    return NextResponse.json(
      { error: handledError.message },
      { status: 500 }
    );
  }
}
```

### Client-Side API Calls

```typescript
// hooks/useApiCall.ts
import { useState, useCallback } from 'react';
import { ApiResponse } from '@/types';

export function useApiCall<T, P = any>() {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const execute = useCallback(async (
    url: string,
    options?: RequestInit,
    payload?: P
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        body: payload ? JSON.stringify(payload) : options?.body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result: ApiResponse<T> = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      setData(result.data || null);
      return result.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return { data, loading, error, execute };
}
```

## Testing Strategy

### Testing Philosophy

1. **Test Pyramid**: More unit tests, fewer integration tests, minimal E2E tests
2. **Behavior Testing**: Test what the user sees and does
3. **Accessibility**: Include accessibility testing
4. **Performance**: Test for performance regressions

### Unit Testing

```typescript
// __tests__/utils.test.ts
import { formatDate, truncate } from '../utils';

describe('utils', () => {
  describe('formatDate', () => {
    it('should format date correctly', () => {
      const date = new Date('2023-12-25');
      expect(formatDate(date)).toBe('Dec 25, 2023');
    });
  });

  describe('truncate', () => {
    it('should truncate long text', () => {
      expect(truncate('Long text here', 5)).toBe('Lo...');
    });
  });
});
```

### Component Testing

```typescript
// __tests__/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../Button';

describe('Button', () => {
  it('should render with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button', { name: /click me/i })).toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Integration Testing

```typescript
// __tests__/ChatFlow.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ChatComponent } from '../ChatComponent';

describe('Chat Flow', () => {
  it('should send message and receive response', async () => {
    const user = userEvent.setup();
    
    render(<ChatComponent />);
    
    const input = screen.getByPlaceholderText(/message/i);
    const sendButton = screen.getByRole('button', { name: /send/i });
    
    await user.type(input, 'Hello AI');
    await user.click(sendButton);
    
    await waitFor(() => {
      expect(screen.getByText('Hello AI')).toBeInTheDocument();
    });
  });
});
```

## Performance Optimization

### Code Splitting

```typescript
// Dynamic imports for large components
import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <div>Loading...</div>,
  ssr: false, // Disable SSR if not needed
});
```

### Memoization

```typescript
// Memoize expensive calculations
const expensiveValue = useMemo(() => {
  return heavyCalculation(data);
}, [data]);

// Memoize callbacks
const handleClick = useCallback((id: string) => {
  onItemClick(id);
}, [onItemClick]);

// Memoize components
const MemoizedComponent = memo(({ data }) => {
  return <div>{data.name}</div>;
});
```

### Image Optimization

```typescript
// Use Next.js Image component
import Image from 'next/image';

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority // For above-the-fold images
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>
```

## Security Considerations

### Input Validation

```typescript
// Always validate and sanitize inputs
import { sanitizeInput } from '@/lib/security';
import { z } from 'zod';

const messageSchema = z.object({
  content: z.string().min(1).max(1000),
  type: z.enum(['text', 'image']),
});

function handleUserInput(rawInput: unknown) {
  // Validate structure
  const validatedInput = messageSchema.parse(rawInput);
  
  // Sanitize content
  const sanitizedContent = sanitizeInput(validatedInput.content);
  
  return { ...validatedInput, content: sanitizedContent };
}
```

### Authentication

```typescript
// Protect API routes
import { getServerSession } from 'next-auth';

export async function POST(request: NextRequest) {
  const session = await getServerSession();
  
  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized' },
      { status: 401 }
    );
  }
  
  // Process authenticated request
}
```

### Content Security Policy

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline';
      style-src 'self' 'unsafe-inline';
      img-src 'self' data: https:;
    `.replace(/\s{2,}/g, ' ').trim()
  }
];
```

## Deployment Process

### Build Optimization

```bash
# Analyze bundle size
npm run build
npm run analyze

# Check for type errors
npm run typecheck

# Run tests
npm run test:ci

# Lint code
npm run lint
```

### Environment Configuration

```typescript
// lib/config.ts
export const config = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  
  // Feature flags
  features: {
    newFeature: process.env.NEXT_PUBLIC_ENABLE_NEW_FEATURE === 'true',
  },
};
```

### Monitoring and Analytics

```typescript
// lib/analytics.ts
export function trackEvent(eventName: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && config.isProduction) {
    // Send to analytics service
    gtag('event', eventName, properties);
  }
}

// Error tracking
export function trackError(error: Error, context?: Record<string, any>) {
  if (config.isProduction) {
    // Send to error tracking service
    Sentry.captureException(error, { extra: context });
  }
}
```

## Troubleshooting

### Common Development Issues

1. **Build Errors**:
   - Check TypeScript errors: `npm run typecheck`
   - Clear `.next` folder: `rm -rf .next`
   - Update dependencies: `npm update`

2. **Runtime Errors**:
   - Check browser console for client-side errors
   - Check server logs for API errors
   - Verify environment variables

3. **Performance Issues**:
   - Use React DevTools Profiler
   - Check bundle analyzer output
   - Monitor network requests

4. **Styling Issues**:
   - Verify Tailwind CSS is working
   - Check for CSS conflicts
   - Use browser DevTools to debug styles

### Debug Configuration

```typescript
// lib/debug.ts
export const debug = {
  enabled: process.env.NODE_ENV === 'development',
  
  log: (message: string, data?: any) => {
    if (debug.enabled) {
      console.log(`[DEBUG] ${message}`, data);
    }
  },
  
  error: (message: string, error?: Error) => {
    if (debug.enabled) {
      console.error(`[ERROR] ${message}`, error);
    }
  },
};
```

---

This development guide should be updated as the project evolves. For questions or suggestions, please create an issue or reach out to the development team.
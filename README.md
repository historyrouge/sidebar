# ScholarSage - AI-Powered Study Companion

ScholarSage is a comprehensive AI-powered study tool designed to help students learn more effectively through intelligent content analysis, automated flashcard generation, and interactive quizzes.

## Features

- **AI-Powered Content Analysis**: Upload documents and get intelligent analysis of key concepts
- **Automatic Flashcard Generation**: Create flashcards from your study materials automatically
- **Interactive Quizzes**: Generate quizzes with multiple question formats
- **Study Tools**: Mind maps, question papers, presentation maker, and more
- **Resource Integration**: YouTube tools, news reader, eBooks, and text-to-speech
- **Modern UI**: Clean, accessible interface with dark/light theme support
- **Mobile Responsive**: Optimized for all device sizes
- **Keyboard Shortcuts**: Power user features for efficient navigation

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Radix UI primitives
- **Authentication**: Firebase Auth
- **AI Integration**: Google Genkit, OpenAI
- **State Management**: Zustand
- **Icons**: Lucide React

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```

3. Run the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Design System

ScholarSage uses a carefully crafted design system with:
- **Primary Color**: #607EA3 (muted blue for focus and intelligence)
- **Background**: #F4F4F8 (off-white for readability)
- **Accent Color**: #A36060 (dark rose for key actions)
- **Typography**: Inter font family for modern, neutral look

## Accessibility

The app is built with accessibility in mind:
- WCAG 2.1 AA compliance
- Screen reader support
- Keyboard navigation
- High contrast ratios
- Focus management

## Performance

Optimized for performance with:
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- Efficient state management

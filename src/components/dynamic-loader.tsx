"use client";

import dynamic from 'next/dynamic';
import { Loader2 } from 'lucide-react';
import { ComponentType } from 'react';

// Loading component for dynamic imports
const LoadingSpinner = () => (
  <div className="flex h-64 w-full items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      <p className="text-sm text-muted-foreground">Loading...</p>
    </div>
  </div>
);

// Generic dynamic loader with loading state
export function createDynamicComponent<T = {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options?: {
    loading?: ComponentType;
    ssr?: boolean;
  }
) {
  return dynamic(importFn, {
    loading: options?.loading || LoadingSpinner,
    ssr: options?.ssr ?? true,
  });
}

// Pre-configured dynamic components for common pages
export const DynamicStudyNowContent = createDynamicComponent(
  () => import('./study-now-content'),
  { ssr: false }
);

export const DynamicAiEditorContent = createDynamicComponent(
  () => import('./ai-editor-content'),
  { ssr: false }
);

export const DynamicCodeAnalyzerContent = createDynamicComponent(
  () => import('./code-analyzer-content'),
  { ssr: false }
);

export const DynamicCreateFlashcardsContent = createDynamicComponent(
  () => import('./create-flashcards-content'),
  { ssr: false }
);

export const DynamicQuizContent = createDynamicComponent(
  () => import('./quiz-content'),
  { ssr: false }
);

export const DynamicMindMapContent = createDynamicComponent(
  () => import('./mind-map-content'),
  { ssr: false }
);

export const DynamicQuestionPaperContent = createDynamicComponent(
  () => import('./question-paper-content'),
  { ssr: false }
);

export const DynamicPresentationMakerContent = createDynamicComponent(
  () => import('./presentation-maker-content'),
  { ssr: false }
);

export const DynamicWebBrowserContent = createDynamicComponent(
  () => import('./web-browser-content'),
  { ssr: false }
);

export const DynamicYoutubeExtractorContent = createDynamicComponent(
  () => import('./youtube-extractor-content'),
  { ssr: false }
);

export const DynamicNewsContent = createDynamicComponent(
  () => import('./news-content'),
  { ssr: false }
);

export const DynamicEbooksContent = createDynamicComponent(
  () => import('./ebooks-content'),
  { ssr: false }
);

export const DynamicTextToSpeechContent = createDynamicComponent(
  () => import('./text-to-speech-content'),
  { ssr: false }
);

export const DynamicAiTrainingContent = createDynamicComponent(
  () => import('./ai-training-content'),
  { ssr: false }
);

export const DynamicPdfHubContent = createDynamicComponent(
  () => import('./pdf-hub-content'),
  { ssr: false }
);

export const DynamicNewsReaderContent = createDynamicComponent(
  () => import('./news-reader-content'),
  { ssr: false }
);

"use client";

import { useState, useEffect, useCallback } from 'react';

// This hook is no longer used for model selection but is kept for potential future settings.
// The model logic is now hard-coded per feature.

export type ModelKey = 'gemini' | 'samba' | 'puter';

type ModelSettings = {
  model: ModelKey;
  setModel: (model: ModelKey, isPermanent?: boolean) => void;
};

export function useModelSettings(): ModelSettings {
  // Default to Gemini, though it's not actively used for selection anymore.
  const [model, setModel] = useState<ModelKey>('gemini');

  const handleSetModel = useCallback((newModel: ModelKey, isPermanent = true) => {
    // This function is now effectively a no-op for the UI,
    // but we can keep the state update for any component that might still use it.
    setModel(newModel);
  }, []);

  return { model, setModel: handleSetModel };
}


"use client";

import { useState, useEffect, useCallback } from 'react';
import type { ModelKey } from '@/app/actions';

type ModelSettings = {
  model: ModelKey;
  setModel: (model: ModelKey) => void;
};

export function useModelSettings(): ModelSettings {
  const [model, setModel] = useState<ModelKey>('deepseek');

  useEffect(() => {
    try {
      const savedModel = localStorage.getItem('ai-model') as ModelKey | null;
      if (savedModel && (savedModel === 'deepseek' || savedModel === 'openai')) {
        setModel(savedModel);
      }
    } catch (error) {
      console.warn('Could not read model setting from localStorage', error);
    }
  }, []);

  const handleSetModel = useCallback((newModel: ModelKey) => {
    try {
      if (newModel === 'deepseek' || newModel === 'openai') {
        setModel(newModel);
        localStorage.setItem('ai-model', newModel);
      }
    } catch (error) {
      console.warn('Could not save model setting to localStorage', error);
    }
  }, []);

  return { model, setModel: handleSetModel };
}

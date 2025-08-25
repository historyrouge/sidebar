
"use client";

import { useState, useEffect, useCallback } from 'react';

export type ModelKey = 'gemini' | 'samba' | 'puter';

type ModelSettings = {
  model: ModelKey;
  setModel: (model: ModelKey, isPermanent?: boolean) => void;
};

export function useModelSettings(): ModelSettings {
  const [model, setModel] = useState<ModelKey>('gemini');

  useEffect(() => {
    try {
      const savedModel = localStorage.getItem('ai-model') as ModelKey | null;
      if (savedModel && ['gemini', 'samba', 'puter'].includes(savedModel)) {
        setModel(savedModel);
      }
    } catch (error) {
      console.warn('Could not read model setting from localStorage', error);
    }
  }, []);

  const handleSetModel = useCallback((newModel: ModelKey, isPermanent = true) => {
    try {
      if (['gemini', 'samba', 'puter'].includes(newModel)) {
        setModel(newModel);
        if (isPermanent) {
            localStorage.setItem('ai-model', newModel);
        }
      }
    } catch (error) {
      console.warn('Could not save model setting to localStorage', error);
    }
  }, []);

  return { model, setModel: handleSetModel };
}

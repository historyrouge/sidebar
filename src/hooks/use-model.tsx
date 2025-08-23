
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export type Model = 'gemini' | 'deepseek';

interface ModelContextType {
  model: Model;
  setModel: (model: Model) => void;
}

const ModelContext = createContext<ModelContextType | undefined>(undefined);

export function useModel() {
  const context = useContext(ModelContext);
  if (!context) {
    throw new Error('useModel must be used within a ModelProvider');
  }
  return context;
}

export function ModelProvider({ children }: { children: React.ReactNode }) {
  const [model, setModel] = useState<Model>('gemini');

  useEffect(() => {
    const savedModel = localStorage.getItem('learnsphere-model') as Model | null;
    if (savedModel && ['gemini', 'deepseek'].includes(savedModel)) {
      setModel(savedModel);
    }
  }, []);

  const handleSetModel = useCallback((newModel: Model) => {
    setModel(newModel);
    localStorage.setItem('learnsphere-model', newModel);
  }, []);
  
  const value = { model, setModel: handleSetModel };

  return (
    <ModelContext.Provider value={value}>
      {children}
    </ModelContext.Provider>
  );
}

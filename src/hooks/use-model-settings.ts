
"use client";

// This hook is no longer used for model selection, as the logic is now hard-coded per feature.
// It is kept for potential future use with other settings.

export type ModelKey = 'gemini' | 'qwen';

type ModelSettings = {
  model: ModelKey;
  setModel: (model: ModelKey, isPermanent?: boolean) => void;
};

export function useModelSettings(): ModelSettings {
  // Default to Gemini, as it's the primary model for chat.
  const model: ModelKey = 'gemini';

  const handleSetModel = (newModel: ModelKey, isPermanent = true) => {
    // This function is currently a no-op as model selection is fixed.
    // In the future, this could be used to update user preferences.
    console.log(`Model selection changed to ${newModel}. This is currently a no-op.`);
  };

  return { model, setModel: handleSetModel };
}

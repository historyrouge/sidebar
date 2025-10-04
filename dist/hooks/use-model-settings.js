"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.useModelSettings = useModelSettings;
function useModelSettings() {
    // Default to Gemini, as it's the primary model for chat.
    const model = 'gemini';
    const handleSetModel = (newModel, isPermanent = true) => {
        // This function is currently a no-op as model selection is fixed.
        // In the future, this could be used to update user preferences.
        console.log(`Model selection changed to ${newModel}. This is currently a no-op.`);
    };
    return { model, setModel: handleSetModel };
}

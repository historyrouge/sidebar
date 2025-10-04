"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AiEditorPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const ai_editor_content_1 = require("@/components/ai-editor-content");
// This page is now a fallback for mobile or direct access
function AiEditorPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(ai_editor_content_1.AiEditorContent, {}) }));
}

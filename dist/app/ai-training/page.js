"use strict";
"use client";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AiTrainingPage;
const jsx_runtime_1 = require("react/jsx-runtime");
const main_layout_1 = require("@/components/main-layout");
const ai_training_content_1 = require("@/components/ai-training-content");
function AiTrainingPage() {
    return ((0, jsx_runtime_1.jsx)(main_layout_1.MainLayout, { children: (0, jsx_runtime_1.jsx)(ai_training_content_1.AiTrainingContent, {}) }));
}
